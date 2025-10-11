// Firebase client initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Read config from NEXT_PUBLIC_* environment variables so keys are not hard-coded.
// These variables are exposed to the browser by Next.js when prefixed with NEXT_PUBLIC_.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Basic runtime check: warn in development if any key is missing to help debugging.
if (process.env.NODE_ENV === 'development') {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
     
    console.warn(
      `[firebase] missing NEXT_PUBLIC env vars: ${missing.join(', ')}. ` +
        'Copy .env.example to .env.local and fill in your Firebase config.'
    );
  }
}

// Initialize app only once
let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch {
  // fallback
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
