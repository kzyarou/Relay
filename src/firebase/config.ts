import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCzvc9-APa-8VPQxuubRtwMPDFvYoJI5cQ",
  authDomain: "enya-9b04a.firebaseapp.com",
  projectId: "enya-9b04a",
  storageBucket: "enya-9b04a.firebasestorage.app",
  messagingSenderId: "630810851296",
  appId: "1:630810851296:web:be82558458e9492c04dd85",
  measurementId: "G-LMSL4TBL2K"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const realtimeDB = getDatabase(app);

export { app, analytics, firestore, realtimeDB };
