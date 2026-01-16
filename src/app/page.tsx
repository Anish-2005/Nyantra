/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import LanguageToggle from '../components/LanguageToggle';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ScrollToTopButton from '../components/landing/ScrollToTopButton';
import ProgressBar from '../components/landing/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Lazy load components for better performance
const Footer = lazy(() => import('../components/landing/Footer'));
const FAQ = lazy(() => import('../components/landing/FAQ'));
const Integrations = lazy(() => import('../components/landing/Integrations'));
const Benefits = lazy(() => import('../components/landing/Benefits'));
const Process = lazy(() => import('../components/landing/Process'));
const Features = lazy(() => import('../components/landing/Features'));
const Stats = lazy(() => import('../components/landing/Stats'));
const Hero = lazy(() => import('../components/landing/Hero'));
const Navigation = lazy(() => import('../components/landing/Navigation'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <motion.div
      className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Page loading component
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <div className="text-center">
      <motion.div
        className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.h2
        className="text-xl font-semibold text-slate-700 dark:text-slate-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading Nyantra...
      </motion.h2>
    </div>
  </div>
);

// Main component for better performance
const NyantraLanding = () => {
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Use global theme from ThemeContext
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Preload critical images and mark page as loaded
  useEffect(() => {
    const preloadImages = ['/Logo-Dark.png', '/Logo-Light.png'];
    const promises = preloadImages.map(src => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        img.src = src;
      });
    });

    Promise.all(promises).then(() => {
      setIsPageLoaded(true);
    });
  }, []);

  // Mouse tracking with throttling for better performance
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Navigation helper: navigate according to authenticated user's role
  const navigateByRole = async () => {
    // wait briefly for auth loading to settle (max ~3s)
    const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const start = Date.now();
    while (loading && Date.now() - start < 3000) {
      // poll every 100ms while auth initializes
      // eslint-disable-next-line no-await-in-loop
      await waitFor(100);
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const role = profile?.role;
    if (role === 'officer') return router.push('/dashboard');
    if (role === 'user') return router.push('/user-dashboard');

    // logged in but no role selected yet
    return router.push('/choose-role');
  };

  // ThemeProvider manages persistence and document attribute; toggleTheme available from context

  const { t, locale, setLocale } = useLocale();

  // Show loading screen until critical resources are loaded
  if (!isPageLoaded) {
    return <PageLoading />;
  }

  return (
    <div
      data-theme={theme}
      className="relative min-h-screen overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--bg-gradient)' }}
      role="main"
      aria-label="Nyantra Landing Page"
    >

      {/* Three.js Canvas Background */}
      <BackgroundAnimation />

      {/* Enhanced Gradient Orbs - Reduced complexity for better performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${
            theme === 'dark' ? 'opacity-20' : 'opacity-30'
          }`}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          aria-hidden="true"
        />
        <motion.div
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${
            theme === 'dark' ? 'opacity-20' : 'opacity-30'
          }`}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          aria-hidden="true"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 theme-text-primary">
        {/* Navigation */}
        <Suspense fallback={<LoadingSpinner />}>
          <Navigation />
        </Suspense>

        {/* Hero Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <Hero />
        </Suspense>

        {/* Stats Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <Stats />
        </Suspense>

        {/* Features Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <Features />
        </Suspense>

        {/* Process Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <Process />
        </Suspense>

        {/* Benefits Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <Benefits />
        </Suspense>

        {/* Integrations Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <Integrations />
        </Suspense>

        {/* FAQ Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <FAQ />
        </Suspense>

        {/* Footer with enhanced theme */}
        <Suspense fallback={<LoadingSpinner />}>
          <Footer />
        </Suspense>

        {/* Floating Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Enhanced Progress Bar */}
        <ProgressBar />
      </div>
    </div>
  );
};

export default NyantraLanding;