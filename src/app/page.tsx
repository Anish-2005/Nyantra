/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import LanguageToggle from '../components/LanguageToggle';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Menu, X, ChevronRight, Shield, Users, Zap, CheckCircle, ArrowRight, Rocket, Sun, Moon, Sparkles, Globe, Mail, Phone, MapPinned, BadgeCheck, Target, Activity, CheckSquare, UserCheck, Wallet, Clock, Upload, Send, Star, Database, Lock, TrendingUp, Smartphone, Eye, HelpCircle } from 'lucide-react';

const NyantraLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

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

  // Enhanced Three.js Scene with theme-aware colors
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;
    // Ensure canvas is transparent so underlying CSS gradient shows through
    renderer.setClearColor(0x000000, 0);

  // Theme-aware colors: read CSS vars so accents control particle colors
  let particleColor: THREE.Color | number = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
  let lineColor: THREE.Color | number = theme === 'dark' ? 0xf59e0b : 0xd97706;
    try {
      const style = getComputedStyle(document.documentElement);
      const a = (style.getPropertyValue('--accent-primary') || '').trim();
      const b = (style.getPropertyValue('--accent-secondary') || '').trim();
      if (a) particleColor = new THREE.Color(a);
      if (b) lineColor = new THREE.Color(b);
  } catch {}

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: theme === 'dark' ? 0.015 : 0.012,
      color: particleColor,
      transparent: true,
      opacity: theme === 'dark' ? 0.8 : 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create connecting lines
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: theme === 'dark' ? 0.2 : 0.15
    });

    const linesPositions = [];
    for (let i = 0; i < 100; i++) {
      const x1 = (Math.random() - 0.5) * 10;
      const y1 = (Math.random() - 0.5) * 10;
      const z1 = (Math.random() - 0.5) * 10;
      const x2 = x1 + (Math.random() - 0.5) * 2;
      const y2 = y1 + (Math.random() - 0.5) * 2;
      const z2 = z1 + (Math.random() - 0.5) * 2;
      linesPositions.push(x1, y1, z1, x2, y2, z2);
    }

    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    let animationId: number | null = null;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      linesMesh.rotation.y -= 0.0003;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId !== null) cancelAnimationFrame(animationId);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
    };
  }, [theme]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll detection
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

  const benefitIcons = [Clock, Target, Shield, Globe, Smartphone, Eye];
  const benefitColors = [
    { dark: "text-blue-500", light: "text-blue-600" },
    { dark: "text-amber-500", light: "text-amber-600" },
    { dark: "text-green-500", light: "text-green-600" },
    { dark: "text-indigo-500", light: "text-indigo-600" },
    { dark: "text-purple-500", light: "text-purple-600" },
    { dark: "text-pink-500", light: "text-pink-600" }
  ];

  const benefits = JSON.parse(t('benefits.items')).map((item: any, i: number) => ({
    ...item,
    icon: benefitIcons[i],
    darkColor: benefitColors[i].dark,
    lightColor: benefitColors[i].light
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

  // FAQ accordion item component
  const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls={`faq-${index}`}
          className="w-full flex items-center justify-between p-4 rounded-xl theme-bg-glass theme-border-glass border transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          <div className="text-left">
            <p className="font-semibold theme-text-primary">{question}</p>
          </div>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronRight className="w-5 h-5 theme-text-secondary" />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id={`faq-${index}`}
              key={`faq-content-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28 }}
              className="mt-3 overflow-hidden"
            >
              <div className="p-4 rounded-lg theme-bg-card theme-border-card theme-text-secondary">
                <p className="text-sm leading-relaxed">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>
      {/* Enhanced Theme Variables */}
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
          /* New dark accent: teal -> violet */
          --accent-primary: #06b6d4; /* teal-400 */
          --accent-secondary: #8b5cf6; /* violet-500 */
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
          /* New light accent: rose -> orange */
          --accent-primary: #fb7185; /* rose-400 */
          --accent-secondary: #fb923c; /* orange-400 */
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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
        style={{ zIndex: 0, background: 'transparent' }}
      />

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
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg border-b theme-border-glass ${isScrolled ? 'theme-bg-nav shadow-xl' : 'bg-transparent'
            }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-transparent">
                  <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantra_logo')} width={40} height={40} className="object-contain" />
                </div>
                <span className="text-2xl font-bold text-accent-gradient">
                  Nyantra
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {[t('nav.features'), t('nav.process'), t('nav.benefits'), t('nav.integrations'), t('nav.faq')].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${String(item).toLowerCase()}`}
                    className="theme-text-secondary hover:text-accent-gradient transition-all font-medium px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  onClick={() => navigateByRole()}
                  aria-label={t('extracted.get_started_continue')}
                  className="px-6 py-2.5 accent-gradient rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('nav.getStarted')}
                </motion.button>

                {/* Language selector (toggle) */}
                <div>
                  <LanguageToggle />
                </div>

                {/* Enhanced Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl flex items-center justify-center theme-border-glass border theme-bg-glass"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={t('extracted.toggle_theme')}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
                  ) : (
                    <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                  )}
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden theme-text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden theme-bg-nav backdrop-blur-lg border-t theme-border-glass"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 py-6 space-y-3">
                    {[t('nav.features'), t('nav.process'), t('nav.benefits'), t('nav.integrations'), t('nav.faq')].map((item) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="block theme-text-secondary hover:text-accent-gradient transition-all font-medium px-4 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      whileHover={{ x: 10 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </motion.a>
                  ))}
                  <div className="pt-4 space-y-3">
                    <motion.button
                      onClick={() => { navigateByRole(); setIsMobileMenuOpen(false); }}
                      aria-label={t('extracted.get_started_continue')}
                      className="w-full px-6 py-3 accent-gradient rounded-xl font-semibold text-white shadow-lg"
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('nav.getStarted')}
                    </motion.button>
                    <div className="pt-2">
                      <LanguageToggle />
                    </div>
                    <button
                      onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                      className="w-full px-6 py-3 rounded-xl theme-border-glass border theme-bg-glass flex items-center justify-center space-x-2 theme-text-primary"
                    >
                      {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />}
                      <span className="font-medium">Toggle Theme</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Enhanced Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-left space-y-8 overflow-visible"
              >
                <motion.div variants={itemVariants}>
                  <motion.span
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4"
                    animate={{
                      boxShadow: theme === 'dark'
                        ? ['0 0 0 0 rgba(59, 130, 246, 0.4)', '0 0 0 10px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                        : ['0 0 0 0 rgba(30, 64, 175, 0.4)', '0 0 0 10px rgba(30, 64, 175, 0)', '0 0 0 0 rgba(30, 64, 175, 0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="inline w-4 h-4 mr-2 text-accent-gradient" />
                    {t('hero.badge')}
                  </motion.span>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-bold theme-text-primary overflow-visible whitespace-normal py-4"
                  style={{ lineHeight: '1.4' }}
                >
                  {t('hero.titleLine1')}{' '}
                  <span className="py-4 text-accent-gradient">
                    {t('hero.titleLine2').split('\n')[0]}
                  </span>
                  <br />
                  <span className="block mt-1">
                    {t('hero.titleLine2').split('\n')[1] || ''}
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-xl theme-text-secondary leading-relaxed"
                >
                  {t('hero.description')}
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    onClick={() => navigateByRole()}
                    aria-label={t('extracted.apply_now_continue')}
                    className="px-8 py-4 accent-gradient rounded-xl font-semibold text-lg text-white flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{t('hero.applyNow')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="px-8 py-4 theme-bg-glass theme-border-glass border rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 theme-text-primary hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{t('hero.watchDemo')}</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-8 pt-4"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-12 h-12 rounded-full accent-gradient border-2 theme-bg-card flex items-center justify-center text-sm font-bold text-white"
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                      >
                        {i}K+
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm theme-text-muted">{t('extracted.trusted_by')} </p>
                    <p className="text-lg font-semibold text-accent-gradient">{t('extracted.45000_beneficiaries')} </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative"
              >
                <div className="relative theme-bg-card backdrop-blur-xl rounded-3xl p-8 theme-border-card shadow-2xl">
                  {/* Dashboard Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-transparent">
                          <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantara_logo')} width={40} height={40} className="object-contain" />
                        </div>
                        <div>
                          <p className="font-semibold theme-text-primary">{t('extracted.application_status')} </p>
                          <p className="text-xs theme-text-muted">{t('extracted.realtime_tracking')} </p>
                        </div>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: t('extracted.verified'), value: '100%', icon: BadgeCheck, color: 'from-green-500 to-emerald-500' },
                        { label: t('extracted.processing'), value: '2 hrs', icon: Clock, color: 'from-blue-500 to-cyan-500' },
                        { label: t('extracted.amount'), value: '₹40K', icon: Wallet, color: 'from-amber-500 to-orange-500' },
                        { label: t('extracted.status'), value: t('extracted.active'), icon: Activity, color: 'from-purple-500 to-pink-500' }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className={`bg-gradient-to-br ${item.color} p-4 rounded-xl text-white shadow-lg`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          animate={{
                            boxShadow: theme === 'dark'
                              ? ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                              : ['0 0 20px rgba(30, 64, 175, 0.2)', '0 0 30px rgba(30, 64, 175, 0.3)', '0 0 20px rgba(30, 64, 175, 0.2)']
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <item.icon className="w-6 h-6 mb-2 text-white" />
                          <p className="text-2xl font-bold text-white">{item.value}</p>
                          <p className="text-xs text-white/80">{item.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="theme-bg-glass rounded-xl p-4 space-y-3 theme-border-glass">
                      <p className="text-sm font-semibold theme-text-secondary">{t('extracted.recent_activities')} </p>
                      {[
                        { text: t('extracted.application_submitted'), time: t('extracted.two_mins_ago'), status: 'success' },
                        { text: t('extracted.document_verified'), time: t('extracted.one_hour_ago'), status: 'success' },
                        { text: t('extracted.approval_pending'), time: t('extracted.three_hours_ago'), status: 'pending' }
                      ].map((activity, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center justify-between text-sm"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-400' : 'bg-amber-400'}`} />
                            <span className="theme-text-primary">{activity.text}</span>
                          </div>
                          <span className="theme-text-muted text-xs">{activity.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Icons */}
                  <motion.div
                    className="absolute -top-6 -right-6 w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 theme-border-glass rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1 h-2 rounded-full accent-gradient"
                animate={{ y: [0, 12, 0] }}
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

        <section
          id="benefits"
          className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-500"
        >
          {/* Background Layer */}
          <div
            className={`
      absolute inset-0 transition-colors duration-700
      ${theme === 'dark'
                ? 'bg-gradient-to-b from-[#0A0F28] via-[#0A1432]/80 to-black'
                : 'bg-gradient-to-b from-[#F9FBFF] via-[#F4F7FA] to-white'}
    `}
          />

          {/* Ambient Glow */}
          <div
            className={`
      absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] blur-3xl pointer-events-none
      ${theme === 'dark'
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.15),transparent_70%)]'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(255,200,100,0.15),transparent_70%)]'}
    `}
          />

        

          <div className="relative max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <motion.span
                className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4 backdrop-blur-md shadow-sm"
                whileHover={{ scale: 1.08 }}
              >
                <Target className="inline w-4 h-4 mr-2 text-accent-gradient" />
                {t('benefits.badge')}
              </motion.span>

              <h2 className="mt-4 text-4xl md:text-5xl font-bold mb-4 tracking-tight theme-text-primary overflow-visible px-4">
                {t('benefits.title')} <span className="py-4 text-accent-gradient whitespace-nowrap">{t('benefits.titleHighlight')}</span>
              </h2>

              <p className="text-lg md:text-xl theme-text-secondary max-w-2xl mx-auto leading-relaxed">
                {t('benefits.description')}
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {benefits.map((benefit: any, i: number) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{
                    y: -8,
                    rotate: 1,
                    transition: { type: 'spring', stiffness: 200 },
                  }}
                  className="group relative"
                >
                  {/* Benefit Card */}
                  <div
                    className={`
    rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full 
    backdrop-blur-xl border transition-all duration-300 shadow-md hover:shadow-xl
    ${theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:border-accent-secondary/40'
                        : 'bg-white/60 border-gray-200 hover:border-amber-300/60'}
  `}
                  >
                    {/* Icon */}
                    <div
                      className={`
      relative w-16 h-16 mb-5 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110
      ${theme === 'dark'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-300'
                          : 'bg-gradient-to-br from-amber-400 to-orange-500'}
    `}
                    >
                      <benefit.icon
                        className="w-8 h-8 text-white drop-shadow-md"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold theme-text-primary group-hover:text-accent-gradient transition-colors duration-300">
                      {benefit.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm theme-text-muted mt-2 leading-snug max-w-[85%] mx-auto">
                      {benefit.desc}
                    </p>

                    {/* Accent underline */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent-gradient group-hover:w-1/2 transition-all duration-500 rounded-full"></span>
                  </div>

                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

   

        {/* Integrations Section */}
        <section id="integrations" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/6 w-64 h-64 blur-[80px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent-primary, rgba(59,130,246,0.12)), transparent)' }} />
            <div className="absolute bottom-1/4 right-1/6 w-64 h-64 blur-[80px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent-secondary, rgba(245,158,11,0.08)), transparent)' }} />
          </div>

          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12">
              <motion.span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-5" whileHover={{ scale: 1.05 }}>
                <Database className="inline w-4 h-4 mr-2 text-accent-gradient" />
                Trusted Integrations
              </motion.span>

              <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary">{t('extracted.works_seamlessly_with')} </h2>
              <p className="mt-2 text-sm sm:text-base theme-text-muted max-w-2xl mx-auto">{t('extracted.connect_to_national_and_regional_services_with_secure_audita')} </p>
            </motion.div>

            {/* Integrations Grid */}
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
              {[
                { key: 'pfms', name: 'PFMS', logo: '/next.svg', desc: 'Payments & DBT', accent: 'from-amber-400 to-amber-500' },
                { key: 'aadhaar', name: 'Aadhaar', logo: '/window.svg', desc: 'Identity Verification', accent: 'from-blue-400 to-indigo-500' },
                { key: 'cctns', name: 'CCTNS', logo: '/vercel.svg', desc: 'Police Records', accent: 'from-indigo-400 to-purple-500' },
                { key: 'ecourts', name: 'eCourts', logo: '/globe.svg', desc: 'Case Fetching', accent: 'from-green-400 to-teal-500' },
                { key: 'digilocker', name: 'DigiLocker', logo: '/file.svg', desc: 'Document Store', accent: 'from-pink-400 to-rose-500' },
                { key: 'sms', name: 'SMS Gateways', logo: '/next.svg', desc: 'Notifications', accent: 'from-yellow-400 to-amber-500' }
              ].map((integration) => (
                <motion.div key={integration.key} variants={itemVariants} whileHover={{ y: -6 }} className="flex items-center justify-center p-4">
                  <div className="w-full theme-bg-card theme-border-card rounded-2xl p-4 flex flex-col items-center text-center space-y-3 hover:shadow-xl transition-all duration-300">
                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br ${integration.accent}`}>
                      {/* Use Image for logo if available, fallback to name */}
                      <Image src={integration.logo} alt={`${integration.name} logo`} width={48} height={48} className="object-contain" />
                    </div>
                    <div>
                      <p className="font-semibold theme-text-primary">{integration.name}</p>
                      <p className="text-xs theme-text-muted">{integration.desc}</p>
                    </div>
                    <a href={`#`} aria-label={`Learn more about ${integration.name}`} className="mt-2 inline-flex items-center text-sm font-medium theme-text-secondary hover:text-accent-gradient transition-colors">
                      Learn
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center">
              <p className="theme-text-secondary mb-4">{t('extracted.need_a_custom_connector_we_offer_secure_apis_webhooks_and_en')} </p>
              <motion.a href="#" className="inline-flex items-center px-6 py-3 accent-gradient rounded-xl font-semibold text-white shadow-lg" whileHover={{ scale: 1.05 }} aria-label={t('extracted.contact_sales_for_integrations')}>
                Contact Sales
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.a>
            </motion.div>
          </div>
        </section>

{/* FAQ Section (placed between Benefits and Integrations) */}
        <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-5" whileHover={{ scale: 1.05 }}>
              <HelpCircle className="inline w-4 h-4 mr-2 text-accent-gradient" />
              Frequently Asked Questions
            </motion.span>

            <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary">{t('extracted.got_questions_weaposve_got_answers')} </h2>
            <p className="mt-2 text-sm sm:text-base theme-text-muted">{t('extracted.common_queries_about_the_program_security_and_integrations_e')} </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {[
              { q: 'How long does verification take?', a: 'Most cases complete within 48-72 hours after documents are uploaded and Aadhaar verification is successful.' },
              { q: 'Is my data secure?', a: 'Yes. We use bank-grade encryption, role-based access controls, and audit trails to ensure privacy and integrity.' },
              { q: 'Which documents are required?', a: 'Aadhaar or government ID, FIR (if applicable), bank account details for DBT, and supporting evidence.' },
              { q: 'Can districts integrate their own SMS gateway?', a: 'Yes — we support multiple SMS gateway providers and can onboard a custom provider via our enterprise onboarding.' }
            ].map((item, i) => (
              <motion.div key={i} className="mb-4 rounded-2xl theme-bg-card theme-border-card p-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <FAQItem question={item.q} answer={item.a} index={i} />
              </motion.div>
            ))}
          </div>
        </section>
        {/* Footer with enhanced theme */}
        <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t theme-border-glass">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Company Info */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-transparent">
                    <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantara_logo')} width={40} height={40} className="object-contain" />
                  </div>
                  <span className="text-2xl font-bold text-accent-gradient">
                    Nyantara
                  </span>
                </div>
                <p className="theme-text-secondary mb-6 leading-relaxed">
                  Empowering social justice through technology. Making Direct Benefit Transfer
                  transparent, efficient, and accessible for all.
                </p>
                <div className="flex space-x-4">
                  {[
                    { icon: Globe, label: 'Website' },
                    { icon: Mail, label: 'Email' },
                    { icon: Phone, label: 'Phone' },
                    { icon: MapPinned, label: 'Location' }
                  ].map((social, i) => (
                    <motion.button
                      key={i}
                      className="w-10 h-10 theme-bg-glass theme-border-glass border rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-primary)' }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5 theme-text-primary" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-6 theme-text-primary">{t('extracted.quick_links_1')} </h3>
                <ul className="space-y-3">
                  {['About Us', 'How It Works', 'Success Stories', 'News & Updates', 'Careers', 'Contact'].map((link, i) => (
                    <motion.li key={i} whileHover={{ x: 5 }}>
                      <a href="#" className="theme-text-secondary hover:text-accent-gradient transition-colors flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span>{link}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Enhanced Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-6 theme-text-primary">{t('extracted.get_in_touch')} </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 theme-bg-glass rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-accent-gradient" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-muted mb-1">{t('extracted.helpline')} </p>
                      <p className="theme-text-primary font-semibold">{t('extracted.1800xxxxxxx')} </p>
                      <p className="text-xs theme-text-muted">{t('extracted.available_247')} </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 theme-bg-glass rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-accent-gradient" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-muted mb-1">{t('extracted.email')} </p>
                      <p className="theme-text-primary font-semibold">{t('extracted.supportnyantragovin')} </p>
                      <p className="text-xs theme-text-muted">{t('extracted.response_in_24_hours')} </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-lg font-bold mb-6 theme-text-primary">Stay Updated</h3>
                <div className="space-y-4">
                  <p className="theme-text-secondary text-sm">{t('footer.stayUpdated')}</p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder={t('extracted.enter_your_email')}
                      className="flex-1 px-4 py-3 theme-bg-glass theme-border-glass border rounded-lg theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                    />
                    <motion.button
                      className="px-6 py-3 accent-gradient rounded-lg font-semibold flex items-center space-x-2 text-white shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{t('footer.subscribe')}</span>
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t theme-border-glass pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="theme-text-secondary text-sm text-center md:text-left">
                  <p>{t('footer.copyright')}</p>
                  <p className="text-xs mt-1">
                    {t('footer.developedBy')}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((link, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      className="theme-text-secondary hover:text-accent-gradient transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {link}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Enhanced Scroll to Top Button */}
        <AnimatePresence>
          {isScrolled && (
            <motion.button
              className="fixed bottom-8 right-8 w-14 h-14 accent-gradient rounded-full flex items-center justify-center shadow-2xl z-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={t('extracted.scroll_to_top')}
            >
              <ChevronRight className="w-6 h-6 text-white transform -rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Enhanced Progress Bar */}
        <motion.div
          className={`fixed top-0 left-0 right-0 h-1 transform origin-left z-50`}
          style={{ scaleX: scaleProgress, background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))` }}
        />
      </div>
    </div>
  );
};

export default NyantraLanding;