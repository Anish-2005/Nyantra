"use client";
import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Sun, Moon } from 'lucide-react';

// Lazy load components for better performance
const VerifyBackground = lazy(() => import('@/components/verify/VerifyBackground').then(module => ({ default: module.VerifyBackground })));
const LanguageToggle = lazy(() => import('@/components/LanguageToggle').then(module => ({ default: module.default })));
const VerifyCard = lazy(() => import('@/components/verify/VerifyCard').then(module => ({ default: module.VerifyCard })));

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

export default function VerifyPage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useLocale();
  const preloadRef = useRef(false);

  // Preload images on mount
  useEffect(() => {
    if (!preloadRef.current) {
      preloadRef.current = true;
      preloadImages();
    }
  }, []);

  useEffect(() => {
    if (loading) return; // wait until auth/profile loading finishes
    if (!user) {
      router.push('/login');
      return;
    }

    if (profile === undefined) return; // still loading profile

    if (profile === null) {
      router.push('/choose-role');
      return;
    }

    if (profile?.role === 'officer') {
      router.push('/dashboard');
      return;
    }

    if (profile?.role === 'user' && profile?.verified) {
      router.push('/dashboard');
      return;
    }
  }, [user, profile, loading, router]);

  const startMockVerification = async () => {
    setVerifying(true);

    // Simulate verification progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // simulate Digilocker flow
    await new Promise((r) => setTimeout(r, 1500));

    // mark verified in Firestore via a client-side call
    try {
      const mod = await import('firebase/firestore');
      const { doc, updateDoc } = mod;
      const { db } = await import('@/lib/firebase');
      if (user) {
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, { verified: true });
      }
    } catch {
      // ignore; verification state may not persist in some environments
    }

    // Complete progress
    setProgress(100);
    clearInterval(interval);

    // give AuthContext a moment to pick up changes
    setTimeout(() => {
      setVerifying(false);
      router.push('/dashboard');
    }, 600);
  };

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
        <title>{t('extracted.verify_identity')} | Nyantra</title>
        <meta name="description" content={t('extracted.secure_identity_verification_description')} />
        <meta name="keywords" content="identity verification, secure access, Digilocker, user authentication" />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('extracted.verify_identity')} | Nyantra`} />
        <meta property="og:description" content={t('extracted.secure_identity_verification_description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-verify.png" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyantra.app'}/verify`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('extracted.verify_identity')} | Nyantra`} />
        <meta name="twitter:description" content={t('extracted.secure_identity_verification_description')} />
        <meta name="twitter:image" content="/og-verify.png" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Preload critical resources */}
        <link rel="preload" href="/Logo-Dark.png" as="image" />
        <link rel="preload" href="/Logo-Light.png" as="image" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": t('extracted.verify_identity'),
              "description": t('extracted.secure_identity_verification_description'),
              "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyantra.app'}/verify`,
              "isPartOf": {
                "@type": "WebApplication",
                "name": "Nyantra",
                "description": "Secure government service platform"
              }
            })
          }}
        />
      </Head>

      <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>
        {/* Enhanced Gradient Orbs */}
        <Suspense fallback={null}>
          <VerifyBackground />
        </Suspense>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Theme & Language Toggles */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Suspense fallback={null}>
                <LanguageToggle compact className="backdrop-blur-xl" />
              </Suspense>
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary backdrop-blur-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* Verification Card */}
            <Suspense fallback={<LoadingFallback />}>
              <VerifyCard
                verifying={verifying}
                progress={progress}
                onVerify={startMockVerification}
                t={t}
              />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </>
  );
}