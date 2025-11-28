"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import {
  Download, Eye, RefreshCw, TrendingUp, TrendingDown, FileText, Users, Banknote,
  DollarSign, PieChart, Activity, CheckCircle, XCircle, AlertCircle, Award as AwardIcon,
  Clock as ClockIcon, Map as MapIcon, Calendar as CalendarIcon, BarChart3, Target,
  Percent, Scale, UserCheck, AlertTriangle, Zap, Globe, Layers, Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AnalyticsPage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [timeRange, setTimeRange] = useState('year');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [manualDisbursements, setManualDisbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // New UI customization states
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedActs, setSelectedActs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'applications' | 'disbursements' | 'successRate' | 'district'>('applications');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Combine disbursements
  const allDisbursements = useMemo(() => [...disbursements, ...manualDisbursements], [disbursements, manualDisbursements]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Force refresh by updating a dummy state
      setLoading(prev => prev);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Helper function to get date range
  const getDateRange = (range: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            startDate: new Date(customStartDate),
            endDate: new Date(customEndDate)
          };
        }
        // If no custom dates set, default to last year
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1); // Default to year
    }

    return { startDate, endDate: now };
  };

  // Get filtered data based on time range
  const { filteredApplications, filteredDisbursements } = useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRange);

    const filteredApps = applications.filter(app => {
      const appDate = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate || new Date());
      return appDate >= startDate && appDate <= endDate;
    });

    const filteredDisbs = allDisbursements.filter(d => {
      const disbDate = new Date(d.initiatedDate || new Date());
      return disbDate >= startDate && disbDate <= endDate;
    });

    return { filteredApplications: filteredApps, filteredDisbursements: filteredDisbs };
  }, [applications, allDisbursements, timeRange, customStartDate, customEndDate]);

  // Filtered analytics data based on selections
  const filteredAnalyticsData = useMemo(() => {
    let filteredApps = filteredApplications;
    let filteredDisbs = filteredDisbursements;

    // Filter by selected states
    if (selectedStates.length > 0) {
      filteredApps = filteredApps.filter(app => selectedStates.includes(app.state || 'Unknown'));
      filteredDisbs = filteredDisbs.filter(d => selectedStates.includes(d.state || 'Unknown'));
    }

    // Filter by selected acts
    if (selectedActs.length > 0) {
      filteredApps = filteredApps.filter(app => selectedActs.includes(app.actType || 'Unknown'));
      filteredDisbs = filteredDisbs.filter(d => selectedActs.includes(d.actType || 'Unknown'));
    }

    // Recalculate metrics with filters
    const totalApplications = filteredApps.length;
    const totalDisbursements = filteredDisbs.length;
    const completedDisbursements = filteredDisbs.filter(d => d.status === 'completed');
    const totalAmount = completedDisbursements.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    const successRate = totalApplications > 0 ? (completedDisbursements.length / totalApplications) * 100 : 0;
    const pendingApplications = filteredApps.filter(app => app.status === 'pending').length;
    const rejectedApplications = filteredApps.filter(app => app.status === 'rejected').length;

    return {
      totalApplications,
      totalDisbursements,
      totalAmount,
      successRate,
      pendingApplications,
      rejectedApplications,
      filteredApplications: filteredApps,
      filteredDisbursements: filteredDisbs
    };
  }, [filteredApplications, filteredDisbursements, selectedStates, selectedActs]);

  // Fetch applications data
  useEffect(() => {
    const q = query(collection(db, 'applications'), orderBy('applicationDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(items);
    });
    return () => unsubscribe();
  }, []);

  // Fetch beneficiaries data
  useEffect(() => {
    const q = query(collection(db, 'beneficiaries'), orderBy('registrationDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBeneficiaries(items);
    });
    return () => unsubscribe();
  }, []);

  // Fetch disbursements from approved applications
  useEffect(() => {
    const q = query(collection(db, 'applications'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d, i) => {
        const data = d.data() as any;
        const now = Date.now();
        const disId = `DIS${now}${i}`;
        const initiatedDate = data.applicationDate && (data.applicationDate as any).toDate ?
          (data.applicationDate as any).toDate().toISOString() : new Date().toISOString();
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
    });
    return () => unsubscribe();
  }, []);

  // Fetch manual disbursements
  useEffect(() => {
    const q = collection(db, 'disbursements');
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        firestoreId: d.id,
        ...d.data()
      })) as any[];
      setManualDisbursements(items);
    });
    return () => unsubscribe();
  }, []);

  // Set loading to false when all data is loaded
  useEffect(() => {
    if (applications.length >= 0 && beneficiaries.length >= 0 && allDisbursements.length >= 0) {
      setLoading(false);
    }
  }, [applications, beneficiaries, allDisbursements]);

  // Calculate analytics data from real Firebase data
  const analyticsData = useMemo(() => {
    // Overview metrics
    const totalApplications = filteredApplications.length;
    const totalBeneficiaries = beneficiaries.length; // Beneficiaries don't have date filtering
    const totalDisbursements = filteredDisbursements.length;
    const completedDisbursements = filteredDisbursements.filter(d => d.status === 'completed');
    const totalAmount = completedDisbursements.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    const successRate = totalApplications > 0 ? (completedDisbursements.length / totalApplications) * 100 : 0;
    const pendingApplications = filteredApplications.filter(app => app.status === 'pending').length;
    const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected').length;

    // State-wise data
    const stateWiseData = filteredApplications.reduce((acc: any[], app) => {
      const state = app.state || 'Unknown';
      const existing = acc.find(s => s.state === state);
      const disbursements = filteredDisbursements.filter(d => d.state === state);
      const completed = disbursements.filter(d => d.status === 'completed');
      const amount = completed.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);

      if (existing) {
        existing.applications += 1;
        existing.disbursements += disbursements.length;
        existing.amount += amount;
      } else {
        acc.push({
          state,
          applications: 1,
          disbursements: disbursements.length,
          amount,
          successRate: disbursements.length > 0 ? (completed.length / disbursements.length) * 100 : 0
        });
      }
      return acc;
    }, []);

    // Act-wise breakdown
    const pcrApps = filteredApplications.filter(app => app.actType === 'PCR Act');
    const poaApps = filteredApplications.filter(app => app.actType === 'PoA Act');
    const pcrDisbursements = filteredDisbursements.filter(d => d.actType === 'PCR Act');
    const poaDisbursements = filteredDisbursements.filter(d => d.actType === 'PoA Act');
    const pcrCompleted = pcrDisbursements.filter(d => d.status === 'completed');
    const poaCompleted = poaDisbursements.filter(d => d.status === 'completed');

    // Category-wise data from beneficiaries (no date filtering for beneficiaries)
    const categoryWiseData = {
      SC: beneficiaries.filter(b => b.category === 'SC').length,
      ST: beneficiaries.filter(b => b.category === 'ST').length,
      OBC: beneficiaries.filter(b => b.category === 'OBC').length
    };

    // Top districts
    const districtData = filteredApplications.reduce((acc: any[], app) => {
      const district = app.district || 'Unknown';
      const state = app.state || 'Unknown';
      const existing = acc.find(d => d.district === district && d.state === state);
      const disbursements = filteredDisbursements.filter(d => d.district === district && d.state === state);
      const completed = disbursements.filter(d => d.status === 'completed');

      if (existing) {
        existing.applications += 1;
        existing.disbursements += disbursements.length;
      } else {
        acc.push({
          district,
          state,
          applications: 1,
          disbursements: disbursements.length,
          successRate: disbursements.length > 0 ? (completed.length / disbursements.length) * 100 : 0
        });
      }
      return acc;
    }, []).sort((a, b) => b.applications - a.applications).slice(0, 5);

    // Monthly trends (last 12 months)
    const monthlyTrends = {
      labels: JSON.parse(t('extracted.months_short')),
      applications: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      disbursements: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      amounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    // Calculate monthly data
    const now = new Date();
    filteredApplications.forEach(app => {
      const date = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate || now);
      const month = date.getMonth();
      if (monthlyTrends.applications[month] !== undefined) {
        monthlyTrends.applications[month]++;
      }
    });

    filteredDisbursements.forEach(d => {
      const date = new Date(d.initiatedDate || now);
      const month = date.getMonth();
      if (monthlyTrends.disbursements[month] !== undefined) {
        monthlyTrends.disbursements[month]++;
        if (d.status === 'completed' && d.disbursedAmount) {
          monthlyTrends.amounts[month] += d.disbursedAmount;
        }
      }
    });

    return {
      overview: {
        totalApplications,
        totalBeneficiaries,
        totalDisbursements,
        totalAmount,
        successRate,
        pendingApplications,
        rejectedApplications
      },
      monthlyTrends,
      stateWiseData,
      actWiseBreakdown: {
        pcr: {
          applications: pcrApps.length,
          disbursements: pcrDisbursements.length,
          amount: pcrCompleted.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0),
          successRate: pcrDisbursements.length > 0 ? (pcrCompleted.length / pcrDisbursements.length) * 100 : 0
        },
        poa: {
          applications: poaApps.length,
          disbursements: poaDisbursements.length,
          amount: poaCompleted.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0),
          successRate: poaDisbursements.length > 0 ? (poaCompleted.length / poaDisbursements.length) * 100 : 0
        }
      },
      categoryWiseData,
      topDistricts: districtData
    };
  }, [filteredApplications, filteredDisbursements, beneficiaries, selectedStates, selectedActs]);

  // Sorted districts for table
  const sortedDistricts = useMemo(() => {
    const districts = [...analyticsData.topDistricts];
    return districts.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'applications':
          aValue = a.applications;
          bValue = b.applications;
          break;
        case 'disbursements':
          aValue = a.disbursements;
          bValue = b.disbursements;
          break;
        case 'successRate':
          aValue = a.successRate;
          bValue = b.successRate;
          break;
        case 'district':
          aValue = a.district;
          bValue = b.district;
          break;
        default:
          aValue = a.applications;
          bValue = b.applications;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [analyticsData.topDistricts, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedDistricts.length / itemsPerPage);

  // Performance indicators
  const performanceIndicators = useMemo(() => {
    const completedDisbursements = filteredDisbursements.filter(d => d.status === 'completed');
    const disbursementRate = filteredApplications.length > 0 ? (completedDisbursements.length / filteredApplications.length) * 100 : 0;

    return [
      {
        labelKey: 'extracted.application_success_rate',
        value: `${analyticsData.overview.successRate.toFixed(1)}%`,
        change: '+2.3%',
        trend: 'up',
        icon: TrendingUp,
        color: 'from-green-500 to-emerald-500'
      },
      {
        labelKey: 'extracted.disbursement_rate',
        value: `${disbursementRate.toFixed(1)}%`,
        change: '+4.1%',
        trend: 'up',
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500'
      },
      {
        labelKey: 'extracted.amount_disbursed',
        value: `₹${(analyticsData.overview.totalAmount / 10000000).toFixed(1)}Cr`,
        change: '+12.5%',
        trend: 'up',
        icon: TrendingUp,
        color: 'from-amber-500 to-orange-500'
      }
    ];
  }, [analyticsData, filteredApplications, filteredDisbursements]);

  // Detect small screens and adjust UI defaults for better mobile UX
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = () => {
      // placeholder handler kept for possible future use
      // const matches = 'matches' in e ? e.matches : mq.matches;
      // setIsMobile(matches);
      return;
    };

  handler();
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

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Analytics Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Overview metrics
    doc.setFontSize(16);
    doc.text('Overview Metrics', 20, 60);
    
    let yPos = 75;
    const metrics = [
      ['Total Applications', analyticsData.overview.totalApplications.toString()],
      ['Total Beneficiaries', analyticsData.overview.totalBeneficiaries.toString()],
      ['Total Disbursements', analyticsData.overview.totalDisbursements.toString()],
      ['Total Amount Disbursed', `₹${(analyticsData.overview.totalAmount / 100000).toFixed(2)}L`],
      ['Success Rate', `${analyticsData.overview.successRate.toFixed(1)}%`],
      ['Pending Applications', analyticsData.overview.pendingApplications.toString()],
      ['Rejected Applications', analyticsData.overview.rejectedApplications.toString()]
    ];
    
    metrics.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, yPos);
      yPos += 10;
    });
    
    // Top Districts table
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    
    yPos += 20;
    doc.setFontSize(16);
    doc.text('Top Performing Districts', 20, yPos);
    yPos += 15;
    
    const districtHeaders = [['District', 'State', 'Applications', 'Disbursements', 'Success Rate']];
    const districtData = sortedDistricts.slice(0, 10).map(district => [
      district.district,
      district.state,
      district.applications.toString(),
      district.disbursements.toString(),
      `${district.successRate.toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      head: districtHeaders,
      body: districtData,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save('analytics-report.pdf');
  };

  const exportToCSV = () => {
    // Prepare CSV data
    let csvContent = 'Analytics Report\n';
    csvContent += `Generated on,${new Date().toLocaleDateString()}\n\n`;
    
    // Overview metrics
    csvContent += 'Overview Metrics\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Applications,${analyticsData.overview.totalApplications}\n`;
    csvContent += `Total Beneficiaries,${analyticsData.overview.totalBeneficiaries}\n`;
    csvContent += `Total Disbursements,${analyticsData.overview.totalDisbursements}\n`;
    csvContent += `Total Amount Disbursed,₹${(analyticsData.overview.totalAmount / 100000).toFixed(2)}L\n`;
    csvContent += `Success Rate,${analyticsData.overview.successRate.toFixed(1)}%\n`;
    csvContent += `Pending Applications,${analyticsData.overview.pendingApplications}\n`;
    csvContent += `Rejected Applications,${analyticsData.overview.rejectedApplications}\n\n`;
    
    // Top Districts
    csvContent += 'Top Performing Districts\n';
    csvContent += 'District,State,Applications,Disbursements,Success Rate\n';
    sortedDistricts.slice(0, 10).forEach(district => {
      csvContent += `${district.district},${district.state},${district.applications},${district.disbursements},${district.successRate.toFixed(1)}%\n`;
    });
    
    csvContent += '\nState-wise Performance\n';
    csvContent += 'State,Applications,Disbursements,Amount,Success Rate\n';
    analyticsData.stateWiseData.forEach(state => {
      csvContent += `${state.state},${state.applications},${state.disbursements},₹${(state.amount / 100000).toFixed(2)}L,${state.successRate.toFixed(1)}%\n`;
    });
    
    csvContent += '\nMonthly Trends\n';
    csvContent += 'Month,Applications,Disbursements,Amount\n';
    analyticsData.monthlyTrends.labels.forEach((month, index) => {
      csvContent += `${month},${analyticsData.monthlyTrends.applications[index]},${analyticsData.monthlyTrends.disbursements[index]},₹${(analyticsData.monthlyTrends.amounts[index] / 100000).toFixed(2)}L\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'analytics-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateMonthlyReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Monthly Analytics Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Report Period: ${timeRange}`, 20, 40);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Monthly trends table
    doc.setFontSize(16);
    doc.text('Monthly Trends', 20, 70);
    
    const monthlyHeaders = [['Month', 'Applications', 'Disbursements', 'Amount (₹)']];
    const monthlyData = analyticsData.monthlyTrends.labels.map((month, index) => [
      month,
      analyticsData.monthlyTrends.applications[index].toString(),
      analyticsData.monthlyTrends.disbursements[index].toString(),
      (analyticsData.monthlyTrends.amounts[index] / 100000).toFixed(2) + 'L'
    ]);
    
    autoTable(doc, {
      head: monthlyHeaders,
      body: monthlyData,
      startY: 80,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save('monthly-analytics-report.pdf');
  };

  const generatePerformanceReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Performance Analytics Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Performance indicators
    doc.setFontSize(16);
    doc.text('Key Performance Indicators', 20, 60);
    
    let yPos = 75;
    performanceIndicators.forEach((indicator, index) => {
      doc.setFontSize(12);
      doc.text(`${indicator.labelKey}: ${indicator.value}`, 20, yPos);
      yPos += 10;
    });
    
    // Act-wise performance
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    
    yPos += 20;
    doc.setFontSize(16);
    doc.text('Act-wise Performance', 20, yPos);
    yPos += 15;
    
    const actHeaders = [['Act Type', 'Applications', 'Disbursements', 'Amount', 'Success Rate']];
    const actData = [
      [
        'PCR Act',
        analyticsData.actWiseBreakdown.pcr.applications.toString(),
        analyticsData.actWiseBreakdown.pcr.disbursements.toString(),
        `₹${(analyticsData.actWiseBreakdown.pcr.amount / 100000).toFixed(2)}L`,
        `${analyticsData.actWiseBreakdown.pcr.successRate.toFixed(1)}%`
      ],
      [
        'PoA Act',
        analyticsData.actWiseBreakdown.poa.applications.toString(),
        analyticsData.actWiseBreakdown.poa.disbursements.toString(),
        `₹${(analyticsData.actWiseBreakdown.poa.amount / 100000).toFixed(2)}L`,
        `${analyticsData.actWiseBreakdown.poa.successRate.toFixed(1)}%`
      ]
    ];
    
    autoTable(doc, {
      head: actHeaders,
      body: actData,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save('performance-analytics-report.pdf');
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
      
      {/* Header Section - Real-time Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-blue-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium theme-text-secondary">
              {t('extracted.live_tracking')} • {t('extracted.analytics')} {t('extracted.monitoring_center')}
            </span>
          </div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            {t('extracted.analytics')} <span className="text-accent-gradient">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="theme-text-secondary max-w-2xl">{t('extracted.comprehensive_insights_and_performance_metrics_for_dbt_under')}</p>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 theme-text-primary hover:shadow-md transition-shadow"
            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('extracted.export_data')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('extracted.refresh_data')}</span>
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
            <span className="text-sm font-medium theme-text-primary">{t('extracted.time_period')} </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'week', labelKey: 'extracted.last_week' },
              { value: 'month', labelKey: 'extracted.last_month' },
              { value: 'quarter', labelKey: 'extracted.last_quarter' },
              { value: 'year', labelKey: 'extracted.last_year' },
              { value: 'custom', labelKey: 'extracted.custom_range' }
            ].map((period) => (
              <motion.button
                key={period.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(period.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  timeRange === period.value 
                    ? 'accent-gradient text-white' 
                    : 'theme-bg-glass theme-text-muted border theme-border-glass'
                }`}
                style={timeRange !== period.value && theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
              >
                {t(period.labelKey)}
              </motion.button>
            ))}
          </div>
          {timeRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row gap-3 mt-2"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium theme-text-muted">{t('extracted.start_date')}</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm theme-bg-glass theme-text-primary border theme-border-glass focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium theme-text-muted">{t('extracted.end_date')}</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm theme-bg-glass theme-text-primary border theme-border-glass focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Analytics Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Mode & Chart Type */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 theme-text-muted" />
              <span className="text-sm font-medium theme-text-primary">{t('extracted.view_mode')}</span>
            </div>
            <div className="flex gap-1">
              {[
                { value: 'grid', label: 'Grid', icon: Layers },
                { value: 'list', label: 'List', icon: FileText },
                { value: 'compact', label: 'Compact', icon: Target }
              ].map((mode) => (
                <motion.button
                  key={mode.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(mode.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    viewMode === mode.value
                      ? 'accent-gradient text-white'
                      : 'theme-bg-glass theme-text-muted border theme-border-glass'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  {mode.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 theme-text-muted" />
              <span className="text-sm font-medium theme-text-primary">{t('extracted.chart_type')}</span>
            </div>
            <div className="flex gap-1">
              {[
                { value: 'bar', label: 'Bar', icon: BarChart3 },
                { value: 'line', label: 'Line', icon: Activity },
                { value: 'area', label: 'Area', icon: TrendingUp },
                { value: 'pie', label: 'Pie', icon: PieChart }
              ].map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChartType(type.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    chartType === type.value
                      ? 'accent-gradient text-white'
                      : 'theme-bg-glass theme-text-muted border theme-border-glass'
                  }`}
                >
                  <type.icon className="w-3 h-3" />
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                showFilters
                  ? 'accent-gradient text-white'
                  : 'theme-bg-glass theme-text-muted border theme-border-glass'
              }`}
            >
              <Filter className="w-3 h-3" />
              {t('extracted.filters')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                autoRefresh
                  ? 'accent-gradient text-white'
                  : 'theme-bg-glass theme-text-muted border theme-border-glass'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              {t('extracted.auto_refresh')}
            </motion.button>

            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 theme-text-muted" />
              <select className="px-3 py-1.5 rounded-lg text-xs theme-bg-glass theme-text-primary border theme-border-glass focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pdf">{t('extracted.export_pdf')}</option>
                <option value="csv">{t('extracted.export_csv')}</option>
                <option value="excel">{t('extracted.export_excel')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t theme-border-glass"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* State Filter */}
                <div>
                  <label className="text-xs font-medium theme-text-muted mb-2 block">{t('extracted.filter_by_state')}</label>
                  <div className="flex flex-wrap gap-1">
                    {analyticsData.stateWiseData.slice(0, 5).map((state: any) => (
                      <motion.button
                        key={state.state}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedStates(prev =>
                            prev.includes(state.state)
                              ? prev.filter(s => s !== state.state)
                              : [...prev, state.state]
                          );
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedStates.includes(state.state)
                            ? 'accent-gradient text-white'
                            : 'theme-bg-glass theme-text-muted border theme-border-glass'
                        }`}
                      >
                        {state.state}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Act Type Filter */}
                <div>
                  <label className="text-xs font-medium theme-text-muted mb-2 block">{t('extracted.filter_by_act')}</label>
                  <div className="flex gap-1">
                    {['PCR Act', 'PoA Act'].map((act) => (
                      <motion.button
                        key={act}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedActs(prev =>
                            prev.includes(act)
                              ? prev.filter(a => a !== act)
                              : [...prev, act]
                          );
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedActs.includes(act)
                            ? 'accent-gradient text-white'
                            : 'theme-bg-glass theme-text-muted border theme-border-glass'
                        }`}
                      >
                        {act}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="text-xs font-medium theme-text-muted mb-2 block">{t('extracted.sort_by')}</label>
                  <div className="flex gap-1">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2 py-1 rounded text-xs theme-bg-glass theme-text-primary border theme-border-glass focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="applications">{t('extracted.applications')}</option>
                      <option value="disbursements">{t('extracted.disbursements')}</option>
                      <option value="successRate">{t('extracted.success_rate')}</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-2 py-1 rounded text-xs theme-bg-glass theme-text-muted border theme-border-glass"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              style={{
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined
              }}
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
              <p className="text-sm theme-text-muted">{t(indicator.labelKey)}</p>
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
          { labelKey: 'extracted.total_applications', value: formatNumber(analyticsData.overview.totalApplications), icon: FileText, color: 'from-blue-500 to-cyan-500' },
          { labelKey: 'extracted.beneficiaries', value: formatNumber(analyticsData.overview.totalBeneficiaries), icon: Users, color: 'from-green-500 to-emerald-500' },
          { labelKey: 'extracted.disbursements', value: formatNumber(analyticsData.overview.totalDisbursements), icon: Banknote, color: 'from-purple-500 to-pink-500' },
          { labelKey: 'extracted.amount_disbursed', value: formatCurrency(analyticsData.overview.totalAmount), icon: DollarSign, color: 'from-amber-500 to-orange-500' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl text-center"
            style={{
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined
            }}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 mx-auto`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold theme-text-primary">{stat.value}</p>
            <p className="text-sm theme-text-muted">{t(stat.labelKey)}</p>
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
              <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.monthly_trends')} </h3>
              <p className="text-sm theme-text-muted">{t('extracted.applications_vs_disbursements')} </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs theme-text-muted">{t('extracted.applications')} </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs theme-text-muted">{t('extracted.disbursements')} </span>
              </div>
            </div>
          </div>
          <div className="h-48 sm:h-64 overflow-x-auto">
            {chartType === 'bar' && (
              <div className="flex items-end gap-1 h-full">
                {analyticsData.monthlyTrends.labels.map((month, index) => {
                  const appHeight = analyticsData.monthlyTrends.applications[index] > 0 ? (analyticsData.monthlyTrends.applications[index] / Math.max(...analyticsData.monthlyTrends.applications.filter(v => v > 0))) * 100 : 0;
                  const disbHeight = analyticsData.monthlyTrends.disbursements[index] > 0 ? (analyticsData.monthlyTrends.disbursements[index] / Math.max(...analyticsData.monthlyTrends.disbursements.filter(v => v > 0))) * 100 : 0;

                  return (
                    <div key={month} className="flex flex-col items-center min-w-[64px] sm:flex-1 sm:min-w-0 flex-shrink-0">
                      <div className="flex items-end justify-center w-full h-24 sm:h-48 gap-1 mb-2">
                        <motion.div
                          className="w-1/2 bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${appHeight}%` }}
                          whileHover={{ scale: 1.05 }}
                          title={`${t('extracted.applications')}: ${analyticsData.monthlyTrends.applications[index]}`}
                        ></motion.div>
                        <motion.div
                          className="w-1/2 bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600"
                          style={{ height: `${disbHeight}%` }}
                          whileHover={{ scale: 1.05 }}
                          title={`${t('extracted.disbursements')}: ${analyticsData.monthlyTrends.disbursements[index]}`}
                        ></motion.div>
                      </div>
                      <span className="text-xs theme-text-muted">{month}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {chartType === 'line' && (
              <div className="relative h-full">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Applications line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={analyticsData.monthlyTrends.labels.map((_, index) => {
                      const x = (index / (analyticsData.monthlyTrends.labels.length - 1)) * 360 + 20;
                      const maxApp = Math.max(...analyticsData.monthlyTrends.applications);
                      const y = maxApp > 0 ? 180 - (analyticsData.monthlyTrends.applications[index] / maxApp) * 140 : 180;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Disbursements line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points={analyticsData.monthlyTrends.labels.map((_, index) => {
                      const x = (index / (analyticsData.monthlyTrends.labels.length - 1)) * 360 + 20;
                      const maxDisb = Math.max(...analyticsData.monthlyTrends.disbursements);
                      const y = maxDisb > 0 ? 180 - (analyticsData.monthlyTrends.disbursements[index] / maxDisb) * 140 : 180;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Month labels */}
                  {analyticsData.monthlyTrends.labels.map((month, index) => (
                    <text
                      key={month}
                      x={(index / (analyticsData.monthlyTrends.labels.length - 1)) * 360 + 20}
                      y="195"
                      textAnchor="middle"
                      className="text-xs fill-current theme-text-muted"
                    >
                      {month}
                    </text>
                  ))}
                </svg>
              </div>
            )}

            {chartType === 'area' && (
              <div className="relative h-full">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Applications area */}
                  <defs>
                    <linearGradient id="appGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                    </linearGradient>
                    <linearGradient id="disbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>

                  {/* Applications area */}
                  <polygon
                    fill="url(#appGradient)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={`20,180 ${analyticsData.monthlyTrends.labels.map((_, index) => {
                      const x = (index / (analyticsData.monthlyTrends.labels.length - 1)) * 360 + 20;
                      const maxApp = Math.max(...analyticsData.monthlyTrends.applications);
                      const y = maxApp > 0 ? 180 - (analyticsData.monthlyTrends.applications[index] / maxApp) * 140 : 180;
                      return `${x},${y}`;
                    }).join(' ')} 380,180`}
                  />

                  {/* Disbursements area */}
                  <polygon
                    fill="url(#disbGradient)"
                    stroke="#10b981"
                    strokeWidth="2"
                    points={`20,180 ${analyticsData.monthlyTrends.labels.map((_, index) => {
                      const x = (index / (analyticsData.monthlyTrends.labels.length - 1)) * 360 + 20;
                      const maxDisb = Math.max(...analyticsData.monthlyTrends.disbursements);
                      const y = maxDisb > 0 ? 180 - (analyticsData.monthlyTrends.disbursements[index] / maxDisb) * 140 : 180;
                      return `${x},${y}`;
                    }).join(' ')} 380,180`}
                  />

                  {/* Month labels */}
                  {analyticsData.monthlyTrends.labels.map((month, index) => (
                    <text
                      key={month}
                      x={(index / (analyticsData.monthlyTrends.labels.length - 1)) * 360 + 20}
                      y="195"
                      textAnchor="middle"
                      className="text-xs fill-current theme-text-muted"
                    >
                      {month}
                    </text>
                  ))}
                </svg>
              </div>
            )}

            {chartType === 'pie' && (
              <div className="flex items-center justify-center h-full">
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {(() => {
                      const totalApps = analyticsData.monthlyTrends.applications.reduce((a, b) => a + b, 0);
                      const totalDisbs = analyticsData.monthlyTrends.disbursements.reduce((a, b) => a + b, 0);
                      const total = totalApps + totalDisbs;
                      const appAngle = total > 0 ? (totalApps / total) * 360 : 0;
                      const disbAngle = total > 0 ? (totalDisbs / total) * 360 : 0;

                      return (
                        <>
                          {/* Applications slice */}
                          <path
                            d={`M 100 100 L 100 20 A 80 80 0 ${appAngle > 180 ? 1 : 0} 1 ${100 + 80 * Math.sin((appAngle * Math.PI) / 180)} ${100 - 80 * Math.cos((appAngle * Math.PI) / 180)} Z`}
                            fill="#3b82f6"
                          />
                          {/* Disbursements slice */}
                          <path
                            d={`M 100 100 L ${100 + 80 * Math.sin((appAngle * Math.PI) / 180)} ${100 - 80 * Math.cos((appAngle * Math.PI) / 180)} A 80 80 0 ${disbAngle > 180 ? 1 : 0} 1 100 20 Z`}
                            fill="#10b981"
                          />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold theme-text-primary">
                        {analyticsData.monthlyTrends.applications.reduce((a, b) => a + b, 0) + analyticsData.monthlyTrends.disbursements.reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-xs theme-text-muted">{t('extracted.total')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.actwise_performance')} </h3>
              <p className="text-sm theme-text-muted">{t('extracted.pcr_act_vs_poa_act')} </p>
            </div>
            <PieChart className="w-5 h-5 theme-text-muted" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
                <div className="relative inline-block mb-4">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg font-bold">
                    {analyticsData.overview.totalApplications > 0 ? Math.round((analyticsData.actWiseBreakdown.pcr.applications / analyticsData.overview.totalApplications) * 100) : 0}%
                  </span>
                </div>
              </div>
              <h4 className="font-semibold theme-text-primary mb-1">{t('extracted.pcr_act')} </h4>
              <p className="text-sm theme-text-muted">{formatNumber(analyticsData.actWiseBreakdown.pcr.applications)} {t('extracted.applications')}</p>
              <p className="text-sm theme-text-muted">{formatNumber(analyticsData.actWiseBreakdown.pcr.disbursements)} {t('extracted.disbursed')}</p>
              <p className="text-sm font-medium text-green-500">{analyticsData.actWiseBreakdown.pcr.successRate.toFixed(1)}% {t('extracted.success')}</p>
            </div>
            <div className="text-center">
                <div className="relative inline-block mb-4">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg font-bold">
                    {analyticsData.overview.totalApplications > 0 ? Math.round((analyticsData.actWiseBreakdown.poa.applications / analyticsData.overview.totalApplications) * 100) : 0}%
                  </span>
                </div>
              </div>
              <h4 className="font-semibold theme-text-primary mb-1">{t('extracted.poa_act')} </h4>
              <p className="text-sm theme-text-muted">{formatNumber(analyticsData.actWiseBreakdown.poa.applications)} {t('extracted.applications')}</p>
              <p className="text-sm theme-text-muted">{formatNumber(analyticsData.actWiseBreakdown.poa.disbursements)} {t('extracted.disbursed')}</p>
              <p className="text-sm font-medium text-green-500">{analyticsData.actWiseBreakdown.poa.successRate.toFixed(1)}% {t('extracted.success')}</p>
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
              <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.statewise_performance_1')} </h3>
              <p className="text-sm theme-text-muted">{t('extracted.top_performing_states')} </p>
            </div>
            <MapIcon className="w-5 h-5 theme-text-muted" />
          </div>
          <div className="space-y-4">
            {analyticsData.stateWiseData.map((state, index) => (
              <div key={state.state} className="flex items-center justify-between p-3 rounded-lg theme-bg-glass">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium theme-text-primary">{state.state}</p>
                    <p className="text-xs theme-text-muted">{state.applications} {t('extracted.applications_lowercase')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold theme-text-primary">{state.disbursements} {t('extracted.disbursed_lowercase')}</p>
                  <p className="text-xs theme-text-muted">{state.successRate}% {t('extracted.success_lowercase')}</p>
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
              <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.categorywise_distribution_1')} </h3>
              <p className="text-sm theme-text-muted">{t('extracted.beneficiary_categories')} </p>
            </div>
            <Users className="w-5 h-5 theme-text-muted" />
          </div>
          <div className="space-y-4">
            {Object.entries(analyticsData.categoryWiseData).map(([category, count]) => {
              const percentage = analyticsData.overview.totalBeneficiaries > 0 ? (count / analyticsData.overview.totalBeneficiaries) * 100 : 0;
              return (
                <div key={category} className="p-3 rounded-lg theme-bg-glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium theme-text-primary">{category}</span>
                    <span className="text-sm theme-text-muted">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full accent-gradient"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs theme-text-muted mt-2">
                    <span>{formatNumber(count)} {t('extracted.beneficiaries_lowercase')}</span>
                    <span>{category} Category</span>
                  </div>
                </div>
              );
            })}
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
            <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.performance_metrics_1')} </h3>
            <p className="text-sm theme-text-muted">{t('extracted.key_operational_indicators')} </p>
          </div>
          <Activity className="w-5 h-5 theme-text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              labelKey: 'extracted.total_pending',
              value: formatNumber(analyticsData.overview.pendingApplications),
              icon: ClockIcon,
              color: 'text-amber-500'
            },
            {
              labelKey: 'extracted.total_rejected',
              value: formatNumber(analyticsData.overview.rejectedApplications),
              icon: XCircle,
              color: 'text-red-500'
            },
            {
              labelKey: 'extracted.pcr_ratio',
              value: `${analyticsData.overview.totalApplications > 0 ? ((analyticsData.actWiseBreakdown.pcr.applications / analyticsData.overview.totalApplications) * 100).toFixed(1) : 0}%`,
              icon: Scale,
              color: 'text-blue-500'
            },
            {
              labelKey: 'extracted.poa_ratio',
              value: `${analyticsData.overview.totalApplications > 0 ? ((analyticsData.actWiseBreakdown.poa.applications / analyticsData.overview.totalApplications) * 100).toFixed(1) : 0}%`,
              icon: Users,
              color: 'text-purple-500'
            },
            {
              labelKey: 'extracted.success_rate',
              value: `${analyticsData.overview.successRate.toFixed(1)}%`,
              icon: CheckCircle,
              color: 'text-green-500'
            }
          ].map((metric, idx) => (
            <div key={idx} className="text-center p-4 rounded-lg theme-bg-glass">
              <metric.icon className={`w-8 h-8 mx-auto mb-2 ${metric.color}`} />
              <p className="text-lg font-bold theme-text-primary mb-1">{metric.value}</p>
              <p className="text-xs theme-text-muted">{t(metric.labelKey)}</p>
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
        style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined
        }}
      >
        <div className="p-6 border-b theme-border-glass">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.top_performing_districts')} </h3>
              <p className="text-sm theme-text-muted">{t('extracted.districts_with_highest_disbursement_rates')} </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF}
                className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border flex items-center gap-2 theme-text-primary hover:bg-blue-500/10"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">{t('extracted.export')}</span>
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="text-sm theme-text-muted">{t('extracted.show')}</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 rounded text-xs theme-bg-glass theme-text-primary border theme-border-glass focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm theme-text-muted">{t('extracted.per_page')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="theme-bg-glass border-b theme-border-glass">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">{t('extracted.rank')} </th>
                <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary cursor-pointer hover:theme-text-primary" onClick={() => {
                  setSortBy('district');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  <div className="flex items-center gap-1">
                    {t('extracted.district')}
                    {sortBy === 'district' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">{t('extracted.state')} </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary cursor-pointer hover:theme-text-primary" onClick={() => {
                  setSortBy('applications');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  <div className="flex items-center gap-1">
                    {t('extracted.applications')}
                    {sortBy === 'applications' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary cursor-pointer hover:theme-text-primary" onClick={() => {
                  setSortBy('disbursements');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  <div className="flex items-center gap-1">
                    {t('extracted.disbursements')}
                    {sortBy === 'disbursements' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary cursor-pointer hover:theme-text-primary" onClick={() => {
                  setSortBy('successRate');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  <div className="flex items-center gap-1">
                    {t('extracted.success_rate')}
                    {sortBy === 'successRate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">{t('extracted.actions')} </th>
              </tr>
            </thead>
            <tbody>
              {sortedDistricts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((district, idx) => (
                <motion.tr
                  key={district.district}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium theme-text-primary">{district.district}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary">{district.state}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm theme-text-primary">{district.applications}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm theme-text-primary">{district.disbursements}</td>
                  <td className="hidden lg:table-cell px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      district.successRate >= 80 ? 'bg-green-100 text-green-800' :
                      district.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {district.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors border theme-border-glass"
                        title={t('extracted.view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg theme-bg-glass hover:bg-blue-500 hover:text-white transition-colors border theme-border-glass"
                        title={t('extracted.export_data')}
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t theme-border-glass flex items-center justify-between">
            <div className="text-sm theme-text-muted">
              {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, sortedDistricts.length)} {t('extracted.of')} {sortedDistricts.length} {t('extracted.entries')}
            </div>
            <div className="flex gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded text-sm theme-bg-glass theme-text-primary border theme-border-glass disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('extracted.previous')}
              </motion.button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm border ${
                      currentPage === pageNum
                        ? 'accent-gradient text-white'
                        : 'theme-bg-glass theme-text-primary theme-border-glass'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded text-sm theme-bg-glass theme-text-primary border theme-border-glass disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('extracted.next')}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Report Generation Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
        style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.generate_custom_reports')} </h3>
            <p className="text-sm theme-text-muted">{t('extracted.create_detailed_reports_for_analysis_and_compliance')} </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateMonthlyReport}
              className="w-full sm:w-auto px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 justify-center theme-text-primary"
              style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
            >
              <FileText className="w-4 h-4" />
              <span>{t('extracted.monthly_report')} </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generatePerformanceReport}
              className="w-full sm:w-auto px-4 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 justify-center theme-text-primary"
              style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('extracted.performance_report')} </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="w-full sm:w-auto px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 justify-center"
            >
              <Download className="w-4 h-4" />
              <span>{t('extracted.export_all_data')} </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;