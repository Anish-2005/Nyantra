"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';

type AuthContextValue = {
  user: User | null;
  profile: { role?: 'officer' | 'user'; verified?: boolean } | null | undefined;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role?: 'officer' | 'user'; verified?: boolean } | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub: Unsubscribe | null = null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (profileUnsub) {
        try { profileUnsub(); } catch {}
        profileUnsub = null;
      }

      if (u) {
        try {
          const ref = doc(db, 'users', u.uid);
          // subscribe to profile changes
          profileUnsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) setProfile(snap.data() as any);
            else setProfile(null);
            setLoading(false);
          }, (err) => {
            try { console.error('[auth] profile onSnapshot error', err); } catch {}
            setProfile(null);
            setLoading(false);
          });
        } catch (err) {
          try { console.error('[auth] failed to attach profile listener', err); } catch {}
          setProfile(null);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      try { unsub(); } catch {}
      try { if (profileUnsub) profileUnsub(); } catch {}
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const signUp = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // create a minimal profile document without role; role will be chosen after login
    const ref = doc(db, 'users', cred.user.uid);
    try {
      await setDoc(ref, { verified: false, createdAt: serverTimestamp() });
    } catch (e) {
      // Log and rethrow so caller can show error
      try { console.error('[auth] signUp: failed to create profile doc', e); } catch {}
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      // Popup may be blocked by Cross-Origin-Opener-Policy or browser settings.
      // Fall back to redirect-based flow which works reliably when popups are blocked.
      try { console.warn('[auth] signInWithPopup failed, falling back to signInWithRedirect', err); } catch {}
      try {
        await signInWithRedirect(auth, provider);
      } catch (e) {
        try { console.error('[auth] signInWithRedirect also failed', e); } catch {}
        throw e;
      }
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
