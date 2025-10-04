"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useSpring, AnimatePresence} from 'framer-motion';
import * as THREE from 'three';
import { Menu, X, ChevronRight, Shield, Users, Zap, Lock, TrendingUp, Database, CheckCircle,  ArrowRight, FileText, Smartphone, Globe, Clock, MapPin, Heart, Eye, Upload, Send, Star, Target, Layers, Activity, CheckSquare, UserCheck, Wallet, HelpCircle, Phone, Mail, MapPinned, BadgeCheck, Fingerprint, Sparkles, Rocket, Package, Wifi } from 'lucide-react';

const NyantaraLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  // store mouse position in a ref to avoid re-renders (was unused state)
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

  // Three.js Scene Setup
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

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create connecting lines
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.2
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
  }, []);

  // Mouse tracking (store in ref to avoid causing re-renders)
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

  const features = [
    {
      icon: Shield,
      title: "Secure Verification",
      description: "Multi-layer authentication with Aadhaar integration ensuring only genuine beneficiaries receive assistance",
      color: "from-blue-500 to-blue-600",
      features: ["Biometric Verification", "OTP Authentication", "Document Validation"]
    },
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Monitor every stage from application to disbursement with live updates and transparent status tracking",
      color: "from-amber-500 to-amber-600",
      features: ["Live Status Updates", "SMS Notifications", "Email Alerts"]
    },
    {
      icon: Database,
      title: "Unified Database",
      description: "Seamless integration with eCourts, CCTNS, and national databases for comprehensive case management",
      color: "from-indigo-500 to-indigo-600",
      features: ["eCourts Integration", "CCTNS Sync", "DigiLocker Connect"]
    },
    {
      icon: Lock,
      title: "Privacy Protection",
      description: "Bank-grade encryption and data privacy measures protecting sensitive victim information",
      color: "from-purple-500 to-purple-600",
      features: ["End-to-End Encryption", "GDPR Compliant", "Secure Data Storage"]
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Comprehensive insights with real-time analytics for better decision-making and accountability",
      color: "from-green-500 to-green-600",
      features: ["Custom Reports", "Trend Analysis", "Predictive Insights"]
    },
    {
      icon: Users,
      title: "Multi-Stakeholder Access",
      description: "Role-based access for victims, officials, and administrators with customized dashboards",
      color: "from-pink-500 to-pink-600",
      features: ["Role Management", "Custom Permissions", "Audit Trails"]
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Register & Verify",
      description: "Victim registers on portal with Aadhaar-based verification",
      icon: UserCheck,
      color: "bg-blue-500"
    },
    {
      step: "02",
      title: "File FIR & Upload",
      description: "Auto-fetch FIR from CCTNS or manual upload with documents",
      icon: Upload,
      color: "bg-indigo-500"
    },
    {
      step: "03",
      title: "Smart Assessment",
      description: "AI-powered validation and automatic eligibility check",
      icon: CheckSquare,
      color: "bg-purple-500"
    },
    {
      step: "04",
      title: "Approval Workflow",
      description: "Multi-level approval with time-bound processing",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      step: "05",
      title: "Direct Transfer",
      description: "Instant DBT to verified bank account via PFMS",
      icon: Wallet,
      color: "bg-amber-500"
    },
    {
      step: "06",
      title: "Track & Feedback",
      description: "Real-time tracking and grievance redressal mechanism",
      icon: Activity,
      color: "bg-pink-500"
    }
  ];

  const benefits = [
    { icon: Clock, title: "72% Faster", desc: "Processing Time", color: "text-blue-500" },
    { icon: Target, title: "99.5% Accuracy", desc: "In Verification", color: "text-amber-500" },
    { icon: Shield, title: "Zero Leakage", desc: "Fraud Prevention", color: "text-green-500" },
    { icon: Globe, title: "Pan-India", desc: "Coverage", color: "text-indigo-500" },
    { icon: Smartphone, title: "Mobile First", desc: "Accessible Anywhere", color: "text-purple-500" },
    { icon: Eye, title: "100% Transparent", desc: "Full Visibility", color: "text-pink-500" }
  ];

  const integrations = [
    { name: "Aadhaar", icon: Fingerprint, status: "Active", color: "bg-blue-500" },
    { name: "eCourts", icon: FileText, status: "Active", color: "bg-indigo-500" },
    { name: "CCTNS", icon: Database, status: "Active", color: "bg-purple-500" },
    { name: "PFMS", icon: Wallet, status: "Active", color: "bg-green-500" },
    { name: "DigiLocker", icon: Package, status: "Active", color: "bg-amber-500" },
    { name: "State DBs", icon: Layers, status: "Active", color: "bg-pink-500" }
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

  // Deterministic random generator (seeded) to avoid SSR/CSR mismatches from Math.random()
  const orbPositions = useMemo(() => {
    // mulberry32-like seeded PRNG
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-40"
        style={{ zIndex: 0 }}
      />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500 rounded-full opacity-20 blur-3xl"
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
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-amber-500 rounded-full opacity-20 blur-3xl"
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
      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? 'bg-slate-900/95 backdrop-blur-lg shadow-2xl' : 'bg-transparent'
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  Nyantara
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {['Features', 'Process', 'Benefits', 'Integrations', 'FAQ'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
                    whileHover={{ scale: 1.1, color: '#f59e0b' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden bg-slate-900/98 backdrop-blur-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 py-6 space-y-4">
                  {['Features', 'Process', 'Benefits', 'Integrations', 'FAQ'].map((item) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="block text-gray-300 hover:text-amber-400 transition-colors font-medium"
                      whileHover={{ x: 10 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </motion.a>
                  ))}
                  <motion.button
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-semibold"
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Hero Section */}
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
                    className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-semibold mb-4"
                    animate={{ 
                      boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.4)', '0 0 0 10px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="inline w-4 h-4 mr-2" />
                    Smart DBT Solution for Social Justice
                  </motion.span>
                </motion.div>

                <motion.h1 
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-bold leading-tight"
                >
                  Empowering{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                    Justice
                  </span>
                  <br />
                  Through Technology
                </motion.h1>

                <motion.p 
                  variants={itemVariants}
                  className="text-xl text-gray-300 leading-relaxed"
                >
                  Revolutionary Direct Benefit Transfer system for PCR & PoA Acts. 
                  Ensuring swift, transparent, and dignified assistance to victims of caste-based discrimination.
                </motion.p>

                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/30"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
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
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-sm font-bold"
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                      >
                        {i}K+
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Trusted by</p>
                    <p className="text-lg font-semibold text-amber-400">45,000+ Beneficiaries</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                  {/* Dashboard Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
                        <div>
                          <p className="font-semibold">Application Status</p>
                          <p className="text-xs text-gray-400">Real-time tracking</p>
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
                          className={`bg-gradient-to-br ${item.color} p-4 rounded-xl`}
                          whileHover={{ scale: 1.05 }}
                          animate={{ 
                            boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <item.icon className="w-6 h-6 mb-2 text-white" />
                          <p className="text-2xl font-bold text-white">{item.value}</p>
                          <p className="text-xs text-white/80">{item.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-300">Recent Activities</p>
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
                            <span className="text-gray-300">{activity.text}</span>
                          </div>
                          <span className="text-gray-500 text-xs">{activity.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Icons */}
                  <motion.div
                    className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
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
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <motion.div 
                className="w-1 h-2 bg-white/60 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
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
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:shadow-2xl">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {stat.value}
                      <span className="text-2xl text-amber-400">{stat.suffix}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
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
                className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="inline w-4 h-4 mr-2" />
                Powerful Features
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need for{' '}
                <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  Seamless DBT
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                  whileHover={{ y: -10 }}
                >
                  <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-amber-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="space-y-2">
                      {feature.features.map((item, j) => (
                        <motion.div
                          key={j}
                          className="flex items-center space-x-2 text-sm text-gray-300"
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
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-30 transition-opacity`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

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
                className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Activity className="inline w-4 h-4 mr-2" />
                Simple Process
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                From Application to{' '}
                <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  Disbursement
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Six streamlined steps ensuring swift and transparent benefit delivery
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 transform -translate-y-1/2 opacity-30" />

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
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all h-full"
                      whileHover={{ scale: 1.05, y: -10 }}
                    >
                      <div className="flex items-start space-x-4 mb-6">
                        <motion.div 
                          className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="text-4xl font-bold text-white/20 mb-2">{step.step}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 text-white">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-400 leading-relaxed">
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
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
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
                className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="inline w-4 h-4 mr-2" />
                Key Benefits
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  Nyantara
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all text-center h-full flex flex-col items-center justify-center">
                    <div className={`w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                    </div>
                    <div className="text-2xl font-bold mb-1 group-hover:text-amber-400 transition-colors">
                      {benefit.title}
                    </div>
                    <p className="text-xs text-gray-400">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <motion.span 
                className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Layers className="inline w-4 h-4 mr-2" />
                Seamless Integrations
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Connected with{' '}
                <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  National Systems
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Real-time sync with government databases for accuracy and efficiency
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {integrations.map((integration, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group relative"
                  whileHover={{ y: -10 }}
                >
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all text-center">
                    <motion.div 
                      className={`w-16 h-16 ${integration.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <integration.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="font-bold mb-2 text-white">{integration.name}</h3>
                    
                    <div className="flex items-center justify-center space-x-1">
                      <motion.div 
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs text-green-400">{integration.status}</span>
                    </div>
                  </div>
                  
                  <motion.div
                    className={`absolute inset-0 ${integration.color} rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-30 transition-opacity`}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Integration Flow Diagram */}
            <motion.div 
              className="mt-16 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-8 text-center">Data Flow Architecture</h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-4">
                {['User Portal', 'Nyantara Core', 'Verification Layer', 'PFMS Disbursement'].map((node, i) => (
                  <React.Fragment key={i}>
                    <motion.div
                      className="flex-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30 text-center min-w-[150px]"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                    >
                      <Wifi className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <p className="font-semibold text-sm">{node}</p>
                    </motion.div>
                    
                    {i < 3 && (
                      <motion.div
                        className="hidden md:block"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: i * 0.2 + 0.1 }}
                      >
                        <ArrowRight className="w-6 h-6 text-amber-400" />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <motion.span 
                className="inline-block px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Heart className="inline w-4 h-4 mr-2" />
                Testimonials
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Trusted by{' '}
                <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  Thousands
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Real stories from people whose lives have been impacted
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group"
                  whileHover={{ y: -10 }}
                >
                  <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed italic">
                      {`"${testimonial.text}"`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <motion.span 
                className="inline-block px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <HelpCircle className="inline w-4 h-4 mr-2" />
                FAQ
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about Nyantara
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                >
                  <motion.button
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    whileHover={{ x: 5 }}
                  >
                    <span className="font-semibold text-lg pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-6 h-6 text-amber-400" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-8 pb-6 text-gray-400 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-amber-600 rounded-3xl p-12 md:p-16 overflow-hidden"
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                {orbPositions.map((orb, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-20 h-20 border-2 border-white rounded-full"
                    style={{
                      left: orb.left,
                      top: orb.top,
                      willChange: 'transform, opacity',
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: orb.duration,
                      repeat: Infinity,
                      delay: orb.delay,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <Rocket className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Make a Difference?
                </h2>
                
                <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                  Join thousands of beneficiaries and officials using Nyantara for transparent, 
                  efficient, and dignified delivery of social justice
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 shadow-2xl"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(255, 255, 255, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Get Started Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-bold text-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Contact Support</span>
                    <Phone className="w-5 h-5" />
                  </motion.button>
                </div>

                <motion.div 
                  className="mt-10 flex flex-wrap justify-center gap-8 text-sm"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Free for Beneficiaries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Multilingual Interface</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Company Info */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                    Nyantara
                  </span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
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
                      className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                      whileHover={{ scale: 1.1, backgroundColor: '#3b82f6' }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
                <ul className="space-y-3">
                  {['About Us', 'How It Works', 'Success Stories', 'News & Updates', 'Careers', 'Contact'].map((link, i) => (
                    <motion.li key={i} whileHover={{ x: 5 }}>
                      <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span>{link}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Resources</h3>
                <ul className="space-y-3">
                  {['User Guide', 'Documentation', 'API Reference', 'Video Tutorials', 'FAQs', 'Support Center'].map((link, i) => (
                    <motion.li key={i} whileHover={{ x: 5 }}>
                      <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span>{link}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Helpline</p>
                      <p className="text-gray-300 font-semibold">1800-XXX-XXXX</p>
                      <p className="text-xs text-gray-500">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-300 font-semibold">support@nyantara.gov.in</p>
                      <p className="text-xs text-gray-500">Response in 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPinned className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-gray-300 font-semibold text-sm">Ministry of Social Justice</p>
                      <p className="text-xs text-gray-500">New Delhi, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <motion.div 
              className="bg-gradient-to-r from-blue-500/10 to-amber-500/10 rounded-2xl p-8 mb-12 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-white">Stay Updated</h3>
                  <p className="text-gray-400">Subscribe to our newsletter for latest updates and announcements</p>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-semibold flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Subscribe</span>
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-400 text-sm text-center md:text-left">
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
                      className="text-gray-400 hover:text-amber-400 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {link}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Government Badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 items-center">
                {[
                  { name: 'Digital India', color: 'from-orange-500 to-green-500' },
                  { name: 'Make in India', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Data Secured', color: 'from-purple-500 to-pink-500' },
                  { name: 'ISO Certified', color: 'from-amber-500 to-red-500' }
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    className={`px-4 py-2 bg-gradient-to-r ${badge.color} rounded-lg text-xs font-bold text-white flex items-center space-x-2`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    <span>{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {isScrolled && (
            <motion.button
              className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50 z-50"
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

     

        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 transform origin-left z-50"
          style={{ scaleX: scaleProgress }}
        />

      </div>
    </div>
  );
};

export default NyantaraLanding;