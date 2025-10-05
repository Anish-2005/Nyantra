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
  Banknote, Receipt, Fingerprint, QrCode
} from 'lucide-react';

// Mock data for beneficiaries
const mockBeneficiaries = [
  {
    id: 'BEN-2024-001234',
    aadhaarNumber: '****-****-1234',
    name: 'Rajesh Kumar',
    fatherName: 'Suresh Kumar',
    phone: '+91 98765-43210',
    email: 'rajesh.k@example.com',
    district: 'Patna',
    state: 'Bihar',
    address: 'House No. 123, Ram Nagar, Patna - 800001',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-001',
    incidentDate: '2024-02-15',
    registrationDate: '2024-02-20',
    status: 'verified',
    reliefAmount: 40000,
    disbursedAmount: 40000,
    priority: 'high',
    assignedOfficer: 'Officer Sharma',
    documents: 4,
    lastUpdate: '2024-03-15 14:30',
    bankAccount: 'XXXXXX1234',
    ifsc: 'SBIN0000123',
    verificationStatus: 'verified',
    category: 'SC',
    age: 32,
    gender: 'Male',
    maritalStatus: 'Married'
  },
  {
    id: 'BEN-2024-001235',
    aadhaarNumber: '****-****-5678',
    name: 'Priya Singh',
    fatherName: 'Rajesh Singh',
    phone: '+91 98765-43211',
    email: 'priya.s@example.com',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'House No. 456, Gandhi Road, Lucknow - 226001',
    actType: 'PoA Act',
    caseNumber: 'POA-2024-002',
    incidentDate: '2024-02-10',
    registrationDate: '2024-02-18',
    status: 'pending-verification',
    reliefAmount: 35000,
    disbursedAmount: 0,
    priority: 'medium',
    assignedOfficer: 'Officer Verma',
    documents: 5,
    lastUpdate: '2024-03-14 10:15',
    bankAccount: 'XXXXXX5678',
    ifsc: 'SBIN0000567',
    verificationStatus: 'pending',
    category: 'ST',
    age: 28,
    gender: 'Female',
    maritalStatus: 'Single'
  },
  {
    id: 'BEN-2024-001236',
    aadhaarNumber: '****-****-9012',
    name: 'Amit Verma',
    fatherName: 'Ramesh Verma',
    phone: '+91 98765-43212',
    email: 'amit.v@example.com',
    district: 'Jaipur',
    state: 'Rajasthan',
    address: 'House No. 789, Jawahar Nagar, Jaipur - 302001',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-003',
    incidentDate: '2024-01-25',
    registrationDate: '2024-02-05',
    status: 'disbursed',
    reliefAmount: 45000,
    disbursedAmount: 45000,
    priority: 'medium',
    assignedOfficer: 'Officer Kapoor',
    documents: 6,
    lastUpdate: '2024-03-10 16:45',
    bankAccount: 'XXXXXX9012',
    ifsc: 'SBIN0000901',
    verificationStatus: 'verified',
    category: 'SC',
    age: 35,
    gender: 'Male',
    maritalStatus: 'Married'
  },
  {
    id: 'BEN-2024-001237',
    aadhaarNumber: '****-****-3456',
    name: 'Sunita Devi',
    fatherName: 'Mohan Lal',
    phone: '+91 98765-43213',
    email: 'sunita.d@example.com',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'House No. 321, Arera Colony, Bhopal - 462001',
    actType: 'PoA Act',
    caseNumber: 'POA-2024-004',
    incidentDate: '2024-02-28',
    registrationDate: '2024-03-05',
    status: 'documents-required',
    reliefAmount: 38000,
    disbursedAmount: 0,
    priority: 'high',
    assignedOfficer: 'Officer Gupta',
    documents: 3,
    lastUpdate: '2024-03-13 09:20',
    bankAccount: 'XXXXXX3456',
    ifsc: 'SBIN0000345',
    verificationStatus: 'documents-required',
    category: 'OBC',
    age: 42,
    gender: 'Female',
    maritalStatus: 'Widowed'
  },
  {
    id: 'BEN-2024-001238',
    aadhaarNumber: '****-****-7890',
    name: 'Ramesh Yadav',
    fatherName: 'Shyam Yadav',
    phone: '+91 98765-43214',
    email: 'ramesh.y@example.com',
    district: 'Ranchi',
    state: 'Jharkhand',
    address: 'House No. 654, Harmu Road, Ranchi - 834001',
    actType: 'PCR Act',
    caseNumber: 'PCR-2024-005',
    incidentDate: '2024-03-01',
    registrationDate: '2024-03-08',
    status: 'rejected',
    reliefAmount: 42000,
    disbursedAmount: 0,
    priority: 'low',
    assignedOfficer: 'Officer Mishra',
    documents: 4,
    lastUpdate: '2024-03-12 11:30',
    bankAccount: 'XXXXXX7890',
    ifsc: 'SBIN0000789',
    verificationStatus: 'rejected',
    category: 'SC',
    age: 29,
    gender: 'Male',
    maritalStatus: 'Single'
  }
];

const BeneficiariesPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actTypeFilter, setActTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<typeof mockBeneficiaries[0] | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter and sort beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    let filtered = [...mockBeneficiaries];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(beneficiary =>
        beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.aadhaarNumber.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.status === statusFilter);
    }

    // Act type filter
    if (actTypeFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.actType === actTypeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.category === categoryFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.verificationStatus === verificationFilter);
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
  }, [searchQuery, statusFilter, actTypeFilter, categoryFilter, verificationFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = mockBeneficiaries.reduce((sum, b) => sum + b.reliefAmount, 0);
    const disbursedAmount = mockBeneficiaries.reduce((sum, b) => sum + b.disbursedAmount, 0);
    
    return {
      total: mockBeneficiaries.length,
      verified: mockBeneficiaries.filter(b => b.verificationStatus === 'verified').length,
      pendingVerification: mockBeneficiaries.filter(b => b.verificationStatus === 'pending').length,
      disbursed: mockBeneficiaries.filter(b => b.status === 'disbursed').length,
      rejected: mockBeneficiaries.filter(b => b.status === 'rejected').length,
      documentsRequired: mockBeneficiaries.filter(b => b.status === 'documents-required').length,
      totalAmount,
      disbursedAmount,
      pendingAmount: totalAmount - disbursedAmount
    };
  }, []);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      SC: mockBeneficiaries.filter(b => b.category === 'SC').length,
      ST: mockBeneficiaries.filter(b => b.category === 'ST').length,
      OBC: mockBeneficiaries.filter(b => b.category === 'OBC').length
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
        case 'verified': return 'text-green-300 bg-green-900/30';
        case 'disbursed': return 'text-emerald-300 bg-emerald-900/30';
        case 'pending-verification': return 'text-amber-300 bg-amber-900/30';
        case 'rejected': return 'text-red-300 bg-red-900/30';
        case 'documents-required': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'verified': return 'text-green-700 bg-green-100';
      case 'disbursed': return 'text-emerald-700 bg-emerald-100';
      case 'pending-verification': return 'text-amber-700 bg-amber-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'documents-required': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
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

  const getCategoryColor = (category: string) => {
    if (theme === 'dark') {
      switch (category) {
        case 'SC': return 'text-blue-300 bg-blue-900/30';
        case 'ST': return 'text-green-300 bg-green-900/30';
        case 'OBC': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (category) {
      case 'SC': return 'text-blue-700 bg-blue-100';
      case 'ST': return 'text-green-700 bg-green-100';
      case 'OBC': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending-verification': Clock,
      'verified': BadgeCheck,
      'disbursed': Banknote,
      'rejected': X,
      'documents-required': AlertCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getVerificationIcon = (status: string) => {
    const icons = {
      'verified': Shield,
      'pending': Clock,
      'rejected': X,
      'documents-required': AlertCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  // Deterministic formatting helpers to avoid SSR/client hydration mismatches
  const formatNumber = (n?: number | null) => {
    if (n == null || Number.isNaN(n)) return '0';
    return new Intl.NumberFormat('en-IN').format(n);
  };

  const formatCurrency = (n?: number | null) => {
    if (n == null || Number.isNaN(n)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n as number);
  };

  const formatDate = (s?: string | null) => {
    if (!s) return '—';
    try { const d = new Date(s); return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d); } catch { return s; }
  };

  return (
    <div data-theme={theme} className="p-4 lg:p-6 space-y-6">
      {/* Three.js Canvas Background (theme-aware) */}
      <canvas
        ref={canvasRef}
        id="beneficiaries-three-canvas"
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
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Beneficiaries Management</h1>
          <p className="theme-text-secondary">Track and manage DBT beneficiaries under PCR/PoA Acts</p>
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
            <span>Add Beneficiary</span>
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
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: User },
          { label: 'Verified', value: stats.verified, color: 'from-green-500 to-emerald-500', icon: BadgeCheck },
          { label: 'Pending', value: stats.pendingVerification, color: 'from-amber-500 to-orange-500', icon: Clock },
          { label: 'Disbursed', value: stats.disbursed, color: 'from-emerald-500 to-teal-500', icon: Banknote },
          { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-rose-500', icon: X },
          { label: 'Docs Required', value: stats.documentsRequired, color: 'from-purple-500 to-pink-500', icon: AlertCircle },
          { label: 'SC', value: categoryStats.SC, color: 'from-indigo-500 to-blue-500', icon: Shield },
          { label: 'ST', value: categoryStats.ST, color: 'from-green-500 to-lime-500', icon: Award }
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
              <p className="text-sm theme-text-muted">Total Relief Amount</p>
              <p className="text-2xl font-bold theme-text-primary">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
              style={{ width: `${(stats.disbursedAmount / stats.totalAmount) * 100}%` }}
            ></div>
          </div>
            <div className="flex justify-between text-xs theme-text-muted mt-2">
            <span>Disbursed: {formatCurrency(stats.disbursedAmount)}</span>
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
              <p className="text-sm theme-text-muted">PCR Act Beneficiaries</p>
              <p className="text-2xl font-bold theme-text-primary">
                {mockBeneficiaries.filter(b => b.actType === 'PCR Act').length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            Protection of Civil Rights Act cases
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
              <p className="text-sm theme-text-muted">PoA Act Beneficiaries</p>
              <p className="text-2xl font-bold theme-text-primary">
                {mockBeneficiaries.filter(b => b.actType === 'PoA Act').length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            Prevention of Atrocities Act cases
          </p>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by name, Aadhaar, ID, or district..."
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
            {(statusFilter !== 'all' || actTypeFilter !== 'all' || categoryFilter !== 'all' || verificationFilter !== 'all') && (
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
                    <option value="verified">Verified</option>
                    <option value="pending-verification">Pending Verification</option>
                    <option value="disbursed">Disbursed</option>
                    <option value="rejected">Rejected</option>
                    <option value="documents-required">Documents Required</option>
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
                  <label className="block text-sm theme-text-muted mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">Verification</label>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
                  >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="documents-required">Documents Required</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Beneficiaries List */}
    {/* Beneficiaries List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
      >
        {viewMode === 'table' ? (
          isMobile ? (
            <div className="p-3 space-y-3">
              {paginatedBeneficiaries.map((beneficiary, idx) => {
                const StatusIcon = getStatusIcon(beneficiary.status);
                const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);
                
                return (
                  <motion.div
                    key={beneficiary.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileTap={{ scale: 0.995 }}
                    className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
                    onClick={() => setSelectedBeneficiary(beneficiary)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                          {beneficiary.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold theme-text-primary truncate">{beneficiary.name}</p>
                          <p className="text-xs theme-text-muted truncate">{beneficiary.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getCategoryColor(beneficiary.category)}`}>
                        {beneficiary.category}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5" />
                          Aadhaar
                        </span>
                        <span className="theme-text-primary font-mono text-[10px]">{beneficiary.aadhaarNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Location
                        </span>
                        <span className="theme-text-primary font-medium">{beneficiary.district}, {beneficiary.state}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          Act Type
                        </span>
                        <span className="theme-text-primary font-medium">{beneficiary.actType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          Relief Amount
                        </span>
                        <span className="theme-text-primary font-bold">{formatCurrency(beneficiary.reliefAmount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5" />
                          Disbursed
                        </span>
                        <span className="theme-text-primary font-medium">{formatCurrency(beneficiary.disbursedAmount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Assigned Officer
                        </span>
                        <span className="theme-text-primary font-medium truncate max-w-[150px]">{beneficiary.assignedOfficer}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b theme-border-glass">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{beneficiary.status.replace('-', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                        <VerificationIcon className="w-3 h-3" />
                        <span className="capitalize">{beneficiary.verificationStatus.replace('-', ' ')}</span>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBeneficiary(beneficiary); }}
                        className="px-3 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/10 active:scale-95 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Beneficiary ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Beneficiary</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Aadhaar</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">District</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Act Type</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Status</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">Verification</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBeneficiaries.map((beneficiary, idx) => (
                    <motion.tr
                      key={beneficiary.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium theme-text-primary">{beneficiary.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                            {beneficiary.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">{beneficiary.name}</p>
                            <p className="text-xs theme-text-muted">{beneficiary.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary">
                        {beneficiary.aadhaarNumber}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <div>
                          <p className="text-sm theme-text-primary">{beneficiary.district}</p>
                          <p className="text-xs theme-text-muted">{beneficiary.state}</p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(beneficiary.category)}`}>
                          {beneficiary.actType}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold theme-text-primary">{formatCurrency(beneficiary.reliefAmount)}</p>
                          <p className="text-xs theme-text-muted">
                            Disbursed: {formatCurrency(beneficiary.disbursedAmount)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(beneficiary.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {beneficiary.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                          {(() => {
                            const Icon = getVerificationIcon(beneficiary.verificationStatus);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {beneficiary.verificationStatus.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedBeneficiary(beneficiary)}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
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
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 p-4`}>
            {paginatedBeneficiaries.map((beneficiary, idx) => {
              const StatusIcon = getStatusIcon(beneficiary.status);
              const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);
              
              return (
                <motion.div
                  key={beneficiary.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={isMobile ? {} : { y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
                  onClick={() => setSelectedBeneficiary(beneficiary)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white font-bold flex-shrink-0">
                        {beneficiary.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium theme-text-primary truncate">{beneficiary.name}</p>
                        <p className="text-xs theme-text-muted truncate">{beneficiary.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(beneficiary.priority)}`}>
                      {beneficiary.priority}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <Fingerprint className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{beneficiary.aadhaarNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{beneficiary.district}, {beneficiary.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <Scale className="w-4 h-4 flex-shrink-0" />
                      <span>{beneficiary.actType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">{formatCurrency(beneficiary.reliefAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{beneficiary.status.replace('-', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                        <VerificationIcon className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1.5 rounded-lg hover:theme-bg-card"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBeneficiary(beneficiary);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 rounded-lg hover:theme-bg-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t theme-border-glass theme-bg-glass">
          <p className="text-sm theme-text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBeneficiaries.length)} of {filteredBeneficiaries.length}
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

      {/* Beneficiary Detail Modal */}
      <AnimatePresence>
        {selectedBeneficiary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBeneficiary(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isMobile ? 'theme-bg-card theme-border-glass border rounded-tl-none rounded-tr-none w-full h-full max-h-none overflow-y-auto' : 'theme-bg-card theme-border-glass border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'}`}
            >
              <div className="sticky top-0 theme-bg-nav backdrop-blur-xl border-b theme-border-glass p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold theme-text-primary">{selectedBeneficiary.name}</h2>
                  <p className="theme-text-muted">{selectedBeneficiary.id} • {selectedBeneficiary.actType}</p>
                </div>
                <button
                  onClick={() => setSelectedBeneficiary(null)}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <User className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">Full Name</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <User className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">Father's Name</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.fatherName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <Fingerprint className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">Aadhaar Number</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.aadhaarNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <Phone className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">Phone Number</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <Shield className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">Category</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <Calendar className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">Age</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.age} years</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <MapPin className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">District</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.district}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                      <MapPin className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-xs theme-text-muted">State</p>
                        <p className="font-medium theme-text-primary">{selectedBeneficiary.state}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Complete Address</p>
                      <p className="font-medium theme-text-primary">{selectedBeneficiary.address}</p>
                    </div>
                  </div>
                </div>

                {/* Case and Financial Details */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Case & Financial Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Act Type</p>
                      <p className="font-medium theme-text-primary">{selectedBeneficiary.actType}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Case Number</p>
                      <p className="font-medium theme-text-primary">{selectedBeneficiary.caseNumber}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Incident Date</p>
                      <p className="font-medium theme-text-primary">{formatDate(selectedBeneficiary.incidentDate)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Relief Amount</p>
                      <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedBeneficiary.reliefAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Disbursed Amount</p>
                      <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedBeneficiary.disbursedAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Registration Date</p>
                      <p className="font-medium theme-text-primary">{formatDate(selectedBeneficiary.registrationDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">Bank Account Number</p>
                      <p className="font-medium theme-text-primary">{selectedBeneficiary.bankAccount}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass">
                      <p className="text-xs theme-text-muted mb-1">IFSC Code</p>
                      <p className="font-medium theme-text-primary">{selectedBeneficiary.ifsc}</p>
                    </div>
                  </div>
                </div>

                {/* Status and Verification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">Application Status</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedBeneficiary.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(selectedBeneficiary.status);
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {selectedBeneficiary.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">Verification Status</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getVerificationColor(selectedBeneficiary.verificationStatus)}`}>
                      {(() => {
                        const Icon = getVerificationIcon(selectedBeneficiary.verificationStatus);
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {selectedBeneficiary.verificationStatus.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {[
                      'Aadhaar Card',
                      'FIR Copy', 
                      'Medical Certificate', 
                      'Identity Proof', 
                      'Caste Certificate',
                      'Bank Passbook'
                    ].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg theme-bg-glass hover:theme-border-glass border border-transparent transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium theme-text-primary">{doc}</p>
                            <p className="text-xs theme-text-muted">PDF • 2.4 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:theme-bg-card">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:theme-bg-card">
                            <Download className="w-4 h-4" />
                          </button>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t theme-border-glass">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Verify Beneficiary
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center justify-center gap-2"
                  >
                    <Banknote className="w-5 h-5" />
                    Initiate Disbursement
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Request Documents
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

export default BeneficiariesPage;