"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ScrollToTopButton from '../components/landing/ScrollToTopButton';
import ProgressBar from '../components/landing/ProgressBar';
import Navigation from '../components/landing/Navigation';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import Features from '../components/landing/Features';
import Process from '../components/landing/Process';
import Benefits from '../components/landing/Benefits';
import Integrations from '../components/landing/Integrations';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

/**
 * Landing page shell.
 *
 * Sections are statically imported on purpose: they are lightweight marketing
 * content, and lazy-loading them only produced spinner waterfalls. The page
 * paints instantly; framer-motion handles section reveal polish.
 */
const NyantraLanding = () => {
  const { theme } = useTheme();

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

      {/* Gradient Orbs - ambient depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${
            theme === 'dark' ? 'opacity-20' : 'opacity-30'
          }`}
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${
            theme === 'dark' ? 'opacity-20' : 'opacity-30'
          }`}
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 theme-text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Navigation />
        <Hero />
        <Stats />
        <Features />
        <Process />
        <Benefits />
        <Integrations />
        <FAQ />
        <Footer />

        {/* Floating Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Reading Progress Bar */}
        <ProgressBar />
      </motion.div>
    </div>
  );
};

export default NyantraLanding;
