"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import {
  Search, Download, Eye, X, FileText, DollarSign, RefreshCw, TrendingUp,
  Shield, CheckCircle, XCircle,
  BarChart3, PieChart,
  Database,
  Cpu, FilePlus, FileCheck, BookOpen, Printer, Share2,
  
  Sparkles,
  Settings,
  BarChart,
  ArrowUpRight,
  Activity,
  Calendar,
  Clock,
  Zap,
} from 'lucide-react';

// Mock data for reports
const mockReports = [
  {
    id: 'REP-2024-001234',
    name: 'Monthly DBT Disbursement Report',
    type: 'disbursement',
    category: 'financial',
    frequency: 'monthly',
    status: 'completed',
    fileSize: '4.2 MB',
    fileFormat: 'PDF',
    generatedDate: '2024-03-18 14:30:25',
    generatedBy: 'Officer Sharma',
    schedule: null,
    lastRun: '2024-03-18 14:30:25',
    nextRun: null,
    recordCount: 1247,
    description: 'Comprehensive monthly report of all DBT disbursements under PCR and PoA Acts',
    parameters: {
      dateRange: '2024-03-01 to 2024-03-18',
      actType: 'Both',
      districts: 'All',
      status: 'All'
    },
    downloadCount: 45,
    isScheduled: false,
    recipients: [],
    columns: ['Application ID', 'Beneficiary Name', 'District', 'Act Type', 'Amount', 'Status', 'Disbursement Date']
  },
  {
    id: 'REP-2024-001235',
    name: 'Beneficiary Verification Report',
    type: 'verification',
    category: 'compliance',
    frequency: 'weekly',
    status: 'completed',
    fileSize: '2.8 MB',
    fileFormat: 'Excel',
    generatedDate: '2024-03-17 09:15:10',
    generatedBy: 'Officer Verma',
    schedule: null,
    lastRun: '2024-03-17 09:15:10',
    nextRun: null,
    recordCount: 892,
    description: 'Weekly report of beneficiary verification status and pending cases',
    parameters: {
      dateRange: '2024-03-11 to 2024-03-17',
      verificationStatus: 'All',
      districts: 'Priority Districts',
      category: 'All'
    },
    downloadCount: 32,
    isScheduled: false,
    recipients: [],
    columns: ['Beneficiary ID', 'Name', 'Aadhaar', 'District', 'Verification Status', 'Pending Days']
  },
  {
    id: 'REP-2024-001236',
    name: 'Grievance Redressal Performance',
    type: 'grievance',
    category: 'performance',
    frequency: 'weekly',
    status: 'completed',
    fileSize: '1.5 MB',
    fileFormat: 'PDF',
    generatedDate: '2024-03-16 16:45:30',
    generatedBy: 'Officer Kapoor',
    schedule: null,
    lastRun: '2024-03-16 16:45:30',
    nextRun: null,
    recordCount: 156,
    description: 'Weekly performance report on grievance resolution and response times',
    parameters: {
      dateRange: '2024-03-09 to 2024-03-16',
      grievanceType: 'All',
      priority: 'All',
      resolutionStatus: 'All'
    },
    downloadCount: 28,
    isScheduled: false,
    recipients: [],
    columns: ['Grievance ID', 'Category', 'Priority', 'Status', 'Resolution Time', 'Satisfaction Rating']
  },
  {
    id: 'REP-2024-001237',
    name: 'PCR Act Applications Quarterly',
    type: 'applications',
    category: 'statistical',
    frequency: 'quarterly',
    status: 'scheduled',
    fileSize: null,
    fileFormat: 'PDF',
    generatedDate: null,
    generatedBy: null,
    schedule: {
      frequency: 'quarterly',
      nextRun: '2024-04-01 00:00:00',
      recipients: ['director@socialwelfare.gov.in', 'pcr-section@socialwelfare.gov.in'],
      format: 'PDF'
    },
    lastRun: '2024-01-05 09:00:00',
    nextRun: '2024-04-01 00:00:00',
    recordCount: null,
    description: 'Quarterly statistical report on PCR Act applications and processing',
    parameters: {
      dateRange: '2024 Q1',
      actType: 'PCR Act',
      districts: 'All',
      reportType: 'Statistical'
    },
    downloadCount: 67,
    isScheduled: true,
    recipients: ['director@socialwelfare.gov.in', 'pcr-section@socialwelfare.gov.in'],
    columns: ['Application ID', 'District', 'Incident Date', 'Status', 'Processing Time', 'Officer']
  },
  {
    id: 'REP-2024-001238',
    name: 'SC/ST Category-wise Distribution',
    type: 'demographic',
    category: 'analytical',
    frequency: 'monthly',
    status: 'scheduled',
    fileSize: null,
    fileFormat: 'Excel',
    generatedDate: null,
    generatedBy: null,
    schedule: {
      frequency: 'monthly',
      nextRun: '2024-04-01 06:00:00',
      recipients: ['analysis@socialwelfare.gov.in'],
      format: 'Excel'
    },
    lastRun: '2024-03-01 06:00:00',
    nextRun: '2024-04-01 06:00:00',
    recordCount: null,
    description: 'Monthly demographic analysis of beneficiaries by SC/ST categories',
    parameters: {
      dateRange: 'Monthly',
      categories: ['SC', 'ST'],
      districts: 'All',
      analysisType: 'Demographic'
    },
    downloadCount: 41,
    isScheduled: true,
    recipients: ['analysis@socialwelfare.gov.in'],
    columns: ['Category', 'District', 'Applications', 'Approved', 'Rejected', 'Pending']
  },
  {
    id: 'REP-2024-001239',
    name: 'Financial Reconciliation Report',
    type: 'financial',
    category: 'audit',
    frequency: 'monthly',
    status: 'processing',
    fileSize: null,
    fileFormat: 'PDF',
    generatedDate: null,
    generatedBy: 'System',
    schedule: null,
    lastRun: '2024-02-29 23:59:00',
    nextRun: null,
    recordCount: null,
    description: 'Monthly financial reconciliation of disbursed amounts and bank records',
    parameters: {
      dateRange: '2024-03-01 to 2024-03-18',
      banks: 'All',
      transactionType: 'All',
      reconciliationType: 'Full'
    },
    downloadCount: 0,
    isScheduled: false,
    recipients: [],
    columns: ['Bank', 'Transaction Count', 'Total Amount', 'Success Rate', 'Failed Amount']
  },
  {
    id: 'REP-2024-001240',
    name: 'Integration Health Dashboard',
    type: 'system',
    category: 'technical',
    frequency: 'daily',
    status: 'scheduled',
    fileSize: null,
    fileFormat: 'PDF',
    generatedDate: null,
    generatedBy: null,
    schedule: {
      frequency: 'daily',
      nextRun: '2024-03-19 08:00:00',
      recipients: ['tech-support@socialwelfare.gov.in'],
      format: 'PDF'
    },
    lastRun: '2024-03-18 08:00:00',
    nextRun: '2024-03-19 08:00:00',
    recordCount: null,
    description: 'Daily system health report of all government integrations and APIs',
    parameters: {
      dateRange: 'Daily',
      integrations: 'All',
      metrics: 'Health, Performance, Errors'
    },
    downloadCount: 89,
    isScheduled: true,
    recipients: ['tech-support@socialwelfare.gov.in'],
    columns: ['Integration', 'Status', 'Uptime', 'Response Time', 'Error Rate']
  },
  {
    id: 'REP-2024-001241',
    name: 'District-wise Performance Ranking',
    type: 'performance',
    category: 'analytical',
    frequency: 'weekly',
    status: 'failed',
    fileSize: null,
    fileFormat: 'PDF',
    generatedDate: null,
    generatedBy: 'System',
    schedule: null,
    lastRun: '2024-03-17 18:00:00',
    nextRun: null,
    recordCount: null,
    description: 'Weekly performance ranking of districts based on application processing',
    parameters: {
      dateRange: '2024-03-11 to 2024-03-17',
      metrics: ['Processing Time', 'Approval Rate', 'Satisfaction'],
      districts: 'All'
    },
    downloadCount: 23,
    isScheduled: false,
    recipients: [],
    columns: ['District', 'Rank', 'Processing Time', 'Approval Rate', 'Satisfaction Score']
  }
];

// Mock data for report templates
const reportTemplates = [
  {
    id: 'TEMP-001',
    name: 'Standard DBT Disbursement Report',
    type: 'disbursement',
    category: 'financial',
    description: 'Standard template for monthly DBT disbursement reporting',
    defaultFormat: 'PDF',
    defaultParameters: {
      dateRange: 'last-month',
      actType: 'both',
      includeSummary: true,
      includeCharts: true
    },
    popular: true
  },
  {
    id: 'TEMP-002',
    name: 'Beneficiary Verification Summary',
    type: 'verification',
    category: 'compliance',
    description: 'Template for beneficiary verification status reports',
    defaultFormat: 'Excel',
    defaultParameters: {
      dateRange: 'last-week',
      verificationStatus: 'all',
      includePending: true
    },
    popular: true
  },
  {
    id: 'TEMP-003',
    name: 'Grievance Resolution Analytics',
    type: 'grievance',
    category: 'performance',
    description: 'Detailed analytics template for grievance resolution',
    defaultFormat: 'PDF',
    defaultParameters: {
      dateRange: 'last-month',
      resolutionTime: 'all',
      includeTrends: true
    },
    popular: false
  },
  {
    id: 'TEMP-004',
    name: 'PCR/PoA Act Comparison',
    type: 'analytical',
    category: 'statistical',
    description: 'Comparative analysis between PCR and PoA Act implementations',
    defaultFormat: 'Excel',
    defaultParameters: {
      dateRange: 'last-quarter',
      comparisonType: 'side-by-side',
      includeRecommendations: true
    },
    popular: false
  }
];

const ReportsPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('all');
  const [statusFilter] = useState('all');
  const [categoryFilter] = useState('all');
  const [frequencyFilter] = useState('all');
  const [sortBy] = useState('generatedDate');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [viewMode, setViewMode] = useState<'reports' | 'templates' | 'scheduled'>('reports');
  const [activeTab] = useState('details');
  // Note: removed unused isMobile/showScheduleModal/newSchedule state variables
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Use deterministic formatting so server and client render identical strings
  const formatDate = (s?: string | null) => {
    if (!s) return '--';
    try {
      const d = new Date(s);
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    } catch {
      return '--';
    }
  };

  const formatDateTime = (s?: string | null) => {
    if (!s) return '--';
    try {
      const d = new Date(s);
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
    } catch {
      return '--';
    }
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...mockReports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    // Frequency filter
    if (frequencyFilter !== 'all') {
      filtered = filtered.filter(report => report.frequency === frequencyFilter);
    }

    // View mode filter
    if (viewMode === 'scheduled') {
      filtered = filtered.filter(report => report.isScheduled);
    } else if (viewMode === 'templates') {
      return []; // Templates are handled separately
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      const aNull = aVal === null || aVal === undefined;
      const bNull = bVal === null || bVal === undefined;

      // Handle null/undefined consistently (place nulls last for ascending)
      if (aNull && bNull) return 0;
      if (aNull) return sortOrder === 'asc' ? 1 : -1;
      if (bNull) return sortOrder === 'asc' ? -1 : 1;

      // If both are numbers, compare numerically
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }

      // If both can be parsed as valid dates, compare by timestamp
      const aTime = Date.parse(String(aVal));
      const bTime = Date.parse(String(bVal));
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // Fallback to string comparison (numeric option helps compare numeric strings)
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc'
        ? aStr.localeCompare(bStr, undefined, { numeric: true })
        : bStr.localeCompare(aStr, undefined, { numeric: true });
    });

    return filtered;
  }, [searchQuery, typeFilter, statusFilter, categoryFilter, frequencyFilter, viewMode, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = mockReports.length;
    const completed = mockReports.filter(r => r.status === 'completed').length;
    const scheduled = mockReports.filter(r => r.isScheduled).length;
    const processing = mockReports.filter(r => r.status === 'processing').length;
    const failed = mockReports.filter(r => r.status === 'failed').length;
    const totalDownloads = mockReports.reduce((sum, r) => sum + r.downloadCount, 0);
    const avgFileSize = '2.8 MB'; // This would be calculated in a real app

    return {
      total,
      completed,
      scheduled,
      processing,
      failed,
      totalDownloads,
      avgFileSize
    };
  }, []);

  // Category distribution
  const categoryStats = useMemo(() => {
    const categories = {
      'financial': mockReports.filter(r => r.category === 'financial').length,
      'compliance': mockReports.filter(r => r.category === 'compliance').length,
      'performance': mockReports.filter(r => r.category === 'performance').length,
      'statistical': mockReports.filter(r => r.category === 'statistical').length,
      'analytical': mockReports.filter(r => r.category === 'analytical').length,
      'audit': mockReports.filter(r => r.category === 'audit').length,
      'technical': mockReports.filter(r => r.category === 'technical').length
    };
    return categories;
  }, []);

  // small-screen detection removed (isMobile not used)

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

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'completed': return 'text-green-300 bg-green-900/30';
        case 'processing': return 'text-blue-300 bg-blue-900/30';
        case 'scheduled': return 'text-purple-300 bg-purple-900/30';
        case 'failed': return 'text-red-300 bg-red-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'processing': return 'text-blue-700 bg-blue-100';
      case 'scheduled': return 'text-purple-700 bg-purple-100';
      case 'failed': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'completed': CheckCircle,
      'processing': RefreshCw,
      'scheduled': Clock,
      'failed': XCircle
    };
    return icons[status as keyof typeof icons] || FileText;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'financial': DollarSign,
      'compliance': Shield,
      'performance': TrendingUp,
      'statistical': BarChart3,
      'analytical': PieChart,
      'audit': FileCheck,
      'technical': Cpu
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getFileFormatIcon = (format: string) => {
    const icons = {
      'PDF': FileText,
      'Excel': BarChart3,
      'CSV': Database
    };
    return icons[format as keyof typeof icons] || FileText;
  };

  const handleDownload = (reportId: string) => {
    // In a real application, this would trigger the download
    console.log(`Downloading report: ${reportId}`);
    // Show download progress/notification
  };

  const handleScheduleReport = (reportId: string) => {
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
    }
  };

  const formatFileSize = (size: string | null) => {
    return size || '--';
  };

  return (
    <div data-theme={theme} className="min-h-screen p-4 lg:p-6 space-y-6 relative overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      />

      {/* Custom Theme Styles */}
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.8);
          --card-border: rgba(255, 255, 255, 0.1);
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
          --card-bg: rgba(255, 255, 255, 0.9);
          --card-border: rgba(0, 0, 0, 0.08);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        
        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }
        
        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
      `}</style>

      {/* Header Section - Redesigned */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Report Hub
              </h1>
              <p className="theme-text-secondary text-lg">Advanced Analytics & Reporting Platform</p>
            </div>
          </div>
          <p className="theme-text-muted max-w-2xl mx-auto lg:mx-0">
            Generate, analyze, and schedule comprehensive reports for DBT under PCR/PoA Acts
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Print dashboard"
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border flex items-center gap-3 glass-effect focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme === 'light' ? 'bg-white text-gray-800 border-gray-200' : 'theme-bg-glass theme-border-glass text-white'}`}
            >
              <Printer className={`w-5 h-5 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`} />
              <span className="font-semibold text-sm">Print</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-3 shadow-xl"
            >
              <FilePlus className="w-5 h-5" />
              <span className="font-semibold text-sm">New</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Grid - New Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analytics Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 xl:col-span-3 space-y-6 order-2 lg:order-1"
        >
          {/* Quick Stats */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Report Analytics</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Generated', value: '1,247', trend: '+12%', icon: FileText, color: 'from-blue-500 to-cyan-500' },
                { label: 'Avg Processing Time', value: '2.3s', trend: '-0.4s', icon: Zap, color: 'from-green-500 to-emerald-500' },
                { label: 'Success Rate', value: '98.7%', trend: '+1.2%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
                { label: 'Active Schedules', value: '24', trend: '+3', icon: Clock, color: 'from-orange-500 to-red-500' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl theme-bg-glass">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold theme-text-primary">{stat.value}</p>
                      <p className="text-sm theme-text-muted">{stat.label}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-400">{stat.trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Generate Disbursement', icon: FilePlus, color: 'bg-blue-500/20 text-blue-400' },
                { label: 'Schedule Weekly', icon: Calendar, color: 'bg-purple-500/20 text-purple-400' },
                { label: 'Download All', icon: Download, color: 'bg-green-500/20 text-green-400' },
                { label: 'View Templates', icon: BookOpen, color: 'bg-orange-500/20 text-orange-400' }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.color} transition-colors`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Report Categories */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Categories</h3>
            <div className="space-y-3">
              {[
                { name: 'Financial', count: 45, color: 'bg-green-500' },
                { name: 'Compliance', count: 32, color: 'bg-blue-500' },
                { name: 'Performance', count: 28, color: 'bg-purple-500' },
                { name: 'Statistical', count: 19, color: 'bg-orange-500' },
                { name: 'Technical', count: 15, color: 'bg-red-500' }
              ].map((category, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg theme-bg-glass">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm theme-text-primary">{category.name}</span>
                  </div>
                  <span className="text-sm theme-text-muted">{category.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        {/* Main Content Area */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.3 }}
  className="lg:col-span-9 xl:col-span-9 space-y-6 order-1 lg:order-2"
>
  {/* View Controls - Improved */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 theme-bg-card theme-border-glass border rounded-2xl glass-effect">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <FileText className="w-4 h-4 text-white" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold theme-text-primary">Recent Reports</h2>
  <p className="text-sm theme-text-muted">{viewMode === 'templates' ? `${reportTemplates.length} templates` : `${filteredReports.length} reports found`}</p>
      </div>
    </div>
    
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 sm:w-48 lg:w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm"
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 theme-bg-glass rounded-xl p-1">
        {[
          { mode: 'reports', label: 'Reports', icon: FileText },
          { mode: 'templates', label: 'Templates', icon: BookOpen },
          { mode: 'scheduled', label: 'Scheduled', icon: Clock }
        ].map(({ mode, label, icon: Icon }) => (
          <motion.button
            key={mode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(mode as 'reports' | 'templates' | 'scheduled')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === mode 
                ? 'accent-gradient text-white shadow-sm' 
                : 'theme-text-muted hover:theme-text-primary'
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  </div>
          {/* Reports Grid */}
          {/* Reports Grid - Fixed Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-5 glass-effect cursor-pointer group hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedReport(report)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      {(() => {
                        const Icon = getCategoryIcon(report.category) || FileText;
                        return <Icon className="w-5 h-5 sm:w-6 sm:h-6" />;
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold theme-text-primary text-sm sm:text-base group-hover:text-blue-400 transition-colors truncate">
                        {report.name}
                      </h3>
                      <p className="theme-text-muted text-xs truncate">{report.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                    <span className={`px-2 py-1 ${getStatusColor(report.status)} text-xs font-bold rounded-full whitespace-nowrap`}>
                      {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="theme-text-secondary text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <p className="text-sm font-bold theme-text-primary">{report.recordCount ?? '--'}</p>
                    <p className="theme-text-muted text-xs">Records</p>
                  </div>
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {(() => {
                        const FormatIcon = getFileFormatIcon(report.fileFormat || 'PDF');
                        return <FormatIcon className="w-3 h-3 theme-text-muted" />;
                      })()}
                      <p className="text-sm font-bold theme-text-primary">{formatFileSize(report.fileSize)}</p>
                    </div>
                    <p className="theme-text-muted text-xs">Size</p>
                  </div>
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <p className="text-sm font-bold theme-text-primary">{report.downloadCount}</p>
                    <p className="theme-text-muted text-xs">Downloads</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs theme-text-muted mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(report.generatedDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="capitalize">{report.frequency}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${report.status === 'completed' ? 'bg-green-500' :
                        report.status === 'processing' ? 'bg-blue-500' :
                          report.status === 'scheduled' ? 'bg-purple-500' : 'bg-gray-400'
                      }`}></div>
                    <span className="text-xs theme-text-muted">
                      {report.status === 'completed' ? 'Ready' :
                        report.status === 'processing' ? 'Processing' :
                          report.status === 'scheduled' ? 'Scheduled' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDownload(report.id); }}
                      className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 transition-colors"
                      disabled={report.status !== 'completed'}
                    >
                      <Download className={`w-3.5 h-3.5 ${report.status === 'completed' ? 'theme-text-primary' : 'theme-text-muted'}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                      className="p-1.5 rounded-lg theme-bg-glass hover:bg-blue-500/20 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 theme-text-primary" />
                    </motion.button>
                    {!report.isScheduled && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleScheduleReport(report.id); }}
                        className="p-1.5 rounded-lg theme-bg-glass hover:bg-purple-500/20 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 theme-text-primary" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Analytics Overview */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
    {/* Performance Chart */}
    <motion.div
      whileHover={{ y: -2 }}
      className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 glass-effect"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold theme-text-primary">Performance Metrics</h3>
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 theme-text-muted" />
      </div>
      <div className="space-y-3">
        {[
          { label: 'Success Rate', value: 98, color: 'bg-green-500', icon: CheckCircle },
          { label: 'Processing Speed', value: 85, color: 'bg-blue-500', icon: Zap },
          { label: 'User Satisfaction', value: 92, color: 'bg-purple-500', icon: TrendingUp }
        ].map((metric, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className={`w-3 h-3 ${metric.color.replace('bg-', 'text-')}`} />
                <span className="text-sm theme-text-primary">{metric.label}</span>
              </div>
              <span className="text-sm font-semibold theme-text-primary">{metric.value}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${metric.color} transition-all duration-1000`}
                style={{ width: `${metric.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Recent Activity */}
    <motion.div
      whileHover={{ y: -2 }}
      className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 glass-effect"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold theme-text-primary">Recent Activity</h3>
        <Activity className="w-4 h-4 sm:w-5 sm:h-5 theme-text-muted" />
      </div>
      <div className="space-y-3">
        {[
          { action: 'Monthly Report Generated', user: 'System', time: '2 min ago', status: 'success' },
          { action: 'Weekly Schedule Created', user: 'Admin', time: '5 min ago', status: 'info' },
          { action: 'Export Completed', user: 'Officer Sharma', time: '10 min ago', status: 'success' },
          { action: 'Processing Failed', user: 'System', time: '15 min ago', status: 'error' }
        ].map((activity, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg theme-bg-glass">
            <div className={`w-1.5 h-1.5 rounded-full ${
              activity.status === 'success' ? 'bg-green-500' :
              activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium theme-text-primary truncate">{activity.action}</p>
              <p className="text-xs theme-text-muted truncate">{activity.user} • {activity.time}</p>
            </div>
            <ArrowUpRight className="w-3 h-3 theme-text-muted flex-shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  </div>
        </motion.div>
      </div>

      {/* Enhanced Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedReport(null)}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-bg-card theme-border-glass border rounded-2xl w-full sm:w-[95%] md:w-[90%] lg:w-[80%] max-w-6xl max-h-[95vh] overflow-hidden glass-effect shadow-2xl"
            >
              {/* Enhanced Header */}
              <div className="sticky top-0 theme-bg-card backdrop-blur-xl border-b theme-border-glass p-4 sm:p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl accent-gradient flex items-center justify-center text-white shadow-lg">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold theme-text-primary">{selectedReport.name}</h2>
                        <span className={`px-3 py-2 text-sm font-bold rounded-full ${getStatusColor(selectedReport.status)}`}>{selectedReport.status?.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <p className="theme-text-muted text-sm sm:text-lg">{selectedReport.id}</p>
                        <span className="text-sm theme-text-muted">•</span>
                        <p className="theme-text-muted">{selectedReport.category} • {selectedReport.frequency}</p>
                        <span className="text-sm theme-text-muted">•</span>
                        <p className="theme-text-muted">Generated: {formatDateTime(selectedReport.generatedDate)}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedReport(null)} className="p-2 sm:p-3 rounded-xl theme-bg-glass hover:bg-red-500/20 transition-colors" aria-label="Close report details">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Enhanced Tabs */}
              <div className="border-b theme-border-glass bg-gradient-to-r from-transparent via-theme-bg-glass to-transparent">
                <div className="flex overflow-x-auto px-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'analytics', label: 'Analytics', icon: BarChart },
                    { id: 'parameters', label: 'Parameters', icon: Settings },
                    { id: 'preview', label: 'Preview', icon: FileText },
                    { id: 'sharing', label: 'Sharing', icon: Share2 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 theme-text-primary'
                          : 'border-transparent theme-text-muted hover:theme-text-primary hover:bg-theme-bg-glass'
                        }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[calc(95vh-200px)] overflow-y-auto">
                {/* Content would go here based on active tab */}
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                  <h3 className="text-2xl font-bold theme-text-primary mb-2">Report Details</h3>
                  <p className="theme-text-muted text-lg">Select a tab to view different aspects of this report</p>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="sticky bottom-0 theme-bg-card backdrop-blur-xl border-t theme-border-glass p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-3 hover:bg-green-500/30 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center justify-center gap-3 hover:bg-purple-500/30 transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    Schedule
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center justify-center gap-3 hover:bg-blue-500/30 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-3 hover:theme-bg-card transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;