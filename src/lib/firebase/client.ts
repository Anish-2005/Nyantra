// Firebase client initialization (single source of truth).
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

// Read config from NEXT_PUBLIC_* environment variables so keys are not hard-coded.
export const firebaseConfig = {
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

let app: FirebaseApp;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch {
  // fallback
  app = initializeApp(firebaseConfig);
}

export const firebaseApp = app;
export const auth = getAuth(app);
export const db = getFirestore(app);

// Development convenience: automatically sign in anonymously so local dev can access
// Firestore rules that require `request.auth != null`. This is only enabled in
// development to avoid inadvertently creating anonymous sessions in production.
if (process.env.NODE_ENV === 'development') {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
          console.log('Firebase: Signed in anonymously for development');
        } catch (error) {
          console.warn('Firebase: Anonymous sign-in failed, you may need to enable anonymous authentication in Firebase Console or sign in manually:', error);
          // Don't throw - allow the app to continue without auth for development
        }
      }
    });
  } catch (e) {
    console.warn('Firebase: Auth state listener setup failed:', e);
  }
}
