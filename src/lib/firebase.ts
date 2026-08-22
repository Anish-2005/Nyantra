// Back-compat re-export. New code should import from '@/lib/firebase/client'
// or, preferably, from service interfaces.
export { auth, db, firebaseApp, firebaseConfig } from './firebase/client';
