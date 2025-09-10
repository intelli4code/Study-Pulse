import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQiKKjKf8uUN44SlNCvARsLk6_Obnj1tU",
  authDomain: "study-tracker-b0f03.firebaseapp.com",
  projectId: "study-tracker-b0f03",
  storageBucket: "study-tracker-b0f03.appspot.com",
  messagingSenderId: "130142924451",
  appId: "1:130142924451:web:92937291e44b2a1db45916",
  measurementId: "G-6G502WNHZR"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
