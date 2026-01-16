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
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Menu, X, ChevronRight, Shield, Users, Zap, CheckCircle, ArrowRight, Rocket, Sun, Moon, Sparkles, BadgeCheck, Target, Activity, CheckSquare, UserCheck, Wallet, Clock, Upload, Star, Database, Lock, TrendingUp } from 'lucide-react';

const NyantraLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  const [stats, setStats] = useState({
    beneficiaries: 0,
    disbursed: 0,
    avgTime: 0,
    satisfaction: 0
  });

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

  // Scroll detection for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      const duration = 2500;
      const steps = 80;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setStats({
          beneficiaries: Math.floor(45000 * easeOut),
          disbursed: Math.floor(250 * easeOut),
          avgTime: Math.floor(72 * easeOut),
          satisfaction: Math.floor(94 * easeOut)
        });

        if (step >= steps) clearInterval(timer);
      }, interval);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
      }
    }, { threshold: 0.5 });

    const statsElement = document.getElementById('stats-section');
    if (statsElement) observer.observe(statsElement);

    return () => observer.disconnect();
  }, []);

  // ThemeProvider manages persistence and document attribute; toggleTheme available from context

  const { t, locale, setLocale } = useLocale();

  const features = [
    {
      icon: Shield,
      title: t('features.secureVerification.title'),
      description: t('features.secureVerification.description'),
      color: "from-blue-500 to-blue-600",
      darkColor: "from-blue-500 to-blue-600",
      lightColor: "from-blue-400 to-blue-500",
      features: JSON.parse(t('features.secureVerification.features')) as string[]
    },
    {
      icon: Zap,
      title: t('features.realTimeTracking.title'),
      description: t('features.realTimeTracking.description'),
      color: "from-amber-500 to-amber-600",
      darkColor: "from-amber-500 to-amber-600",
      lightColor: "from-amber-400 to-amber-500",
      features: JSON.parse(t('features.realTimeTracking.features')) as string[]
    },
    {
      icon: Database,
      title: t('features.unifiedDatabase.title'),
      description: t('features.unifiedDatabase.description'),
      color: "from-indigo-500 to-indigo-600",
      darkColor: "from-indigo-500 to-indigo-600",
      lightColor: "from-indigo-400 to-indigo-500",
      features: JSON.parse(t('features.unifiedDatabase.features')) as string[]
    },
    {
      icon: Lock,
      title: t('features.privacyProtection.title'),
      description: t('features.privacyProtection.description'),
      color: "from-purple-500 to-purple-600",
      darkColor: "from-purple-500 to-purple-600",
      lightColor: "from-purple-400 to-purple-500",
      features: JSON.parse(t('features.privacyProtection.features')) as string[]
    },
    {
      icon: TrendingUp,
      title: t('features.analyticsDashboard.title'),
      description: t('features.analyticsDashboard.description'),
      color: "from-green-500 to-green-600",
      darkColor: "from-green-500 to-green-600",
      lightColor: "from-green-400 to-green-500",
      features: JSON.parse(t('features.analyticsDashboard.features')) as string[]
    },
    {
      icon: Users,
      title: t('features.multiStakeholder.title'),
      description: t('features.multiStakeholder.description'),
      color: "from-pink-500 to-pink-600",
      darkColor: "from-pink-500 to-pink-600",
      lightColor: "from-pink-400 to-pink-500",
      features: JSON.parse(t('features.multiStakeholder.features')) as string[]
    }
  ];

  const icons = [UserCheck, Upload, CheckSquare, CheckCircle, Wallet, Activity];
  const colors = [
    { dark: "bg-blue-500", light: "bg-blue-400" },
    { dark: "bg-indigo-500", light: "bg-indigo-400" },
    { dark: "bg-purple-500", light: "bg-purple-400" },
    { dark: "bg-green-500", light: "bg-green-400" },
    { dark: "bg-amber-500", light: "bg-amber-400" },
    { dark: "bg-pink-500", light: "bg-pink-400" }
  ];

  const processSteps = JSON.parse(t('process.steps')).map((step: any, i: number) => ({
    ...step,
    icon: icons[i],
    darkColor: colors[i].dark,
    lightColor: colors[i].light
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>
      {/* Enhanced Theme Variables */}
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.8);
          --card-border: rgba(255, 255, 255, 0.12);
          --nav-bg: rgba(15, 23, 42, 0.95);
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --text-muted: #64748b;
          /* Enhanced dark accent: teal -> violet with better contrast */
          --accent-primary: #14b8a6; /* emerald-400 for better contrast */
          --accent-secondary: #8b5cf6; /* violet-500 */
          --glass-bg: rgba(15, 23, 42, 0.7);
          --glass-border: rgba(255, 255, 255, 0.15);
          --hover-bg: rgba(255, 255, 255, 0.05);
          --shadow-color: rgba(0, 0, 0, 0.3);
        }

        [data-theme="light"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          --card-bg: rgba(255, 255, 255, 0.9);
          --card-border: rgba(0, 0, 0, 0.08);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          /* Enhanced light accent: rose -> orange with better contrast */
          --accent-primary: #f43f5e; /* rose-500 for better contrast */
          --accent-secondary: #fb923c; /* orange-400 */
          --glass-bg: rgba(255, 255, 255, 0.8);
          --glass-border: rgba(0, 0, 0, 0.1);
          --hover-bg: rgba(0, 0, 0, 0.02);
          --shadow-color: rgba(0, 0, 0, 0.1);
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
        /* Smooth scrolling for anchor links and programmatic scrolls
           scroll-padding-top accounts for the fixed header so sections aren't hidden behind it */
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 6rem; /* adjust if header height changes */
        }

        /* Respect users who prefer reduced motion */
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>

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
        {/* Enhanced Navigation */}
        <motion.nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b theme-border-glass ${isScrolled ? 'theme-bg-nav shadow-2xl' : 'bg-transparent'
            }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <motion.div
                className="flex items-center space-x-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden bg-transparent rounded-xl theme-bg-glass theme-border-glass border">
                  <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('nav.brandName')} width={44} height={44} className="object-contain" />
                </div>
                <span className="text-2xl font-bold text-accent-gradient overflow-visible" style={{ lineHeight: '1.4' }}>
                  {t('nav.brandName')}
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {[
                  { label: t('nav.features'), id: 'features' },
                  { label: t('nav.process'), id: 'process' },
                  { label: t('nav.benefits'), id: 'benefits' },
                  { label: t('nav.integrations'), id: 'integrations' },
                  { label: t('nav.faq'), id: 'faq' }
                ].map((item) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    className="relative px-4 py-2.5 theme-text-secondary hover:text-accent-gradient transition-all font-medium rounded-xl hover:theme-bg-glass group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" />
                  </motion.a>
                ))}
                <div className="w-px h-6 bg-theme-border-glass mx-2" />
                <motion.button
                  onClick={() => navigateByRole()}
                  aria-label={t('extracted.get_started_continue')}
                  className="px-6 py-2.5 accent-gradient rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">{t('nav.getStarted')}</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                {/* Language selector (toggle) */}
                <div className="ml-2">
                  <LanguageToggle />
                </div>

                {/* Enhanced Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="ml-2 w-11 h-11 rounded-xl flex items-center justify-center theme-border-glass border theme-bg-glass hover:theme-bg-card transition-all relative group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={t('extracted.toggle_theme')}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
                      ) : (
                        <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden theme-text-primary p-2 rounded-xl theme-bg-glass theme-border-glass border"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle mobile menu"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden theme-bg-nav backdrop-blur-xl border-t theme-border-glass shadow-2xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 py-6 space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: t('nav.features'), id: 'features' },
                      { label: t('nav.process'), id: 'process' },
                      { label: t('nav.benefits'), id: 'benefits' },
                      { label: t('nav.integrations'), id: 'integrations' },
                      { label: t('nav.faq'), id: 'faq' }
                    ].map((item, index) => (
                      <motion.a
                        key={item.id}
                        href={`#${item.id}`}
                        className="flex items-center justify-between theme-text-secondary hover:text-accent-gradient transition-all font-medium px-4 py-3 rounded-xl hover:theme-bg-glass group"
                        whileHover={{ x: 8 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                    ))}
                  </div>

                  <div className="border-t theme-border-glass pt-4 space-y-4">
                    <motion.button
                      onClick={() => { navigateByRole(); setIsMobileMenuOpen(false); }}
                      aria-label={t('extracted.get_started_continue')}
                      className="w-full px-6 py-3 accent-gradient rounded-xl font-semibold text-white shadow-lg relative overflow-hidden group"
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <span className="relative z-10">{t('nav.getStarted')}</span>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <LanguageToggle />
                      </div>
                      <motion.button
                        onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                        className="w-full px-4 py-3 rounded-xl theme-border-glass border theme-bg-glass flex items-center justify-center space-x-2 theme-text-primary hover:theme-bg-card transition-all group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />}
                        <span className="font-medium text-sm">Theme</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Enhanced Hero Section */}
        <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-left space-y-6 sm:space-y-10"
              >
                <motion.div variants={itemVariants}>
                  <motion.span
                    className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4 sm:mb-6 shadow-lg backdrop-blur-lg"
                    animate={{
                      boxShadow: theme === 'dark'
                        ? ['0 0 0 0 rgba(20, 184, 166, 0.4)', '0 0 0 12px rgba(20, 184, 166, 0)', '0 0 0 0 rgba(20, 184, 166, 0)']
                        : ['0 0 0 0 rgba(244, 63, 94, 0.4)', '0 0 0 12px rgba(244, 63, 94, 0)', '0 0 0 0 rgba(244, 63, 94, 0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-accent-gradient" />
                    {t('hero.badge')}
                  </motion.span>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl md:text-7xl font-bold theme-text-primary overflow-visible leading-tight"
                  style={{ lineHeight: '1.1' }}
                >
                  {t('hero.titleLine1')}{' '}
                  <span className="py-1 sm:py-2 text-accent-gradient block md:inline">
                    {t('hero.titleLine2').split('\n')[0]}
                  </span>
                  <br className="hidden md:block" />
                  <span className="block mt-1 sm:mt-2 md:mt-0">
                    {t('hero.titleLine2').split('\n')[1] || ''}
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg sm:text-xl md:text-2xl theme-text-secondary leading-relaxed max-w-2xl"
                >
                  {t('hero.description')}
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
                >
                  <motion.button
                    onClick={() => navigateByRole()}
                    aria-label={t('extracted.apply_now_continue')}
                    className="px-6 sm:px-10 py-4 sm:py-5 accent-gradient rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white flex items-center justify-center space-x-2 sm:space-x-3 shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">{t('hero.applyNow')}</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>

                  <motion.button
                    className="px-6 sm:px-10 py-4 sm:py-5 theme-bg-glass theme-border-glass border-2 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 sm:space-x-3 theme-text-primary hover:shadow-2xl transition-all group"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{t('hero.watchDemo')}</span>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-6 sm:pt-8"
                >
                  <div className="flex -space-x-3 sm:-space-x-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full accent-gradient border-2 sm:border-4 theme-bg-card flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-xl"
                        whileHover={{ scale: 1.3, zIndex: 10 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {i}K+
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm theme-text-muted font-medium">{t('extracted.trusted_by')} </p>
                    <p className="text-lg sm:text-2xl font-bold text-accent-gradient">{t('extracted.45000_beneficiaries')} </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative mt-8 lg:mt-0"
              >
                <div className="relative theme-bg-card backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 theme-border-card shadow-3xl border-2">
                  {/* Dashboard Header */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-transparent theme-border-glass border-2">
                          <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantara_logo')} width={40} height={40} className="object-contain" />
                        </div>
                        <div>
                          <p className="font-bold theme-text-primary text-base sm:text-lg">{t('extracted.application_status')} </p>
                          <p className="text-xs sm:text-sm theme-text-muted">{t('extracted.realtime_tracking')} </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs sm:text-sm font-medium text-green-400">Live</span>
                      </div>
                    </div>

                    {/* Status Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: t('extracted.verified'), value: '100%', icon: BadgeCheck, color: 'from-green-500 to-emerald-500', status: 'success' },
                        { label: t('extracted.processing'), value: '2 hrs', icon: Clock, color: 'from-blue-500 to-cyan-500', status: 'active' },
                        { label: t('extracted.amount'), value: '₹40K', icon: Wallet, color: 'from-amber-500 to-orange-500', status: 'pending' },
                        { label: t('extracted.status'), value: t('extracted.active'), icon: Activity, color: 'from-purple-500 to-pink-500', status: 'active' }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className={`bg-gradient-to-br ${item.color} p-3 sm:p-5 rounded-xl sm:rounded-2xl text-white shadow-xl relative overflow-hidden group`}
                          whileHover={{ scale: 1.05, y: -3 }}
                          animate={{
                            boxShadow: theme === 'dark'
                              ? ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                              : ['0 0 20px rgba(30, 64, 175, 0.2)', '0 0 30px rgba(30, 64, 175, 0.3)', '0 0 20px rgba(30, 64, 175, 0.2)']
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <item.icon className="w-5 h-5 sm:w-7 sm:h-7 mb-2 sm:mb-3 text-white drop-shadow-lg" />
                          <p className="text-xl sm:text-3xl font-bold text-white mb-1">{item.value}</p>
                          <p className="text-xs sm:text-sm text-white/90">{item.label}</p>
                          <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            item.status === 'success' ? 'bg-green-300' :
                            item.status === 'active' ? 'bg-blue-300' : 'bg-amber-300'
                          }`} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Activity Feed */}
                    <div className="theme-bg-glass rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 theme-border-glass border">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-semibold theme-text-secondary">{t('extracted.recent_activities')} </p>
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs theme-text-muted">Live updates</span>
                        </div>
                      </div>
                      {[
                        { text: t('extracted.application_submitted'), time: t('extracted.two_mins_ago'), status: 'success', icon: CheckCircle },
                        { text: t('extracted.document_verified'), time: t('extracted.one_hour_ago'), status: 'success', icon: CheckCircle },
                        { text: t('extracted.approval_pending'), time: t('extracted.three_hours_ago'), status: 'pending', icon: Clock }
                      ].map((activity, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center justify-between text-xs sm:text-sm p-2 sm:p-3 rounded-lg sm:rounded-xl theme-bg-card theme-border-card border"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                              activity.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              <activity.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            <span className="theme-text-primary font-medium text-xs sm:text-sm">{activity.text}</span>
                          </div>
                          <span className="theme-text-muted text-xs">{activity.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Icons */}
                  <motion.div
                    className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 accent-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 accent-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  {/* Notification Badge */}
                  <motion.div
                    className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-white text-xs font-bold">3</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 theme-border-glass rounded-full flex justify-center pt-1.5 sm:pt-2">
              <motion.div
                className="w-0.5 h-1.5 sm:w-1 sm:h-2 rounded-full accent-gradient"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        
        {/* Enhanced Stats Section */}
        <section
          id="stats-section"
          className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
          {/* Background Glows */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/4 w-72 h-72 blur-[100px] rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--accent-primary, rgba(59,130,246,0.1)), transparent)' }} />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 blur-[100px] rounded-full animate-pulse delay-300" style={{ background: 'linear-gradient(135deg, var(--accent-secondary, rgba(245,158,11,0.08)), transparent)' }} />
          </div>

          {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary">
              {t('stats.impactTitle')}
            </h2>
            <p className="mt-2 text-sm sm:text-base theme-text-muted">
              {t('stats.impactSubtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            {[
              {
                label: t('stats.beneficiaries'),
                value: stats.beneficiaries.toLocaleString(),
                suffix: '+',
                icon: Users,
                colorLight: 'from-blue-500 to-cyan-400',
                colorDark: 'from-blue-400 to-indigo-500',
              },
              {
                label: t('stats.disbursed'),
                value: stats.disbursed,
                suffix: 'Cr+',
                icon: TrendingUp,
                colorLight: 'from-green-500 to-emerald-400',
                colorDark: 'from-emerald-400 to-teal-500',
              },
              {
                label: t('stats.avgTime'),
                value: stats.avgTime,
                suffix: 'hrs',
                icon: Clock,
                colorLight: 'from-amber-500 to-orange-400',
                colorDark: 'from-amber-400 to-yellow-500',
              },
              {
                label: t('stats.satisfaction'),
                value: stats.satisfaction,
                suffix: '%',
                icon: Star,
                colorLight: 'from-purple-500 to-pink-500',
                colorDark: 'from-fuchsia-400 to-pink-500',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="relative group"
              >
                <div
                  className="theme-bg-card theme-border-card backdrop-blur-2xl rounded-2xl p-6 transition-all duration-300 hover:theme-border-glass hover:shadow-lg hover:shadow-[var(--accent-color)/40]"
                  style={{
                    ['--accent-color' as any]:
                      stat.colorLight.includes('blue')
                        ? '#3b82f6'
                        : stat.colorLight.includes('amber')
                          ? '#f59e0b'
                          : stat.colorLight.includes('green')
                            ? '#10b981'
                            : '#8b5cf6',
                  }}
                >
                  {/* Icon */}
                  <div
                    className={`
              w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md transition-transform
              bg-gradient-to-br ${stat.colorLight} dark:${stat.colorDark}
            `}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Value */}
                  <div className="text-4xl font-extrabold tracking-tight theme-text-primary">
                    {stat.value}
                    <span className="text-2xl font-semibold text-accent-gradient ml-1">
                      {stat.suffix}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium theme-text-muted">
                    {stat.label}
                  </p>
                </div>

                {/* Hover Glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.colorLight} dark:${stat.colorDark} opacity-0 group-hover:opacity-20 blur-2xl rounded-2xl transition duration-500 -z-10`}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Soft glowing background accents */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/3 w-80 h-80 blur-[120px] rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--accent-primary, rgba(59,130,246,0.18)), transparent)' }} />
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 blur-[120px] rounded-full animate-pulse delay-300" style={{ background: 'linear-gradient(135deg, var(--accent-secondary, rgba(245,158,11,0.14)), transparent)' }} />
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <motion.span
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-5 shadow-sm backdrop-blur-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 250 }}
              >
                <Sparkles className="inline w-4 h-4 mr-2 text-accent-gradient" />
                {t('features.title')}
              </motion.span>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 theme-text-primary tracking-tight">
                {t('features.subtitle')}
              </h2>
              <p className="text-lg md:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
                {t('features.description')}
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={containerVariants}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                  className="group relative"
                >
                  <div className="relative h-full theme-bg-card theme-border-card backdrop-blur-2xl rounded-2xl p-8 transition-all duration-300 hover:theme-border-glass shadow-[0_4px_20px_-6px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.25)]">

                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${theme === 'dark' ? feature.darkColor : feature.lightColor
                        } rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                      {React.createElement(feature.icon as any, { className: 'w-8 h-8 text-white' })}
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-2xl font-semibold mb-4 theme-text-primary group-hover:text-accent-gradient transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="theme-text-secondary mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Bulleted Feature Points */}
                    <div className="space-y-2">
                      {feature.features.map((item, j) => (
                        <motion.div
                          key={j}
                          className="flex items-center space-x-2 text-sm theme-text-primary"
                          initial={{ x: -10, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Hover glow accent */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark' ? feature.darkColor : feature.lightColor
                      } rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-25 transition-opacity`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* Rest of the sections follow similar pattern with theme-aware classes */}
        {/* Process Section */}
        <section
          id="process"
          className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
          {/* Subtle Background Gradient */}
          <div
            className="absolute inset-0 opacity-60 blur-3xl"
            style={{
              background:
                theme === 'dark'
                  ? 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15), transparent 60%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.15), transparent 60%)'
                  : 'radial-gradient(circle at 20% 20%, rgba(191,219,254,0.4), transparent 60%), radial-gradient(circle at 80% 80%, rgba(233,213,255,0.4), transparent 60%)',
            }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Heading */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <motion.span
                className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary backdrop-blur-md shadow-sm mb-5"
                whileHover={{ scale: 1.05 }}
              >
                <Activity className="inline w-4 h-4 mr-2 text-accent-gradient" />
                {t('process.badge')}
              </motion.span>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 theme-text-primary">
                {t('process.title')}{' '}
                <span className="text-accent-gradient">{t('process.titleHighlight')}</span>
              </h2>
              <p className="text-lg md:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
                {t('process.description')}
              </p>
            </motion.div>

            <div className="relative">
              {/* Animated Gradient Line */}
              <div
                className={`hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] opacity-40`}
                style={{
                  background:
                    'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary))',
                  backgroundSize: '300% 300%',
                  animation: 'moveGradient 6s ease-in-out infinite',
                }}
              />

              {/* Step Cards */}
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
              >
                {processSteps.map((step: any, i: number) => (
                  <motion.div key={i} variants={itemVariants} className="relative">
                    <motion.div
                      className="theme-bg-card rounded-2xl p-8 theme-border-card backdrop-blur-xl transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 relative overflow-hidden"
                    >
                      {/* Glow overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        }}
                      />

                      {/* Step Header */}
                      <div className="flex items-start space-x-5 mb-6">
                        <motion.div
                          className={`${theme === 'dark' ? step.darkColor : step.lightColor
                            } w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon className="w-8 h-8 text-white" />
                        </motion.div>

                        <div>
                          <div className="text-4xl font-bold theme-text-muted mb-1">
                            {step.step}
                          </div>
                          <div className="h-[3px] w-10 bg-accent-gradient rounded-full"></div>
                        </div>
                      </div>

                      {/* Step Title + Desc */}
                      <h3 className="text-xl font-semibold mb-3 theme-text-primary">
                        {step.title}
                      </h3>
                      <p className="theme-text-secondary leading-relaxed text-base">
                        {step.description}
                      </p>
                    </motion.div>

                    {/* Step Connector */}
                    {i < processSteps.length - 1 && (
                      <motion.div
                        className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="w-8 h-8 accent-gradient rounded-full flex items-center justify-center shadow-lg">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>


        </section>

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