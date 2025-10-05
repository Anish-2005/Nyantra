"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion,} from 'framer-motion';
import type * as THREE from 'three';
import { Download, Eye, RefreshCw, TrendingUp, TrendingDown, FileText, Users, Banknote, DollarSign, PieChart, Activity, CheckCircle, XCircle, AlertCircle, Award as AwardIcon, Clock as ClockIcon, Map as MapIcon, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';

// Mock data for analytics
const analyticsData = {
  overview: {
    totalApplications: 1247,
    totalBeneficiaries: 892,
    totalDisbursements: 756,
    totalAmount: 32850000,
    successRate: 87.5,
    avgProcessingTime: 4.2,
    pendingApplications: 156,
    rejectedApplications: 89
  },
  monthlyTrends: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    applications: [85, 92, 78, 105, 120, 135, 110, 125, 140, 130, 115, 128],
    disbursements: [65, 70, 62, 85, 95, 110, 92, 105, 115, 108, 98, 102],
    amounts: [2850000, 3150000, 2720000, 3670000, 4200000, 4720000, 3850000, 4380000, 5020000, 4550000, 4120000, 4470000]
  },
  stateWiseData: [
    { state: 'Bihar', applications: 145, disbursements: 120, amount: 5250000, successRate: 82.8 },
    { state: 'Uttar Pradesh', applications: 178, disbursements: 152, amount: 6650000, successRate: 85.4 },
    { state: 'Rajasthan', applications: 132, disbursements: 115, amount: 5020000, successRate: 87.1 },
    { state: 'Madhya Pradesh', applications: 121, disbursements: 98, amount: 4280000, successRate: 81.0 },
    { state: 'Jharkhand', applications: 98, disbursements: 85, amount: 3720000, successRate: 86.7 },
    { state: 'Maharashtra', applications: 156, disbursements: 138, amount: 6040000, successRate: 88.5 },
    { state: 'West Bengal', applications: 142, disbursements: 125, amount: 5470000, successRate: 88.0 }
  ],
  actWiseBreakdown: {
    pcr: {
      applications: 678,
      disbursements: 589,
      amount: 25750000,
      successRate: 86.9
    },
    poa: {
      applications: 569,
      disbursements: 432,
      amount: 19580000,
      successRate: 75.9
    }
  },
  categoryWiseData: {
    SC: { applications: 645, disbursements: 567, amount: 24800000 },
    ST: { applications: 328, disbursements: 289, amount: 12650000 },
    OBC: { applications: 274, disbursements: 165, amount: 7200000 }
  },
  performanceMetrics: {
    avgApplicationToDisbursement: 18.5,
    avgVerificationTime: 3.2,
    rejectionRate: 7.1,
    documentDeficiencyRate: 12.3,
    appealSuccessRate: 34.8
  },
  topDistricts: [
    { district: 'Patna', state: 'Bihar', applications: 67, disbursements: 58, successRate: 86.6 },
    { district: 'Lucknow', state: 'Uttar Pradesh', applications: 72, disbursements: 62, successRate: 86.1 },
    { district: 'Jaipur', state: 'Rajasthan', applications: 58, disbursements: 51, successRate: 87.9 },
    { district: 'Bhopal', state: 'Madhya Pradesh', applications: 49, disbursements: 40, successRate: 81.6 },
    { district: 'Ranchi', state: 'Jharkhand', applications: 45, disbursements: 39, successRate: 86.7 }
  ]
};

const AnalyticsPage = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('year');
  const [actTypeFilter, setActTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    const data = { ...analyticsData } as const;

    // Time range filtering would be implemented here
    // For now, we'll use the full dataset

    return data;
  }, [timeRange, actTypeFilter, categoryFilter, stateFilter]);

  // Performance indicators
  const performanceIndicators = useMemo(() => {
    return [
      {
        label: 'Application Success Rate',
        value: `${filteredData.overview.successRate}%`,
        change: '+2.3%',
        trend: 'up',
        icon: TrendingUp,
        color: 'from-green-500 to-emerald-500'
      },
      {
        label: 'Avg Processing Time',
        value: `${filteredData.overview.avgProcessingTime} days`,
        change: '-0.8 days',
        trend: 'down',
        icon: TrendingDown,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        label: 'Disbursement Rate',
        value: `${Math.round((filteredData.overview.totalDisbursements / filteredData.overview.totalApplications) * 100)}%`,
        change: '+4.1%',
        trend: 'up',
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500'
      },
      {
        label: 'Amount Disbursed',
        value: `₹${(filteredData.overview.totalAmount / 10000000).toFixed(1)}Cr`,
        change: '+12.5%',
        trend: 'up',
        icon: TrendingUp,
        color: 'from-amber-500 to-orange-500'
      }
    ];
  }, [filteredData]);

  // Detect small screens and adjust UI defaults for better mobile UX
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setIsMobile(matches);
    };

    handler(mq);
    if ('addEventListener' in mq) mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);

    return () => {
      if ('removeEventListener' in mq) mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      else (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  // Three.js canvas background (particles + connecting lines) — theme-aware
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, alpha: true, antialias: true });

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
      const linesMaterial = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: theme === 'dark' ? 0.15 : 0.1 });

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

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  return (
    <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
      {/* Three.js Canvas Background (theme-aware) */}
      <canvas
        ref={canvasRef}
        id="analytics-three-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
        style={{ zIndex: 0, background: 'transparent' }}
      />
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
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Analytics & Reports</h1>
          <p className="theme-text-secondary">Comprehensive insights and performance metrics for DBT under PCR/PoA Acts</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Time Range Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 theme-text-muted" />
            <span className="text-sm font-medium theme-text-primary">Time Period</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'quarter', label: 'Last Quarter' },
              { value: 'year', label: 'Last Year' },
              { value: 'custom', label: 'Custom Range' }
            ].map((period) => (
              <motion.button
                key={period.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(period.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  timeRange === period.value 
                    ? 'accent-gradient text-white' 
                    : 'theme-bg-glass theme-text-muted'
                }`}
              >
                {period.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Performance Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {performanceIndicators.map((indicator, idx) => {
          const TrendIcon = getTrendIcon(indicator.trend);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${indicator.color} flex items-center justify-center`}>
                  <indicator.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 ${getTrendColor(indicator.trend)}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{indicator.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold theme-text-primary mb-1">{indicator.value}</p>
              <p className="text-sm theme-text-muted">{indicator.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Applications', value: formatNumber(filteredData.overview.totalApplications), icon: FileText, color: 'from-blue-500 to-cyan-500' },
          { label: 'Beneficiaries', value: formatNumber(filteredData.overview.totalBeneficiaries), icon: Users, color: 'from-green-500 to-emerald-500' },
          { label: 'Disbursements', value: formatNumber(filteredData.overview.totalDisbursements), icon: Banknote, color: 'from-purple-500 to-pink-500' },
          { label: 'Amount Disbursed', value: formatCurrency(filteredData.overview.totalAmount), icon: DollarSign, color: 'from-amber-500 to-orange-500' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl text-center"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 mx-auto`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold theme-text-primary">{stat.value}</p>
            <p className="text-sm theme-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">Monthly Trends</h3>
              <p className="text-sm theme-text-muted">Applications vs Disbursements</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs theme-text-muted">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs theme-text-muted">Disbursements</span>
              </div>
            </div>
          </div>
          <div className="h-48 sm:h-64 overflow-x-auto">
            <div className="flex items-end gap-1 h-full">
              {filteredData.monthlyTrends.labels.map((month, index) => {
                const appHeight = (filteredData.monthlyTrends.applications[index] / Math.max(...filteredData.monthlyTrends.applications)) * 100;
                const disbHeight = (filteredData.monthlyTrends.disbursements[index] / Math.max(...filteredData.monthlyTrends.disbursements)) * 100;

                return (
                  <div key={month} className="flex flex-col items-center min-w-[64px] sm:flex-1 sm:min-w-0 flex-shrink-0">
                    <div className="flex items-end justify-center w-full h-24 sm:h-48 gap-1 mb-2">
                      <div 
                        className="w-1/2 bg-blue-500 rounded-t transition-all duration-500"
                        style={{ height: `${appHeight}%` }}
                      ></div>
                      <div 
                        className="w-1/2 bg-green-500 rounded-t transition-all duration-500"
                        style={{ height: `${disbHeight}%` }}
                      ></div>
                    </div>
                    <span className="text-xs theme-text-muted">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Act-wise Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">Act-wise Performance</h3>
              <p className="text-sm theme-text-muted">PCR Act vs PoA Act</p>
            </div>
            <PieChart className="w-5 h-5 theme-text-muted" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
                <div className="relative inline-block mb-4">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg font-bold">
                    {Math.round((filteredData.actWiseBreakdown.pcr.applications / filteredData.overview.totalApplications) * 100)}%
                  </span>
                </div>
              </div>
              <h4 className="font-semibold theme-text-primary mb-1">PCR Act</h4>
              <p className="text-sm theme-text-muted">{formatNumber(filteredData.actWiseBreakdown.pcr.applications)} Applications</p>
              <p className="text-sm theme-text-muted">{formatNumber(filteredData.actWiseBreakdown.pcr.disbursements)} Disbursed</p>
              <p className="text-sm font-medium text-green-500">{filteredData.actWiseBreakdown.pcr.successRate}% Success</p>
            </div>
            <div className="text-center">
                <div className="relative inline-block mb-4">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg font-bold">
                    {Math.round((filteredData.actWiseBreakdown.poa.applications / filteredData.overview.totalApplications) * 100)}%
                  </span>
                </div>
              </div>
              <h4 className="font-semibold theme-text-primary mb-1">PoA Act</h4>
              <p className="text-sm theme-text-muted">{formatNumber(filteredData.actWiseBreakdown.poa.applications)} Applications</p>
              <p className="text-sm theme-text-muted">{formatNumber(filteredData.actWiseBreakdown.poa.disbursements)} Disbursed</p>
              <p className="text-sm font-medium text-green-500">{filteredData.actWiseBreakdown.poa.successRate}% Success</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* State-wise Performance and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">State-wise Performance</h3>
              <p className="text-sm theme-text-muted">Top performing states</p>
            </div>
            <MapIcon className="w-5 h-5 theme-text-muted" />
          </div>
          <div className="space-y-4">
            {filteredData.stateWiseData.map((state, index) => (
              <div key={state.state} className="flex items-center justify-between p-3 rounded-lg theme-bg-glass">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium theme-text-primary">{state.state}</p>
                    <p className="text-xs theme-text-muted">{state.applications} applications</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold theme-text-primary">{state.disbursements} disbursed</p>
                  <p className="text-xs theme-text-muted">{state.successRate}% success</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category-wise Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">Category-wise Distribution</h3>
              <p className="text-sm theme-text-muted">Beneficiary categories</p>
            </div>
            <Users className="w-5 h-5 theme-text-muted" />
          </div>
          <div className="space-y-4">
            {Object.entries(filteredData.categoryWiseData).map(([category, data]) => (
              <div key={category} className="p-3 rounded-lg theme-bg-glass">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium theme-text-primary">{category}</span>
                  <span className="text-sm theme-text-muted">
                    {Math.round((data.applications / filteredData.overview.totalApplications) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full accent-gradient"
                    style={{ width: `${(data.applications / filteredData.overview.totalApplications) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs theme-text-muted mt-2">
                  <span>{formatNumber(data.applications)} applications</span>
                  <span>{formatNumber(data.disbursements)} disbursed</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Performance Metrics</h3>
            <p className="text-sm theme-text-muted">Key operational indicators</p>
          </div>
          <Activity className="w-5 h-5 theme-text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Avg Processing Time', value: `${filteredData.performanceMetrics.avgApplicationToDisbursement} days`, icon: ClockIcon },
            { label: 'Avg Verification Time', value: `${filteredData.performanceMetrics.avgVerificationTime} days`, icon: CheckCircle },
            { label: 'Rejection Rate', value: `${filteredData.performanceMetrics.rejectionRate}%`, icon: XCircle },
            { label: 'Document Deficiency', value: `${filteredData.performanceMetrics.documentDeficiencyRate}%`, icon: AlertCircle },
            { label: 'Appeal Success Rate', value: `${filteredData.performanceMetrics.appealSuccessRate}%`, icon: AwardIcon }
          ].map((metric, idx) => (
            <div key={idx} className="text-center p-4 rounded-lg theme-bg-glass">
              <metric.icon className="w-8 h-8 theme-text-primary mx-auto mb-2" />
              <p className="text-lg font-bold theme-text-primary mb-1">{metric.value}</p>
              <p className="text-xs theme-text-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Districts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
      >
        <div className="p-6 border-b theme-border-glass">
          <h3 className="text-lg font-semibold theme-text-primary">Top Performing Districts</h3>
          <p className="text-sm theme-text-muted">Districts with highest disbursement rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="theme-bg-glass border-b theme-border-glass">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">District</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">State</th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Applications</th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Disbursements</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Success Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.topDistricts.map((district, idx) => (
                <motion.tr
                  key={district.district}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium theme-text-primary">{district.district}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary">{district.state}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm theme-text-primary">{district.applications}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm theme-text-primary">{district.disbursements}</td>
                  <td className="hidden lg:table-cell px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {district.successRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Report Generation Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Generate Custom Reports</h3>
            <p className="text-sm theme-text-muted">Create detailed reports for analysis and compliance</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 justify-center"
            >
              <FileText className="w-4 h-4" />
              <span>Monthly Report</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 justify-center"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Performance Report</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 justify-center"
            >
              <Download className="w-4 h-4" />
              <span>Export All Data</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;