// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "estate-2f08a.firebaseapp.com",
  projectId: "estate-2f08a",
  storageBucket: "estate-2f08a.firebasestorage.app",
  messagingSenderId: "313821753158",
  appId: "1:313821753158:web:18fd2b494d88a52b343f47"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);