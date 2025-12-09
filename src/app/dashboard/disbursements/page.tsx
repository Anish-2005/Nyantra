"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import type * as THREE from 'three';
import {
  Search, Plus, Eye, ChevronLeft, ChevronRight, X,
  Clock, User, Phone, MapPin,
  Calendar, DollarSign,
   MoreVertical, TrendingUp,
   Scale,
  CreditCard,
   CheckCircle, XCircle, PlayCircle,
  RotateCcw, Edit, Heart, Filter, Fingerprint, Download, Trash2, FileText,
  AlertTriangle,
  Receipt, ArrowUpDown
} from 'lucide-react';// Disbursements state — now all from Firestore

const DisbursementsPage: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [tableInstallmentSelections, setTableInstallmentSelections] = useState<Record<string, number | null>>({});

  // Edit disbursement form states
  const [editingDisbursementId, setEditingDisbursementId] = useState<string | null>(null);
  const [isEditingManual, setIsEditingManual] = useState<boolean>(false);

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

  // Combine disbursements (now all from Firestore)
  const allDisbursements = useMemo(() => manualDisbursements, [manualDisbursements]);

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
      const actKey = actTypeFilter.toLowerCase().split(' ')[0]; // 'pcr' or 'poa'
      filtered = filtered.filter(disbursement => (disbursement.actType || '').toLowerCase().includes(actKey));
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

    // Sort with proper type handling
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortBy === 'initiatedDate' || sortBy === 'applicationDate') {
        // Date sorting
        const aDate = a[sortBy as keyof typeof a];
        const bDate = b[sortBy as keyof typeof b];
        
        aVal = aDate ? (typeof aDate === 'string' ? new Date(aDate).getTime() : 
                       (aDate.toDate ? aDate.toDate().getTime() : new Date(aDate).getTime())) : 0;
        bVal = bDate ? (typeof bDate === 'string' ? new Date(bDate).getTime() : 
                       (bDate.toDate ? bDate.toDate().getTime() : new Date(bDate).getTime())) : 0;
      } else if (sortBy === 'reliefAmount' || sortBy === 'disbursedAmount') {
        // Numeric sorting
        aVal = parseFloat(String(a[sortBy as keyof typeof a] || 0)) || 0;
        bVal = parseFloat(String(b[sortBy as keyof typeof b] || 0)) || 0;
      } else if (sortBy === 'status') {
        // Custom status order: completed -> in_progress -> pending -> failed -> cancelled
        const statusOrder = {
          'completed': 1,
          'in_progress': 2,
          'pending': 3,
          'failed': 4,
          'cancelled': 5
        };
        aVal = statusOrder[a.status as keyof typeof statusOrder] || 99;
        bVal = statusOrder[b.status as keyof typeof statusOrder] || 99;
      } else {
        // Default string sorting
        aVal = String(a[sortBy as keyof typeof a] ?? '');
        bVal = String(b[sortBy as keyof typeof b] ?? '');
      }

      if (aVal === bVal) return 0;
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
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
    const MONTH_SHORT = JSON.parse(t('extracted.months_short'));
    const months: { label: string; year: number; month: number }[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: MONTH_SHORT[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
    }

    const added = Array(monthsCount).fill(0);
    const completed = Array(monthsCount).fill(0);

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
          added[idx] += 1; // Count all disbursements added
          if ((d.status || '').toLowerCase() === 'completed') completed[idx] += 1;
          break;
        }
      }
    });

    return {
      labels: months.map(m => m.label),
      added,
      completed
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

  // Listen for approved or completed applications and create disbursements if not exist
  useEffect(() => {
    const q = query(collection(db, 'applications'), where('status', 'in', ['approved', 'completed']));
    const unsubscribe = onSnapshot(q, async (snap) => {
      try {
        for (const doc of snap.docs) {
          const data = doc.data() as any;
          const disQuery = query(collection(db, 'disbursements'), where('applicationId', '==', doc.id));
          const disSnap = await getDocs(disQuery);
          if (disSnap.empty) {
            // Check if this is a POA Act application
            const isPOAAct = data.actType === 'PoA Act' || data.actType?.toLowerCase().includes('poa');

            if (isPOAAct) {
              // Create single progressive disbursement for POA Act with progress tracking
              const totalAmount = data.amount || 0;
              const disId = `DIS${Date.now()}${Math.floor(Math.random() * 100000)}`;
              const initiatedDate = data.applicationDate && (data.applicationDate as any).toDate ? (data.applicationDate as any).toDate().toISOString() : new Date().toISOString();

              await addDoc(collection(db, 'disbursements'), {
                id: disId,
                beneficiaryId: data.beneficiaryId || '',
                beneficiaryName: data.applicantName || data.name || '',
                district: data.district || '',
                state: data.state || '',
                transactionId: data.transactionId || null,
                utrNumber: data.utrNumber || null,
                paymentMethod: data.paymentMethod || null,
                reliefAmount: totalAmount,
                transactionFee: 0,
                netAmount: totalAmount,
                disbursedAmount: 0, // Will be updated as installments are completed
                status: 'pending',
                initiatedDate,
                actType: data.actType || data.caseType || 'relief',
                retryCount: data.retryCount || 0,
                failureReason: data.failureReason || null,
                initiatedBy: data.assignedOfficer || null,
                verifiedBy: data.verifiedBy || null,
                applicationId: doc.id,
                ownerId: data.ownerId || '',
                isAuto: true,
                isProgressivePayment: true,
                currentInstallment: 1,
                totalInstallments: 3,
                installmentAmounts: [Math.round(totalAmount * 0.25), Math.round(totalAmount * 0.75), totalAmount],
                installmentPercentages: [25, 75, 100],
                completedInstallments: 0,
                disbursementProgress: 0, // Percentage completed
                nextInstallmentAmount: Math.round(totalAmount * 0.25),
                nextInstallmentPercentage: 25
              });
            } else {
              // Create single disbursement for non-POA acts
              const disId = `DIS${Date.now()}${Math.floor(Math.random() * 100000)}`;
              const initiatedDate = data.applicationDate && (data.applicationDate as any).toDate ? (data.applicationDate as any).toDate().toISOString() : new Date().toISOString();
              await addDoc(collection(db, 'disbursements'), {
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
                status: data.status === 'completed' ? 'completed' : (data.disbursementStatus || 'pending'),
                initiatedDate,
                actType: data.actType || data.caseType || 'relief',
                retryCount: data.retryCount || 0,
                failureReason: data.failureReason || null,
                initiatedBy: data.assignedOfficer || null,
                verifiedBy: data.verifiedBy || null,
                applicationId: doc.id,
                ownerId: data.ownerId || '',
                isAuto: true,
                isProgressivePayment: false
              });
            }
          }
        }
      } catch (err) {
        console.error('Error creating disbursements for applications:', err);
      }
    }, (err) => {
      console.error('onSnapshot error for applications:', err);
    });

    return () => unsubscribe();
  }, []);

  // Listen for manual disbursements in realtime
  useEffect(() => {
    const q = collection(db, 'disbursements');
    const unsubscribe = onSnapshot(q, (snap) => {
      try {
        const items = snap.docs.map((d) => {
          const data = d.data();
          return {
            firestoreId: d.id,  // Store Firestore document ID separately
            ...data  // Spread the document data (includes custom 'id' field)
          };
        }) as any[];
        setManualDisbursements(items);
      } catch (err) {
        console.error('Error processing snapshot for disbursements', err);
      }
    }, (err) => {
      console.error('onSnapshot error for disbursements:', err);
    });

    return () => unsubscribe();
  }, []);

  // Fetch applications for manual beneficiary ID
  useEffect(() => {
    if (!manualBeneficiaryId.trim()) {
      setAvailableApplications([]);
      setManualApplicationId('');
      return;
    }

    const fetchApplications = async () => {
      try {
        const q = query(collection(db, 'applications'), where('beneficiaryId', '==', manualBeneficiaryId.trim()));
        const snap = await getDocs(q);
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAvailableApplications(apps);
        if (apps.length === 0) {
          setManualApplicationId('');
        }
      } catch (err) {
        console.error('Error fetching applications for beneficiary:', err);
        setAvailableApplications([]);
        setManualApplicationId('');
      }
    };

    fetchApplications();
  }, [manualBeneficiaryId]);

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

  const translateStatus = (status?: string) => {
    if (!status) return '';
    const key = status.split(/[-_]/).map((s, i) => i === 0 ? s : s[0].toUpperCase() + s.slice(1)).join('');
    const lookedUp = t(`dashboard.status.${key}`);
    // if translation missing, t returns the key string — fall back to uppercase humanized status
    if (lookedUp && lookedUp !== `dashboard.status.${key}`) return lookedUp;
    return status.replace(/[-_]/g, ' ').toUpperCase();
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
    const headers = ['Disbursement ID','Beneficiary ID','Beneficiary Name','Aadhaar','Phone','District','State','Act Type','Case Number','Relief Amount','Disbursed Amount','Net Amount','Status','Transaction ID', t("extracted.sortOptions.initiatedDate") || 'Initiated Date','Disbursement Date'];
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

  // Function to export disbursements data as PDF
  const exportDisbursementsPDF = (items: any[]) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Professional header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('NYANTRA - Disbursements Report', margin, 22);

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Direct Benefit Transfer System under PCR & PoA Acts', margin, 30);

    // Report metadata
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
    doc.text(`Total Records: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

    let yPosition = 50;

    // Summary section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 25, 'F');

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

    // Summary stats
    const totalAmount = items.reduce((sum, d) => sum + (d.reliefAmount || 0), 0);
    const statusCounts = items.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Disbursements: ${items.length}`, margin + 5, yPosition + 18);
    doc.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPosition + 18, { align: 'right' });

    yPosition += 35;

    // Status breakdown
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Status Breakdown:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    Object.entries(statusCounts).forEach(([status, count]) => {
        const statusText = status.replace(/-/g, ' ').toUpperCase();
        const percentage = ((count as number/ items.length) * 100).toFixed(1);
        doc.text(`${statusText}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
    });

    yPosition += 10;

    // Disbursements table
    const tableColumns = [
        { header: 'Disbursement ID', dataKey: 'id', width: 30 },
        { header: 'Beneficiary', dataKey: 'beneficiaryName', width: 35 },
        { header: 'District', dataKey: 'district', width: 25 },
        { header: 'Act Type', dataKey: 'actType', width: 25 },
        { header: 'Amount (₹)', dataKey: 'reliefAmount', width: 25 },
        { header: 'Status', dataKey: 'status', width: 25 },
        { header: 'Transaction ID', dataKey: 'transactionId', width: 30 }
    ];

    const tableRows = items.map(d => ({
        id: d.id || '',
        beneficiaryName: d.beneficiaryName || '',
        district: d.district || '',
        actType: d.actType || '',
        reliefAmount: d.isProgressivePayment 
            ? `₹${d.netAmount?.toLocaleString('en-IN') || 0} (${d.disbursementProgress || 0}% complete)`
            : `₹${d.reliefAmount?.toLocaleString('en-IN') || 0}`,
        status: (d.status || '').toUpperCase(),
        transactionId: d.transactionId || 'N/A'
    }));

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
    }

    // Table header
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    let xPos = margin + 2;
    tableColumns.forEach(col => {
        doc.text(col.header, xPos, yPosition + 5.5);
        xPos += col.width;
    });

    yPosition += 10;

    // Table rows
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    tableRows.forEach((row, index) => {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;

            // Repeat header on new page
            doc.setFillColor(30, 64, 175);
            doc.rect(margin, yPosition, contentWidth, 8, 'F');

            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');

            xPos = margin + 2;
            tableColumns.forEach(col => {
                doc.text(col.header, xPos, yPosition + 5.5);
                xPos += col.width;
            });

            yPosition += 10;
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
        }

        // Alternate row colors
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPosition - 3, contentWidth, 6, 'F');
        }

        xPos = margin + 2;
        tableColumns.forEach(col => {
            const value = row[col.dataKey as keyof typeof row] || '';
            doc.text(String(value), xPos, yPosition + 2);
            xPos += col.width;
        });

        yPosition += 6;
    });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(6);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text('This report is generated by Nyantra - Direct Benefit Transfer System', margin, footerY);
    doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

    // Save the PDF
    doc.save(`nyantra_disbursements_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Function to send disbursements data via email
  const sendDisbursementsEmail = async (items: any[], format: 'csv' | 'pdf') => {
    if (!emailAddress.trim()) {
      alert('Please enter an email address');
      return;
    }

    setSendingEmail(true);
    try {
      let attachmentData: string | Buffer;
      let attachmentName: string;
      let attachmentType: string;

      if (format === 'csv') {
        // Generate CSV data directly
        const headers = ['Disbursement ID','Beneficiary ID','Beneficiary Name','Aadhaar','Phone','District','State','Act Type','Case Number','Relief Amount','Disbursed Amount','Net Amount','Status','Transaction ID', t("extracted.sortOptions.initiatedDate") || 'Initiated Date','Disbursement Date'];
        const rows = items.map(d => [
          d.id, d.beneficiaryId, d.beneficiaryName, d.aadhaarNumber, d.phone, d.district, d.state, d.actType, d.caseNumber, d.reliefAmount, d.disbursedAmount, d.netAmount, d.status, d.transactionId, d.initiatedDate, d.disbursementDate
        ]);
        const csv = [headers, ...rows].map(r => r.map(f => `"${String(f ?? '')}"`).join(',')).join('\n');
        attachmentData = csv;
        attachmentName = `nyantra_disbursements_report_${new Date().toISOString().split('T')[0]}.csv`;
        attachmentType = 'text/csv';
      } else {
        // Generate PDF data
        const pdfDoc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pageWidth = pdfDoc.internal.pageSize.getWidth();
        const pageHeight = pdfDoc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Professional header
        pdfDoc.setFillColor(30, 64, 175);
        pdfDoc.rect(0, 0, pageWidth, 35, 'F');

        // Title
        pdfDoc.setFontSize(20);
        pdfDoc.setTextColor(255, 255, 255);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('NYANTRA - Disbursements Report', margin, 22);

        // Subtitle
        pdfDoc.setFontSize(10);
        pdfDoc.setTextColor(255, 255, 255);
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.text('Direct Benefit Transfer System under PCR & PoA Acts', margin, 30);

        // Report metadata
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(255, 255, 255);
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        pdfDoc.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
        pdfDoc.text(`Total Records: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

        let yPosition = 50;

        // Summary section
        pdfDoc.setFillColor(240, 240, 240);
        pdfDoc.rect(margin, yPosition, contentWidth, 25, 'F');

        pdfDoc.setFontSize(12);
        pdfDoc.setTextColor(30, 64, 175);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

        // Calculate summary data
        const totalAmount = items.reduce((sum, d) => sum + (d.reliefAmount || 0), 0);
        const completedCount = items.filter(d => d.status === 'completed').length;
        const pendingCount = items.filter(d => d.status === 'pending').length;
        const failedCount = items.filter(d => d.status === 'failed').length;

        pdfDoc.setFontSize(9);
        pdfDoc.setTextColor(0, 0, 0);
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.text(`Total Disbursements: ₹${totalAmount.toLocaleString('en-IN')}`, margin + 5, yPosition + 18);
        pdfDoc.text(`Completed: ${completedCount} | Pending: ${pendingCount} | Failed: ${failedCount}`, margin + 5, yPosition + 25);

        yPosition += 35;

        // Table
        const tableColumns = [
          { header: 'ID', width: 25 },
          { header: 'Beneficiary', width: 40 },
          { header: 'District', width: 30 },
          { header: 'Act Type', width: 25 },
          { header: 'Amount', width: 25 },
          { header: 'Status', width: 20 },
          { header: 'Transaction ID', width: 35 }
        ];

        const tableRows = items.map(d => ({
          id: d.id || '',
          beneficiaryName: d.beneficiaryName || '',
          district: d.district || '',
          actType: d.actType || '',
          reliefAmount: d.reliefAmount ? `₹${d.reliefAmount.toLocaleString('en-IN')}` : '₹0',
          status: (d.status || '').toUpperCase(),
          transactionId: d.transactionId || 'N/A'
        }));

        // Table header
        pdfDoc.setFillColor(30, 64, 175);
        pdfDoc.rect(margin, yPosition, contentWidth, 8, 'F');

        pdfDoc.setFontSize(9);
        pdfDoc.setTextColor(255, 255, 255);
        pdfDoc.setFont('helvetica', 'bold');

        let xPos = margin + 2;
        tableColumns.forEach(col => {
          pdfDoc.text(col.header, xPos, yPosition + 5.5);
          xPos += col.width;
        });

        yPosition += 10;

        // Table rows
        pdfDoc.setFontSize(7);
        pdfDoc.setTextColor(0, 0, 0);
        pdfDoc.setFont('helvetica', 'normal');

        tableRows.forEach((row, index) => {
          if (yPosition > pageHeight - 20) {
            pdfDoc.addPage();
            yPosition = margin;

            // Repeat header on new page
            pdfDoc.setFillColor(30, 64, 175);
            pdfDoc.rect(margin, yPosition, contentWidth, 8, 'F');

            pdfDoc.setFontSize(9);
            pdfDoc.setTextColor(255, 255, 255);
            pdfDoc.setFont('helvetica', 'bold');

            xPos = margin + 2;
            tableColumns.forEach(col => {
              pdfDoc.text(col.header, xPos, yPosition + 5.5);
              xPos += col.width;
            });

            yPosition += 10;
          }

          xPos = margin + 2;
          tableColumns.forEach(col => {
            const value = row[col.header.toLowerCase().replace(' ', '') as keyof typeof row] || '';
            pdfDoc.text(String(value), xPos, yPosition + 3);
            xPos += col.width;
          });

          yPosition += 6;
        });

        // Footer
        const footerY = pageHeight - 15;
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(128, 128, 128);
        pdfDoc.setFont('helvetica', 'italic');
        pdfDoc.text('This report is generated by Nyantra - Direct Benefit Transfer System', margin, footerY);
        pdfDoc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

        // Get PDF as buffer
        attachmentData = Buffer.from(pdfDoc.output('arraybuffer'));
        attachmentName = `nyantra_disbursements_report_${new Date().toISOString().split('T')[0]}.pdf`;
        attachmentType = 'application/pdf';
      }

      // Send email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          subject: `Nyantra Disbursements Report - ${new Date().toLocaleDateString()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Nyantra - Disbursements Report</h2>
              <p>Dear User,</p>
              <p>Please find attached the disbursements report containing ${items.length} records.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Total Records: ${items.length}</li>
                <li>Format: ${format.toUpperCase()}</li>
                <li>Generated: ${new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
              <p>This report is generated by the Nyantra Direct Benefit Transfer System.</p>
              <p>Best regards,<br>Nyantra Team</p>
            </div>
          `,
          attachments: [{
            filename: attachmentName,
            content: attachmentData,
            contentType: attachmentType,
            encoding: format === 'csv' ? 'utf8' : undefined
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Email sent successfully!');
      setEmailAddress('');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDeleteDisbursement = async (disbursement: any) => {
    if (!confirm(`Are you sure you want to delete disbursement ${disbursement.id}? This action cannot be undone.`)) {
      return;
    }

    try {
      const docId = disbursement.firestoreId || disbursement.id;
      await deleteDoc(doc(db, 'disbursements', docId));
      // The real-time listener will automatically update the UI
    } catch (error) {
      console.error('Error deleting disbursement:', error);
      alert('Failed to delete disbursement. Please try again.');
    }
  };

  const handleInstallmentDisbursement = async (disbursement: any, installmentNumber: number) => {
    if (!installmentNumber) return;

    try {
      const disbursementRef = doc(db, 'disbursements', disbursement.firestoreId || disbursement.id);
      const totalInstallments = disbursement.totalInstallments || 3;
      const installmentPercentages = disbursement.installmentPercentages || [25, 50, 25];
      
      // Calculate the amount for this installment
      const installmentPercentage = installmentPercentages[installmentNumber - 1] || 25;
      const installmentAmount = (disbursement.reliefAmount * installmentPercentage) / 100;
      
      // Update the disbursement with new progress
      const newCompletedInstallments = Math.min(disbursement.completedInstallments + 1, totalInstallments);
      const newProgress = Math.min((newCompletedInstallments / totalInstallments) * 100, 100);
      const newDisbursedAmount = (disbursement.disbursedAmount || 0) + installmentAmount;
      
      const updateData = {
        completedInstallments: newCompletedInstallments,
        disbursementProgress: Math.round(newProgress),
        disbursedAmount: newDisbursedAmount,
        status: newCompletedInstallments >= totalInstallments ? 'completed' : 'pending',
        lastUpdated: new Date().toISOString(),
        [`installment${installmentNumber}Date`]: new Date().toISOString(),
        [`installment${installmentNumber}Amount`]: installmentAmount,
      };
      
      await updateDoc(disbursementRef, updateData);
      
      // Clear the selection
      setTableInstallmentSelections(prev => ({
        ...prev,
        [disbursement.id]: null
      }));
      
      alert(`Installment ${installmentNumber} disbursed successfully!`);
    } catch (error) {
      console.error('Error disbursing installment:', error);
      alert('Failed to disburse installment. Please try again.');
    }
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

    // Validate required fields for completed status
    if (manualStatus === 'completed') {
      const requiredFieldsFilled =
        manualBeneficiaryId.trim() &&
        manualApplicationId &&
        manualReliefAmount.trim() &&
        manualActType &&
        manualTransactionId.trim() &&
        manualPaymentMethod;

      if (!requiredFieldsFilled) {
        alert(t('extracted.all_fields_required_for_completion') || 'All fields must be filled to mark as completed');
        return;
      }
    }

    try {
      console.log('Submitting form. Editing ID:', editingDisbursementId);
      if (isEditingManual && editingDisbursementId) {
        // Update existing disbursement
        console.log('Updating disbursement with ID:', editingDisbursementId);
        const disbursementRef = doc(db, 'disbursements', editingDisbursementId);
        const updateData: any = {
          transactionId: manualTransactionId.trim() || null,
          utrNumber: manualUtrNumber.trim() || null,
          paymentMethod: manualPaymentMethod.trim() || null,
          status: manualStatus,
          lastUpdated: new Date().toISOString()
        };

        // If status changed to completed, set disbursedAmount and update progressive payment progress
        if (manualStatus === 'completed') {
          updateData.disbursedAmount = amount;
          updateData.completedDate = new Date().toISOString();
          
          // Update progressive payment progress if this is a progressive payment
          await updateProgressivePaymentProgress(editingDisbursementId, manualStatus);
        }

        await updateDoc(disbursementRef, updateData);
      } else {
        // Create new disbursement (for auto-generated being edited)
        console.log('Creating new disbursement');
        const selectedApp = availableApplications.find(a => a.id === manualApplicationId);
        if (!selectedApp) {
          alert(t('extracted.application_not_found'));
          return;
        }

        const disId = `DIS${Date.now()}${Math.floor(Math.random() * 100000)}`;
        
        // Check if this is a POA Act application for progressive payments
        const isPOAAct = manualActType === 'PoA Act' || manualActType?.toLowerCase().includes('poa');
        
        if (isPOAAct) {
          // Create single progressive disbursement for POA Act with progress tracking
          const totalAmount = amount;
          const disId = `DIS${Date.now()}${Math.floor(Math.random() * 100000)}`;
          await addDoc(collection(db, 'disbursements'), {
            id: disId,
            beneficiaryId: manualBeneficiaryId.trim(),
            beneficiaryName: selectedApp.applicantName || selectedApp.name || '',
            district: selectedApp.district || '',
            state: selectedApp.state || '',
            transactionId: manualTransactionId.trim() || null,
            utrNumber: manualUtrNumber.trim() || null,
            paymentMethod: manualPaymentMethod.trim() || null,
            reliefAmount: totalAmount,
            transactionFee: 0,
            netAmount: totalAmount,
            disbursedAmount: manualStatus === 'completed' ? totalAmount : 0,
            status: manualStatus,
            initiatedDate: new Date().toISOString(),
            actType: manualActType,
            retryCount: 0,
            failureReason: null,
            initiatedBy: 'manual',
            verifiedBy: null,
            applicationId: manualApplicationId,
            ownerId: selectedApp.ownerId || '',
            isManual: true,
            isProgressivePayment: true,
            currentInstallment: manualStatus === 'completed' ? 3 : 1,
            totalInstallments: 3,
            installmentAmounts: [Math.round(totalAmount * 0.25), Math.round(totalAmount * 0.75), totalAmount],
            installmentPercentages: [25, 75, 100],
            completedInstallments: manualStatus === 'completed' ? 3 : 0,
            disbursementProgress: manualStatus === 'completed' ? 100 : 0,
            nextInstallmentAmount: manualStatus === 'completed' ? totalAmount : Math.round(totalAmount * 0.25),
            nextInstallmentPercentage: manualStatus === 'completed' ? 100 : 25
          });
        } else {
          // Create single disbursement for non-POA acts
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
            initiatedBy: 'manual',
            verifiedBy: null,
            applicationId: manualApplicationId,
            ownerId: selectedApp.ownerId || '',
            isManual: true,
            isProgressivePayment: false
          });
        }
      }

      // Reset form
      setEditingDisbursementId(null);
      setIsEditingManual(false);
      setSelectedDisbursement(null);
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

    } catch (err) {
      console.error('Error saving disbursement:', err);
      alert(isEditingManual ? (t('extracted.error_updating_disbursement') || 'Error updating disbursement') : t('extracted.error_adding_disbursement'));
    }
  };

  // Helper function to update progressive payment progress
  const updateProgressivePaymentProgress = async (disbursementId: string, newStatus: string) => {
    try {
      const disbursementRef = doc(db, 'disbursements', disbursementId);
      const disbursementDoc = await getDocs(query(collection(db, 'disbursements'), where('id', '==', disbursementId)));
      
      if (!disbursementDoc.empty) {
        const disbursementData = disbursementDoc.docs[0].data();
        
        if (disbursementData.isProgressivePayment && newStatus === 'completed') {
          const currentCompleted = disbursementData.completedInstallments || 0;
          const totalInstallments = disbursementData.totalInstallments || 3;
          const installmentAmounts = disbursementData.installmentAmounts || [];
          const installmentPercentages = disbursementData.installmentPercentages || [25, 75, 100];
          
          // Calculate new progress
          const newCompletedInstallments = Math.min(currentCompleted + 1, totalInstallments);
          const newProgress = Math.min((newCompletedInstallments / totalInstallments) * 100, 100);
          
          // Calculate next installment info
          const nextInstallmentIndex = newCompletedInstallments;
          const nextInstallmentAmount = nextInstallmentIndex < installmentAmounts.length ? installmentAmounts[nextInstallmentIndex] : null;
          const nextInstallmentPercentage = nextInstallmentIndex < installmentPercentages.length ? installmentPercentages[nextInstallmentIndex] : null;
          
          const updateData = {
            completedInstallments: newCompletedInstallments,
            disbursementProgress: Math.round(newProgress),
            currentInstallment: Math.min(newCompletedInstallments + 1, totalInstallments),
            nextInstallmentAmount: nextInstallmentAmount,
            nextInstallmentPercentage: nextInstallmentPercentage,
            lastUpdated: new Date().toISOString()
          };
          
          await updateDoc(disbursementRef, updateData);
        }
      }
    } catch (error) {
      console.error('Error updating progressive payment progress:', error);
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
          {t("extracted.disbursement")}{" "}
          <span className="text-accent-gradient inline-block leading-normal">
            {t("extracted.monitoring_center")}
          </span>
        </h1>
          <p className="theme-text-secondary max-w-2xl">{t('extracted.realtime_disbursement_tracking_description')}</p>
        </div>
        
          <div className="relative z-10 flex items-center gap-3">
            <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-xl theme-border-glass border flex items-center gap-2 theme-bg-glass theme-text-primary shadow-lg"
            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
          >
            <Download className="w-4 h-4" />
            <span>{t('extracted.export_data')}</span>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold theme-text-primary">
            {editingDisbursementId
              ? t('extracted.edit_disbursement') || 'Edit Disbursement'
              : t('extracted.add_manual_disbursement')}
          </h2>
          <button
            onClick={() => {
              setShowManualForm(false);
              setEditingDisbursementId(null);
              setIsEditingManual(false);
              setSelectedDisbursement(null);
            }}
            className="p-2 rounded-lg theme-bg-glass theme-border-glass border hover:shadow-md transition-shadow"
          >
            <X className="w-5 h-5 theme-text-primary" />
          </button>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              {t('extracted.beneficiary_id')} *
            </label>
            <input
              type="text"
              value={manualBeneficiaryId}
              onChange={(e) => setManualBeneficiaryId(e.target.value)}
              onBlur={(e) => {
                const id = e.target.value.trim();
                if (id) {
                  setManualBeneficiaryId(id);
                } else {
                  setAvailableApplications([]);
                  setManualApplicationId('');
                }
              }}
              disabled={!!editingDisbursementId}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('extracted.enter_beneficiary_id')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              {t('extracted.application_id')} *
            </label>
            <select
              value={manualApplicationId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setManualApplicationId(selectedId);
                if (selectedId) {
                  const selectedApp = availableApplications.find(
                    (app) => app.id === selectedId
                  );
                  if (selectedApp) {
                    setManualReliefAmount(
                      selectedApp.amount ? selectedApp.amount.toString() : ''
                    );
                    setManualActType(
                      selectedApp.actType || selectedApp.caseType || 'relief'
                    );
                    setManualStatus('pending');
                  }
                } else {
                  setManualReliefAmount('');
                  setManualActType('relief');
                  setManualStatus('pending');
                }
              }}
              disabled={availableApplications.length === 0 || !!editingDisbursementId}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {availableApplications.length === 0
                  ? t('extracted.no_applications_found')
                  : t('extracted.select_application')}
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
              disabled={!!editingDisbursementId}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
              onChange={(e) => {
                const newStatus = e.target.value;
                if (newStatus === 'completed') {
                  const isValidForCompletion =
                    manualBeneficiaryId.trim() &&
                    manualApplicationId &&
                    manualReliefAmount.trim() &&
                    manualActType &&
                    manualTransactionId.trim() &&
                    manualPaymentMethod;

                  if (!isValidForCompletion) {
                    alert(
                      t('extracted.all_fields_required_for_completion') ||
                        'All fields must be filled to mark as completed'
                    );
                    return;
                  }
                }
                setManualStatus(newStatus);
              }}
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
              disabled={!!editingDisbursementId}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Progressive Payment Progress Section */}
        {editingDisbursementId &&
          selectedDisbursement &&
          (selectedDisbursement.isProgressivePayment ||
            selectedDisbursement.actType?.toLowerCase().includes('poa')) && (
            <div className="mt-6 p-4 rounded-lg theme-bg-glass theme-border-glass border">
              <h3 className="text-lg font-semibold theme-text-primary mb-4">
                {t('extracted.progressive_payment_progress') ||
                  'Progressive Payment Progress'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm theme-text-muted mb-1">
                    {t('extracted.current_progress') || 'Current Progress'}
                  </div>
                  <div className="text-2xl font-bold theme-text-primary">
                    {selectedDisbursement.disbursementProgress?.toFixed(2)}%
                  </div>
                </div>

                <div>
                  <div className="text-sm theme-text-muted mb-1">
                    {t('extracted.completed_installments') ||
                      'Completed Installments'}
                  </div>
                  <div className="text-2xl font-bold theme-text-primary">
                    {selectedDisbursement.completedInstallments || 0} /{' '}
                    {selectedDisbursement.totalInstallments || 3}
                  </div>
                </div>

                <div>
                  <div className="text-sm theme-text-muted mb-1">
                    {t('extracted.next_installment') || 'Next Installment'}
                  </div>
                  <div className="text-lg font-semibold theme-text-primary">
                    {selectedDisbursement.nextInstallmentAmount
                      ? formatCurrency(
                          selectedDisbursement.nextInstallmentAmount
                        )
                      : t('extracted.all_completed') || 'All Completed'}
                  </div>
                </div>

                <div>
                  <div className="text-sm theme-text-muted mb-1">
                    Disbursed Amount
                  </div>
                  <div className="text-lg font-semibold theme-text-primary">
                    {formatCurrency(selectedDisbursement.disbursedAmount || 0)} / {formatCurrency(selectedDisbursement.reliefAmount)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${selectedDisbursement.disbursementProgress || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Select Installment to Disburse
                </label>
                <select
                  value={selectedInstallment || ''}
                  onChange={(e) => setSelectedInstallment(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="">Select Installment</option>
                  <option value="1">Installment 1 (25%)</option>
                  <option value="2">Installment 2 (50%)</option>
                  <option value="3">Installment 3 (25%)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (
                      !manualTransactionId.trim() ||
                      !manualUtrNumber.trim() ||
                      !manualPaymentMethod
                    ) {
                      alert(
                        t('extracted.all_fields_required_for_progressive') ||
                          'Please fill Transaction ID, UTR Number, and Payment Method to proceed with disbursement.'
                      );
                      return;
                    }
                    if (!selectedInstallment) {
                      alert('Please select an installment to disburse.');
                      return;
                    }
                    if (editingDisbursementId) {
                      let nextAmount = 0;
                      let nextPercentage = 0;
                      if (selectedInstallment === 1) {
                        nextAmount = Math.round(
                          selectedDisbursement.reliefAmount * 0.25
                        );
                        nextPercentage = 25;
                      } else if (selectedInstallment === 2) {
                        nextAmount = Math.round(
                          selectedDisbursement.reliefAmount * 0.5
                        );
                        nextPercentage = 50;
                      } else if (selectedInstallment === 3) {
                        nextAmount = Math.round(
                          selectedDisbursement.reliefAmount * 0.25
                        );
                        nextPercentage = 25;
                      }
                      const newDisbursedAmount =
                        (selectedDisbursement.disbursedAmount || 0) + nextAmount;
                      const newCompleted = Math.max(
                        selectedDisbursement.completedInstallments || 0,
                        selectedInstallment
                      );
                      const newProgress = (newDisbursedAmount / selectedDisbursement.reliefAmount) * 100;
                      const updateData: any = {
                        disbursedAmount: newDisbursedAmount,
                        completedInstallments: newCompleted,
                        disbursementProgress: newProgress,
                        currentInstallment: newCompleted + 1,
                        transactionId: manualTransactionId,
                        utrNumber: manualUtrNumber,
                        paymentMethod: manualPaymentMethod,
                        lastUpdated: new Date().toISOString(),
                      };
                      if (newCompleted < 3) {
                        updateData.nextInstallmentAmount =
                          newCompleted === 1
                            ? Math.round(selectedDisbursement.reliefAmount * 0.5)
                            : Math.round(selectedDisbursement.reliefAmount * 0.25);
                        updateData.nextInstallmentPercentage =
                          newCompleted === 1 ? 50 : 25;
                      }
                      if (newCompleted === 3) {
                        updateData.status = 'completed';
                        updateData.nextInstallmentAmount = null;
                        updateData.nextInstallmentPercentage = null;
                      }
                      const disbursementRef = doc(
                        db,
                        'disbursements',
                        editingDisbursementId
                      );
                      await updateDoc(disbursementRef, updateData);
                      const updatedDisbursement = manualDisbursements.find(
                        (d) => d.firestoreId === editingDisbursementId
                      );
                      if (updatedDisbursement) {
                        setSelectedDisbursement(updatedDisbursement);
                      }
                      setSelectedInstallment(null); // Reset selection after disbursement
                    }
                  }}
                  disabled={
                    (selectedDisbursement.completedInstallments || 0) >= 3 ||
                    !selectedInstallment ||
                    !manualTransactionId.trim() ||
                    !manualUtrNumber.trim() ||
                    !manualPaymentMethod
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {selectedInstallment
                    ? `Disburse Installment ${selectedInstallment}`
                    : 'Select Installment'}
                </button>

                <button
                  onClick={async () => {
                    if (editingDisbursementId) {
                      const disbursementRef = doc(
                        db,
                        'disbursements',
                        editingDisbursementId
                      );
                      await updateDoc(disbursementRef, {
                        completedInstallments: 0,
                        disbursementProgress: 0,
                        currentInstallment: 1,
                        nextInstallmentAmount:
                          selectedDisbursement.installmentAmounts?.[0] ||
                          Math.round(selectedDisbursement.reliefAmount * 0.25),
                        nextInstallmentPercentage: 25,
                        lastUpdated: new Date().toISOString(),
                      });
                      const updatedDisbursement = manualDisbursements.find(
                        (d) => d.firestoreId === editingDisbursementId
                      );
                      if (updatedDisbursement) {
                        setSelectedDisbursement(updatedDisbursement);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  {t('extracted.reset_progress') || 'Reset Progress'}
                </button>
              </div>
            </div>
          )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => {
              setShowManualForm(false);
              setEditingDisbursementId(null);
              setIsEditingManual(false);
              setSelectedDisbursement(null);
            }}
            className="px-4 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary hover:shadow-md transition-shadow"
          >
            {t('extracted.cancel')}
          </button>
          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 rounded-lg accent-gradient text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            {editingDisbursementId
              ? t('extracted.update_disbursement') || 'Update Disbursement'
              : t('extracted.add_disbursement')}
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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      >
        {[
          { labelKey: 'extracted.total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: DollarSign, statusColor: 'bg-cyan-500' },
          { labelKey: 'extracted.completed', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: CheckCircle, statusColor: 'bg-green-500' },
          { labelKey: 'extracted.pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: Clock, statusColor: 'bg-amber-500' },
          { labelKey: 'extracted.in_progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500', icon: PlayCircle, statusColor: 'bg-purple-500' },
          { labelKey: 'extracted.failed', value: stats.failed, color: 'from-red-500 to-rose-500', icon: XCircle, statusColor: 'bg-red-500' },
          { labelKey: 'extracted.cancelled', value: stats.cancelled, color: 'from-gray-500 to-slate-500', icon: X, statusColor: 'bg-gray-500' }
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
                {allDisbursements.filter(d => (d.actType || '').toLowerCase().includes('pcr')).length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {formatCurrency(allDisbursements.filter(d => (d.actType || '').toLowerCase().includes('pcr') && (d.status || '').toLowerCase() === 'completed').reduce((sum, d) => sum + (d.disbursedAmount || 0), 0))} {t('extracted.disbursed')}
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
                {allDisbursements.filter(d => (d.actType || '').toLowerCase().includes('poa')).length}
              </p>
            </div>
          </div>
          <p className="text-sm theme-text-secondary">
            {formatCurrency(allDisbursements.filter(d => (d.actType || '').toLowerCase().includes('poa') && (d.status || '').toLowerCase() === 'completed').reduce((sum, d) => sum + (d.disbursedAmount || 0), 0))} {t('extracted.disbursed')}
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
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs theme-text-muted">{t('extracted.added')} </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs theme-text-muted">{t('extracted.completed')} </span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between h-32">
          {monthlyTrend.labels.map((month, index) => (
            <div key={month} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center w-full h-20 gap-1 mb-2">
                <div
                  className="w-1/2 bg-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${(monthlyTrend.added[index] / Math.max(...monthlyTrend.added, 1)) * 80}%` }}
                ></div>
                <div
                  className="w-1/2 bg-green-500 rounded-t transition-all duration-500"
                  style={{ height: `${(monthlyTrend.completed[index] / Math.max(...monthlyTrend.added, 1)) * 80}%` }}
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
            {(statusFilter !== 'all' || actTypeFilter !== 'all' || dateFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'initiatedDate' || sortOrder !== 'desc') && (
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

              {/* Sorting Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t theme-border-glass">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <ArrowUpDown className="w-3 h-3 text-white" />
                    </div>
                    <label className="text-sm font-medium theme-text-primary">{t("extracted_grouped.hero.sortBy") || "Sort By"}</label>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <option value="initiatedDate">{t("extracted_grouped.hero.sortOptions.initiatedDate") || "Initiated Date"}</option>
                    <option value="reliefAmount">{t("extracted_grouped.hero.sortOptions.reliefAmount") || "Amount"}</option>
                    <option value="status">{t("extracted_grouped.hero.sortOptions.status") || "Status"}</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                      <ArrowUpDown className="w-3 h-3 text-white" />
                    </div>
                    <label className="text-sm font-medium theme-text-primary">{t("extracted_grouped.hero.sortOrder") || "Sort Order"}</label>
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                  >
                    <option value="desc">
                      {sortBy === 'reliefAmount' ? (t("extracted.sortOrderOptions.highToLow") || 'High to Low') : 
                       sortBy === 'status' ? (t("extracted.sortOrderOptions.completedToPending") || 'Completed to Pending') : (t("extracted_grouped.hero.sortOrderOptions.newestFirst") || 'Newest First')}
                    </option>
                    <option value="asc">
                      {sortBy === 'reliefAmount' ? (t("extracted.sortOrderOptions.lowToHigh") || 'Low to High') : 
                       sortBy === 'status' ? (t("extracted.sortOrderOptions.pendingToCompleted") || 'Pending to Completed') : (t("extracted_grouped.hero.sortOrderOptions.oldestFirst") || 'Oldest First')}
                    </option>
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
                          {t('transaction_id')}
                        </span>
                        <span className="theme-text-primary font-mono text-[10px]">
                          {disbursement.transactionId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          {t('act_type')}
                        </span>
                        <span className="theme-text-primary font-medium">
                          {disbursement.actType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {t('location')}
                        </span>
                        <span className="theme-text-primary font-medium">
                          {disbursement.district}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {t('initiated_date')}
                        </span>
                        <span className="theme-text-primary font-medium font-mono text-[10px]">
                          {formatDate(disbursement.initiatedDate)}
                        </span>
                      </div>

                      {disbursement.utrNumber && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="theme-text-muted flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" />
                            {t('utr_number')}
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
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedDisbursement(disbursement);
                        }}
                        className="px-2 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
                        title={t('extracted.view')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('extracted.view')} </span>
                      </button>
                      {disbursement.status === 'failed' ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                          }}
                          className="px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 active:scale-95 transition-all"
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
                          title={t('extracted.retry')}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('extracted.retry')} </span>
                        </button>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                          }}
                          className="px-2 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-500/10 active:scale-95 transition-all theme-text-primary"
                          style={{
                            background:
                              theme === 'light'
                                ? 'rgba(255, 255, 255, 0.95)'
                                : undefined
                          }}
                          title={t('extracted.receipt')}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('extracted.receipt')} </span>
                        </button>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteDisbursement(disbursement);
                        }}
                        className="px-2 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1 hover:bg-red-500/10 active:scale-95 transition-all theme-text-primary"
                        style={{
                          background:
                            theme === 'light'
                              ? 'rgba(255, 255, 255, 0.95)'
                              : undefined
                        }}
                        title={t('extracted.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('extracted.delete')} </span>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                        }}
                        className="px-2 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1 hover:bg-gray-500/10 active:scale-95 transition-all theme-text-primary"
                        style={{
                          background:
                            theme === 'light'
                              ? 'rgba(255, 255, 255, 0.95)'
                              : undefined
                        }}
                        title={t('extracted.more')}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('extracted.more')} </span>
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
                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
                      Installments
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
                            {formatCurrency(disbursement.disbursedAmount || 0)}
                            {disbursement.isProgressivePayment && (
                              <span className="text-xs theme-text-muted ml-1">
                                / {formatCurrency(disbursement.reliefAmount)}
                              </span>
                            )}
                          </p>
                          {disbursement.isProgressivePayment && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs theme-text-muted mb-1">
                                <span>Progress</span>
                                <span>{disbursement.disbursementProgress?.toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs theme-text-muted mt-1">
                                {disbursement.completedInstallments || 0} of {disbursement.totalInstallments || 3} installments
                              </div>
                            </div>
                          )}
                          {!disbursement.isProgressivePayment && disbursement.status === 'completed' && (
                            <p className="text-xs theme-text-muted">
                              Net: {formatCurrency(disbursement.netAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        {disbursement.actType?.toLowerCase().includes('poa') ? (
                          <div className="flex flex-col gap-2">
                            <select
                              value={tableInstallmentSelections[disbursement.id] || ''}
                              className="text-xs px-2 py-1 rounded theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                              onChange={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : null;
                                setTableInstallmentSelections(prev => ({
                                  ...prev,
                                  [disbursement.id]: value
                                }));
                              }}
                            >
                              <option value="">Select</option>
                              <option value="1">Inst 1 (25%)</option>
                              <option value="2">Inst 2 (50%)</option>
                              <option value="3">Inst 3 (25%)</option>
                            </select>
                            <button
                              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:bg-gray-400"
                              disabled={!tableInstallmentSelections[disbursement.id]}
                              onClick={async () => {
                                const selectedInst = tableInstallmentSelections[disbursement.id];
                                if (!selectedInst) return;

                                // Check if required fields are set
                                if (!disbursement.transactionId || !disbursement.utrNumber || !disbursement.paymentMethod) {
                                  alert('Please edit this disbursement first to set Transaction ID, UTR Number, and Payment Method.');
                                  return;
                                }

                                // Calculate amount
                                let nextAmount = 0;
                                if (selectedInst === 1) {
                                  nextAmount = Math.round(disbursement.reliefAmount * 0.25);
                                } else if (selectedInst === 2) {
                                  nextAmount = Math.round(disbursement.reliefAmount * 0.5);
                                } else if (selectedInst === 3) {
                                  nextAmount = Math.round(disbursement.reliefAmount * 0.25);
                                }

                                const newDisbursedAmount = (disbursement.disbursedAmount || 0) + nextAmount;
                                const newCompleted = Math.max(disbursement.completedInstallments || 0, selectedInst);
                                const newProgress = (newDisbursedAmount / disbursement.reliefAmount) * 100;

                                const updateData: any = {
                                  disbursedAmount: newDisbursedAmount,
                                  completedInstallments: newCompleted,
                                  disbursementProgress: newProgress,
                                  currentInstallment: newCompleted + 1,
                                  lastUpdated: new Date().toISOString(),
                                };

                                if (newCompleted < 3) {
                                  updateData.nextInstallmentAmount = newCompleted === 1
                                    ? Math.round(disbursement.reliefAmount * 0.5)
                                    : Math.round(disbursement.reliefAmount * 0.25);
                                  updateData.nextInstallmentPercentage = newCompleted === 1 ? 50 : 25;
                                }

                                if (newCompleted === 3) {
                                  updateData.status = 'completed';
                                  updateData.nextInstallmentAmount = null;
                                  updateData.nextInstallmentPercentage = null;
                                }

                                const disbursementRef = doc(db, 'disbursements', disbursement.firestoreId || disbursement.id);
                                await updateDoc(disbursementRef, updateData);

                                // Clear selection
                                setTableInstallmentSelections(prev => ({
                                  ...prev,
                                  [disbursement.id]: null
                                }));

                                // Refresh data
                                // The listener should update automatically
                              }}
                            >
                              Disburse
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs theme-text-muted">-</span>
                        )}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDisbursement(disbursement);
                            }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
                            style={{
                              background:
                                theme === 'light'
                                  ? 'rgba(255, 255, 255, 0.95)'
                                  : undefined
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
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
                      {disbursement.isProgressivePayment
                        ? `${formatCurrency(disbursement.disbursedAmount || 0)} / ${formatCurrency(disbursement.reliefAmount)}`
                        : formatCurrency(disbursement.reliefAmount)
                      }
                    </span>
                  </div>
                  {disbursement.isProgressivePayment && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs theme-text-muted mb-1">
                        <span>Progress</span>
                        <span>{disbursement.disbursementProgress?.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs theme-text-muted mt-1">
                        {disbursement.completedInstallments || 0} of {disbursement.totalInstallments || 3} installments
                      </div>
                    </div>
                  )}
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
                  {disbursement.actType?.toLowerCase().includes('poa') && (
                    <div className="flex flex-col gap-1">
                      <select
                        value={tableInstallmentSelections[disbursement.id] || ''}
                        className="text-xs px-2 py-1 rounded theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          setTableInstallmentSelections(prev => ({
                            ...prev,
                            [disbursement.id]: value
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        <option value="1">Inst 1 (25%)</option>
                        <option value="2">Inst 2 (50%)</option>
                        <option value="3">Inst 3 (25%)</option>
                      </select>
                      <button
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:bg-gray-400"
                        disabled={!tableInstallmentSelections[disbursement.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstallmentDisbursement(disbursement, tableInstallmentSelections[disbursement.id]!);
                        }}
                      >
                        Disburse
                      </button>
                    </div>
                  )}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDisbursement(disbursement);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
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
                      title={t('extracted.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

      {/* Disbursement Details Section */}
      {selectedDisbursement && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold theme-text-primary">
                  {selectedDisbursement.id}
                </h2>
                <p className="theme-text-muted">
                  {t('extracted.disbursement_details') || 'वितरण विवरण'} • {selectedDisbursement.actType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Populate the manual form with selected disbursement data for editing
                    const docId = selectedDisbursement.firestoreId || selectedDisbursement.id;
                    console.log('Editing disbursement:', selectedDisbursement, 'Document ID:', docId);
                    setEditingDisbursementId(docId);
                    setIsEditingManual(!!selectedDisbursement.firestoreId);
                    // Keep selectedDisbursement for progressive payment progress section
                    setSelectedDisbursement(selectedDisbursement);
                    setManualBeneficiaryId(selectedDisbursement.beneficiaryId || '');
                    setManualApplicationId(selectedDisbursement.applicationId || '');
                    // Fetch applications for this beneficiary
                    if (selectedDisbursement.beneficiaryId) {
                      const fetchApplications = async () => {
                        try {
                          const q = query(collection(db, 'applications'), where('beneficiaryId', '==', selectedDisbursement.beneficiaryId));
                          const snap = await getDocs(q);
                          const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                          setAvailableApplications(apps);
                        } catch (err) {
                          console.error('Error fetching applications for beneficiary:', err);
                        }
                      };
                      fetchApplications();
                    }
                    setManualReliefAmount(selectedDisbursement.reliefAmount?.toString() || '');
                    setManualStatus(selectedDisbursement.status || 'pending');
                    setManualActType(selectedDisbursement.actType || 'relief');
                    setManualTransactionId(selectedDisbursement.transactionId || '');
                    setManualUtrNumber(selectedDisbursement.utrNumber || '');
                    setManualPaymentMethod(selectedDisbursement.paymentMethod || '');
                    setShowManualForm(true);
                    setSelectedDisbursement(null); // Close details
                  }}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-blue-500/20"
                >
                  <Edit className="w-5 h-5 theme-text-primary" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDisbursement(null)}
                  className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Beneficiary Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.beneficiary_information')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <User className="w-5 h-5 theme-text-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs theme-text-muted">{t('extracted.beneficiary_name')}</p>
                      <p className="font-medium theme-text-primary break-words">{selectedDisbursement.beneficiaryName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <Fingerprint className="w-5 h-5 theme-text-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs theme-text-muted">{t('extracted.aadhaar_number')}</p>
                      <p className="font-medium theme-text-primary break-all">{selectedDisbursement.aadhaarNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <Phone className="w-5 h-5 theme-text-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs theme-text-muted">{t('extracted.phone_number')}</p>
                      <p className="font-medium theme-text-primary break-all">{selectedDisbursement.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <MapPin className="w-5 h-5 theme-text-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs theme-text-muted">{t('extracted.location')}</p>
                      <p className="font-medium theme-text-primary break-words">{selectedDisbursement.district}, {selectedDisbursement.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.transaction_details_1')}</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-xs theme-text-muted mb-1">{t('extracted.transaction_id')}</p>
                    <p className="font-medium theme-text-primary font-mono break-all">{selectedDisbursement.transactionId}</p>
                  </div>
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-xs theme-text-muted mb-1">{t('extracted.utr_number')}</p>
                    <p className="font-medium theme-text-primary font-mono break-all">
                      {selectedDisbursement.utrNumber || 'उपलब्ध नहीं'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-xs theme-text-muted mb-1">{t('extracted.payment_method')}</p>
                    <p className="font-medium theme-text-primary">{selectedDisbursement.paymentMethod}</p>
                  </div>
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-xs theme-text-muted mb-1">{t('extracted.relief_amount')}</p>
                    <p className="font-semibold text-lg theme-text-primary">{formatCurrency(selectedDisbursement.reliefAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Status and Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.timeline_1')} & {t('extracted.disbursement_status')}</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">{t('extracted.disbursement_status')}</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedDisbursement.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(selectedDisbursement.status);
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {translateStatus(selectedDisbursement.status)}
                    </span>
                    {selectedDisbursement.failureReason && (
                      <p className="text-sm theme-text-muted mt-2">
                        <strong>{t('extracted.failure_reason')}</strong> {selectedDisbursement.failureReason}
                      </p>
                    )}
                    {selectedDisbursement.retryCount > 0 && (
                      <p className="text-sm theme-text-muted mt-1">
                        <strong>{t('extracted.retry_attempts')}</strong> {selectedDisbursement.retryCount}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                    <p className="text-sm theme-text-muted mb-2">{t('timeline_1')}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="theme-text-primary">{t('extracted.initiated')}</span>
                          <span className="theme-text-muted">{formatDate(selectedDisbursement.initiatedDate)}</span>
                        </div>
                        {selectedDisbursement.completedDate && (
                          <div className="flex justify-between text-sm">
                            <span className="theme-text-primary">{t('extracted.completed')}</span>
                            <span className="theme-text-muted">{formatDate(selectedDisbursement.completedDate)}</span>
                          </div>
                        )}
                        {selectedDisbursement.disbursementDate && (
                          <div className="flex justify-between text-sm">
                            <span className="theme-text-primary">{t('extracted.disbursed')}</span>
                            <span className="theme-text-muted">{formatDate(selectedDisbursement.disbursementDate)}</span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t theme-border-glass">
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
        </motion.div>
      )}

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowExportModal(false)} />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-md mx-4 p-6 rounded-xl theme-border-glass border shadow-lg"
              style={{ background: theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(6,8,20,0.98)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary flex items-center gap-3">
                    <Download className="w-5 h-5 text-accent-gradient" />
                    {t("extracted.exportTitle") || "Export Disbursements"}
                  </h3>
                  <p className="text-sm theme-text-muted mt-1">
                    {t("extracted.exportSubtitle") || "Choose export format for disbursements data"}
                  </p>
                </div>
                <button onClick={() => setShowExportModal(false)} aria-label="Close export modal" className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors">
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Export All Section */}
                <div className="p-4 rounded-lg border theme-border-glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium theme-text-primary">{t("extracted.exportAllTitle") || "All Disbursements"}</h4>
                      <p className="text-sm theme-text-muted">{allDisbursements.length} records</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { exportDisbursementsData(allDisbursements); setShowExportModal(false); }} className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{t("extracted.exportCsv") || "Export CSV"}</button>
                    <button onClick={() => { exportDisbursementsPDF(allDisbursements); setShowExportModal(false); }} className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md transition-shadow">{t("extracted.exportPdf") || "Export PDF"}</button>
                  </div>
                </div>

                {/* Export Filtered Section */}
                <div className="p-4 rounded-lg border theme-border-glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium theme-text-primary">{t("extracted.exportFilteredTitle") || "Filtered Results"}</h4>
                      <p className="text-sm theme-text-muted">{filteredDisbursements.length} records</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button disabled={filteredDisbursements.length === 0} onClick={() => { exportDisbursementsData(filteredDisbursements); setShowExportModal(false); }} className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{t("extracted.exportCsv") || "Export CSV"}</button>
                    <button disabled={filteredDisbursements.length === 0} onClick={() => { exportDisbursementsPDF(filteredDisbursements); setShowExportModal(false); }} className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow">{t("extracted.exportPdf") || "Export PDF"}</button>
                  </div>
                </div>

                {/* Email Export Section */}
                <div className="p-4 rounded-lg border theme-border-glass">
                  <div className="mb-3">
                    <h4 className="font-medium theme-text-primary mb-2">Email Export</h4>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder={t("extracted.enterEmailAddress") || "Enter email address"}
                      className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <button
                        disabled={!emailAddress.trim() || sendingEmail}
                        onClick={() => sendDisbursementsEmail(allDisbursements, 'csv')}
                        className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                        Send CSV
                      </button>
                      <button
                        disabled={!emailAddress.trim() || sendingEmail}
                        onClick={() => sendDisbursementsEmail(allDisbursements, 'pdf')}
                        className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        Send PDF
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        disabled={!emailAddress.trim() || filteredDisbursements.length === 0 || sendingEmail}
                        onClick={() => sendDisbursementsEmail(filteredDisbursements, 'csv')}
                        className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                        Send Filtered CSV
                      </button>
                      <button
                        disabled={!emailAddress.trim() || filteredDisbursements.length === 0 || sendingEmail}
                        onClick={() => sendDisbursementsEmail(filteredDisbursements, 'pdf')}
                        className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        Send Filtered PDF
                      </button>
                    </div>
                  </div>
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
function setEditPaymentMethod(arg0: any) {
  throw new Error('Function not implemented.');
}

function setEditStatus(status: any) {
  throw new Error('Function not implemented.');
}

function setEditTransactionId(arg0: any) {
  throw new Error('Function not implemented.');
}

function setEditUtrNumber(arg0: any) {
  throw new Error('Function not implemented.');
}

