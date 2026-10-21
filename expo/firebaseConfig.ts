import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "elemental-context-w4mm2",
  appId: "1:583375871803:web:d0d330624d9cd9e113e11e",
  apiKey: "AIzaSyBR4sXn8mDVTUXw2vQaHqofQhug4F8jQus",
  authDomain: "elemental-context-w4mm2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-learnflow-8b5ac6e6-671e-4b90-ac7a-f92520e35b40",
  storageBucket: "elemental-context-w4mm2.firebasestorage.app",
  messagingSenderId: "583375871803",
  measurementId: "",
  oAuthClientId: "583375871803-cjtbp9lvtsdvg19h6vu5g8q75plpdiin.apps.googleusercontent.com"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export default app;
