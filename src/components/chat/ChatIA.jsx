import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";

const ChatIA = ({ showChatModal, setShowChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [intencion, setIntencion] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const chatCollection = collection(db, "chat");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajesObtenidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(mensajesObtenidos);
    });

    return () => unsubscribe();
  }, []);

  const obtenerCategorias = async () => {
    const snapshot = await getDocs(categoriasCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const obtenerRespuestaIA = async (promptUsuario) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const prompt = `
      Analiza el mensaje del usuario: "${promptUsuario}".
      Determina la intención del usuario respecto a operaciones con categorías:
      - "crear": Crear una nueva categoría.
      - "listar": Ver las categorías existentes.
      - "actualizar": Modificar una categoría existente.
      - "eliminar": Eliminar una categoría.
      - "seleccionar_categoria": Selección por nombre o número.
      - "actualizar_datos": Proporcionar nuevos datos tras seleccionar.

      Devuelve un JSON con estructura:
      {
        "intencion": "...",
        "datos": { "nombre": "...", "descripcion": "..." },
        "seleccion": "..."
      }
      Si no se detecta intención, devuelve: { "intencion": "desconocida" }
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" },
          }),
        }
      );

      if (response.status === 429) {
        return { intencion: "error", mensaje: "Límite de solicitudes alcanzado." };
      }

      const data = await response.json();
      const respuestaIA = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      return respuestaIA.intencion ? respuestaIA : { intencion: "desconocida" };
    } catch (error) {
      console.error("Error al obtener respuesta de la IA:", error);
      return { intencion: "error", mensaje: "No se pudo conectar con la IA." };
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
      texto: mensaje,
      emisor: "usuario",
      timestamp: new Date(),
    };

    setCargando(true);
    setMensaje("");

    try {
      await addDoc(chatCollection, nuevoMensaje);
      const respuestaIA = await obtenerRespuestaIA(mensaje);
      const categorias = await obtenerCategorias();

      // LISTAR
      if (respuestaIA.intencion === "listar") {
        if (categorias.length === 0) {
          await addDoc(chatCollection, {
            texto: "No hay categorías registradas.",
            emisor: "ia",
            timestamp: new Date(),
          });
        } else {
          const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
          await addDoc(chatCollection, {
            texto: `Categorías disponibles:\n${lista}`,
            emisor: "ia",
            timestamp: new Date(),
          });
        }
      }

      // CREAR
      if (respuestaIA.intencion === "crear" && !intencion) {
        const datos = respuestaIA.datos;
        if (datos?.nombre && datos?.descripcion) {
          await addDoc(categoriasCollection, datos);
          await addDoc(chatCollection, {
            texto: `Categoría "${datos.nombre}" registrada con éxito.`,
            emisor: "ia",
            timestamp: new Date(),
          });
        } else {
          await addDoc(chatCollection, {
            texto: "Faltan datos para registrar la categoría.",
            emisor: "ia",
            timestamp: new Date(),
          });
        }
      }

      // ELIMINAR
      if (respuestaIA.intencion === "eliminar") {
        if (categorias.length === 0) {
          await addDoc(chatCollection, {
            texto: "No hay categorías para eliminar.",
            emisor: "ia",
            timestamp: new Date(),
          });
          setIntencion(null);
        } else if (respuestaIA.seleccion) {
          const encontrada = categorias.find(
            (cat, i) =>
              cat.nombre.toLowerCase() === respuestaIA.seleccion.toLowerCase() ||
              parseInt(respuestaIA.seleccion) === i + 1
          );
          if (encontrada) {
            await deleteDoc(doc(db, "categorias", encontrada.id));
            await addDoc(chatCollection, {
              texto: `Categoría "${encontrada.nombre}" eliminada.`,
              emisor: "ia",
              timestamp: new Date(),
            });
            setIntencion(null);
          } else {
            await addDoc(chatCollection, {
              texto: "No se encontró la categoría.",
              emisor: "ia",
              timestamp: new Date(),
            });
          }
        } else {
          setIntencion("eliminar");
          const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
          await addDoc(chatCollection, {
            texto: `Selecciona una categoría:\n${lista}`,
            emisor: "ia",
            timestamp: new Date(),
          });
        }
      }

      if (intencion === "eliminar" && respuestaIA.intencion === "seleccionar_categoria") {
        const encontrada = categorias.find(
          (cat, i) => cat.nombre.toLowerCase() === mensaje.toLowerCase() || parseInt(mensaje) === i + 1
        );
        if (encontrada) {
          await deleteDoc(doc(db, "categorias", encontrada.id));
          await addDoc(chatCollection, {
            texto: `Categoría "${encontrada.nombre}" eliminada.`,
            emisor: "ia",
            timestamp: new Date(),
          });
          setIntencion(null);
        } else {
          await addDoc(chatCollection, {
            texto: "Selección inválida.",
            emisor: "ia",
            timestamp: new Date(),
          });
        }
      }

      // ACTUALIZAR
      if (respuestaIA.intencion === "actualizar") {
        if (categorias.length === 0) {
          await addDoc(chatCollection, {
            texto: "No hay categorías para actualizar.",
            emisor: "ia",
            timestamp: new Date(),
          });
          setIntencion(null);
        } else if (respuestaIA.seleccion) {
          const encontrada = categorias.find(
            (cat, i) =>
              cat.nombre.toLowerCase() === respuestaIA.seleccion.toLowerCase() ||
              parseInt(respuestaIA.seleccion) === i + 1
          );
          if (encontrada) {
            setCategoriaSeleccionada(encontrada);
            setIntencion("actualizar");
            await addDoc(chatCollection, {
              texto: `Seleccionaste "${encontrada.nombre}". Proporciona los nuevos datos.`,
              emisor: "ia",
              timestamp: new Date(),
            });
          } else {
            await addDoc(chatCollection, {
              texto: "Categoría no encontrada.",
              emisor: "ia",
              timestamp: new Date(),
            });
          }
        } else {
          setIntencion("actualizar");
          const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
          await addDoc(chatCollection, {
            texto: `Selecciona una categoría para actualizar:\n${lista}`,
            emisor: "ia",
            timestamp: new Date(),
          });
        }
      }

      if (intencion === "actualizar" && respuestaIA.intencion === "actualizar_datos" && categoriaSeleccionada) {
        const datos = respuestaIA.datos;
        const ref = doc(db, "categorias", categoriaSeleccionada.id);
        await updateDoc(ref, {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
        });
        await addDoc(chatCollection, {
          texto: `Categoría actualizada con éxito.`,
          emisor: "ia",
          timestamp: new Date(),
        });
        setIntencion(null);
        setCategoriaSeleccionada(null);
      }

    } catch (error) {
      console.error("Error procesando mensaje:", error);
      await addDoc(chatCollection, {
        texto: "Ocurrió un error procesando tu mensaje.",
        emisor: "ia",
        timestamp: new Date(),
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal show={showChatModal} onHide={() => setShowChatModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Asistente IA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          {mensajes.map((msg) => (
            <ListGroup.Item key={msg.id} className={msg.emisor === "usuario" ? "text-end" : "text-start"}>
              <strong>{msg.emisor === "usuario" ? "Tú" : "IA"}:</strong> {msg.texto}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Form.Group className="mt-3">
          <Form.Control
            type="text"
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
            disabled={cargando}
          />
        </Form.Group>
        <div className="mt-2 d-flex justify-content-end">
          <Button onClick={enviarMensaje} disabled={cargando}>
            {cargando ? <Spinner size="sm" animation="border" /> : "Enviar"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChatIA;
