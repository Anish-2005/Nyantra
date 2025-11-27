"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import type * as THREE from 'three';
import {
  Search, Filter, Download, Plus, Eye, ChevronLeft, ChevronRight, X,
  Clock, User, Phone, MapPin,
  Calendar, DollarSign,
   MoreVertical, TrendingUp, AlertTriangle,
   Heart, Scale,
  Banknote, Receipt, Fingerprint, CreditCard,
   CheckCircle, XCircle, PlayCircle,
  RotateCcw
} from 'lucide-react';

// Disbursements state — generated from approved applications

const DisbursementsPage: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actTypeFilter, setActTypeFilter] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy] = useState('initiatedDate');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Manual disbursement form states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualBeneficiaryId, setManualBeneficiaryId] = useState('');
  const [manualApplicationId, setManualApplicationId] = useState('');
  const [availableApplications, setAvailableApplications] = useState<any[]>([]);
  const [manualReliefAmount, setManualReliefAmount] = useState('');
  const [manualStatus, setManualStatus] = useState('pending');
  const [manualActType, setManualActType] = useState('relief');
  const [manualTransactionId, setManualTransactionId] = useState('');
  const [manualUtrNumber, setManualUtrNumber] = useState('');
  const [manualPaymentMethod, setManualPaymentMethod] = useState('');

  // Manual disbursements from Firestore
  const [manualDisbursements, setManualDisbursements] = useState<any[]>([]);

  // Combine auto-generated and manual disbursements
  const allDisbursements = useMemo(() => [...disbursements, ...manualDisbursements], [disbursements, manualDisbursements]);

  // Filter and sort disbursements
  const filteredDisbursements = useMemo(() => {
    let filtered = [...allDisbursements];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(disbursement =>
        String(disbursement.beneficiaryName ?? '').toLowerCase().includes(q) ||
        String(disbursement.id ?? '').toLowerCase().includes(q) ||
        String(disbursement.district ?? '').toLowerCase().includes(q) ||
        String(disbursement.transactionId ?? '').toLowerCase().includes(q)
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
      const aVal = String(a[sortBy as keyof typeof a] ?? '');
      const bVal = String(b[sortBy as keyof typeof b] ?? '');

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [allDisbursements, searchQuery, statusFilter, actTypeFilter, dateFilter, priorityFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredDisbursements.length / itemsPerPage);
  const paginatedDisbursements = filteredDisbursements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
 
  // Monthly disbursement trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const monthsCount = 6;
    const now = new Date();
    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const months: { label: string; year: number; month: number }[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: MONTH_SHORT[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
    }

    const completed = Array(monthsCount).fill(0);
    const failed = Array(monthsCount).fill(0);

    allDisbursements.forEach(d => {
      const s = d.initiatedDate || d.applicationDate || d.initiatedOn || null;
      let dtLocal: Date | null = null;
      try {
        if (!s) return;
        dtLocal = typeof s === 'string' ? new Date(s) : (s.toDate ? s.toDate() : new Date(s));
        if (!dtLocal || isNaN(dtLocal.getTime())) return;
      } catch (e) {
        return;
      }

      for (let idx = 0; idx < months.length; idx++) {
        const m = months[idx];
        if (dtLocal.getFullYear() === m.year && dtLocal.getMonth() === m.month) {
          if ((d.status || '').toLowerCase() === 'completed') completed[idx] += 1;
          else if ((d.status || '').toLowerCase() === 'failed') failed[idx] += 1;
          break;
        }
      }
    });

    return {
      labels: months.map(m => m.label),
      completed,
      failed
    };
  }, [allDisbursements]);

  // Statistics
  const stats = useMemo(() => {
    const total = allDisbursements.length;
    const completed = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'completed').length;
    const pending = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'pending').length;
    const inProgress = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'in_progress').length;
    const failed = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'failed').length;
    const cancelled = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'cancelled').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const disbursedAmount = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'completed').reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    const totalAmount = allDisbursements.reduce((sum, d) => sum + (d.reliefAmount || 0), 0);
    const pendingAmount = allDisbursements.filter(d => (d.status || '').toLowerCase() === 'pending').reduce((sum, d) => sum + (d.reliefAmount || 0), 0);
    return { total, completed, pending, inProgress, failed, cancelled, successRate, disbursedAmount, totalAmount, pendingAmount };
  }, [allDisbursements]);

  // Listen for approved applications and generate disbursements in realtime
  useEffect(() => {
    const q = query(collection(db, 'applications'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snap) => {
      try {
        const now = Date.now();
        const items = snap.docs.map((d, i) => {
          const data = d.data() as any;
          // Generate a DIS id using timestamp + index to ensure uniqueness
          const disId = `DIS${now}${i}`;
          const initiatedDate = data.applicationDate && (data.applicationDate as any).toDate ? (data.applicationDate as any).toDate().toISOString() : new Date().toISOString();
          return {
            id: disId,
            beneficiaryId: data.beneficiaryId || '',
            beneficiaryName: data.applicantName || data.name || '',
            district: data.district || '',
            state: data.state || '',
            transactionId: data.transactionId || null,
            utrNumber: data.utrNumber || null,
            paymentMethod: data.paymentMethod || null,
            reliefAmount: data.amount || 0,
            transactionFee: 0,
            netAmount: data.amount || 0,
            disbursedAmount: data.disbursedAmount || 0,
            status: data.disbursementStatus || 'pending',
            initiatedDate,
            actType: data.actType || data.caseType || 'relief',
            retryCount: data.retryCount || 0,
            failureReason: data.failureReason || null,
            initiatedBy: data.assignedOfficer || null,
            verifiedBy: data.verifiedBy || null,
            applicationId: d.id
          };
        });
        setDisbursements(items);
      } catch (err) {
        console.error('Error processing snapshot for approved applications', err);
      }
    }, (err) => {
      console.error('onSnapshot error for approved applications:', err);
    });

    return () => unsubscribe();
  }, []);

  // Listen for manual disbursements in realtime
  useEffect(() => {
    const q = collection(db, 'disbursements');
    const unsubscribe = onSnapshot(q, (snap) => {
      try {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })) as any[];
        setManualDisbursements(items);
      } catch (err) {
        console.error('Error processing snapshot for disbursements', err);
      }
    }, (err) => {
      console.error('onSnapshot error for disbursements:', err);
    });

    return () => unsubscribe();
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

  // Export CSV helper
  const exportDisbursementsData = (items: any[]) => {
    const headers = ['Disbursement ID','Beneficiary ID','Beneficiary Name','Aadhaar','Phone','District','State','Act Type','Case Number','Relief Amount','Disbursed Amount','Net Amount','Status','Transaction ID','Initiated Date','Disbursement Date'];
    const rows = items.map(d => [
      d.id, d.beneficiaryId, d.beneficiaryName, d.aadhaarNumber, d.phone, d.district, d.state, d.actType, d.caseNumber, d.reliefAmount, d.disbursedAmount, d.netAmount, d.status, d.transactionId, d.initiatedDate, d.disbursementDate
    ]);
    const csv = [headers, ...rows].map(r => r.map(f => `"${String(f ?? '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `disbursements_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSubmit = async () => {
    if (!manualBeneficiaryId.trim() || !manualApplicationId.trim()) {
      alert(t('extracted.beneficiary_and_application_required'));
      return;
    }

    const amount = parseFloat(manualReliefAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t('extracted.valid_amount_required'));
      return;
    }

    try {
      const selectedApp = availableApplications.find(a => a.id === manualApplicationId);
      if (!selectedApp) {
        alert(t('extracted.application_not_found'));
        return;
      }

      const disId = `DIS${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
      await addDoc(collection(db, 'disbursements'), {
        id: disId,
        beneficiaryId: manualBeneficiaryId.trim(),
        beneficiaryName: selectedApp.applicantName || selectedApp.name || '',
        district: selectedApp.district || '',
        state: selectedApp.state || '',
        transactionId: manualTransactionId.trim() || null,
        utrNumber: manualUtrNumber.trim() || null,
        paymentMethod: manualPaymentMethod.trim() || null,
        reliefAmount: amount,
        transactionFee: 0,
        netAmount: amount,
        disbursedAmount: manualStatus === 'completed' ? amount : 0,
        status: manualStatus,
        initiatedDate: new Date().toISOString(),
        actType: manualActType,
        retryCount: 0,
        failureReason: null,
        initiatedBy: 'manual', // or current user
        verifiedBy: null,
        applicationId: manualApplicationId,
        isManual: true
      });

      // Reset form
      setManualBeneficiaryId('');
      setManualApplicationId('');
      setAvailableApplications([]);
      setManualReliefAmount('');
      setManualStatus('pending');
      setManualActType('relief');
      setManualTransactionId('');
      setManualUtrNumber('');
      setManualPaymentMethod('');
      setShowManualForm(false);

      alert(t('extracted.disbursement_added_successfully'));
    } catch (err) {
      console.error('Error adding manual disbursement:', err);
      alert(t('extracted.error_adding_disbursement'));
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

      {/* Header Section - Real-time Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
      >
        {/* Decorative gradient background (static) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl opacity-40" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium theme-text-secondary">
              {t('extracted.live_tracking')} • {filteredDisbursements.length} {t('extracted.active_disbursements')}
            </span>
          </div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            {t('extracted.disbursement')} <span className="text-accent-gradient">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="theme-text-secondary max-w-2xl">{t('extracted.realtime_disbursement_tracking_description')}</p>
        </div>
        
          <div className="relative z-10 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 theme-text-primary hover:shadow-md transition-shadow"
            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('extracted.export_data')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
            onClick={() => setShowManualForm(true)}
          >
            <Plus className="w-4 h-4" />
            <span>{t('extracted.new_disbursement')}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Manual Disbursement Form */}
      <AnimatePresence>
        {showManualForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold theme-text-primary">{t('extracted.add_manual_disbursement')}</h2>
                <button
                  onClick={() => setShowManualForm(false)}
                  className="p-2 rounded-lg theme-bg-glass theme-border-glass border hover:shadow-md transition-shadow"
                >
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.beneficiary_id')} *
                  </label>
                  <input
                    type="text"
                    value={manualBeneficiaryId}
                    onChange={(e) => setManualBeneficiaryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder={t('extracted.enter_beneficiary_id')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.application_id')} *
                  </label>
                  <select
                    value={manualApplicationId}
                    onChange={(e) => setManualApplicationId(e.target.value)}
                    disabled={availableApplications.length === 0}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50"
                  >
                    <option value="">
                      {availableApplications.length === 0 ? t('extracted.no_applications_found') : t('extracted.select_application')}
                    </option>
                    {availableApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.id} - {app.actType || app.caseType} - {formatCurrency(app.amount)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.relief_amount')} *
                  </label>
                  <input
                    type="number"
                    value={manualReliefAmount}
                    onChange={(e) => setManualReliefAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.status')}
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="pending">{t('extracted.pending')}</option>
                    <option value="in_progress">{t('extracted.in_progress')}</option>
                    <option value="completed">{t('extracted.completed')}</option>
                    <option value="failed">{t('extracted.failed')}</option>
                    <option value="cancelled">{t('extracted.cancelled')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.act_type')}
                  </label>
                  <select
                    value={manualActType}
                    onChange={(e) => setManualActType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="relief">{t('extracted.relief')}</option>
                    <option value="PCR Act">{t('extracted.pcr_act')}</option>
                    <option value="PoA Act">{t('extracted.poa_act')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.transaction_id')}
                  </label>
                  <input
                    type="text"
                    value={manualTransactionId}
                    onChange={(e) => setManualTransactionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder={t('extracted.optional')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.utr_number')}
                  </label>
                  <input
                    type="text"
                    value={manualUtrNumber}
                    onChange={(e) => setManualUtrNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    placeholder={t('extracted.optional')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    {t('extracted.payment_method')}
                  </label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="">{t('extracted.select_payment_method')}</option>
                    <option value="bank_transfer">{t('extracted.bank_transfer')}</option>
                    <option value="upi">{t('extracted.upi')}</option>
                    <option value="cash">{t('extracted.cash')}</option>
                    <option value="cheque">{t('extracted.cheque')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowManualForm(false)}
                  className="px-4 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary hover:shadow-md transition-shadow"
                >
                  {t('extracted.cancel')}
                </button>
                <button
                  onClick={handleManualSubmit}
                  className="px-4 py-2 rounded-lg accent-gradient text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  {t('extracted.add_disbursement')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards - Enhanced with Real-time Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4"
      >
        {[
          { labelKey: 'extracted.total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: Banknote, statusColor: 'bg-cyan-500' },
          { labelKey: 'extracted.completed', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: CheckCircle, statusColor: 'bg-green-500' },
          { labelKey: 'extracted.pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: Clock, statusColor: 'bg-amber-500' },
          { labelKey: 'extracted.in_progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500', icon: PlayCircle, statusColor: 'bg-purple-500' },
          { labelKey: 'extracted.failed', value: stats.failed, color: 'from-red-500 to-rose-500', icon: XCircle, statusColor: 'bg-red-500' },
          { labelKey: 'extracted.cancelled', value: stats.cancelled, color: 'from-gray-500 to-slate-500', icon: X, statusColor: 'bg-gray-500' },
          { labelKey: 'extracted.success_rate', value: `${stats.successRate}%`, color: 'from-teal-500 to-cyan-500', icon: TrendingUp, statusColor: 'bg-teal-500' },
          { labelKey: 'extracted.retry_needed', value: disbursements.filter(d => d.retryCount > 0).length, color: 'from-orange-500 to-red-500', icon: RotateCcw, statusColor: 'bg-orange-500' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className="relative theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl overflow-hidden group"
          >
            {/* Status indicator dot (static) */}
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${stat.statusColor}`} />
            
            {/* Animated icon with ripple effect */}
            <div className="relative mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white relative z-10" />
              </div>
              {/* Ripple overlay removed for static UI */}
            </div>
            
            <p className="text-2xl font-bold theme-text-primary mb-1">{stat.value}</p>
            <p className="text-sm theme-text-muted mb-2">{t(stat.labelKey)}</p>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${stat.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${typeof stat.value === 'number' ? (stat.value / stats.total) * 100 : 100}%` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
              />
            </div>
            
            {/* Hover glow effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />
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
              <p className="text-sm theme-text-muted">{t('extracted.total_disbursed')} </p>
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
            <span>{t('extracted.total')}: {formatCurrency(stats.totalAmount)}</span>
            <span>{t('extracted.pending')}: {formatCurrency(stats.pendingAmount)}</span>
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
              <p className="text-sm theme-text-muted">{t('extracted.pcr_act_disbursements')} </p>
              <p className="text-2xl font-bold theme-text-primary">
                {disbursements.filter(d => d.actType === 'PCR Act').length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {formatCurrency(disbursements.filter(d => d.actType === 'PCR Act').reduce((sum, d) => sum + (d.disbursedAmount || 0), 0))} {t('extracted.disbursed')}
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
              <p className="text-sm theme-text-muted">{t('extracted.poa_act_disbursements')} </p>
              <p className="text-2xl font-bold theme-text-primary">
                {disbursements.filter(d => d.actType === 'PoA Act').length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {formatCurrency(disbursements.filter(d => d.actType === 'PoA Act').reduce((sum, d) => sum + (d.disbursedAmount || 0), 0))} {t('extracted.disbursed')}
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
            <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.disbursement_trend')} </h3>
            <p className="text-sm theme-text-muted">{t('extracted.monthly_disbursement_performance')} </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs theme-text-muted">{t('extracted.completed')} </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs theme-text-muted">{t('extracted.failed')} </span>
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
              placeholder={t('extracted.search_by_beneficiary_transaction_id_or_district')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1 sm:p-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded ${viewMode === 'table' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              {t('extracted.table')}
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded ${viewMode === 'cards' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
            >
              {t('extracted.cards')}
            </button>
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg theme-border-glass border flex items-center gap-2 ${showFilters ? 'accent-gradient text-white' : 'theme-bg-glass theme-text-primary'}`}
            style={!showFilters && theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
          >
            <Filter className="w-4 h-4" />
            <span>{t('extracted.filters')} </span>
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
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.status')} </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <option value="all">{t('extracted.all_statuses')} </option>
                    <option value="completed">{t('extracted.completed')} </option>
                    <option value="pending">{t('extracted.pending')} </option>
                    <option value="in-progress">{t('extracted.in_progress')} </option>
                    <option value="failed">{t('extracted.failed')} </option>
                    <option value="cancelled">{t('extracted.cancelled')} </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.act_type')} </label>
                  <select
                    value={actTypeFilter}
                    onChange={(e) => setActTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <option value="all">{t('extracted.all_acts')} </option>
                    <option value="PCR Act">{t('extracted.pcr_act')} </option>
                    <option value="PoA Act">{t('extracted.poa_act')} </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.time_period')} </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <option value="all">{t('extracted.all_time')} </option>
                    <option value="today">{t('extracted.today')} </option>
                    <option value="week">{t('extracted.this_week')} </option>
                    <option value="month">{t('extracted.this_month')} </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-2">{t('extracted.priority')} </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <option value="all">{t('extracted.all_priorities')} </option>
                    <option value="high">{t('extracted.high')} </option>
                    <option value="medium">{t('extracted.medium')} </option>
                    <option value="low">{t('extracted.low')}</option>
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
          // TABLE VIEW
          isMobile ? (
            // Mobile "table" layout (cards)
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
                          {disbursement.beneficiaryName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold theme-text-primary truncate">
                            {disbursement.beneficiaryName}
                          </p>
                          <p className="text-xs theme-text-muted truncate">{disbursement.id}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(
                          disbursement.priority ?? ''
                        )}`}
                      >
                        {(disbursement.priority ?? '-').toString().toUpperCase()}
                      </span>
                    </div>

                    {/* Amount Display - Prominent */}
                    <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs theme-text-muted mb-0.5">
                            {t('extracted.relief_amount')}{' '}
                          </p>
                          <p className="text-lg font-bold theme-text-primary">
                            {formatCurrency(disbursement.reliefAmount)}
                          </p>
                        </div>
                        {disbursement.status === 'completed' && (
                          <div className="text-right">
                            <p className="text-xs theme-text-muted mb-0.5">
                              {t('extracted.net_amount')}{' '}
                            </p>
                            <p className="text-sm font-semibold text-green-400">
                              {formatCurrency(disbursement.netAmount)}
                            </p>
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
                        <span className="theme-text-primary font-mono text-[10px]">
                          {disbursement.transactionId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          Act Type
                        </span>
                        <span className="theme-text-primary font-medium">
                          {disbursement.actType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Location
                        </span>
                        <span className="theme-text-primary font-medium">
                          {disbursement.district}
                        </span>
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
                          <span className="theme-text-primary font-mono text-[10px]">
                            {disbursement.utrNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge with Retry Info */}
                    <div className="mb-3 pb-3 border-b theme-border-glass">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                          disbursement.status
                        )}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">
                          {disbursement.status.replace('-', ' ')}
                        </span>
                      </span>
                      {disbursement.retryCount > 0 && (
                        <p className="text-xs theme-text-muted mt-2 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          {t('extracted.retries')}: {disbursement.retryCount}
                        </p>
                      )}
                      {disbursement.failureReason && (
                        <p className="text-xs text-red-400 mt-2 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {disbursement.failureReason}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedDisbursement(disbursement);
                        }}
                        className="px-3 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('extracted.view')} </span>
                      </button>
                      {disbursement.status === 'failed' ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          style={{
                            backgroundColor:
                              theme === 'light'
                                ? 'rgba(22, 163, 74, 0.15)'
                                : 'rgba(34, 197, 94, 0.2)',
                            color:
                              theme === 'light' ? '#15803d' : '#86efac',
                            border:
                              theme === 'light'
                                ? '1px solid rgba(22, 163, 74, 0.3)'
                                : '1px solid rgba(34, 197, 94, 0.3)'
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('extracted.retry')} </span>
                        </button>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                          }}
                          className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/10 active:scale-95 transition-all theme-text-primary"
                          style={{
                            background:
                              theme === 'light'
                                ? 'rgba(255, 255, 255, 0.95)'
                                : undefined
                          }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('extracted.receipt')} </span>
                        </button>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                        }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/10 active:scale-95 transition-all theme-text-primary"
                        style={{
                          background:
                            theme === 'light'
                              ? 'rgba(255, 255, 255, 0.95)'
                              : undefined
                        }}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                        <span>{t('extracted.more')} </span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : filteredDisbursements.length === 0 ? (
            // Desktop no-records state
            <div className="p-6 text-center theme-text-muted">
              {t('disbursements.no_records') || 'No disbursements found.'}
            </div>
          ) : (
            // Desktop table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="theme-bg-glass border-b theme-border-glass">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.disbursement_id')}{' '}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.beneficiary')}{' '}
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.transaction_id')}{' '}
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.act_type')}{' '}
                    </th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.amount')}{' '}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.status')}{' '}
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.initiated_date')}{' '}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      {t('extracted.actions')}{' '}
                    </th>
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
                      <td className="px-4 py-3 text-sm font-medium theme-text-primary">
                        {disbursement.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                            {disbursement.beneficiaryName
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">
                              {disbursement.beneficiaryName}
                            </p>
                            <p className="text-xs theme-text-muted">
                              {disbursement.district}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary font-mono">
                        {disbursement.transactionId}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium theme-bg-glass theme-text-primary border theme-border-glass"
                          style={{
                            background:
                              theme === 'light'
                                ? 'rgba(248, 250, 252, 0.8)'
                                : undefined
                          }}
                        >
                          {disbursement.actType}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold theme-text-primary">
                            {formatCurrency(disbursement.reliefAmount)}
                          </p>
                          {disbursement.status === 'completed' && (
                            <p className="text-xs theme-text-muted">
                              Net: {formatCurrency(disbursement.netAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            disbursement.status
                          )}`}
                        >
                          {(() => {
                            const Icon = getStatusIcon(disbursement.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {disbursement.status.replace('-', ' ')}
                        </span>
                        {disbursement.retryCount > 0 && (
                          <p className="text-xs theme-text-muted mt-1">
                            {t('extracted.retries')}: {disbursement.retryCount}
                          </p>
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
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors theme-text-primary"
                            style={{
                              background:
                                theme === 'light'
                                  ? 'rgba(255, 255, 255, 0.95)'
                                  : undefined
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {disbursement.status === 'failed' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors theme-text-primary"
                              style={{
                                background:
                                  theme === 'light'
                                    ? 'rgba(255, 255, 255, 0.95)'
                                    : undefined
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
                            style={{
                              background:
                                theme === 'light'
                                  ? 'rgba(255, 255, 255, 0.95)'
                                  : undefined
                            }}
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
          // CARDS VIEW
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
                      {disbursement.beneficiaryName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium theme-text-primary">
                        {disbursement.beneficiaryName}
                      </p>
                      <p className="text-xs theme-text-muted">
                        {disbursement.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      disbursement.priority
                    )}`}
                  >
                    {disbursement.priority}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-mono">
                      {disbursement.transactionId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Scale className="w-4 h-4" />
                    <span>{disbursement.actType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">
                      {formatCurrency(disbursement.reliefAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(disbursement.initiatedDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      disbursement.status
                    )}`}
                  >
                    {(() => {
                      const Icon = getStatusIcon(disbursement.status);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {disbursement.status.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded-lg hover:theme-bg-card theme-text-primary"
                      style={{
                        background:
                          theme === 'light'
                            ? 'rgba(255, 255, 255, 0.95)'
                            : undefined,
                        border:
                          theme === 'light'
                            ? '1px solid rgba(226, 232, 240, 0.8)'
                            : 'none'
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {disbursement.status === 'failed' && (
                      <button
                        className="p-1.5 rounded-lg hover:theme-bg-card theme-text-primary"
                        style={{
                          background:
                            theme === 'light'
                              ? 'rgba(255, 255, 255, 0.95)'
                              : undefined,
                          border:
                            theme === 'light'
                              ? '1px solid rgba(226, 232, 240, 0.8)'
                              : 'none'
                        }}
                      >
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
            {t('extracted.showing')}{' '}
            {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')}{' '}
            {Math.min(currentPage * itemsPerPage, filteredDisbursements.length)}{' '}
            {t('extracted.of')} {filteredDisbursements.length}
          </p>
          <div className="flex items-center gap-2">
            {isMobile ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
                  className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{
                    background:
                      theme === 'light'
                        ? 'rgba(255, 255, 255, 0.95)'
                        : undefined
                  }}
                >
                  {t('extracted.prev')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{
                    background:
                      theme === 'light'
                        ? 'rgba(255, 255, 255, 0.95)'
                        : undefined
                  }}
                >
                  {t('extracted.next')}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
                  className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{
                    background:
                      theme === 'light'
                        ? 'rgba(255, 255, 255, 0.95)'
                        : undefined
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 rounded-lg ${
                      currentPage === i + 1
                        ? 'accent-gradient text-white'
                        : 'theme-bg-card theme-border-glass border theme-text-primary'
                    }`}
                    style={
                      currentPage !== i + 1 && theme === 'light'
                        ? { background: 'rgba(255, 255, 255, 0.95)' }
                        : undefined
                    }
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{
                    background:
                      theme === 'light'
                        ? 'rgba(255, 255, 255, 0.95)'
                        : undefined
                  }}
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
          <>
            {/* Overlay for desktop when drawer open */}
            {!isMobile && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={() => setSelectedDisbursement(null)} />
            )}

            {/* Drawer on desktop, centered modal on mobile */}
            <motion.div
              initial={isMobile ? { opacity: 0 } : { x: 300 }}
              animate={isMobile ? { opacity: 1 } : { x: 0 }}
              exit={isMobile ? { opacity: 0 } : { x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={isMobile
                ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
                : 'fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] lg:w-[720px] overflow-y-auto'
              }
            >
              <div className={isMobile ? 'theme-bg-card theme-border-glass border rounded-2xl w-full max-h-[90vh] overflow-y-auto' : 'h-full theme-bg-card theme-border-glass border-l shadow-2xl'}>
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
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.beneficiary_information')} </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <User className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">{t('extracted.beneficiary_name')} </p>
                        <p className="font-medium theme-text-primary break-words">{selectedDisbursement.beneficiaryName}</p> {/* -> Handles long names */}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <Fingerprint className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">{t('extracted.aadhaar_number')} </p>
                        <p className="font-medium theme-text-primary break-all">{selectedDisbursement.aadhaarNumber}</p> {/* -> Handles long numbers */}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <Phone className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">{t('extracted.phone_number')} </p>
                        <p className="font-medium theme-text-primary break-all">{selectedDisbursement.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <MapPin className="w-5 h-5 theme-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">{t('extracted.location')} </p>
                        <p className="font-medium theme-text-primary break-words">{selectedDisbursement.district}, {selectedDisbursement.state}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.transaction_details_1')} </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.transaction_id')} </p>
                      <p className="font-medium theme-text-primary font-mono break-all">{selectedDisbursement.transactionId}</p> {/* -> Handles long IDs */}
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.utr_number')} </p>
                      <p className="font-medium theme-text-primary font-mono break-all">
                        {selectedDisbursement.utrNumber || 'Not Available'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.payment_method')} </p>
                      <p className="font-medium theme-text-primary">{selectedDisbursement.paymentMethod}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.relief_amount')} </p>
                      <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedDisbursement.reliefAmount)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.transaction_fee')} </p>
                      <p className="font-medium theme-text-primary">{formatCurrency(selectedDisbursement.transactionFee)}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.net_amount')} </p>
                      <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedDisbursement.netAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.bank_account_details')} </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.bank_account_number')} </p>
                      <p className="font-medium theme-text-primary break-all">{selectedDisbursement.bankAccount}</p> {/* -> Handles long account numbers */}
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.ifsc_code')} </p>
                      <p className="font-medium theme-text-primary break-all">{selectedDisbursement.ifsc}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">{t('extracted.disbursement_status')} </p>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedDisbursement.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(selectedDisbursement.status);
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {selectedDisbursement.status.replace('-', ' ').toUpperCase()}
                    </span>
                    {selectedDisbursement.failureReason && (
                      <p className="text-sm theme-text-muted mt-2">
                        <strong>{t('extracted.failure_reason')} </strong> {selectedDisbursement.failureReason}
                      </p>
                    )}
                    {selectedDisbursement.retryCount > 0 && (
                      <p className="text-sm theme-text-muted mt-1">
                        <strong>{t('extracted.retry_attempts')} </strong> {selectedDisbursement.retryCount}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">{t('extracted.timeline_1')} </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="theme-text-primary">{t('extracted.initiated')} </span>
                        <span className="theme-text-muted">{formatDate(selectedDisbursement.initiatedDate)}</span>
                      </div>
                      {selectedDisbursement.completedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="theme-text-primary">{t('extracted.completed')} </span>
                          <span className="theme-text-muted">{formatDate(selectedDisbursement.completedDate)}</span>
                        </div>
                      )}
                      {selectedDisbursement.disbursementDate && (
                        <div className="flex justify-between text-sm">
                          <span className="theme-text-primary">{t('extracted.disbursed')} </span>
                          <span className="theme-text-muted">{formatDate(selectedDisbursement.disbursementDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Officer Information */}
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.officer_information_1')} </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.initiated_by')} </p>
                      <p className="font-medium theme-text-primary">{selectedDisbursement.initiatedBy}</p>
                    </div>
                    <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass" style={{ background: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined }}>
                      <p className="text-xs theme-text-muted mb-1">{t('extracted.verified_by')} </p>
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
                      className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: theme === 'light' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(34, 197, 94, 0.2)',
                        color: theme === 'light' ? '#15803d' : '#86efac',
                        border: theme === 'light' ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      <RotateCcw className="w-5 h-5" />
                      {t('extracted.retry_disbursement')}
                    </motion.button>
                  )}
                  {selectedDisbursement.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.2)',
                        color: theme === 'light' ? '#1d4ed8' : '#93c5fd',
                        border: theme === 'light' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <PlayCircle className="w-5 h-5" />
                      {t('extracted.initiate_payment')}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2 theme-text-primary"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <Download className="w-5 h-5" />
                    {t('extracted.download_receipt')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                      color: theme === 'light' ? '#dc2626' : '#fca5a5',
                      border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <X className="w-5 h-5" />
                    {t('extracted.cancel_disbursement')}
                  </motion.button>
                </div>
              </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisbursementsPage;