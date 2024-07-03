// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSAZBkGuN45oiffvH9_jd0bThSV5GDun0",
  authDomain: "aplicativogerenciardadosmika.firebaseapp.com",
  projectId: "aplicativogerenciardadosmika",
  storageBucket: "aplicativogerenciardadosmika.appspot.com",
  messagingSenderId: "223002891066",
  appId: "1:223002891066:web:77492f9833d821a73e3603",
  measurementId: "G-1K2HYMMWJG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
