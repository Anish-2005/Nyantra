"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import NotificationDropdown from '@/components/NotificationDropdown';
import NotificationDropdownWrapper from './dashboard/NotificationDropdownWrapper';
import ProgressBar from './dashboard/ProgressBar';
import GradientOrbs from './dashboard/GradientOrbs';
import LiveTrackingStats from './dashboard/LiveTrackingStats';
import DashboardDataFetcher from './dashboard/DashboardDataFetcher';
import RealTimeMonitoringHeader from './dashboard/RealTimeMonitoringHeader';
import LiveApplicationTracking from './dashboard/LiveApplicationTracking';
import AnalyticsHeader from './dashboard/AnalyticsHeader';
import DisbursementsPreview from './dashboard/DisbursementsPreview';
import AnalyticsFiltersAndChart from './dashboard/AnalyticsFiltersAndChart';
import BeneficiariesPreview from './dashboard/BeneficiariesPreview';
import { PlatformLogos, PlatformLogoWrapper, getPlatformLogo } from './dashboard/PlatformLogos';
import AnalyticsChart from '@/components/AnalyticsChart';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import type * as THREE from 'three';
import { JSX } from 'react';
import {
  Users, TrendingUp, FileText, Clock,
   BarChart3,
  Settings,
  Wallet, Award, Rocket, Plus,
  ChevronRight,
  ArrowUpRight, ArrowDownRight, ArrowRight,
  Home, MessageCircle, Database, DownloadCloud, CheckCircle, AlertCircle, Clock as ClockIcon,
  Activity,
  Download,
  RefreshCw,
  BarChart,
  Zap,
  Timer,
  Shield,
  X,
  BadgeCheck, Fingerprint, MapPin, Scale, DollarSign, Banknote, User
} from 'lucide-react';

const Dashboard = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Utility functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };


 
  const formatActType = (val?: string) => {
    if (!val) return '—';
    const v = String(val).toLowerCase();
    if (v.includes('pcr')) return 'PCR Act';
    if (v.includes('poa') || v.includes('poa')) return 'PoA Act';
    return val;
  };

  const formatCurrency = (n?: number | null) => {
    if (n == null || Number.isNaN(n)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n as number);
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  // Chart filters state
  const [chartRange, setChartRange] = useState<number>(30);
  const [showApplications, setShowApplications] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [smoothing, setSmoothing] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('line');

  // Analytics metrics state
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    peakValue: 0,
    average: 0,
    growthRate: 0
  });

  // Dashboard data state
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState<any[]>([]);
  const [grievanceData, setGrievanceData] = useState<any[]>([]);
  const [systemIntegrations, setSystemIntegrations] = useState<any[]>([]);
  const [liveTrackingStats, setLiveTrackingStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [recentDisbursements, setRecentDisbursements] = useState<any[]>([]);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  // Refs
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);

  // Scroll progress for progress bar
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Sync sidebar with viewport size
 // Sync sidebar with viewport size
useEffect(() => {
  // Check if window exists (client-side)
  if (typeof window === 'undefined') {
    // Default to desktop on server-side to avoid hydration mismatch
    setIsDesktop(true);
    setSidebarOpen(true);
    return;
  }

  const mq = window.matchMedia('(min-width: 1024px)');

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    const matches = 'matches' in e ? e.matches : mq.matches;
    setIsDesktop(matches);
    if (!matches) setSidebarOpen(false);
    else setSidebarOpen(true);
  };

  handler(mq);
  
  if ('addEventListener' in mq) mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
  else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);

  return () => {
    if ('removeEventListener' in mq) mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    else (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handler as (e: MediaQueryListEvent) => void);
  };
}, []);
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isDesktop && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isDesktop]);

  // Sync active tab with URL
  useEffect(() => {
    const seg = (pathname || '').split('/')[2] || 'overview';
    setActiveTab(seg);
  }, [pathname]);

  // Scroll detection: currently disabled in this component (kept for future use)

  // Mouse tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate mock data
  type DataPoint = { x: number; y: number };
  type DataSet = { id: string; label: string; color?: string; points: DataPoint[] };

  const dataSets = useMemo<DataSet[]>(() => {
    const generateSeries = (days: number): DataPoint[] => {
      const base = Date.now();
      return Array.from({ length: days }).map((_, i) => ({
        x: base - (days - 1 - i) * 24 * 60 * 60 * 1000,
        y: Math.max(0, Math.round(50 + Math.sin(i / 4) * 25 + (Math.random() - 0.5) * 18))
      }));
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
    if (showApplications) sets.push({ id: 'applications', label: t('dashboard.chartLabels.applications'), points: smoothing ? smooth(apps) : apps });
    if (showApproved) sets.push({ id: 'approved', label: t('dashboard.chartLabels.approved'), color: undefined, points: smoothing ? smooth(approved) : approved });
    if (showPending) sets.push({ id: 'pending', label: t('dashboard.chartLabels.pending'), color: undefined, points: smoothing ? smooth(pending) : pending });
    return sets;
  }, [chartRange, showApplications, showApproved, showPending, smoothing, t]);

  // CSV export
  const exportCSV = useCallback(() => {
    if (!dataSets || dataSets.length === 0) return;
    const header = ['date', ...dataSets.map(ds => ds.label)];
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
  }, [dataSets]);

  // Fetch data on component mount
  const navigationItems = [
    { id: 'overview', label: t('extracted.dashboard'), icon: Home },
    { id: 'applications', label: t('extracted.applications'), icon: FileText },
    { id: 'beneficiaries', label: t('extracted.beneficiaries'), icon: Users },
    { id: 'disbursements', label: t('extracted.disbursements'), icon: Wallet },
    { id: 'analytics', label: t('extracted.analytics_reports'), icon: BarChart3 },
    { id: 'grievance', label: t('extracted.grievance_hub') || t('extracted.grievance'), icon: MessageCircle },
  { id: 'integrations', label: t('nav.integrations'), icon: Database },
    { id: 'reports', label: t('extracted.recent_reports') || 'Reports', icon: DownloadCloud }
  ];


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

    switch (status) {
      case 'approved': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      case 'in-review': return 'text-blue-700 bg-blue-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (theme === 'dark') {
      switch (priority) {
        case 'high': return 'text-red-300 bg-red-900/30';
        case 'medium': return 'text-amber-300 bg-amber-900/30';
        case 'low': return 'text-green-300 bg-green-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-amber-700 bg-amber-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'in-review': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getVerificationColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'verified': return 'text-green-300 bg-green-900/30';
        case 'pending': return 'text-amber-300 bg-amber-900/30';
        case 'rejected': return 'text-red-300 bg-red-900/30';
        case 'documents-required': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'verified': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'documents-required': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getVerificationIcon = (status: string) => {
    const icons: { [key: string]: any } = {
      'verified': Shield,
      'pending': Clock,
      'rejected': X,
      'documents-required': AlertCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    const Comp = (props: any) => <Icon {...props} />;
    try { (Comp as any).displayName = `VerificationIcon_${String(status).replace(/\s+/g, '_')}`; } catch {}
    return Comp;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return t('dashboard.status.approved');
      case 'pending': return t('dashboard.status.pending');
      case 'in-review': return t('dashboard.status.inReview');
      case 'rejected': return t('dashboard.status.rejected');
      case 'open': return t('dashboard.status.open');
      case 'in-progress': return t('dashboard.status.inProgress');
      case 'resolved': return t('dashboard.status.resolved');
      case 'active': return t('dashboard.status.active');
      case 'warning': return t('dashboard.status.warning');
      case 'error': return t('dashboard.status.error');
      case 'verified': return t('dashboard.status.verified');
      case 'completed': return t('dashboard.status.completed');
      case 'processing': return t('dashboard.status.processing');
      default: return status;
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

  // Brief preview of beneficiaries to show on the dashboard (show all statuses)
  const previewBeneficiaries = beneficiaries.slice(0, 4);

  // Current time for display
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div data-theme={theme} className="relative overflow-hidden transition-colors duration-300">
      <DashboardDataFetcher
        t={t}
        theme={theme}
        setRecentApplications={setRecentApplications}
        setGrievanceData={setGrievanceData}
        setSystemIntegrations={setSystemIntegrations}
        setLiveTrackingStats={setLiveTrackingStats}
        setQuickStats={setQuickStats}
        setRecentActivity={setRecentActivity}
        setBeneficiaries={setBeneficiaries}
        setRecentDisbursements={setRecentDisbursements}
        setAnalyticsMetrics={setAnalyticsMetrics}
        setLoading={setLoading}
      />
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
          --text-accent: #cbd5e1;
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
          --text-accent: #334155;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-text-accent { color: var(--text-accent) !important; }
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

      {/* Enhanced Gradient Orbs */}
      <GradientOrbs theme={theme} />

      {/* Main Dashboard Layout */}
      <div className="relative z-10 theme-text-primary flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 lg:hidden z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>


        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
        
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <RealTimeMonitoringHeader t={t} currentTime={currentTime} />

                  {/* Innovative Floating Metric Cards with Hexagon Design */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                  >
                    {loading ? (
                      // Loading skeleton for quick stats
                      Array.from({ length: 4 }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          className="theme-bg-card theme-border-glass border rounded-2xl sm:rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-sm animate-pulse"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-300"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 rounded mb-2"></div>
                              <div className="h-6 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </motion.div>
                      ))
                    ) : (
                      quickStats.map((stat, idx) => (
                      <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="relative group cursor-pointer"
                        whileHover={{ y: -8, scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Hexagonal Background Accent */}
                        <div className="absolute inset-0 opacity-20">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon 
                              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
                              fill="currentColor"
                              className={`${stat.trend === 'up' ? 'text-green-500' : 'text-amber-500'}`}
                            />
                          </svg>
                        </div>

                        {/* Main Card */}
                        <div className="relative theme-bg-card theme-border-glass border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-5 backdrop-blur-xl overflow-hidden">
                          {/* Animated Corner Accent */}
                          <motion.div
                            className={`absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`}
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                          
                          {/* Floating Status Badge */}
                          <motion.div
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                          >
                            <motion.div
                              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${stat.trend === 'up' ? 'bg-green-500' : 'bg-amber-500'}`}
                              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>

                          {/* Icon with Orbital Ring */}
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4">
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-dashed opacity-20"
                              style={{ borderColor: `var(--${stat.trend === 'up' ? 'green' : 'amber'}-500)` }}
                            />
                            <div className={`w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl`}>
                              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                          </div>

                          {/* Value with Counting Animation Effect */}
                          <motion.h3 
                            className="text-xl sm:text-2xl lg:text-3xl font-black theme-text-primary mb-1 tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            {stat.value}
                          </motion.h3>
                          
                          <p className="text-xs sm:text-sm font-medium theme-text-muted mb-2 sm:mb-3">{stat.title}</p>

                          {/* Trend Indicator Bar */}
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                              {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              <span>{stat.change}</span>
                            </div>
                            <div className="flex-1 text-xs theme-text-muted">{t('dashboard.common.vsLastPeriod')}</div>
                          </div>

                          {/* Hover Overlay */}
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}
                          />
                        </div>
                      </motion.div>
                    )))}
                  </motion.div>

                  {/* Live Application Tracking */}
                  <motion.div
                    variants={itemVariants}
                    className="theme-bg-card theme-border-glass border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="tracking-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="2" fill="rgba(59, 130, 246, 0.8)" />
                            <path d="M20,10 L30,20 L20,30 L10,20 Z" stroke="rgba(59, 130, 246, 0.4)" fill="none" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#tracking-pattern)" />
                      </svg>
                    </div>

                    <LiveApplicationTracking
                      t={t}
                      loading={loading}
                      liveTrackingStats={liveTrackingStats}
                      recentActivity={recentActivity}
                    />

                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                  </motion.div>

                  {/* Premium Analytics Dashboard */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                    {/* Left Column - Enhanced Chart Analytics */}
                    <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                      <motion.div
                        variants={itemVariants}
                        className="relative theme-bg-card theme-border-glass border-2 rounded-3xl p-4 sm:p-6 backdrop-blur-xl overflow-hidden group"
                      >
                        {/* Animated Background Grid */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }} />
                        </div>

                        <AnalyticsHeader t={t} onExport={exportCSV} />

                        <AnalyticsFiltersAndChart
                          t={t}
                          chartRange={chartRange}
                          setChartRange={setChartRange}
                          chartType={chartType}
                          setChartType={setChartType}
                          showApplications={showApplications}
                          setShowApplications={setShowApplications}
                          showApproved={showApproved}
                          setShowApproved={setShowApproved}
                          showPending={showPending}
                          setShowPending={setShowPending}
                          smoothing={smoothing}
                          setSmoothing={setSmoothing}
                          analyticsMetrics={analyticsMetrics}
                          dataSets={dataSets}
                        />

                        {/* Decorative Elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>



                      {/* Live Application Tracking */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold theme-text-primary" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t('dashboard.liveTracking.liveApplicationTracking')}</h3>
                            <motion.div
                              className="w-2 h-2 rounded-full bg-green-500"
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                          <motion.button
                            onClick={() => router.push('/dashboard/applications')}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl theme-bg-glass theme-text-primary text-sm w-full sm:w-auto justify-center sm:justify-start"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>{t('dashboard.common.viewAllTracking')}</span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="space-y-3">
                          {loading ? (
                            // Loading skeleton for recent applications
                            Array.from({ length: 4 }).map((_, idx) => (
                              <motion.div
                                key={idx}
                                className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl theme-bg-glass border border-transparent animate-pulse gap-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 pl-3">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-300"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                                  </div>
                                </div>
                                <div className="hidden sm:flex sm:flex-col sm:items-end text-right">
                                  <div className="h-6 bg-gray-300 rounded w-20 mb-2"></div>
                                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            recentApplications.map((app, idx) => (
                            <motion.div
                              key={app.id}
                              className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl theme-bg-glass group hover:theme-border-glass border border-transparent transition-all gap-3"
                              whileHover={{ x: 4 }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              {/* Color-coded status strip */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                                app.status === 'approved' ? 'bg-green-500' :
                                app.status === 'pending' ? 'bg-amber-500' :
                                app.status === 'in-review' ? 'bg-blue-500' : 'bg-red-500'
                              }`} />

                              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 pl-3">
                                <div className="relative">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl accent-gradient flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                                    {app.avatar}
                                  </div>
                                  {/* Progress ring */}
                                  <svg className="absolute -top-1 -right-1 w-5 h-5" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" 
                                      className={app.status === 'approved' ? 'text-green-500' : app.status === 'pending' ? 'text-amber-500' : 'text-blue-500'}
                                      strokeWidth="2" strokeDasharray="50" strokeDashoffset={app.status === 'approved' ? '0' : app.status === 'in-review' ? '25' : '40'}
                                      strokeLinecap="round" transform="rotate(-90 10 10)" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium theme-text-primary text-sm sm:text-base truncate">{app.name}</p>
                                    <span className="text-xs theme-text-muted bg-gray-500/10 px-2 py-0.5 rounded">{app.id}</span>
                                  </div>
                                  <p className="text-xs sm:text-sm theme-text-muted truncate mb-1">{app.district} • {app.type}</p>
                                  
                                  {/* Status timeline */}
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'approved' || app.status === 'in-review' || app.status === 'pending' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <div className={`h-px flex-1 ${app.status === 'approved' || app.status === 'in-review' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'approved' || app.status === 'in-review' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                    <div className={`h-px flex-1 ${app.status === 'approved' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                    <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'approved' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  </div>

                                  <div className="flex items-center space-x-2 mt-2 sm:hidden">
                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                      {getStatusIcon(app.status)}
                                      <span>{getStatusText(app.status)}</span>
                                    </span>
                                    <p className="font-semibold theme-text-primary text-sm">₹{app.amount.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="hidden sm:flex sm:flex-col sm:items-end sm:space-y-2 text-right">
                                <p className="font-semibold theme-text-primary text-lg">₹{app.amount.toLocaleString()}</p>
                                <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                  {getStatusIcon(app.status)}
                                  <span>{getStatusText(app.status)}</span>
                                </span>
                                <span className="text-xs theme-text-muted">{app.date}</span>
                              </div>
                            </motion.div>
                          )))}
                        </div>
                      </motion.div>

                      <BeneficiariesPreview
                        t={t}
                        beneficiaries={beneficiaries}
                        loading={loading}
                        formatActType={formatActType}
                        formatCurrency={formatCurrency}
                        getStatusColor={getStatusColor}
                        getVerificationColor={getVerificationColor}
                        getStatusIcon={getStatusIcon}
                      />

                      {/* Disbursements Preview */}
                      <DisbursementsPreview
                        t={t}
                        recentDisbursements={recentDisbursements} 
                        />

                      {/* Analytics Preview */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-3xl p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                            backgroundSize: '25px 25px'
                          }} />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <motion.div 
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                              >
                                <BarChart3 className="w-7 h-7 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-xl font-bold theme-text-primary">{t('dashboard.analytics.performanceAnalytics')}</h3>
                                <p className="text-sm theme-text-muted">{t('dashboard.analytics.keyMetricsAndInsights')}</p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => router.push('/dashboard/analytics')}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
                              whileHover={{ scale: 1.05, x: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{t('dashboard.common.viewFull')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { label: t('dashboard.analytics.totalApplications'), value: '1,247', change: '+12%', trend: 'up', icon: FileText, color: 'from-blue-500 to-cyan-500', progress: 85 },
                              { label: t('dashboard.analytics.successRate'), value: '87.5%', change: '+3.2%', trend: 'up', icon: TrendingUp, color: 'from-green-500 to-emerald-500', progress: 87.5 },
                              { label: t('dashboard.analytics.avgProcessing'), value: '4.2 days', change: '-0.8', trend: 'down', icon: Clock, color: 'from-amber-500 to-orange-500', progress: 65 }
                            ].map((metric, idx) => (
                              <motion.div
                                key={metric.label}
                                className="relative p-5 rounded-2xl theme-bg-glass border-2 theme-border-glass group/metric overflow-hidden shadow-xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, type: "spring" }}
                                whileHover={{ scale: 1.08, y: -8 }}
                              >
                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                      <pattern id={`metric-bg-${idx}`} x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                                        <circle cx="12.5" cy="12.5" r="1" fill="currentColor" />
                                      </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill={`url(#metric-bg-${idx})`} />
                                  </svg>
                                </div>

                                {/* Status Accent */}
                                <motion.div
                                  className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${metric.color}`}
                                  initial={{ height: 0 }}
                                  animate={{ height: '100%' }}
                                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                                />

                                {/* Icon with Glow */}
                                <div className="relative mb-4">
                                  <motion.div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}
                                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <metric.icon className="w-6 h-6 text-white" />
                                  </motion.div>
                                  {/* Floating Trend Indicator */}
                                  <motion.div
                                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 theme-bg-card flex items-center justify-center shadow-lg ${
                                      metric.trend === 'up' ? 'bg-green-500 border-green-300' : 'bg-amber-500 border-amber-300'
                                    }`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                                  >
                                    {metric.trend === 'up' ?
                                      <ArrowUpRight className="w-3 h-3 text-white" /> :
                                      <ArrowDownRight className="w-3 h-3 text-white" />
                                    }
                                  </motion.div>
                                </div>

                                {/* Metric Info */}
                                <div className="space-y-2">
                                  <p className="text-xs theme-text-muted font-medium">{metric.label}</p>
                                  <motion.p
                                    className="text-2xl font-black theme-text-primary"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                  >
                                    {metric.value}
                                  </motion.p>
                                  <div className={`flex items-center gap-1 text-xs font-bold ${
                                    metric.trend === 'up' ? 'text-green-500' : 'text-amber-500'
                                  }`}>
                                    <span>{metric.change}</span>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                      className={`h-full bg-gradient-to-r ${metric.color}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${metric.progress}%` }}
                                      transition={{ delay: 0.5 + idx * 0.1, duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                </div>

                                {/* Shine Effect */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/metric:opacity-10"
                                  initial={{ x: '-100%' }}
                                  whileHover={{ x: '100%' }}
                                  transition={{ duration: 0.6 }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Decorative orb */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>

                      {/* Reports Preview */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-3xl p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Background Pattern - Waves */}
                        <div className="absolute inset-0 opacity-5">
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="wave-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="rgba(59, 130, 246, 0.8)" fill="none" strokeWidth="2" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#wave-pattern)" />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <motion.div 
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <FileText className="w-7 h-7 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold theme-text-primary">{t('dashboard.reports.generatedReports')}</h3>
                                <p className="text-sm theme-text-muted">{t('dashboard.reports.latestSystemReports')}</p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => router.push('/dashboard/reports')}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
                              whileHover={{ scale: 1.05, x: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{t('dashboard.common.viewFull')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          </div>

                          <div className="space-y-4">
                            {(generatedReports.length ? generatedReports : [
                              { name: t('dashboard.reports.monthlyDbtDisbursement'), type: t('dashboard.reports.financial'), status: 'completed', size: '4.2 MB', date: '2024-03-18', icon: Wallet, progress: 100, color: 'from-green-500 to-emerald-500' },
                              { name: t('dashboard.reports.beneficiaryVerification'), type: t('dashboard.reports.operational'), status: 'completed', size: '2.8 MB', date: '2024-03-17', icon: CheckCircle, progress: 100, color: 'from-blue-500 to-cyan-500' },
                              { name: t('dashboard.reports.applicationAnalytics'), type: t('dashboard.reports.statistical'), status: 'processing', size: '3.5 MB', date: '2024-03-16', icon: BarChart3, progress: 65, color: 'from-amber-500 to-orange-500' }
                            ]).map((report: any, idx: number) => {
                              const title = report.title || report.name || 'Report';
                              const IconComp = report.icon || FileText;
                              const color = report.color || 'from-gray-500 to-gray-600';
                              const status = report.status || 'completed';
                              const progress = typeof report.progress === 'number' ? report.progress : (status === 'completed' ? 100 : (report.progress || 0));
                              return (
                              <motion.div
                                key={(report.id || title) + idx}
                                className="relative p-5 rounded-2xl theme-bg-glass border-2 theme-border-glass group/report overflow-hidden shadow-xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, type: "spring" }}
                                whileHover={{ scale: 1.03, x: 8 }}
                              >
                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                      <pattern id={`report-bg-${idx}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <rect x="10" y="10" width="20" height="20" rx="2" fill="currentColor" opacity="0.3" />
                                      </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill={`url(#report-bg-${idx})`} />
                                  </svg>
                                </div>

                                {/* Status Accent Bar */}
                                <motion.div
                                  className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${color}`}
                                  initial={{ height: 0 }}
                                  animate={{ height: '100%' }}
                                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                                />

                                <div className="relative flex items-center gap-5">
                                  {/* Icon with Animation */}
                                  <div className="relative">
                                    <motion.div
                                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                                      whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      <IconComp className="w-7 h-7 text-white" />
                                    </motion.div>
                                    {/* Status Indicator */}
                                    <motion.div
                                      className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 theme-bg-card flex items-center justify-center shadow-lg ${
                                        status === 'completed' ? 'bg-green-500 border-green-300' : 'bg-blue-500 border-blue-300'
                                      }`}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                                    >
                                      {status === 'completed' ?
                                        <CheckCircle className="w-3 h-3 text-white" /> :
                                        <Clock className="w-3 h-3 text-white" />
                                      }
                                    </motion.div>
                                  </div>

                                  {/* Report Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div className="flex-1 min-w-0">
                                        <motion.p
                                          className="font-bold theme-text-primary text-base mb-2"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.3 + idx * 0.1 }}
                                        >
                                          {report.name}
                                        </motion.p>
                                        <div className="flex items-center gap-3 text-xs theme-text-muted">
                                          <span className={`px-2.5 py-1 rounded-full font-semibold ${
                                            report.type === 'Financial' ? 'bg-green-500/10 text-green-500' :
                                            report.type === 'Operational' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-purple-500/10 text-purple-500'
                                          }`}>
                                            {report.type}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {report.size}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {report.date}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Status Badge */}
                                      <motion.span
                                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                          report.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                      >
                                        {report.status === 'completed' ?
                                          <CheckCircle className="w-3 h-3" /> :
                                          <Clock className="w-3 h-3" />
                                        }
                                        {getStatusText(report.status)}
                                      </motion.span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs theme-text-muted">
                                        <span>Generation Progress</span>
                                        <span className="font-semibold">{report.progress}%</span>
                                      </div>
                                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                          className={`h-full bg-gradient-to-r ${report.color}`}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${report.progress}%` }}
                                          transition={{ delay: 0.5 + idx * 0.1, duration: 1, ease: "easeOut" }}
                                        />
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Shine Effect */}
                                        <motion.div
                                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/report:opacity-10"
                                          initial={{ x: '-100%' }}
                                          whileHover={{ x: '100%' }}
                                          transition={{ duration: 0.6 }}
                                        />
                                      </motion.div>
                                          );
                                      })}
                          </div>
                        </div>

                        {/* Decorative orb */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>
                    </div>

                    {/* Right Column - Side Panels */}
                    <div className="space-y-4 lg:space-y-6">
                      {/* System Integrations Preview */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Animated Mesh Background */}
                        <div className="absolute inset-0 opacity-5">
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="integration-mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="1.5" fill="rgba(99, 102, 241, 0.8)" />
                                <line x1="20" y1="20" x2="40" y2="20" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="0.5" />
                                <line x1="20" y1="20" x2="20" y2="40" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="0.5" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#integration-mesh)" />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <motion.div 
                                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <Database className="w-5 h-5 text-white" />
                                {/* Pulse rings */}
                                <motion.div
                                  className="absolute inset-0 rounded-xl border-2 border-indigo-500"
                                  animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                                />
                                <motion.div
                                  className="absolute inset-0 rounded-xl border-2 border-purple-500"
                                  animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: 1, repeatDelay: 0.5 }}
                                />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold theme-text-primary" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t('dashboard.sections.systemIntegrations')}</h3>
                                <p className="text-xs theme-text-muted">Connected Services</p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => router.push('/dashboard/integrations')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-shadow"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{t('dashboard.common.viewFull')}</span>
                              <ArrowRight className="w-3 h-3" />
                            </motion.button>
                          </div>

                          {/* Grid Layout for Integrations */}
                          <div className="grid grid-cols-2 gap-2.5">
                            {loading ? (
                              Array.from({ length: 6 }).map((_, idx) => (
                                <motion.div
                                  key={idx}
                                  className="relative p-3 rounded-xl theme-bg-glass border theme-border-glass animate-pulse"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-gray-300" />
                                    <div className="flex-1 min-w-0">
                                      <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
                                      <div className="h-3 bg-gray-300 rounded w-20" />
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              systemIntegrations.map((integration: any, idx: number) => {
                                const name = integration.name || 'Unknown Integration';
                                const IconComp = integration.icon || Settings;
                                const color = integration.color || 'from-gray-500 to-gray-600';
                                const status = integration.status || 'error';
                                return (
                                  <motion.div
                                    key={(integration.id || name) + idx}
                                    className="relative p-3 rounded-xl theme-bg-glass border theme-border-glass flex items-center gap-3"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                  >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                      {integration.imageUrl ? (
                                        <img
                                          src={integration.imageUrl}
                                          alt={name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                                            if (sib) sib.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-full h-full flex items-center justify-center ${integration.imageUrl ? 'hidden' : ''}`}>
                                        {IconComp ? <IconComp className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold theme-text-primary text-sm truncate">{name}</p>
                                      <p className="text-xs theme-text-muted">{status === 'active' ? 'Connected' : status}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        status === 'active' ? 'bg-green-500/10 text-green-500' : status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                      }`}>{getStatusText(status)}</span>
                                    </div>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>

                          {/* Connection Status Summary */}
                          <div className="mt-4 pt-3 border-t theme-border-glass">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  <span className="theme-text-muted">
                                    {systemIntegrations.filter(i => i.status === 'active').length} Active
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                                  <span className="theme-text-muted">
                                    {systemIntegrations.filter(i => i.status === 'warning').length} Warning
                                  </span>
                                </div>
                              </div>
                              <motion.div
                                className="flex items-center gap-1 text-green-500 font-medium"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span>Live</span>
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>

                        

                        {/* Grievance Hub Preview */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Alert Wave Background */}
                        <div className="absolute inset-0 opacity-5">
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="grievance-alert" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                <circle cx="30" cy="30" r="2" fill="rgba(239, 68, 68, 0.6)" />
                                <path d="M15,30 L30,15 L45,30 L30,45 Z" stroke="rgba(239, 68, 68, 0.4)" fill="none" strokeWidth="1" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grievance-alert)" />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <motion.div 
                                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <MessageCircle className="w-5 h-5 text-white" />
                                {/* Alert Ripple Effect */}
                                <motion.div
                                  className="absolute inset-0 rounded-xl bg-red-500"
                                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold theme-text-primary" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t('dashboard.sections.grievanceStatus')}</h3>
                                <p className="text-xs theme-text-muted">Active Issues</p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => router.push('/dashboard/grievance')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-shadow"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{t('dashboard.common.viewFull')}</span>
                              <ArrowRight className="w-3 h-3" />
                            </motion.button>
                          </div>
                          
                          <div className="space-y-2.5">
                            {loading ? (
                              // Loading skeleton for grievances
                              Array.from({ length: 3 }).map((_, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex items-center justify-between p-3 rounded-xl theme-bg-glass border theme-border-glass animate-pulse"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-300"></div>
                                    <div>
                                      <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                                    </div>
                                  </div>
                                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                                </motion.div>
                              ))
                            ) : (
                              grievanceData.map((grievance, index) => {
                              const priorityConfig = {
                                high: { 
                                  bg: 'from-red-500 to-rose-500', 
                                  text: 'text-red-500',
                                  icon: AlertCircle,
                                  glow: 'shadow-red-500/30'
                                },
                                medium: { 
                                  bg: 'from-amber-500 to-orange-500', 
                                  text: 'text-amber-500',
                                  icon: Clock,
                                  glow: 'shadow-amber-500/30'
                                },
                                low: { 
                                  bg: 'from-blue-500 to-cyan-500', 
                                  text: 'text-blue-500',
                                  icon: CheckCircle,
                                  glow: 'shadow-blue-500/30'
                                }
                              };
                              
                              const config = priorityConfig[grievance.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                              const PriorityIcon = config.icon;

                              return (
                                <motion.div
                                  key={grievance.id}
                                  className="relative p-3 rounded-xl theme-bg-glass border theme-border-glass group/item overflow-hidden"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1, type: "spring" }}
                                  whileHover={{ scale: 1.03, x: 5 }}
                                >
                                  {/* Priority Accent Bar */}
                                  <motion.div 
                                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.bg}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                  />

                                  {/* Hover Glow Effect */}
                                  <motion.div
                                    className={`absolute inset-0 bg-gradient-to-r ${config.bg} opacity-0 group-hover/item:opacity-5`}
                                    transition={{ duration: 0.3 }}
                                  />

                                  <div className="relative pl-3">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex items-start gap-2 flex-1 min-w-0">
                                        {/* Priority Icon */}
                                        <motion.div
                                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-lg ${config.glow} flex-shrink-0 mt-0.5`}
                                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                          transition={{ duration: 0.5 }}
                                        >
                                          <PriorityIcon className="w-4 h-4 text-white" />
                                        </motion.div>

                                        {/* Subject */}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold theme-text-primary text-sm leading-tight line-clamp-2">
                                            {grievance.subject}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Priority Badge */}
                                      <motion.div
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPriorityColor(grievance.priority)} shadow-sm flex-shrink-0`}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {grievance.priority}
                                      </motion.div>
                                    </div>

                                    {/* Info Row */}
                                    <div className="flex items-center justify-between text-xs theme-text-muted pl-10">
                                      <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text', 'bg')}`} />
                                        <span className="font-medium">{grievance.assignedTo}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{grievance.date}</span>
                                      </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="mt-2 pl-10">
                                      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                          className={`h-full bg-gradient-to-r ${config.bg}`}
                                          initial={{ width: 0 }}
                                          animate={{ width: grievance.priority === 'high' ? '75%' : grievance.priority === 'medium' ? '50%' : '25%' }}
                                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Shine Effect */}
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/item:opacity-10"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6 }}
                                  />
                                </motion.div>
                              );
                            }))}
                          </div>

                          {/* Priority Summary */}
                          <div className="mt-4 pt-3 border-t theme-border-glass">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                  <span className="theme-text-muted font-medium">
                                    {grievanceData.filter(g => g.priority === 'high').length} High
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span className="theme-text-muted font-medium">
                                    {grievanceData.filter(g => g.priority === 'medium').length} Medium
                                  </span>
                                </div>
                              </div>
                              <motion.div
                                className="flex items-center gap-1 text-red-500 font-semibold"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>Active</span>
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Decorative Elements */}
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>

                      {/* Quick Actions */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.5) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.5) 75%, rgba(59, 130, 246, 0.5)), linear-gradient(45deg, rgba(59, 130, 246, 0.5) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.5) 75%, rgba(59, 130, 246, 0.5))',
                            backgroundSize: '15px 15px',
                            backgroundPosition: '0 0, 7.5px 7.5px'
                          }} />
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                            <Zap className="w-5 h-5 text-amber-500" />
                            {t('dashboard.sections.quickActions')}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { labelKey: 'dashboard.quickActionLabels.newApp', icon: Plus, color: 'from-blue-500 to-cyan-500' },
                              { labelKey: 'dashboard.quickActionLabels.reports', icon: FileText, color: 'from-green-500 to-emerald-500' },
                              { labelKey: 'dashboard.quickActionLabels.analytics', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
                              { labelKey: 'dashboard.quickActionLabels.settings', icon: Settings, color: 'from-amber-500 to-orange-500' }
                            ].map((action, index) => (
                              <motion.button
                                key={action.labelKey}
                                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white flex flex-col items-center justify-center space-y-2 shadow-lg relative overflow-hidden`}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <motion.div
                                  className="absolute inset-0 bg-white"
                                  initial={{ scale: 0, opacity: 0 }}
                                  whileHover={{ scale: 2, opacity: 0.1 }}
                                  transition={{ duration: 0.3 }}
                                />
                                <action.icon className="w-6 h-6" />
                                <span className="text-xs font-semibold text-center" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t(action.labelKey)}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Decorative orb */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>

                      {/* System Health Monitor */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }} />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                              <Activity className="w-5 h-5 text-green-500" />
                              {t('dashboard.systemHealth.systemHealth')}
                            </h3>
                            <motion.div
                              className="w-3 h-3 rounded-full bg-green-500"
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>

                          <div className="space-y-3">
                            {[
                              { label: t('dashboard.systemHealth.serverUptime'), value: '99.9%', status: 'excellent', color: 'text-green-500' },
                              { label: t('dashboard.systemHealth.apiResponse'), value: '45ms', status: 'good', color: 'text-green-500' },
                              { label: t('dashboard.systemHealth.databaseLoad'), value: '34%', status: 'normal', color: 'text-blue-500' },
                              { label: t('dashboard.systemHealth.activeUsers'), value: '1,247', status: 'high', color: 'text-purple-500' }
                            ].map((metric, idx) => (
                              <motion.div
                                key={metric.label}
                                className="flex items-center justify-between p-3 rounded-xl theme-bg-glass"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${metric.color.replace('text', 'bg')}`} />
                                  <span className="text-sm theme-text-primary font-medium">{metric.label}</span>
                                </div>
                                <span className={`font-bold text-sm ${metric.color}`}>{metric.value}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Decorative orb */}
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>

                      {/* Recent Activity Feed */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)',
                            backgroundSize: '15px 15px'
                          }} />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                              <Clock className="w-5 h-5 text-purple-500" />
                              {t('dashboard.recentActivity.recentActivity')}
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {[
                              { action: t('dashboard.recentActivity.newApplication'), user: 'Rajesh Kumar', time: '2 min ago', icon: Plus, color: 'from-blue-500 to-cyan-500' },
                              { action: t('dashboard.recentActivity.disbursementApproved'), user: 'Officer Sharma', time: '15 min ago', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
                              { action: t('dashboard.recentActivity.reportGenerated'), user: 'System', time: '1 hr ago', icon: FileText, color: 'from-amber-500 to-orange-500' },
                              { action: t('dashboard.recentActivity.grievanceResolved'), user: 'Officer Verma', time: '3 hrs ago', icon: MessageCircle, color: 'from-red-500 to-rose-500' }
                            ].map((activity, idx) => (
                              <motion.div
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl theme-bg-glass border theme-border-glass"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                              >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center flex-shrink-0`}>
                                  <activity.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold theme-text-primary">{activity.action}</p>
                                  <p className="text-xs theme-text-muted truncate">by {activity.user}</p>
                                </div>
                                <span className="text-xs theme-text-muted whitespace-nowrap">{activity.time}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Decorative orb */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>

                      {/* Performance Metrics */}
                      <motion.div
                        variants={itemVariants}
                        className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="perf-wave" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
                                <path d="M0 25 Q 25 15, 50 25 T 100 25" stroke="rgba(59, 130, 246, 0.8)" fill="none" strokeWidth="1" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#perf-wave)" />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                              <TrendingUp className="w-5 h-5 text-blue-500" />
                              {t('dashboard.performance.performance')}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: t('dashboard.performance.today'), value: '156', change: '+12%', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
                              { label: t('dashboard.performance.thisWeek'), value: '892', change: '+8%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                              { label: t('dashboard.performance.success'), value: '87.5%', change: '+3%', icon: Award, color: 'from-purple-500 to-pink-500' },
                              { label: t('dashboard.performance.pending'), value: '45', change: '-5%', icon: Clock, color: 'from-amber-500 to-orange-500' }
                            ].map((metric, idx) => (
                              <motion.div
                                key={metric.label}
                                className="p-3 rounded-xl theme-bg-glass border theme-border-glass"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-2`}>
                                  <metric.icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs theme-text-muted mb-1">{metric.label}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-lg font-bold theme-text-primary">{metric.value}</p>
                                  <span className={`text-xs font-semibold ${metric.change.startsWith('+') ? 'text-green-500' : 'text-amber-500'}`}>
                                    {metric.change}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Decorative orb */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
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
                  className="theme-bg-card theme-border-glass border rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
                >
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl accent-gradient flex items-center justify-center">
                      {(() => {
                        const Icon = navigationItems.find(item => item.id === activeTab)?.icon || FileText;
                        return <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
                      })()}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold theme-text-primary mb-2 capitalize">{t('dashboard.common.tabManagement', { tab: activeTab })}</h3>
                    <p className="theme-text-muted text-sm sm:text-base mb-4">
                      {t('dashboard.common.tabManagementDescription', { tab: activeTab })}
                    </p>
                    <motion.button
                      className="px-4 py-2.5 sm:px-6 sm:py-3 accent-gradient rounded-xl font-semibold text-white flex items-center space-x-2 mx-auto text-sm sm:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{t('dashboard.common.exploreTab', { tab: activeTab })}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <ProgressBar scaleProgress={scaleProgress} />

      {/* Notification Dropdown */}
      <NotificationDropdownWrapper
        isNotificationOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        triggerRef={notifButtonRef}
      />
    </div>
  );
};

// Set display name for tooling and React devtools
try { (Dashboard as any).displayName = 'Dashboard'; } catch {}

export default Dashboard;