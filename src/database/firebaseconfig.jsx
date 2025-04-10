import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Asegúrate de importar esto
import {getAuth} from "firebase/auth"
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr7pTesPaRylZogIQ-uskkzZO_SJvVSZE",
  authDomain: "prueba2-a0f69.firebaseapp.com",
  projectId: "prueba2-a0f69",
  storageBucket: "prueba2-a0f69.firebasestorage.app",
  messagingSenderId: "768476110306",
  appId: "1:768476110306:web:b2d824c8fdcda3383b2dbb",
  measurementId: "G-0FRPXZEB3N"
};



const appfirebase = initializeApp(firebaseConfig);

let db;
try {
  db = initializeFirestore(appfirebase, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100 * 1024 * 1024, // 100 MB (opcional, para limitar tamaño)
    }),
  });
  console.log("Firestore inicializado con persistencia offline.");
} catch (error) {
  console.error("Error al inicializar Firestore con persistencia:", error);
  // Fallback: inicializar sin persistencia si falla
  db = initializeFirestore(appfirebase, {});
}


const auth = getAuth(appfirebase);

export {appfirebase, db, auth};
