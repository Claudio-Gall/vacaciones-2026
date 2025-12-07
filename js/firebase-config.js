// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCXBQXHIWjege7g8wkQ8_TRL36P7cJ9388",
    authDomain: "vacaciones-2026-f4836.firebaseapp.com",
    projectId: "vacaciones-2026-f4836",
    storageBucket: "vacaciones-2026-f4836.firebasestorage.app",
    messagingSenderId: "887934980890",
    appId: "1:887934980890:web:c9cdf7812bb2f3c244d2a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
