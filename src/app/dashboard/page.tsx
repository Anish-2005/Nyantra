"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import NotificationDropdown from '@/components/NotificationDropdown';
import AnalyticsChart from '@/components/AnalyticsChart';
import type * as THREE from 'three';
import {
  Users, TrendingUp, FileText, Clock,
  Download, Filter, BarChart3,
  Bell, Settings, User, LogOut,
  Wallet, Award, Rocket, Plus,
  ChevronRight, ChevronDown, Sun, Moon,
  ArrowUpRight, ArrowDownRight, ArrowRight,
  Home, MessageCircle, Database, DownloadCloud, Fingerprint, Package, Layers, HelpCircle
} from 'lucide-react';

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // default sidebar closed on small screens; initialize on client in useEffect to avoid server-side `window` access
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Chart filters state
  const [chartRange, setChartRange] = useState<number>(30);
  const [showApplications, setShowApplications] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [smoothing, setSmoothing] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('line');
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);

  const mousePositionRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const pathname = usePathname();
  const router = useRouter();

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
    // add listeners using the correct typed handler
    if ('addEventListener' in mq) mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);
    return () => {
      if ('removeEventListener' in mq) mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      else (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  // Sync active tab with URL segment so the sidebar selection reflects the current route
  useEffect(() => {
    const seg = (pathname || '').split('/')[2] || 'overview';
    setActiveTab(seg);
  }, [pathname]);

  // Generate mock time series and datasets (memoized). Helpers are defined inside the memo to avoid hook-deps warnings.
  type DataPoint = { x: number; y: number };
  type DataSet = { id: string; label: string; color?: string; points: DataPoint[] };

  const dataSets = useMemo<DataSet[]>(() => {
    const generateSeries = (days: number): DataPoint[] => {
      const base = Date.now();
      return Array.from({ length: days }).map((_, i) => ({ x: base - (days - 1 - i) * 24 * 60 * 60 * 1000, y: Math.max(0, Math.round(50 + Math.sin(i / 4) * 25 + (Math.random() - 0.5) * 18)) }));
    };

    const smooth = (arr: DataPoint[]) => {
      const window = 3;
      return arr.map((p, i) => {
        const start = Math.max(0, i - window + 1);
        const end = i;
        const avg = Math.round(arr.slice(start, end + 1).reduce((s, v) => s + v.y, 0) / (end - start + 1));
        return { x: p.x, y: avg };
      });
    };

    const days = chartRange;
    const apps = generateSeries(days);
    const approved = apps.map(p => ({ x: p.x, y: Math.round(p.y * (0.6 + Math.random() * 0.2)) }));
    const pending = apps.map((p, i) => ({ x: p.x, y: Math.max(0, Math.round(p.y - approved[i].y)) }));

    const sets: DataSet[] = [];
    if (showApplications) sets.push({ id: 'applications', label: 'Applications', points: smoothing ? smooth(apps) : apps });
    if (showApproved) sets.push({ id: 'approved', label: 'Approved', color: undefined, points: smoothing ? smooth(approved) : approved });
    if (showPending) sets.push({ id: 'pending', label: 'Pending', color: undefined, points: smoothing ? smooth(pending) : pending });
    return sets;
  }, [chartRange, showApplications, showApproved, showPending, smoothing]);


  // CSV export for currently visible datasets
  const exportCSV = () => {
    if (!dataSets || dataSets.length === 0) return;
    // Construct CSV: first column is timestamp, then each dataset column
    const header = ['date', ...dataSets.map(ds => ds.label)];
    // align by index (datasets are same length and x values)
    const rows: string[][] = [];
    const len = dataSets[0].points.length;
    for (let i = 0; i < len; i++) {
      const row: string[] = [];
      const ts = new Date(dataSets[0].points[i].x).toISOString();
      row.push(ts);
      for (const ds of dataSets) {
        row.push(String(ds.points[i]?.y ?? ''));
      }
      rows.push(row);
    }

    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Enhanced Three.js Background (same as landing page)
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,
        antialias: true
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.position.z = 5;
      renderer.setClearColor(0x000000, 0);

      // Theme-aware colors
      let particleColor: THREE.Color | number = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
      let lineColor: THREE.Color | number = theme === 'dark' ? 0xf59e0b : 0xd97706;
      try {
        const style = getComputedStyle(document.documentElement);
        const a = (style.getPropertyValue('--accent-primary') || '').trim();
        const b = (style.getPropertyValue('--accent-secondary') || '').trim();
        if (a) particleColor = new THREE.Color(a);
        if (b) lineColor = new THREE.Color(b);
      } catch { }

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

      const linesPositions: number[] = [];
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
        cancelled = true;
        window.removeEventListener('resize', handleResize);
        if (animationId !== null) cancelAnimationFrame(animationId);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        linesGeometry.dispose();
        linesMaterial.dispose();
      };
    })();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Handle sidebar selection: update active tab, navigate to route, and close mobile sidebar
  const handleSidebarChange = (id: string) => {
    setActiveTab(id);
    if (id === 'overview') router.push('/dashboard');
    else router.push(`/dashboard/${id}`);
    setSidebarOpen(false);
  };

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'approved': return 'text-green-300 bg-green-900/30';
        case 'pending': return 'text-amber-300 bg-amber-900/30';
        case 'in-review': return 'text-blue-300 bg-blue-900/30';
        case 'rejected': return 'text-red-300 bg-red-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    // light theme
    switch (status) {
      case 'approved': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      case 'in-review': return 'text-blue-700 bg-blue-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPriorityColor = (priority: string) => {
    if (theme === 'dark') {
      switch (priority) {
        case 'high': return 'text-red-300 bg-red-900/30';
        case 'medium': return 'text-amber-300 bg-amber-900/30';
        case 'low': return 'text-green-300 bg-green-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    // light theme
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-amber-700 bg-amber-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  <div className="relative z-0 theme-text-primary flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar component (fixed) */}
        

        {/* Main Content wrapper that matches the fixed sidebar width on desktop */}
        {/* main content: on desktop reserve left margin equal to sidebar width when sidebar is open so page shifts right */}
        <div className="flex flex-col flex-1 relative z-0 overflow-hidden ">
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
                      ? `Welcome back! Here&apos;s what&apos;s happening today.`
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
                        <p className="theme-text-secondary">{`Here's what's happening with your DBT applications today.`}</p>
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
                    {quickStats.map((stat) => (
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
                          <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
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
  {/* Left Column */}
  <div className="lg:col-span-2 space-y-6">
    {/* Applications Overview */}
    <motion.div
      variants={itemVariants}
      className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold theme-text-primary">Applications Overview</h3>
        <div className="flex items-center space-x-2">
          {[Filter, Download].map((Icon, idx) => (
            <motion.button
              key={idx}
              className="p-2 rounded-lg theme-bg-glass theme-border-glass border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4 theme-text-primary" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80 sm:h-96 relative flex items-start justify-center theme-bg-glass rounded-xl overflow-hidden p-4">
        <div className="absolute inset-0 accent-gradient opacity-5 pointer-events-none z-0" aria-hidden />

        {/* Floating Filter Panel */}
        <div className="absolute top-4 right-4 z-20 bg-[var(--glass-bg)] backdrop-blur-sm border theme-border-glass rounded-lg p-3 flex flex-wrap gap-2">
          {/* Range */}
          <div className="flex items-center space-x-2">
            <label className="text-sm theme-text-muted">Range:</label>
            <select
              id="range"
              className="px-3 py-1 rounded-lg border theme-border-glass theme-bg-glass"
              value={chartRange}
              onChange={(e) => setChartRange(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex items-center space-x-2">
            <label className="text-sm theme-text-muted">Type:</label>
            <select
              id="chart-type"
              className="px-3 py-1 rounded-lg border theme-border-glass theme-bg-glass"
              value={chartType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChartType(e.target.value as 'line' | 'area' | 'bar' | 'stacked')}
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
              <option value="stacked">Stacked Bar</option>
            </select>
          </div>

          {/* Datasets */}
          <div className="flex items-center space-x-2 flex-wrap">
            {[
              { id: "ds-app", label: "Applications", value: showApplications, setter: setShowApplications },
              { id: "ds-approved", label: "Approved", value: showApproved, setter: setShowApproved },
              { id: "ds-pending", label: "Pending", value: showPending, setter: setShowPending }
            ].map(ds => (
              <label key={ds.id} className="inline-flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={ds.value} onChange={() => ds.setter(v => !v)} />
                <span>{ds.label}</span>
              </label>
            ))}
          </div>

          {/* Extra Controls */}
          <div className="flex items-center space-x-2">
            <label className="inline-flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={smoothing} onChange={() => setSmoothing(v => !v)} />
              <span>Smoothing</span>
            </label>
            <button onClick={exportCSV} className="px-3 py-1 rounded-lg accent-gradient text-white ml-2 text-sm">
              Download CSV
            </button>
          </div>
        </div>

        <div className="w-full relative z-10 pt-8">
          <div className="text-center mb-4 flex items-center justify-center space-x-2">
            <BarChart3 className="w-10 h-10 theme-text-muted" />
            <span className="theme-text-muted text-sm">Applications Analytics</span>
          </div>
          <div className="w-full max-w-4xl mx-auto">
            <AnalyticsChart dataSets={dataSets} chartType={chartType} />
          </div>
        </div>
      </div>
    </motion.div>

    {/* Recent Applications */}
    <motion.div
      variants={itemVariants}
      className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm"
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
        {recentApplications.map(app => (
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

  {/* Right Column */}
  <div className="space-y-6">
    {["System Integrations", "Grievance Status", "Quick Actions"].map((section, idx) => (
      <motion.div
        key={idx}
        variants={itemVariants}
        className="theme-bg-card theme-border-glass border rounded-2xl p-6 backdrop-blur-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{section}</h3>
        {/* Section-specific content goes here */}
      </motion.div>
    ))}
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