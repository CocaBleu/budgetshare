import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Ta config Firebase copiée depuis la console
const firebaseConfig = {
  apiKey: "AIzaSyDluQmHqi-IjxDV5HJ6YjK2ieqV56d0MZU",
  authDomain: "budgetshareapp-9ecc3.firebaseapp.com",
  projectId: "budgetshareapp-9ecc3",
  storageBucket: "budgetshareapp-9ecc3.firebasestorage.app",
  messagingSenderId: "600644447105",
  appId: "1:600644447105:web:d0aa50f7fadf9fd3ff5680",
  measurementId: "G-WJ2G23XXYR"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Exporte les services que tu vas utiliser (authentification + base de données)
export const auth = getAuth(app);
export const db = getFirestore(app);
