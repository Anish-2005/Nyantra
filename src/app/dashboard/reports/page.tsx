"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import {
  Search, Filter, Download, Eye, ChevronLeft, ChevronRight, X, Check,Clock, FileText, DollarSign,RefreshCw, TrendingUp,
  Shield, CheckCircle, XCircle,
  BarChart3,PieChart,
  Database,
  Cpu,FileDown, FilePlus, FileCheck, BookOpen, Printer, Share2,
  Zap as ZapIcon, Calendar as CalendarIcon2,
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [sortBy] = useState('generatedDate');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [, setSelectedTemplate] = useState<typeof reportTemplates[0] | null>(null);
  const [viewMode, setViewMode] = useState<'reports' | 'templates' | 'scheduled'>('reports');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    frequency: 'weekly',
    format: 'PDF',
    recipients: '',
    time: '08:00'
  });
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
      setShowScheduleModal(true);
    }
  };

  const handleGenerateNow = (reportId: string) => {
    // In a real application, this would trigger report generation
    console.log(`Generating report: ${reportId}`);
    // Show generation progress
  };

  const handleCreateSchedule = () => {
    // In a real application, this would create the schedule
    console.log('Creating schedule:', newSchedule);
    setShowScheduleModal(false);
    setNewSchedule({
      frequency: 'weekly',
      format: 'PDF',
      recipients: '',
      time: '08:00'
    });
  };

  const formatFileSize = (size: string | null) => {
    return size || '--';
  };

  return (
    <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
      {/* Three.js Canvas Background (theme-aware) */}
      <canvas
        ref={canvasRef}
        id="reports-three-canvas"
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
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Reports & Analytics</h1>
          <p className="theme-text-secondary">Generate, schedule, and download comprehensive reports for DBT under PCR/PoA Acts</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
          >
            <FilePlus className="w-4 h-4" />
            <span>New Report</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4"
      >
        {[
          { label: 'Total Reports', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: FileText },
          { label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
          { label: 'Scheduled', value: stats.scheduled, color: 'from-purple-500 to-pink-500', icon: Clock },
          { label: 'Processing', value: stats.processing, color: 'from-blue-500 to-cyan-500', icon: RefreshCw },
          { label: 'Failed', value: stats.failed, color: 'from-red-500 to-rose-500', icon: XCircle },
          { label: 'Total Downloads', value: stats.totalDownloads, color: 'from-amber-500 to-orange-500', icon: Download },
          { label: 'Avg File Size', value: stats.avgFileSize, color: 'from-teal-500 to-cyan-500', icon: Database },
          { label: 'Templates', value: reportTemplates.length, color: 'from-indigo-500 to-purple-500', icon: BookOpen }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold theme-text-primary">{stat.value}</p>
            <p className="text-sm theme-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* View Mode Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 theme-text-muted" />
            <span className="text-sm font-medium theme-text-primary">Report Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'reports', label: 'Generated Reports', icon: FileDown },
              { value: 'scheduled', label: 'Scheduled Reports', icon: Clock },
              { value: 'templates', label: 'Report Templates', icon: BookOpen }
            ].map((view) => (
              <motion.button
                key={view.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(view.value as 'reports' | 'templates' | 'scheduled')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                  viewMode === view.value 
                    ? 'accent-gradient text-white' 
                    : 'theme-bg-glass theme-text-muted'
                }`}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Report Categories</h3>
            <p className="text-sm theme-text-muted">Distribution by report type and purpose</p>
          </div>
          <PieChart className="w-5 h-5 theme-text-muted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(categoryStats).map(([category, count]) => {
            const Icon = getCategoryIcon(category);
            return (
              <div key={category} className="text-center p-4 rounded-lg theme-bg-glass">
                <Icon className="w-8 h-8 theme-text-primary mx-auto mb-2" />
                <p className="text-lg font-bold theme-text-primary">{count}</p>
                <p className="text-xs theme-text-muted capitalize">
                  {category}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Quick Actions</h3>
            <p className="text-sm theme-text-muted">Frequently used report operations</p>
          </div>
          <ZapIcon className="w-5 h-5 theme-text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Generate Disbursement Report', icon: FilePlus, action: () => console.log('Generate disbursement') },
            { label: 'Schedule Weekly Summary', icon: CalendarIcon2, action: () => setShowScheduleModal(true) },
            { label: 'Download All Completed', icon: Download, action: () => console.log('Download all') },
            { label: 'View Report Templates', icon: BookOpen, action: () => setViewMode('templates') }
          ].map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -2 }}
              onClick={action.action}
              className="p-4 rounded-lg theme-bg-glass border theme-border-glass text-left hover:theme-border-card transition-colors"
            >
              <action.icon className="w-8 h-8 theme-text-primary mb-2" />
              <p className="font-medium theme-text-primary text-sm">{action.label}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
            <input
              type="text"
              placeholder="Search reports by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg theme-border-glass border flex items-center gap-2 ${showFilters ? 'accent-gradient text-white' : 'theme-bg-glass'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(typeFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all' || frequencyFilter !== 'all') && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </motion.button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t theme-border-glass">
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Report Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="disbursement">Disbursement</option>
                    <option value="verification">Verification</option>
                    <option value="grievance">Grievance</option>
                    <option value="applications">Applications</option>
                    <option value="demographic">Demographic</option>
                    <option value="financial">Financial</option>
                    <option value="system">System</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="financial">Financial</option>
                    <option value="compliance">Compliance</option>
                    <option value="performance">Performance</option>
                    <option value="statistical">Statistical</option>
                    <option value="analytical">Analytical</option>
                    <option value="audit">Audit</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Frequency</label>
                  <select
                    value={frequencyFilter}
                    onChange={(e) => setFrequencyFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Frequencies</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reports/Templates List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
      >
        {viewMode === 'templates' ? (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTemplates.map((template, idx) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium theme-text-primary">{template.name}</p>
                        <p className="text-xs theme-text-muted">{template.id}</p>
                      </div>
                    </div>
                    {template.popular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm theme-text-secondary line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-2 text-sm theme-text-muted">
                      <FileText className="w-4 h-4" />
                      <span>Format: {template.defaultFormat}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                    <span className="text-xs theme-text-muted capitalize">
                      {template.type} • {template.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:theme-bg-card">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:theme-bg-card">
                        <FilePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* For small screens show a stacked card list instead of table */}
            {isMobile ? (
              <div className="p-4 space-y-3">
                {paginatedReports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 rounded-lg theme-bg-glass theme-border-glass border"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white flex-shrink-0">
                          {(() => {
                            const Icon = getCategoryIcon(report.category);
                            return <Icon className="w-6 h-6" />;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium theme-text-primary truncate">{report.name}</p>
                          <p className="text-xs theme-text-muted truncate">{report.id}</p>
                          <p className="text-xs theme-text-muted mt-1 line-clamp-2">{report.description}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs theme-text-muted">
                            <span className="flex items-center gap-1">
                              <span className="font-medium theme-text-primary">Type:</span>
                              <span className="capitalize">{report.type}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium theme-text-primary">Category:</span>
                              <span className="capitalize">{report.category}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs theme-text-muted">
                            <span><strong className="theme-text-primary">Size:</strong> {formatFileSize(report.fileSize)}</span>
                            <span><strong className="theme-text-primary">Generated:</strong> {formatDate(report.generatedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {report.status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDownload(report.id)}
                          className="flex-1 px-4 py-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 px-4 py-3 rounded-lg theme-bg-glass theme-border-glass border flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </motion.button>

                      {!report.isScheduled && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleScheduleReport(report.id)}
                          className="px-3 py-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="theme-bg-glass border-b theme-border-glass">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Report Name</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Type</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Category</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">File Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Status</th>
                    <th className="hidden xl:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Generated</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map((report, idx) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white">
                            {(() => {
                              const Icon = getCategoryIcon(report.category);
                              return <Icon className="w-5 h-5" />;
                            })()}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">{report.name}</p>
                            <p className="text-xs theme-text-muted">{report.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium theme-bg-glass capitalize">
                          {report.type}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm theme-text-primary capitalize">
                        {report.category}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm theme-text-primary">
                        {formatFileSize(report.fileSize)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(report.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {report.status}
                        </span>
                      </td>
                      <td className="hidden xl:table-cell px-4 py-3 text-sm theme-text-primary">
                        {formatDate(report.generatedDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {report.status === 'completed' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(report.id)}
                              className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedReport(report)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {!report.isScheduled && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleScheduleReport(report.id)}
                              className="p-1.5 rounded-lg theme-bg-glass hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                            >
                              <Clock className="w-4 h-4" />
                            </motion.button>
                          )}
                          {report.status !== 'completed' && report.status !== 'scheduled' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleGenerateNow(report.id)}
                              className="p-1.5 rounded-lg theme-bg-glass hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t theme-border-glass theme-bg-glass">
              <p className="text-sm theme-text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length}
              </p>
              <div className="flex items-center gap-2">
                {isMobile ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p: number) => p - 1)}
                      className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                    >
                      Prev
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p: number) => p + 1)}
                      className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                    >
                      Next
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p: number) => p - 1)}
                      className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1.5 rounded-lg ${currentPage === i + 1 ? 'accent-gradient text-white' : 'theme-bg-card theme-border-glass border'}`}
                      >
                        {i + 1}
                      </motion.button>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p: number) => p + 1)}
                      className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${isMobile ? 'theme-bg-card theme-border-glass border rounded-tl-none rounded-tr-none w-full h-full max-h-none overflow-y-auto' : 'theme-bg-card theme-border-glass border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'}`}
              >
                <div className={isMobile ? 'flex flex-col h-full' : 'relative'}>
                  <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-4 sm:p-6 flex items-center justify-between gap-3 z-30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white flex-shrink-0">
                        {(() => {
                          const Icon = getCategoryIcon(selectedReport.category);
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold theme-text-primary truncate">{selectedReport.name}</h2>
                        <p className="theme-text-muted text-sm truncate">{selectedReport.id} • {selectedReport.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="border-b theme-border-glass sticky top-[64px] z-20 bg-transparent">
                    <div className="flex overflow-x-auto">
                      {['details', 'parameters', 'preview'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab
                              ? 'border-blue-500 text-blue-600 theme-text-primary'
                              : 'border-transparent theme-text-muted hover:theme-text-primary'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {activeTab === 'details' && (
                      <>
                        {/* Report Overview */}
                        <div>
                          <h3 className="text-lg font-semibold theme-text-primary mb-4">Report Overview</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg theme-bg-glass">
                              <p className="text-sm theme-text-muted mb-2">Description</p>
                              <p className="theme-text-primary leading-relaxed">{selectedReport.description}</p>
                            </div>
                            <div className="p-4 rounded-lg theme-bg-glass">
                              <p className="text-sm theme-text-muted mb-2">Record Count</p>
                              <p className="text-2xl font-bold theme-text-primary">{selectedReport.recordCount || '--'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status and Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                            <p className="text-sm theme-text-muted mb-2">Status</p>
                            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedReport.status)}`}>
                              {(() => {
                                const Icon = getStatusIcon(selectedReport.status);
                                return <Icon className="w-4 h-4" />;
                              })()}
                              {selectedReport.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                            <p className="text-sm theme-text-muted mb-2">File Format</p>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const Icon = getFileFormatIcon(selectedReport.fileFormat);
                                return <Icon className="w-4 h-4 theme-text-primary" />;
                              })()}
                              <p className="font-medium theme-text-primary">{selectedReport.fileFormat}</p>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                            <p className="text-sm theme-text-muted mb-2">File Size</p>
                            <p className="font-medium theme-text-primary">{formatFileSize(selectedReport.fileSize)}</p>
                          </div>
                          <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                            <p className="text-sm theme-text-muted mb-2">Download Count</p>
                            <p className="font-medium theme-text-primary">{selectedReport.downloadCount}</p>
                          </div>
                        </div>

                        {/* Generation Information */}
                        <div>
                          <h3 className="text-lg font-semibold theme-text-primary mb-4">Generation Information</h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="p-4 rounded-lg theme-bg-glass">
                              <p className="text-sm theme-text-muted mb-1">Generated Date</p>
                              <p className="font-medium theme-text-primary">{formatDateTime(selectedReport.generatedDate)}</p>
                            </div>
                            <div className="p-4 rounded-lg theme-bg-glass">
                              <p className="text-sm theme-text-muted mb-1">Generated By</p>
                              <p className="font-medium theme-text-primary">{selectedReport.generatedBy || 'System'}</p>
                            </div>
                            <div className="p-4 rounded-lg theme-bg-glass">
                              <p className="text-sm theme-text-muted mb-1">Frequency</p>
                              <p className="font-medium theme-text-primary capitalize">{selectedReport.frequency}</p>
                            </div>
                            {selectedReport.lastRun && (
                              <div className="p-4 rounded-lg theme-bg-glass">
                                <p className="text-sm theme-text-muted mb-1">Last Run</p>
                                <p className="font-medium theme-text-primary">{formatDateTime(selectedReport.lastRun)}</p>
                              </div>
                            )}
                            {selectedReport.nextRun && (
                              <div className="p-4 rounded-lg theme-bg-glass">
                                <p className="text-sm theme-text-muted mb-1">Next Run</p>
                                <p className="font-medium theme-text-primary">{formatDateTime(selectedReport.nextRun)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'parameters' && (
                      <div className="space-y-6">
                        {/* Report Parameters */}
                        <div>
                          <h3 className="text-lg font-semibold theme-text-primary mb-4">Report Parameters</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(selectedReport.parameters).map(([key, value]) => (
                              <div key={key} className="p-4 rounded-lg theme-bg-glass">
                                <p className="text-sm theme-text-muted mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="font-medium theme-text-primary">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Data Columns */}
                        <div>
                          <h3 className="text-lg font-semibold theme-text-primary mb-4">Included Data Columns</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {selectedReport.columns.map((column, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded theme-bg-glass">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm theme-text-primary">{column}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'preview' && (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold theme-text-primary mb-2">Report Preview</h3>
                        <p className="theme-text-muted mb-6">{selectedReport.status === 'completed' ? 'Click download to view the full report' : 'Report preview will be available after generation'}</p>
                        {selectedReport.status === 'completed' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownload(selectedReport.id)} className="px-6 py-3 rounded-xl accent-gradient text-white flex items-center gap-2 mx-auto">
                            <Download className="w-5 h-5" />
                            Download Full Report
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sticky Footer Actions (mobile-friendly) */}
                  <div className="sticky bottom-0 z-40 bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(15,23,42,0.85)] backdrop-blur-md border-t theme-border-glass p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
                    {selectedReport.status === 'completed' && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleDownload(selectedReport.id)} className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2"><Download className="w-5 h-5" />Download Report</motion.button>
                    )}
                    {!selectedReport.isScheduled && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleScheduleReport(selectedReport.id)} className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center justify-center gap-2"><Clock className="w-5 h-5" />Schedule Report</motion.button>
                    )}
                    {selectedReport.status !== 'completed' && selectedReport.status !== 'scheduled' && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleGenerateNow(selectedReport.id)} className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5" />Generate Now</motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2"><Share2 className="w-5 h-5" />Share Report</motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Report Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-bg-card theme-border-glass border rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold theme-text-primary">Schedule Report</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Frequency</label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule({...newSchedule, frequency: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm theme-text-muted mb-2">Format</label>
                  <select
                    value={newSchedule.format}
                    onChange={(e) => setNewSchedule({...newSchedule, format: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm theme-text-muted mb-2">Time</label>
                  <input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm theme-text-muted mb-2">Recipients (Email)</label>
                  <input
                    type="text"
                    placeholder="Enter email addresses separated by commas"
                    value={newSchedule.recipients}
                    onChange={(e) => setNewSchedule({...newSchedule, recipients: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" id="sendNotification" className="rounded theme-bg-glass" />
                  <label htmlFor="sendNotification" className="text-sm theme-text-muted">
                    Send email notification when report is generated
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateSchedule}
                  className="flex-1 px-4 py-3 rounded-xl accent-gradient text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Create Schedule
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;