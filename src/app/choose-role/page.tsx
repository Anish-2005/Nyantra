"use client";
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Sun, Moon } from 'lucide-react';

// Lazy load components for better performance
const ChooseRoleBackground = lazy(() => import('@/components/choose-role/ChooseRoleBackground').then(module => ({ default: module.ChooseRoleBackground })));
const LanguageToggle = lazy(() => import('@/components/LanguageToggle').then(module => ({ default: module.default })));
const ChooseRoleMainCard = lazy(() => import('@/components/choose-role/ChooseRoleMainCard').then(module => ({ default: module.ChooseRoleMainCard })));
const BackgroundAnimation = lazy(() => import('@/components/BackgroundAnimation'));

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

export default function ChooseRolePage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const router = useRouter();
  const preloadRef = useRef(false);

  // Preload images on mount
  useEffect(() => {
    if (!preloadRef.current) {
      preloadRef.current = true;
      preloadImages();
    }
  }, []);

  React.useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && profile?.role) {
      // role already chosen; redirect accordingly
      if (profile.role === 'officer') router.push('/dashboard');
      else if (profile.role === 'user') {
        if (profile.verified) router.push('/user-dashboard');
        else router.push('/verify');
      }
    }
  }, [user, profile, loading, router]);

  const pickRole = async (role: 'officer' | 'user') => {
    if (!user) return;
    try {
      const fb = await import('@/lib/firebase');
      const mod = await import('firebase/firestore');
      const { doc, setDoc, serverTimestamp } = mod;
      const ref = doc(fb.db, 'users', user.uid);
      // use setDoc with merge to create or update safely; include createdAt when creating
      await setDoc(ref, { role, verified: role === 'officer' ? true : false, createdAt: serverTimestamp() }, { merge: true });
      if (role === 'officer') router.push('/dashboard');
      else router.push('/verify');
    } catch (err: unknown) {
      // Surface firebase permission errors clearly without using `any`
      try { console.error('[choose-role] failed to update profile', err); } catch { }
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as Record<string, unknown>).code : undefined;
      if (code === 'permission-denied') {
        alert('Permission denied: your Firestore rules prevent updating your profile. Check security rules or sign-in state.');
      }
      // stay on choose-role so user can retry
      router.push('/choose-role');
    }
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
        <title>{t('extracted.choose_role')} | Nyantra</title>
        <meta name="description" content={t('extracted.select_your_role_description')} />
        <meta name="keywords" content="role selection, user role, officer role, platform access, beneficiary, administrator" />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('extracted.choose_role')} | Nyantra`} />
        <meta property="og:description" content={t('extracted.select_your_role_description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-choose-role.png" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyantra.app'}/choose-role`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('extracted.choose_role')} | Nyantra`} />
        <meta name="twitter:description" content={t('extracted.select_your_role_description')} />
        <meta name="twitter:image" content="/og-choose-role.png" />

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
              "name": t('extracted.choose_role'),
              "description": t('extracted.select_your_role_description'),
              "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyantra.app'}/choose-role`,
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
          <BackgroundAnimation />
          <ChooseRoleBackground />
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

            {/* Role Selection Card */}
            <Suspense fallback={<LoadingFallback />}>
              <ChooseRoleMainCard
                onPickUser={() => pickRole('user')}
                onPickOfficer={() => pickRole('officer')}
                t={t}
              />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </>
  );
}