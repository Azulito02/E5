import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Asegúrate de importar esto
import {getAuth} from "firebase/auth"

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

const db = getFirestore(appfirebase);

const auth = getAuth(appfirebase);

export {appfirebase, db, auth};
