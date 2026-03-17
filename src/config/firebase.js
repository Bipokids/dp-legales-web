import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyCFnH3RykpNHD990H6VYnppo2YQBaeySUY",
  authDomain: "dp-legales-684e2.firebaseapp.com",
  databaseURL: "https://dp-legales-684e2-default-rtdb.firebaseio.com",
  projectId: "dp-legales-684e2",
  storageBucket: "dp-legales-684e2.firebasestorage.app",
  messagingSenderId: "827712660153",
  appId: "1:827712660153:web:6d7fbb0cdaab7e9f89f168"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Exportamos la base de datos con ambos nombres para que sea compatible
// con todas las pantallas (Vencimientos, Deudas y la nueva de Causas).
export const db = getDatabase(app);
export const database = getDatabase(app);