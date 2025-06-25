// Configuration Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase (à remplacer par vos propres clés)
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "wellbeing-compass.firebaseapp.com",
  projectId: "wellbeing-compass",
  storageBucket: "wellbeing-compass.appspot.com",
  messagingSenderId: "123456789",
  appId: "VOTRE_APP_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
export const db = getFirestore(app);

// Initialiser Auth
export const auth = getAuth(app);

export default app;
