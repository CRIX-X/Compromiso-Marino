import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRQbAN-xRDYeUTJ1CXFAVUBdP9-Vdx1CQ",
  authDomain: "compromiso-marino.firebaseapp.com",
  projectId: "compromiso-marino",
  storageBucket: "compromiso-marino.firebasestorage.app",
  messagingSenderId: "595711367078",
  appId: "1:595711367078:web:9a2c7d7cbcbb7bd3292167"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);