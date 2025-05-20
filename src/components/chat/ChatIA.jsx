import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";
import { readUsedSize } from "chart.js/helpers";

const ChatIA = ({ showChatModal, setShowChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const chatCollection = collection(db, "chat");

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

  const obtenerRespuestaIA = async (promptUsuario) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;


    const prompt = `Extrae el nombre y la descripcion de categoria en este mensaje: "${promptUsuario}". Si el
usuario no provee una descripcion, generas una descripcion corta basandote en el nombre. Asegurate de que el nombre
y descripcion comiencen con mayusculas. Devuelvelo en JSON como {"nombre": "...", "descripcion": "..."}.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
            },
          }),
        }
      );

      if (response.status === 429) {
        return "Has alcanzado el límite de solicitudes. Intenta de nuevo más tarde.";
      }

      const data = await response.json();
      const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text;

      return respuestaIA || "No hubo respuesta de la IA.";
    } catch (error) {
      console.error("Error al obtener respuesta de la IA", error);
      return "No se pudo conectar con la IA.";
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;
    setCargando(true);

    await addDoc(chatCollection, {
      texto: mensaje,
      emisor: "usuario",
      timestamp: new Date(),
    });

    const respuesta = await obtenerRespuestaIA(mensaje);

    await addDoc(chatCollection, {
      texto: respuesta,
      emisor: "ia",
      timestamp: new Date(),
    });

    setMensaje("");
    setCargando(false);
  };

  return (
    <Modal show={showChatModal} onHide={() => setShowChatModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chat con IA</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ListGroup style={{ maxHeight: "300px", overflowY: "auto" }}>
          {mensajes.map((msg) => (
            <ListGroup.Item
              key={msg.id}
              variant={msg.emisor === "ia" ? "light" : "primary"}
            >
              <strong>{msg.emisor === "ia" ? "IA: " : "Tú: "}</strong>
              {msg.texto}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Form.Control
          className="mt-3"
          type="text"
          placeholder="Escribe tu mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowChatModal(false)}>
          Cerrar
        </Button>
        <Button onClick={enviarMensaje} disabled={cargando}>
          {cargando ? <Spinner size="sm" animation="border" /> : "Enviar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatIA;