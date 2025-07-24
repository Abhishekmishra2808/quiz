// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC98Ts1i7tjVQdBSCVzhlSS3pm9VcAvLoI",
  authDomain: "ai-quiz-clash.firebaseapp.com",
  projectId: "ai-quiz-clash",
  storageBucket: "ai-quiz-clash.firebasestorage.app",
  messagingSenderId: "651126284165",
  appId: "1:651126284165:web:2ac5113cf1b6280091eeec",
  measurementId: "G-EZBYZC5FGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);