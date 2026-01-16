/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import LanguageToggle from '../components/LanguageToggle';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ScrollToTopButton from '../components/landing/ScrollToTopButton';
import ProgressBar from '../components/landing/ProgressBar';
import Footer from '../components/landing/Footer';
import FAQ from '../components/landing/FAQ';
import Integrations from '../components/landing/Integrations';
import Benefits from '../components/landing/Benefits';
import Process from '../components/landing/Process';
import Features from '../components/landing/Features';
import Stats from '../components/landing/Stats';
import Hero from '../components/landing/Hero';
import Navigation from '../components/landing/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const NyantraLanding = () => {
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Use global theme from ThemeContext
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  return (
    <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>

      {/* Three.js Canvas Background */}
      <BackgroundAnimation />

      {/* Enhanced Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-20' : 'opacity-30'
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
        />
        <motion.div
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-20' : 'opacity-30'
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
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 theme-text-primary">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <Hero />

        {/* Stats Section */}
        <Stats />

        {/* Features Section */}
        <Features />

        {/* Process Section */}
        <Process />

        {/* Benefits Section */}
        <Benefits />

        {/* Integrations Section */}
        <Integrations />

        {/* FAQ Section */}
        <FAQ />

        {/* Footer with enhanced theme */}
        <Footer />

        {/* Floating Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Enhanced Progress Bar */}
        <ProgressBar />
      </div>
    </div>
  );
};

export default NyantraLanding;