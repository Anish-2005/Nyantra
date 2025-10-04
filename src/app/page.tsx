"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useSpring, AnimatePresence} from 'framer-motion';
import * as THREE from 'three';
import { Menu, X, ChevronRight, Shield, Users, Zap, Lock, TrendingUp, Database, CheckCircle,  ArrowRight, FileText, Smartphone, Globe, Clock, MapPin, Heart, Eye, Upload, Send, Star, Target, Layers, Activity, CheckSquare, UserCheck, Wallet, HelpCircle, Phone, Mail, MapPinned, BadgeCheck, Fingerprint, Sparkles, Rocket, Package, Wifi, Sun, Moon } from 'lucide-react';

const NyantaraLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
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

  // Professional theme state with better initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nyantara-theme');
        if (stored === 'light' || stored === 'dark') return stored;
      } catch (e) {}
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

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

    // Theme-aware colors
    const particleColor = theme === 'dark' ? 0x3b82f6 : 0x1e40af; // blue-600 vs blue-700
    const lineColor = theme === 'dark' ? 0xf59e0b : 0xd97706; // amber-500 vs amber-600

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

  // Theme effect with enhanced colors
  useEffect(() => {
    try { 
      localStorage.setItem('nyantara-theme', theme); 
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const features = [
    {
      icon: Shield,
      title: "Secure Verification",
      description: "Multi-layer authentication with Aadhaar integration ensuring only genuine beneficiaries receive assistance",
      color: "from-blue-500 to-blue-600",
      darkColor: "from-blue-500 to-blue-600",
      lightColor: "from-blue-400 to-blue-500",
      features: ["Biometric Verification", "OTP Authentication", "Document Validation"]
    },
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Monitor every stage from application to disbursement with live updates and transparent status tracking",
      color: "from-amber-500 to-amber-600",
      darkColor: "from-amber-500 to-amber-600",
      lightColor: "from-amber-400 to-amber-500",
      features: ["Live Status Updates", "SMS Notifications", "Email Alerts"]
    },
    {
      icon: Database,
      title: "Unified Database",
      description: "Seamless integration with eCourts, CCTNS, and national databases for comprehensive case management",
      color: "from-indigo-500 to-indigo-600",
      darkColor: "from-indigo-500 to-indigo-600",
      lightColor: "from-indigo-400 to-indigo-500",
      features: ["eCourts Integration", "CCTNS Sync", "DigiLocker Connect"]
    },
    {
      icon: Lock,
      title: "Privacy Protection",
      description: "Bank-grade encryption and data privacy measures protecting sensitive victim information",
      color: "from-purple-500 to-purple-600",
      darkColor: "from-purple-500 to-purple-600",
      lightColor: "from-purple-400 to-purple-500",
      features: ["End-to-End Encryption", "GDPR Compliant", "Secure Data Storage"]
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Comprehensive insights with real-time analytics for better decision-making and accountability",
      color: "from-green-500 to-green-600",
      darkColor: "from-green-500 to-green-600",
      lightColor: "from-green-400 to-green-500",
      features: ["Custom Reports", "Trend Analysis", "Predictive Insights"]
    },
    {
      icon: Users,
      title: "Multi-Stakeholder Access",
      description: "Role-based access for victims, officials, and administrators with customized dashboards",
      color: "from-pink-500 to-pink-600",
      darkColor: "from-pink-500 to-pink-600",
      lightColor: "from-pink-400 to-pink-500",
      features: ["Role Management", "Custom Permissions", "Audit Trails"]
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Register & Verify",
      description: "Victim registers on portal with Aadhaar-based verification",
      icon: UserCheck,
      darkColor: "bg-blue-500",
      lightColor: "bg-blue-400"
    },
    {
      step: "02",
      title: "File FIR & Upload",
      description: "Auto-fetch FIR from CCTNS or manual upload with documents",
      icon: Upload,
      darkColor: "bg-indigo-500",
      lightColor: "bg-indigo-400"
    },
    {
      step: "03",
      title: "Smart Assessment",
      description: "AI-powered validation and automatic eligibility check",
      icon: CheckSquare,
      darkColor: "bg-purple-500",
      lightColor: "bg-purple-400"
    },
    {
      step: "04",
      title: "Approval Workflow",
      description: "Multi-level approval with time-bound processing",
      icon: CheckCircle,
      darkColor: "bg-green-500",
      lightColor: "bg-green-400"
    },
    {
      step: "05",
      title: "Direct Transfer",
      description: "Instant DBT to verified bank account via PFMS",
      icon: Wallet,
      darkColor: "bg-amber-500",
      lightColor: "bg-amber-400"
    },
    {
      step: "06",
      title: "Track & Feedback",
      description: "Real-time tracking and grievance redressal mechanism",
      icon: Activity,
      darkColor: "bg-pink-500",
      lightColor: "bg-pink-400"
    }
  ];

  const benefits = [
    { icon: Clock, title: "72% Faster", desc: "Processing Time", darkColor: "text-blue-500", lightColor: "text-blue-600" },
    { icon: Target, title: "99.5% Accuracy", desc: "In Verification", darkColor: "text-amber-500", lightColor: "text-amber-600" },
    { icon: Shield, title: "Zero Leakage", desc: "Fraud Prevention", darkColor: "text-green-500", lightColor: "text-green-600" },
    { icon: Globe, title: "Pan-India", desc: "Coverage", darkColor: "text-indigo-500", lightColor: "text-indigo-600" },
    { icon: Smartphone, title: "Mobile First", desc: "Accessible Anywhere", darkColor: "text-purple-500", lightColor: "text-purple-600" },
    { icon: Eye, title: "100% Transparent", desc: "Full Visibility", darkColor: "text-pink-500", lightColor: "text-pink-600" }
  ];

  const integrations = [
    { name: "Aadhaar", icon: Fingerprint, status: "Active", darkColor: "bg-blue-500", lightColor: "bg-blue-400" },
    { name: "eCourts", icon: FileText, status: "Active", darkColor: "bg-indigo-500", lightColor: "bg-indigo-400" },
    { name: "CCTNS", icon: Database, status: "Active", darkColor: "bg-purple-500", lightColor: "bg-purple-400" },
    { name: "PFMS", icon: Wallet, status: "Active", darkColor: "bg-green-500", lightColor: "bg-green-400" },
    { name: "DigiLocker", icon: Package, status: "Active", darkColor: "bg-amber-500", lightColor: "bg-amber-400" },
    { name: "State DBs", icon: Layers, status: "Active", darkColor: "bg-pink-500", lightColor: "bg-pink-400" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Victim Support Officer",
      location: "Maharashtra",
      text: "Nyantara has revolutionized how we process claims. What used to take months now happens in days.",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Rajesh Kumar",
      role: "District Magistrate",
      location: "Uttar Pradesh",
      text: "The transparency and accountability this system provides is unprecedented. Every rupee is tracked.",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Anita Devi",
      role: "Beneficiary",
      location: "Bihar",
      text: "I received help within 15 days. The SMS updates kept me informed every step of the way.",
      rating: 5,
      avatar: "AD"
    }
  ];

  const faqs = [
    {
      q: "How do I register as a beneficiary?",
      a: "You can register through our web portal or mobile app using your Aadhaar number. The process takes less than 5 minutes and includes biometric verification for security."
    },
    {
      q: "What documents are required?",
      a: "You need Aadhaar card, FIR copy, bank account details, and caste certificate. eCourts integration allows automatic FIR fetching in most cases."
    },
    {
      q: "How long does disbursement take?",
      a: "Once approved, funds are transferred directly to your bank account within 48 hours through PFMS. You'll receive SMS confirmation immediately."
    },
    {
      q: "Can I track my application status?",
      a: "Yes! Real-time tracking is available through the portal, mobile app, SMS, and email. You'll receive updates at every stage of processing."
    },
    {
      q: "What if my application is rejected?",
      a: "You'll receive detailed reasons via email and SMS. You can file a grievance through our redressal portal, which is resolved within 7 working days."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use bank-grade encryption, comply with data protection regulations, and never share personal information without consent."
    }
  ];

  // Deterministic random generator
  const orbPositions = useMemo(() => {
    const seeded = (seed: number) => {
      let t = seed >>> 0;
      return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    };

    const rand = seeded(123456789);
    return Array.from({ length: 20 }).map(() => ({
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      duration: 3 + rand() * 2,
      delay: rand() * 2,
    }));
  }, []);

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

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Helper function to get theme-aware classes
  const getThemeClass = (darkClass: string, lightClass: string) => 
    theme === 'dark' ? darkClass : lightClass;

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
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 theme-text-primary">
        {/* Enhanced Navigation */}
        <motion.nav 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg border-b theme-border-glass ${
            isScrolled ? 'theme-bg-nav shadow-xl' : 'bg-transparent'
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
                  <img src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt="Nyantara logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-bold text-accent-gradient">
                  Nyantara
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {['Features', 'Process', 'Benefits', 'Integrations', 'FAQ'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="theme-text-secondary hover:text-accent-gradient transition-all font-medium px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  className="px-6 py-2.5 accent-gradient rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>

                {/* Enhanced Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl flex items-center justify-center theme-border-glass border theme-bg-glass"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle theme"
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
                  {['Features', 'Process', 'Benefits', 'Integrations', 'FAQ'].map((item) => (
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
                      className="w-full px-6 py-3 accent-gradient rounded-xl font-semibold text-white shadow-lg"
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                    </motion.button>
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
                className="text-left space-y-8"
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
                    Smart DBT Solution for Social Justice
                  </motion.span>
                </motion.div>

                <motion.h1 
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-bold leading-tight theme-text-primary"
                >
                  Empowering{' '}
                  <span className="text-accent-gradient">
                    Justice
                  </span>
                  <br />
                  Through Technology
                </motion.h1>

                <motion.p 
                  variants={itemVariants}
                  className="text-xl theme-text-secondary leading-relaxed"
                >
                  Revolutionary Direct Benefit Transfer system for PCR & PoA Acts. 
                  Ensuring swift, transparent, and dignified assistance to victims of caste-based discrimination.
                </motion.p>

                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    className="px-8 py-4 accent-gradient rounded-xl font-semibold text-lg text-white flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="px-8 py-4 theme-bg-glass theme-border-glass border rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 theme-text-primary hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Watch Demo</span>
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
                    <p className="text-sm theme-text-muted">Trusted by</p>
                    <p className="text-lg font-semibold text-accent-gradient">45,000+ Beneficiaries</p>
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
                          <img src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt="Nyantara logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-semibold theme-text-primary">Application Status</p>
                          <p className="text-xs theme-text-muted">Real-time tracking</p>
                        </div>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Verified', value: '100%', icon: BadgeCheck, color: 'from-green-500 to-emerald-500' },
                        { label: 'Processing', value: '2 hrs', icon: Clock, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Amount', value: '₹40K', icon: Wallet, color: 'from-amber-500 to-orange-500' },
                        { label: 'Status', value: 'Active', icon: Activity, color: 'from-purple-500 to-pink-500' }
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
                      <p className="text-sm font-semibold theme-text-secondary">Recent Activities</p>
                      {[
                        { text: 'Application Submitted', time: '2 mins ago', status: 'success' },
                        { text: 'Document Verified', time: '1 hour ago', status: 'success' },
                        { text: 'Approval Pending', time: '3 hours ago', status: 'pending' }
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
        <section id="stats-section" className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
            >
              {[
                { label: 'Beneficiaries Served', value: stats.beneficiaries.toLocaleString(), suffix: '+', icon: Users, color: 'from-blue-500 to-blue-600' },
                { label: 'Crores Disbursed', value: stats.disbursed, suffix: 'Cr+', icon: TrendingUp, color: 'from-green-500 to-green-600' },
                { label: 'Avg. Processing Time', value: stats.avgTime, suffix: 'hrs', icon: Clock, color: 'from-amber-500 to-amber-600' },
                { label: 'Satisfaction Rate', value: stats.satisfaction, suffix: '%', icon: Star, color: 'from-purple-500 to-purple-600' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="theme-bg-card backdrop-blur-xl rounded-2xl p-6 theme-border-card hover:theme-border-glass transition-all hover:shadow-xl h-full">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold mb-2 theme-text-primary">
                      {stat.value}
                      <span className="text-2xl text-accent-gradient">{stat.suffix}</span>
                    </div>
                    <p className="theme-text-muted text-sm">{stat.label}</p>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <motion.span 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="inline w-4 h-4 mr-2 text-accent-gradient" />
                Powerful Features
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
                Everything You Need for{' '}
                <span className="text-accent-gradient">
                  Seamless DBT
                </span>
              </h2>
              <p className="text-xl theme-text-secondary max-w-3xl mx-auto">
                Comprehensive solution with cutting-edge technology ensuring justice reaches every victim
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={containerVariants}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ y: -8 }}
                >
                  <div className="h-full theme-bg-card backdrop-blur-xl rounded-2xl p-8 theme-border-card hover:theme-border-glass transition-all shadow-lg hover:shadow-xl">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${
                        theme === 'dark' ? feature.darkColor : feature.lightColor
                      } rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4 theme-text-primary group-hover:text-accent-gradient transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="theme-text-secondary mb-6 leading-relaxed">
                      {feature.description}
                    </p>

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
                  
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      theme === 'dark' ? feature.darkColor : feature.lightColor
                    } rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-20 transition-opacity`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Rest of the sections follow similar pattern with theme-aware classes */}
        {/* Process Section */}
        <section id="process" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <motion.span 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Activity className="inline w-4 h-4 mr-2 text-accent-gradient" />
                Simple Process
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
                From Application to{' '}
                <span className="text-accent-gradient">
                  Disbursement
                </span>
              </h2>
              <p className="text-xl theme-text-secondary max-w-3xl mx-auto">
                Six streamlined steps ensuring swift and transparent benefit delivery
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection Line */}
              <div className={`hidden lg:block absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 opacity-30`} style={{
                background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`
              }} />

              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
              >
                {processSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="relative"
                  >
                    <motion.div 
                      className="theme-bg-card backdrop-blur-xl rounded-2xl p-8 theme-border-card hover:theme-border-glass transition-all h-full shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <div className="flex items-start space-x-4 mb-6">
                        <motion.div 
                          className={`${theme === 'dark' ? step.darkColor : step.lightColor} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="text-4xl font-bold theme-text-muted mb-2">{step.step}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 theme-text-primary">
                        {step.title}
                      </h3>
                      
                      <p className="theme-text-secondary leading-relaxed">
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

        {/* Enhanced Benefits Section */}
        <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <motion.span 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="inline w-4 h-4 mr-2 text-accent-gradient" />
                Key Benefits
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 theme-text-primary">
                Why Choose{' '}
                <span className="text-accent-gradient">
                  Nyantara
                </span>
              </h2>
              <p className="text-xl theme-text-secondary max-w-3xl mx-auto">
                Proven results delivering impact where it matters most
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <div className="theme-bg-card backdrop-blur-xl rounded-2xl p-6 theme-border-card hover:theme-border-glass transition-all text-center h-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl">
                    <div className={`w-14 h-14 theme-bg-glass rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                      <benefit.icon className={`w-7 h-7 ${
                        theme === 'dark' ? benefit.darkColor : benefit.lightColor
                      }`} />
                    </div>
                    <div className="text-2xl font-bold mb-1 theme-text-primary group-hover:text-accent-gradient transition-colors">
                      {benefit.title}
                    </div>
                    <p className="text-xs theme-text-muted">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
                    <img src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt="Nyantara logo" className="w-full h-full object-contain" />
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
                <h3 className="text-lg font-bold mb-6 theme-text-primary">Quick Links</h3>
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
                <h3 className="text-lg font-bold mb-6 theme-text-primary">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 theme-bg-glass rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-accent-gradient" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-muted mb-1">Helpline</p>
                      <p className="theme-text-primary font-semibold">1800-XXX-XXXX</p>
                      <p className="text-xs theme-text-muted">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 theme-bg-glass rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-accent-gradient" />
                    </div>
                    <div>
                      <p className="text-sm theme-text-muted mb-1">Email</p>
                      <p className="theme-text-primary font-semibold">support@nyantara.gov.in</p>
                      <p className="text-xs theme-text-muted">Response in 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-lg font-bold mb-6 theme-text-primary">Stay Updated</h3>
                <div className="space-y-4">
                  <p className="theme-text-secondary text-sm">Subscribe to our newsletter for latest updates</p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 theme-bg-glass theme-border-glass border rounded-lg theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                    />
                    <motion.button
                      className="px-6 py-3 accent-gradient rounded-lg font-semibold flex items-center space-x-2 text-white shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Subscribe</span>
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
                  <p>© 2025 Nyantara. All rights reserved.</p>
                  <p className="text-xs mt-1">
                    Developed under Ministry of Social Justice & Empowerment, Government of India
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
              aria-label="Scroll to top"
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

export default NyantaraLanding;