"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import NotificationDropdown from '@/components/NotificationDropdown';
import Sidebar from '@/components/Sidebar';
import * as THREE from 'three';
import { 
  Users, TrendingUp, FileText, Shield, CheckCircle, Clock, 
  AlertCircle, MapPin, Download, Filter, Search, BarChart3, 
  PieChart, Activity, Bell, Settings, User, LogOut, Home,
  Database, Wallet, Send, MessageCircle, HelpCircle, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, Edit, MoreVertical,
  ChevronRight, ChevronDown, Plus, DownloadCloud, UploadCloud,
  BarChart, LineChart, Target, Award, HeartHandshake, Zap,
  Sparkles, Rocket, Sun, Moon, Menu, X, ArrowRight,
  BadgeCheck, Fingerprint, Package, Layers, Smartphone, Globe
} from 'lucide-react';

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // default sidebar closed on small screens
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isScrolled, setIsScrolled] = useState(false);
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Sync sidebar with viewport size (collapse on small screens)
  useEffect(() => {
    // Use matchMedia to more efficiently track desktop vs mobile and keep sidebar behavior consistent
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setIsDesktop(matches);
      // If switched to mobile, ensure sidebar is closed; if desktop, we can open it by default
      if (!matches) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    // initialize
    handler(mq);
    if (mq.addEventListener) mq.addEventListener('change', handler as any);
    else mq.addListener(handler as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler as any);
      else mq.removeListener(handler as any);
    };
  }, []);

  // Enhanced Three.js Background (same as landing page)
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
    renderer.setClearColor(0x000000, 0);

    // Theme-aware colors
    let particleColor: any = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
    let lineColor: any = theme === 'dark' ? 0xf59e0b : 0xd97706;
    try {
      const style = getComputedStyle(document.documentElement);
      const a = (style.getPropertyValue('--accent-primary') || '').trim();
      const b = (style.getPropertyValue('--accent-secondary') || '').trim();
      if (a) particleColor = new THREE.Color(a);
      if (b) lineColor = new THREE.Color(b);
    } catch (e) {}

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: theme === 'dark' ? 0.012 : 0.008,
      color: particleColor,
      transparent: true,
      opacity: theme === 'dark' ? 0.6 : 0.4,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create connecting lines
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: theme === 'dark' ? 0.15 : 0.1
    });

    const linesPositions = [];
    for (let i = 0; i < 80; i++) {
      const x1 = (Math.random() - 0.5) * 8;
      const y1 = (Math.random() - 0.5) * 8;
      const z1 = (Math.random() - 0.5) * 8;
      const x2 = x1 + (Math.random() - 0.5) * 1.5;
      const y2 = y1 + (Math.random() - 0.5) * 1.5;
      const z2 = z1 + (Math.random() - 0.5) * 1.5;
      linesPositions.push(x1, y1, z1, x2, y2, z2);
    }

    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    let animationId: number | null = null;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0003;
      particlesMesh.rotation.x += 0.0001;
      linesMesh.rotation.y -= 0.0002;
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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced mock data
  const dashboardStats = {
    totalApplications: 1247,
    pendingApplications: 48,
    approvedApplications: 987,
    rejectedApplications: 212,
    totalDisbursed: 45250000,
    avgProcessingTime: 2.4,
    satisfactionRate: 94.2
  };

  const recentApplications = [
    {
      id: 'APP-2024-001234',
      name: 'Rajesh Kumar',
      district: 'Patna',
      status: 'approved',
      amount: 40000,
      date: '2024-03-15',
      type: 'PCR Act',
      avatar: 'RK'
    },
    {
      id: 'APP-2024-001235',
      name: 'Priya Singh',
      district: 'Lucknow',
      status: 'pending',
      amount: 35000,
      date: '2024-03-14',
      type: 'PoA Act',
      avatar: 'PS'
    },
    {
      id: 'APP-2024-001236',
      name: 'Amit Verma',
      district: 'Jaipur',
      status: 'in-review',
      amount: 45000,
      date: '2024-03-14',
      type: 'PCR Act',
      avatar: 'AV'
    },
    {
      id: 'APP-2024-001237',
      name: 'Sunita Devi',
      district: 'Bhopal',
      status: 'approved',
      amount: 38000,
      date: '2024-03-13',
      type: 'PoA Act',
      avatar: 'SD'
    }
  ];

  const quickStats = [
    {
      title: 'Today\'s Applications',
      value: 23,
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Pending Review',
      value: 48,
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'This Week Disbursed',
      value: '₹42.5L',
      change: '+18%',
      trend: 'up',
      icon: Wallet,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Satisfaction Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Award,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const grievanceData = [
    {
      id: 'GRV-001',
      subject: 'Delay in Application Processing',
      status: 'open',
      priority: 'high',
      date: '2024-03-15',
      assignedTo: 'Officer Raj'
    },
    {
      id: 'GRV-002',
      subject: 'Document Verification Issue',
      status: 'in-progress',
      priority: 'medium',
      date: '2024-03-14',
      assignedTo: 'Officer Priya'
    },
    {
      id: 'GRV-003',
      subject: 'Payment Disbursement Query',
      status: 'resolved',
      priority: 'low',
      date: '2024-03-13',
      assignedTo: 'Officer Amit'
    }
  ];

  const systemIntegrations = [
    { name: 'Aadhaar', icon: Fingerprint, status: 'active', color: 'from-blue-500 to-blue-600' },
    { name: 'eCourts', icon: FileText, status: 'active', color: 'from-indigo-500 to-indigo-600' },
    { name: 'CCTNS', icon: Database, status: 'warning', color: 'from-purple-500 to-purple-600' },
    { name: 'PFMS', icon: Wallet, status: 'active', color: 'from-green-500 to-green-600' },
    { name: 'DigiLocker', icon: Package, status: 'active', color: 'from-amber-500 to-amber-600' },
    { name: 'State DBs', icon: Layers, status: 'active', color: 'from-pink-500 to-pink-600' }
  ];

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'disbursements', label: 'Disbursements', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'grievance', label: 'Grievance', icon: MessageCircle },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'reports', label: 'Reports', icon: DownloadCloud }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'in-review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
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

  // Enhanced gradient orb positions
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
    return Array.from({ length: 12 }).map(() => ({
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      duration: 3 + rand() * 2,
      delay: rand() * 2,
    }));
  }, []);

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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
        style={{ zIndex: 0, background: 'transparent' }}
      />

      {/* Enhanced Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
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
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
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

      {/* Main Dashboard Layout */}
  {/* Use a wrapper that reserves left space equal to the sidebar width on desktop so content doesn't shift up when scrolling
      and expands left when the sidebar is closed. We apply an inline style computed from `sidebarOpen` to match the
      sidebar widths defined in `Sidebar.tsx`. */}
  <div className="relative z-10 theme-text-primary flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar component (fixed) */}
        <Sidebar
          items={navigationItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id)}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Main Content wrapper that matches the fixed sidebar width on desktop */}
  {/* main content: on desktop reserve left margin equal to sidebar width when sidebar is open so page shifts right */}
  <div
    className="flex-1 flex flex-col overflow-hidden"
    // Only add left margin on desktop when sidebar is open. Collapsed sidebar should take no layout space.
    style={{ marginLeft: isDesktop && sidebarOpen ? '20rem' : undefined }}
  >
          {/* Enhanced Header */}
          <motion.header 
            className={`theme-bg-nav backdrop-blur-xl border-b theme-border-glass transition-all duration-300 ${isScrolled ? 'shadow-xl' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
          >
            <div className="flex items-center justify-between p-4 lg:p-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-xl theme-bg-glass theme-border-glass border"
                  aria-label="Toggle sidebar"
                >
                  <ChevronRight className={`w-5 h-5 theme-text-primary transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold theme-text-primary capitalize">
                    {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
                  </h1>
                  <p className="text-sm theme-text-muted">
                    {activeTab === 'overview' 
                      ? 'Welcome back! Here\'s what\'s happening today.' 
                      : `Manage ${activeTab} and track progress`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                {/* Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center theme-border-glass border theme-bg-glass"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
                  ) : (
                    <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                  )}
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    ref={notifButtonRef}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center theme-border-glass border theme-bg-glass relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-5 h-5 theme-text-primary" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </motion.button>

                  <NotificationDropdown
                    anchorRef={notifButtonRef}
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  >
                    <div className="space-y-3">
                      <p className="font-semibold theme-text-primary">Notifications</p>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 rounded-xl theme-bg-glass">
                          <p className="text-sm theme-text-primary">New application requires review</p>
                          <p className="text-xs theme-text-muted">2 hours ago</p>
                        </div>
                      ))}
                    </div>
                  </NotificationDropdown>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    ref={profileButtonRef}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 rounded-lg lg:rounded-xl theme-bg-glass theme-border-glass border"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4 theme-text-primary" />
                  </motion.button>

                  <NotificationDropdown
                    anchorRef={profileButtonRef}
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    width={192}
                    offsetY={12}
                  >
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:theme-bg-glass">
                      <Settings className="w-4 h-4 theme-text-primary" />
                      <span className="theme-text-primary text-sm">Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:theme-bg-glass">
                      <HelpCircle className="w-4 h-4 theme-text-primary" />
                      <span className="theme-text-primary text-sm">Help & Support</span>
                    </button>
                    <div className="border-t theme-border-glass my-2"></div>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:theme-bg-glass text-red-500">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </NotificationDropdown>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Welcome Banner */}
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="theme-bg-card theme-border-glass border rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
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
                          Smart DBT Dashboard
                        </motion.span>
                        <h2 className="text-3xl font-bold theme-text-primary mb-2">
                          Welcome back, <span className="text-accent-gradient">Officer</span>
                        </h2>
                        <p className="theme-text-secondary">
                          Here's what's happening with your DBT applications today.
                        </p>
                      </div>
                      <motion.button
                        className="px-6 py-3 accent-gradient rounded-xl font-semibold text-white flex items-center space-x-2 shadow-lg"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>New Application</span>
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                  >
                    {quickStats.map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-6 backdrop-blur-xl group relative overflow-hidden"
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className={`flex items-center space-x-1 text-sm ${
                            stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            <span>{stat.change}</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold theme-text-primary mb-1">{stat.value}</h3>
                        <p className="text-sm theme-text-muted">{stat.title}</p>
                        
                        {/* Hover glow */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500 -z-10`}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Charts and Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Left Column - Applications Chart */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Applications Overview */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold theme-text-primary">Applications Overview</h3>
                          <div className="flex items-center space-x-2">
                            <motion.button 
                              className="p-2 rounded-lg theme-bg-glass theme-border-glass border"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Filter className="w-4 h-4 theme-text-primary" />
                            </motion.button>
                            <motion.button 
                              className="p-2 rounded-lg theme-bg-glass theme-border-glass border"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Download className="w-4 h-4 theme-text-primary" />
                            </motion.button>
                          </div>
                        </div>
                        
                        {/* Enhanced Chart Placeholder */}
                        <div className="h-56 sm:h-64 flex items-center justify-center theme-bg-glass rounded-xl relative overflow-hidden">
                          <div className="text-center z-10">
                            <BarChart3 className="w-12 h-12 theme-text-muted mx-auto mb-2" />
                            <p className="theme-text-muted">Applications Analytics</p>
                            <p className="text-sm theme-text-muted">Real-time chart visualization</p>
                          </div>
                          <motion.div
                            className="absolute inset-0 accent-gradient opacity-5"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                      </motion.div>

                      {/* Recent Applications */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold theme-text-primary">Recent Applications</h3>
                          <motion.button 
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl theme-bg-glass theme-text-primary text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>View All</span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="space-y-4">
                          {recentApplications.map((app) => (
                            <motion.div
                              key={app.id}
                              className="flex items-center justify-between p-4 rounded-xl theme-bg-glass group hover:theme-border-glass border border-transparent transition-all"
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl accent-gradient flex items-center justify-center text-white font-semibold">
                                  {app.avatar}
                                </div>
                                <div>
                                  <p className="font-medium theme-text-primary">{app.name}</p>
                                  <p className="text-sm theme-text-muted">{app.district} • {app.type}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold theme-text-primary">₹{app.amount.toLocaleString()}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                  {app.status}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Right Column - Additional Info */}
                    <div className="space-y-6">
                      {/* System Status */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-6 backdrop-blur-xl"
                      >
                        <h3 className="text-lg font-semibold theme-text-primary mb-6">System Integrations</h3>
                        
                        <div className="space-y-4">
                          {systemIntegrations.map((system, index) => (
                            <motion.div
                              key={system.name}
                              className="flex items-center justify-between p-3 rounded-xl theme-bg-glass group"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${system.color} flex items-center justify-center shadow-lg`}>
                                  <system.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="theme-text-primary text-sm font-medium">{system.name}</span>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${
                                system.status === 'active' ? 'bg-green-500' :
                                system.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Grievance Status */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-6 backdrop-blur-xl"
                      >
                        <h3 className="text-lg font-semibold theme-text-primary mb-6">Grievance Status</h3>
                        
                        <div className="space-y-4">
                          {grievanceData.map((grievance) => (
                            <motion.div
                              key={grievance.id}
                              className="p-4 rounded-xl theme-bg-glass group hover:theme-border-glass border border-transparent transition-all"
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium theme-text-primary text-sm">{grievance.subject}</p>
                                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(grievance.priority)}`}>
                                  {grievance.priority}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs theme-text-muted">
                                <span>{grievance.assignedTo}</span>
                                <span>{grievance.date}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <motion.button
                          className="w-full mt-4 p-3 rounded-xl theme-border-glass border theme-bg-glass theme-text-primary flex items-center justify-center space-x-2 group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Grievance</span>
                        </motion.button>
                      </motion.div>

                      {/* Quick Actions */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-6 backdrop-blur-xl"
                      >
                        <h3 className="text-lg font-semibold theme-text-primary mb-6">Quick Actions</h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'New App', icon: Plus, color: 'accent-gradient' },
                            { label: 'Reports', icon: DownloadCloud, color: 'theme-bg-glass' },
                            { label: 'Verify', icon: CheckCircle, color: 'theme-bg-glass' },
                            { label: 'Disburse', icon: Send, color: 'theme-bg-glass' }
                          ].map((action, index) => (
                            <motion.button
                              key={action.label}
                              className={`p-4 rounded-xl flex flex-col items-center justify-center space-y-2 ${
                                action.color === 'accent-gradient' 
                                  ? 'accent-gradient text-white shadow-lg' 
                                  : 'theme-bg-glass theme-text-primary theme-border-glass border'
                              }`}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <action.icon className="w-5 h-5" />
                              <span className="text-xs font-medium text-center">{action.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Other tabs placeholder */}
              {activeTab !== 'overview' && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-8 backdrop-blur-xl"
                >
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl accent-gradient flex items-center justify-center">
                      {(() => {
                        const Icon = navigationItems.find(item => item.id === activeTab)?.icon || FileText;
                        return <Icon className="w-8 h-8 text-white" />;
                      })()}
                    </div>
                    <h3 className="text-xl font-semibold theme-text-primary mb-2 capitalize">{activeTab} Management</h3>
                    <p className="theme-text-muted">
                      {activeTab} management interface with detailed tables, forms, and analytics.
                    </p>
                    <motion.button
                      className="mt-6 px-6 py-3 accent-gradient rounded-xl font-semibold text-white flex items-center space-x-2 mx-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Explore {activeTab}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 lg:hidden z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Progress Bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-1 transform origin-left z-50`}
        style={{ scaleX: scaleProgress, background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))` }}
      />
    </div>
  );
};

export default Dashboard;