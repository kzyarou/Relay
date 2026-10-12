import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCzvc9-APa-8VPQxuubRtwMPDFvYoJI5cQ',
  authDomain: 'enya-9b04a.firebaseapp.com',
  databaseURL: 'https://enya-9b04a-default-rtdb.firebaseio.com',
  projectId: 'enya-9b04a',
  storageBucket: 'enya-9b04a.firebasestorage.app',
  messagingSenderId: '630810851296',
  appId: '1:630810851296:web:be82558458e9492c04dd85',
  measurementId: 'G-LMSL4TBL2K'
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getDatabase(firebaseApp);

// Analytics isn't available in every environment (e.g. sandboxed iframes), so only start it when supported.
isSupported().
then((supported) => {
  // Pin cookies to the exact host — shared hosts like *.vercel.app reject parent-domain cookies.
  if (supported) initializeAnalytics(firebaseApp, { config: { cookie_domain: window.location.hostname } });
}).
catch(() => {

  // Analytics is optional — ignore.
});