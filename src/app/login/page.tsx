"use client";
import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import Head from 'next/head';

// Lazy load components for better performance
const BackgroundAnimation = lazy(() => import('@/components/BackgroundAnimation'));
const GradientOrbs = lazy(() => import('@/components/login/GradientOrbs').then(module => ({ default: module.GradientOrbs })));
const ThemeToggle = lazy(() => import('@/components/login/ThemeToggle').then(module => ({ default: module.ThemeToggle })));
const LanguageToggle = lazy(() => import('@/components/LanguageToggle').then(module => ({ default: module.default })));
const LoginCard = lazy(() => import('@/components/login/LoginCard').then(module => ({ default: module.LoginCard })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Preload critical images
const preloadImages = () => {
  return new Promise<void>((resolve) => {
    const images = ['/Logo-Dark.png', '/Logo-Light.png'];
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        resolve();
      }
    };

    images.forEach(src => {
      const img = new window.Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = src;
    });
  });
};

// Helper to safely extract message from unknown error
function messageFromUnknown(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const maybe = (err as Record<string, unknown>).message;
    return typeof maybe === 'string' ? maybe : null;
  }
  return null;
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, user, profile, loading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocale();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Preload images on mount
  useEffect(() => {
    preloadImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) await signUp(email, password);
      else await signIn(email, password);
      // fetch profile immediately and route (avoids waiting for AuthContext refresh)
      try {
        const fb = await import('@/lib/firebase');
        const mod = await import('firebase/firestore');
        const { doc, getDoc } = mod;
        const current = fb.auth.currentUser;
        let p: Record<string, unknown> | null = null;
        if (current) {
          const snap = await getDoc(doc(fb.db, 'users', current.uid));
          p = snap.exists() ? snap.data() : null;
        }
        if (p === null) router.push('/choose-role');
        else if (p?.role === 'officer') router.push('/dashboard');
        else if (p?.role === 'user') {
          if (p.verified) router.push('/dashboard');
          else router.push('/verify');
        } else router.push('/choose-role');
      } catch (e) {
        try { console.error('[login] post-signin profile read failed, routing to /choose-role', e); } catch { }
        router.push('/choose-role');
      }
    } catch (err: unknown) {
      setError(messageFromUnknown(err) || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // fetch profile immediately and route
      try {
        const fb = await import('@/lib/firebase');
        const mod = await import('firebase/firestore');
        const { doc, getDoc } = mod;
        const current = fb.auth.currentUser;
        let p: Record<string, unknown> | null = null;
        if (current) {
          const snap = await getDoc(doc(fb.db, 'users', current.uid));
          p = snap.exists() ? snap.data() : null;
        }
        // treat null profile as "choose role" — same behavior as email/password sign-in
        if (p === null) {
          // small console trace for local debugging
          try { console.debug('[login] google sign-in: no profile, routing to /choose-role'); } catch { };
          router.push('/choose-role');
        } else if (p?.role === 'officer') router.push('/dashboard');
        else if (p?.role === 'user') {
          if (p.verified) router.push('/dashboard');
          else router.push('/verify');
        } else router.push('/choose-role');
      } catch (e) {
        // fallback to choose-role rather than forcing dashboard
        try { console.error('[login] google sign-in: error reading profile, falling back to /choose-role', e); } catch { };
        router.push('/choose-role');
      }
    } catch (err: unknown) {
      setError(messageFromUnknown(err) || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to dashboard when user is authenticated (do this in effect to avoid updates during render)
  // Redirect when auth + profile state is available
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    // wait until profile is loaded (undefined means not loaded yet)
    if (profile === undefined) return;

    if (profile === null) {
      // no profile document yet — ask user to choose role
      router.push('/choose-role');
      return;
    }

    if (profile?.role === 'officer') router.push('/dashboard');
    else if (profile?.role === 'user') {
      if (profile.verified) router.push('/dashboard');
      else router.push('/verify');
    } else if (profile && !profile.role) {
      // profile exists but role not chosen yet
      router.push('/choose-role');
    } else {
      // fallback: if profile shape is unexpected, send to choose-role so user can self-correct
      try { console.warn('[login] unexpected profile shape, routing to /choose-role', profile); } catch { }
      router.push('/choose-role');
    }
  }, [user, profile, loading, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <Head>
        <title>Login - Nyantra DBT Portal | Secure Access to Government Benefits</title>
        <meta name="description" content="Secure login to Nyantra DBT Portal. Access government benefits, track disbursements, and manage your social welfare entitlements with our secure authentication system." />
        <meta name="keywords" content="login, authentication, DBT portal, government benefits, secure access, user login, officer login" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Login - Nyantra DBT Portal" />
        <meta property="og:description" content="Secure access to government benefits and welfare schemes through Nyantra's DBT portal." />
        <meta property="og:image" content="https://nyantra.vercel.app/login-og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Login - Nyantra DBT Portal" />
        <meta property="twitter:description" content="Secure access to government benefits and welfare schemes." />
        <meta property="twitter:image" content="https://nyantra.vercel.app/login-og-image.jpg" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://nyantra.vercel.app/login" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Login - Nyantra DBT Portal",
              "description": "Secure login page for Nyantra's Direct Benefit Transfer portal providing access to government welfare schemes and benefits.",
              "url": "https://nyantra.vercel.app/login",
              "isPartOf": {
                "@type": "WebSite",
                "name": "Nyantra",
                "url": "https://nyantra.vercel.app"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Nyantra",
                "description": "Empowering Justice Through Technology"
              },
              "potentialAction": {
                "@type": "LoginAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://nyantra.vercel.app/login"
                }
              }
            })
          }}
        />
      </Head>

      <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>
        {/* Theme Variables */}
        <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%),
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%),
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.7);
          --card-border: rgba(255, 255, 255, 0.08);
          --nav-bg: rgba(15, 23, 42, 0.95);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --accent-primary: #06b6d4;
          --accent-secondary: #8b5cf6;
          --glass-bg: rgba(15, 23, 42, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        [data-theme="light"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%),
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%),
                         linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          --card-bg: rgba(255, 255, 255, 0.8);
          --card-border: rgba(0, 0, 0, 0.06);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        .theme-bg-nav { background: var(--nav-bg) !important; }

        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }

        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

        {/* Three.js Canvas Background */}
        <Suspense fallback={null}>
          <BackgroundAnimation />
        </Suspense>

        {/* Enhanced Gradient Orbs */}
        <Suspense fallback={null}>
          <GradientOrbs />
        </Suspense>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-5xl"
          >
            {/* Theme & Language Toggles */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Suspense fallback={null}>
                <LanguageToggle compact />
              </Suspense>
              <Suspense fallback={null}>
                <ThemeToggle />
              </Suspense>
            </div>

            {/* Login Card */}
            <Suspense fallback={<LoadingFallback />}>
              <LoginCard
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                isRegister={isRegister}
                setIsRegister={setIsRegister}
                error={error}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onGoogleSignIn={handleGoogleSignIn}
                t={t}
              />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </>
  );
}