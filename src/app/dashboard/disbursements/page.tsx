"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import {
  Search, Filter, Download, Plus, Eye, Edit, Trash2,
  ChevronDown, ChevronLeft, ChevronRight, X, Check,
  Clock, AlertCircle, FileText, User, Phone, MapPin,
  Calendar, DollarSign, Upload, Send, MessageSquare,
  RefreshCw, MoreVertical, TrendingUp, AlertTriangle,
  Shield, Award, Heart, Cross, Scale, BadgeCheck,
  Banknote, Receipt, Fingerprint, QrCode, CreditCard,
  TrendingDown, Circle, CheckCircle, XCircle, PlayCircle,
  PauseCircle, BarChart3, Target, RotateCcw
} from 'lucide-react';

// Mock data for disbursements
const mockDisbursements = [
  {
    id: 'DIS-2024-001234',
    beneficiaryId: 'BEN-2024-001234',
    beneficiaryName: 'Rajesh Kumar',
    aadhaarNumber: '****-****-1234',
    phone: '+91 98765-43210',
    district: 'Patna',
    state: 'Bihar',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-001',
    reliefAmount: 40000,
    disbursedAmount: 40000,
    transactionFee: 50,
    netAmount: 39950,
    status: 'completed',
    transactionId: 'TXN2024001234',
    bankAccount: 'XXXXXX1234',
    ifsc: 'SBIN0000123',
    disbursementDate: '2024-03-15',
    initiatedDate: '2024-03-10',
    completedDate: '2024-03-15',
    initiatedBy: 'Officer Sharma',
    verifiedBy: 'Officer Verma',
    paymentMethod: 'Direct Transfer',
    utrNumber: 'UTR202400123456',
    failureReason: '',
    retryCount: 0,
    priority: 'high',
    documents: 4
  },
  {
    id: 'DIS-2024-001235',
    beneficiaryId: 'BEN-2024-001235',
    beneficiaryName: 'Priya Singh',
    aadhaarNumber: '****-****-5678',
    phone: '+91 98765-43211',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    actType: 'PoA Act',
    caseNumber: 'POA-2024-002',
    reliefAmount: 35000,
    disbursedAmount: 35000,
    transactionFee: 50,
    netAmount: 34950,
    status: 'completed',
    transactionId: 'TXN2024001235',
    bankAccount: 'XXXXXX5678',
    ifsc: 'SBIN0000567',
    disbursementDate: '2024-03-14',
    initiatedDate: '2024-03-08',
    completedDate: '2024-03-14',
    initiatedBy: 'Officer Verma',
    verifiedBy: 'Officer Kapoor',
    paymentMethod: 'Direct Transfer',
    utrNumber: 'UTR202400123457',
    failureReason: '',
    retryCount: 0,
    priority: 'medium',
    documents: 5
  },
  {
    id: 'DIS-2024-001236',
    beneficiaryId: 'BEN-2024-001236',
    beneficiaryName: 'Amit Verma',
    aadhaarNumber: '****-****-9012',
    phone: '+91 98765-43212',
    district: 'Jaipur',
    state: 'Rajasthan',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-003',
    reliefAmount: 45000,
    disbursedAmount: 45000,
    transactionFee: 50,
    netAmount: 44950,
    status: 'completed',
    transactionId: 'TXN2024001236',
    bankAccount: 'XXXXXX9012',
    ifsc: 'SBIN0000901',
    disbursementDate: '2024-03-10',
    initiatedDate: '2024-03-05',
    completedDate: '2024-03-10',
    initiatedBy: 'Officer Kapoor',
    verifiedBy: 'Officer Gupta',
    paymentMethod: 'Direct Transfer',
    utrNumber: 'UTR202400123458',
    failureReason: '',
    retryCount: 0,
    priority: 'medium',
    documents: 6
  },
  {
    id: 'DIS-2024-001237',
    beneficiaryId: 'BEN-2024-001237',
    beneficiaryName: 'Sunita Devi',
    aadhaarNumber: '****-****-3456',
    phone: '+91 98765-43213',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    actType: 'PoA Act',
    caseNumber: 'POA-2024-004',
    reliefAmount: 38000,
    disbursedAmount: 0,
    transactionFee: 50,
    netAmount: 0,
    status: 'pending',
    transactionId: 'TXN2024001237',
    bankAccount: 'XXXXXX3456',
    ifsc: 'SBIN0000345',
    disbursementDate: '',
    initiatedDate: '2024-03-13',
    completedDate: '',
    initiatedBy: 'Officer Gupta',
    verifiedBy: '',
    paymentMethod: 'Direct Transfer',
    utrNumber: '',
    failureReason: '',
    retryCount: 0,
    priority: 'high',
    documents: 3
  },
  {
    id: 'DIS-2024-001238',
    beneficiaryId: 'BEN-2024-001238',
    beneficiaryName: 'Ramesh Yadav',
    aadhaarNumber: '****-****-7890',
    phone: '+91 98765-43214',
    district: 'Ranchi',
    state: 'Jharkhand',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-005',
    reliefAmount: 42000,
    disbursedAmount: 0,
    transactionFee: 50,
    netAmount: 0,
    status: 'failed',
    transactionId: 'TXN2024001238',
    bankAccount: 'XXXXXX7890',
    ifsc: 'SBIN0000789',
    disbursementDate: '',
    initiatedDate: '2024-03-12',
    completedDate: '',
    initiatedBy: 'Officer Mishra',
    verifiedBy: '',
    paymentMethod: 'Direct Transfer',
    utrNumber: '',
    failureReason: 'Incorrect bank account details',
    retryCount: 2,
    priority: 'low',
    documents: 4
  },
  {
    id: 'DIS-2024-001239',
    beneficiaryId: 'BEN-2024-001239',
    beneficiaryName: 'Anita Sharma',
    aadhaarNumber: '****-****-2468',
    phone: '+91 98765-43215',
    district: 'Chandigarh',
    state: 'Punjab',
    actType: 'PoA Act',
    caseNumber: 'POA-2024-006',
    reliefAmount: 32000,
    disbursedAmount: 32000,
    transactionFee: 50,
    netAmount: 31950,
    status: 'in-progress',
    transactionId: 'TXN2024001239',
    bankAccount: 'XXXXXX2468',
    ifsc: 'SBIN0000246',
    disbursementDate: '',
    initiatedDate: '2024-03-16',
    completedDate: '',
    initiatedBy: 'Officer Singh',
    verifiedBy: 'Officer Kaur',
    paymentMethod: 'Direct Transfer',
    utrNumber: 'UTR202400123459',
    failureReason: '',
    retryCount: 0,
    priority: 'medium',
    documents: 5
  },
  {
    id: 'DIS-2024-001240',
    beneficiaryId: 'BEN-2024-001240',
    beneficiaryName: 'Mohan Das',
    aadhaarNumber: '****-****-1357',
    phone: '+91 98765-43216',
    district: 'Ahmedabad',
    state: 'Gujarat',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-007',
    reliefAmount: 48000,
    disbursedAmount: 48000,
    transactionFee: 50,
    netAmount: 47950,
    status: 'completed',
    transactionId: 'TXN2024001240',
    bankAccount: 'XXXXXX1357',
    ifsc: 'SBIN0000135',
    disbursementDate: '2024-03-08',
    initiatedDate: '2024-03-03',
    completedDate: '2024-03-08',
    initiatedBy: 'Officer Patel',
    verifiedBy: 'Officer Joshi',
    paymentMethod: 'Direct Transfer',
    utrNumber: 'UTR202400123460',
    failureReason: '',
    retryCount: 0,
    priority: 'high',
    documents: 6
  },
  {
    id: 'DIS-2024-001241',
    beneficiaryId: 'BEN-2024-001241',
    beneficiaryName: 'Kavita Nair',
    aadhaarNumber: '****-****-9753',
    phone: '+91 98765-43217',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    actType: 'PoA Act',
    caseNumber: 'POA-2024-008',
    reliefAmount: 36000,
    disbursedAmount: 0,
    transactionFee: 50,
    netAmount: 0,
    status: 'cancelled',
    transactionId: 'TXN2024001241',
    bankAccount: 'XXXXXX9753',
    ifsc: 'SBIN0000975',
    disbursementDate: '',
    initiatedDate: '2024-03-11',
    completedDate: '',
    initiatedBy: 'Officer Nair',
    verifiedBy: '',
    paymentMethod: 'Direct Transfer',
    utrNumber: '',
    failureReason: 'Application withdrawn by beneficiary',
    retryCount: 0,
    priority: 'medium',
    documents: 4
  }
];

const DisbursementsPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actTypeFilter, setActTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('initiatedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<typeof mockDisbursements[0] | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter and sort disbursements
  const filteredDisbursements = useMemo(() => {
    let filtered = [...mockDisbursements];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(disbursement =>
        disbursement.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disbursement.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disbursement.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disbursement.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(disbursement => disbursement.status === statusFilter);
    }

    // Act type filter
    if (actTypeFilter !== 'all') {
      filtered = filtered.filter(disbursement => disbursement.actType === actTypeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filtered = filtered.filter(disbursement => {
        const disbursementDate = disbursement.initiatedDate ? new Date(disbursement.initiatedDate) : null;
        if (!disbursementDate) return false;

        switch (dateFilter) {
          case 'today':
            return disbursementDate.toDateString() === today.toDateString();
          case 'week':
            return disbursementDate >= lastWeek;
          case 'month':
            return disbursementDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(disbursement => disbursement.priority === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, actTypeFilter, dateFilter, priorityFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredDisbursements.length / itemsPerPage);
  const paginatedDisbursements = filteredDisbursements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = mockDisbursements.reduce((sum, d) => sum + d.reliefAmount, 0);
    const disbursedAmount = mockDisbursements.reduce((sum, d) => sum + d.disbursedAmount, 0);
    const pendingAmount = totalAmount - disbursedAmount;

    return {
      total: mockDisbursements.length,
      completed: mockDisbursements.filter(d => d.status === 'completed').length,
      pending: mockDisbursements.filter(d => d.status === 'pending').length,
      inProgress: mockDisbursements.filter(d => d.status === 'in-progress').length,
      failed: mockDisbursements.filter(d => d.status === 'failed').length,
      cancelled: mockDisbursements.filter(d => d.status === 'cancelled').length,
      totalAmount,
      disbursedAmount,
      pendingAmount,
      successRate: Math.round((mockDisbursements.filter(d => d.status === 'completed').length / mockDisbursements.length) * 100)
    };
  }, []);

  // Monthly disbursement trend
  const monthlyTrend = useMemo(() => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      completed: [12, 18, 24, 16, 22, 28],
      failed: [2, 3, 1, 4, 2, 1]
    };
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

  // Prefer cards view on mobile for readability
  useEffect(() => {
    if (isMobile) setViewMode('cards');
  }, [isMobile]);

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
        case 'pending': return 'text-amber-300 bg-amber-900/30';
        case 'in-progress': return 'text-blue-300 bg-blue-900/30';
        case 'failed': return 'text-red-300 bg-red-900/30';
        case 'cancelled': return 'text-gray-300 bg-gray-800';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'failed': return 'text-red-700 bg-red-100';
      case 'cancelled': return 'text-gray-700 bg-gray-100';
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
    const icons = {
      'pending': Clock,
      'in-progress': PlayCircle,
      'completed': CheckCircle,
      'failed': XCircle,
      'cancelled': X
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Deterministic date formatting to avoid SSR/client hydration mismatches
  const formatDate = (s?: string | null) => {
    if (!s) return '—';
    try {
      const d = new Date(s);
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    } catch {
      return s;
    }
  };

  const formatDateTime = (s?: string | null) => {
    if (!s) return '—';
    try {
      const d = new Date(s);
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
    } catch {
      return s;
    }
  };

  return (
    <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
      {/* Three.js Canvas Background (theme-aware) */}
      <canvas
        ref={canvasRef}
        id="disbursements-three-canvas"
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
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Disbursements Management</h1>
          <p className="theme-text-secondary">Track and manage DBT payments under PCR/PoA Acts</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Disbursement</span>
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
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: Banknote },
          { label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
          { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: Clock },
          { label: 'In Progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500', icon: PlayCircle },
          { label: 'Failed', value: stats.failed, color: 'from-red-500 to-rose-500', icon: XCircle },
          { label: 'Cancelled', value: stats.cancelled, color: 'from-gray-500 to-slate-500', icon: X },
          { label: 'Success Rate', value: `${stats.successRate}%`, color: 'from-teal-500 to-cyan-500', icon: TrendingUp },
          { label: 'Retry Needed', value: mockDisbursements.filter(d => d.retryCount > 0).length, color: 'from-orange-500 to-red-500', icon: RotateCcw }
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

      {/* Financial Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">Total Disbursed</p>
              <p className="text-2xl font-bold theme-text-primary">{formatCurrency(stats.disbursedAmount)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              style={{ width: `${(stats.disbursedAmount / stats.totalAmount) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs theme-text-muted mt-2">
            <span>Total: {formatCurrency(stats.totalAmount)}</span>
            <span>Pending: {formatCurrency(stats.pendingAmount)}</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">PCR Act Disbursements</p>
              <p className="text-2xl font-bold theme-text-primary">
                {mockDisbursements.filter(d => d.actType === 'PCR Act').length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {formatCurrency(mockDisbursements.filter(d => d.actType === 'PCR Act').reduce((sum, d) => sum + d.disbursedAmount, 0))} disbursed
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm theme-text-muted">PoA Act Disbursements</p>
              <p className="text-2xl font-bold theme-text-primary">
                {mockDisbursements.filter(d => d.actType === 'PoA Act').length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {formatCurrency(mockDisbursements.filter(d => d.actType === 'PoA Act').reduce((sum, d) => sum + d.disbursedAmount, 0))} disbursed
          </p>
        </motion.div>
      </motion.div>

      {/* Monthly Trend Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Disbursement Trend</h3>
            <p className="text-sm theme-text-muted">Monthly disbursement performance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs theme-text-muted">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs theme-text-muted">Failed</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between h-32">
          {monthlyTrend.labels.map((month, index) => (
            <div key={month} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center w-full h-20 gap-1 mb-2">
                <div
                  className="w-3/4 bg-green-500 rounded-t transition-all duration-500"
                  style={{ height: `${(monthlyTrend.completed[index] / Math.max(...monthlyTrend.completed)) * 80}%` }}
                ></div>
                <div
                  className="w-1/4 bg-red-500 rounded-t transition-all duration-500"
                  style={{ height: `${(monthlyTrend.failed[index] / Math.max(...monthlyTrend.completed, ...monthlyTrend.failed, 1)) * 80}%` }}
                ></div>
              </div>
              <span className="text-xs theme-text-muted">{month}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by beneficiary, transaction ID, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1 sm:p-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded ${viewMode === 'table' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded ${viewMode === 'cards' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              Cards
            </button>
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
            {(statusFilter !== 'all' || actTypeFilter !== 'all' || dateFilter !== 'all' || priorityFilter !== 'all') && (
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
                  <label className="block text-sm theme-text-muted mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Act Type</label>
                  <select
                    value={actTypeFilter}
                    onChange={(e) => setActTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Acts</option>
                    <option value="PCR Act">PCR Act</option>
                    <option value="PoA Act">PoA Act</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Time Period</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Disbursements List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
      >
        {viewMode === 'table' ? (
          isMobile ? (
            <div className="p-3 space-y-3">
              {paginatedDisbursements.map((disbursement, idx) => {
                const StatusIcon = getStatusIcon(disbursement.status);

                return (
                  <motion.div
                    key={disbursement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileTap={{ scale: 0.995 }}
                    className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
                    onClick={() => setSelectedDisbursement(disbursement)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                          {disbursement.beneficiaryName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold theme-text-primary truncate">{disbursement.beneficiaryName}</p>
                          <p className="text-xs theme-text-muted truncate">{disbursement.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(disbursement.priority)}`}>
                        {disbursement.priority.toUpperCase()}
                      </span>
                    </div>

                    {/* Amount Display - Prominent */}
                    <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs theme-text-muted mb-0.5">Relief Amount</p>
                          <p className="text-lg font-bold theme-text-primary">{formatCurrency(disbursement.reliefAmount)}</p>
                        </div>
                        {disbursement.status === 'completed' && (
                          <div className="text-right">
                            <p className="text-xs theme-text-muted mb-0.5">Net Amount</p>
                            <p className="text-sm font-semibold text-green-400">{formatCurrency(disbursement.netAmount)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          Transaction ID
                        </span>
                        <span className="theme-text-primary font-mono text-[10px]">{disbursement.transactionId}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          Act Type
                        </span>
                        <span className="theme-text-primary font-medium">{disbursement.actType}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Location
                        </span>
                        <span className="theme-text-primary font-medium">{disbursement.district}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Initiated Date
                        </span>
                        <span className="theme-text-primary font-medium font-mono text-[10px]">
                          {formatDate(disbursement.initiatedDate)}
                        </span>
                      </div>

                      {disbursement.utrNumber && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="theme-text-muted flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" />
                            UTR Number
                          </span>
                          <span className="theme-text-primary font-mono text-[10px]">{disbursement.utrNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge with Retry Info */}
                    <div className="mb-3 pb-3 border-b theme-border-glass">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(disbursement.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{disbursement.status.replace('-', ' ')}</span>
                      </span>
                      {disbursement.retryCount > 0 && (
                        <p className="text-xs theme-text-muted mt-2 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          Retries: {disbursement.retryCount}
                        </p>
                      )}
                      {disbursement.failureReason && (
                        <p className="text-xs text-red-400 mt-2 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{disbursement.failureReason}</span>
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedDisbursement(disbursement); }}
                        className="px-3 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      {disbursement.status === 'failed' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="px-3 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/10 active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/10 active:scale-95 transition-all"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                        <span>More</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="theme-bg-glass border-b theme-border-glass">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Disbursement ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Beneficiary</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Transaction ID</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Act Type</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Status</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Initiated Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDisbursements.map((disbursement, idx) => (
                    <motion.tr
                      key={disbursement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium theme-text-primary">{disbursement.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                            {disbursement.beneficiaryName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">{disbursement.beneficiaryName}</p>
                            <p className="text-xs theme-text-muted">{disbursement.district}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary font-mono">
                        {disbursement.transactionId}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium theme-bg-glass">
                          {disbursement.actType}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold theme-text-primary">{formatCurrency(disbursement.reliefAmount)}</p>
                          {disbursement.status === 'completed' && (
                            <p className="text-xs theme-text-muted">
                              Net: {formatCurrency(disbursement.netAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(disbursement.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(disbursement.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {disbursement.status.replace('-', ' ')}
                        </span>
                        {disbursement.retryCount > 0 && (
                          <p className="text-xs theme-text-muted mt-1">Retries: {disbursement.retryCount}</p>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary">
                        {formatDate(disbursement.initiatedDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedDisbursement(disbursement)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {disbursement.status === 'failed' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {paginatedDisbursements.map((disbursement, idx) => (
              <motion.div
                key={disbursement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
                onClick={() => setSelectedDisbursement(disbursement)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white font-bold">
                      {disbursement.beneficiaryName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium theme-text-primary">{disbursement.beneficiaryName}</p>
                      <p className="text-xs theme-text-muted">{disbursement.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(disbursement.priority)}`}>
                    {disbursement.priority}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-mono">{disbursement.transactionId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Scale className="w-4 h-4" />
                    <span>{disbursement.actType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{formatCurrency(disbursement.reliefAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(disbursement.initiatedDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(disbursement.status)}`}>
                    {(() => {
                      const Icon = getStatusIcon(disbursement.status);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {disbursement.status.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:theme-bg-card">
                      <Eye className="w-4 h-4" />
                    </button>
                    {disbursement.status === 'failed' && (
                      <button className="p-1.5 rounded-lg hover:theme-bg-card">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t theme-border-glass theme-bg-glass">
          <p className="text-sm theme-text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDisbursements.length)} of {filteredDisbursements.length}
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
      </motion.div>

      {/* Disbursement Detail Modal */}
      <AnimatePresence>
        {selectedDisbursement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDisbursement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isMobile
                  ? 'theme-bg-card theme-border-glass border rounded-xl w-full h-full max-h-none overflow-y-auto'
                  : 'theme-bg-card theme-border-glass border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'
                }`}
            >
              {/* --- MODIFIED HEADER --- */}
              <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-4 sm:p-6 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0"> {/* -> Allows text to truncate */}
                  <h2 className="text-xl sm:text-2xl font-bold theme-text-primary truncate"> {/* -> Responsive text size and truncation */}
                    {selectedDisbursement.id}
                  </h2>
                  <p className="theme-text-muted truncate"> {/* -> Truncation */}
                    Disbursement Details • {selectedDisbursement.actType}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDisbursement(null)}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20 flex-shrink-0" // -> Prevents button from shrinking
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6"> {/* -> Responsive padding */}
                {/* Beneficiary Information */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Beneficiary Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <User className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">Beneficiary Name</p>
                        <p className="font-medium theme-text-primary break-words">{selectedDisbursement.beneficiaryName}</p> {/* -> Handles long names */}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <Fingerprint className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">Aadhaar Number</p>
                        <p className="font-medium theme-text-primary break-all">{selectedDisbursement.aadhaarNumber}</p> {/* -> Handles long numbers */}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <Phone className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">Phone Number</p>
                        <p className="font-medium theme-text-primary break-all">{selectedDisbursement.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <MapPin className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">Location</p>
                        <p className="font-medium theme-text-primary break-words">{selectedDisbursement.district}, {selectedDisbursement.state}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Transaction Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Transaction ID</p>
                      <p className="font-medium theme-text-primary font-mono break-all">{selectedDisbursement.transactionId}</p> {/* -> Handles long IDs */}
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">UTR Number</p>
                      <p className="font-medium theme-text-primary font-mono break-all">
                        {selectedDisbursement.utrNumber || 'Not Available'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Payment Method</p>
                      <p className="font-medium theme-text-primary">{selectedDisbursement.paymentMethod}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Relief Amount</p>
                      <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedDisbursement.reliefAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Transaction Fee</p>
                      <p className="font-medium theme-text-primary">{formatCurrency(selectedDisbursement.transactionFee)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Net Amount</p>
                      <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedDisbursement.netAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Bank Account Number</p>
                      <p className="font-medium theme-text-primary break-all">{selectedDisbursement.bankAccount}</p> {/* -> Handles long account numbers */}
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">IFSC Code</p>
                      <p className="font-medium theme-text-primary break-all">{selectedDisbursement.ifsc}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">Disbursement Status</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedDisbursement.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(selectedDisbursement.status);
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {selectedDisbursement.status.replace('-', ' ').toUpperCase()}
                    </span>
                    {selectedDisbursement.failureReason && (
                      <p className="text-sm theme-text-muted mt-2">
                        <strong>Failure Reason:</strong> {selectedDisbursement.failureReason}
                      </p>
                    )}
                    {selectedDisbursement.retryCount > 0 && (
                      <p className="text-sm theme-text-muted mt-1">
                        <strong>Retry Attempts:</strong> {selectedDisbursement.retryCount}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">Timeline</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="theme-text-primary">Initiated</span>
                        <span className="theme-text-muted">{formatDate(selectedDisbursement.initiatedDate)}</span>
                      </div>
                      {selectedDisbursement.completedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="theme-text-primary">Completed</span>
                          <span className="theme-text-muted">{formatDate(selectedDisbursement.completedDate)}</span>
                        </div>
                      )}
                      {selectedDisbursement.disbursementDate && (
                        <div className="flex justify-between text-sm">
                          <span className="theme-text-primary">Disbursed</span>
                          <span className="theme-text-muted">{formatDate(selectedDisbursement.disbursementDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Officer Information */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Officer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Initiated By</p>
                      <p className="font-medium theme-text-primary">{selectedDisbursement.initiatedBy}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Verified By</p>
                      <p className="font-medium theme-text-primary">
                        {selectedDisbursement.verifiedBy || 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t theme-border-glass">
                  {selectedDisbursement.status === 'failed' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Retry Disbursement
                    </motion.button>
                  )}
                  {selectedDisbursement.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Initiate Payment
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Receipt
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel Disbursement
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

export default DisbursementsPage;