"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import {
  Search, Download, Eye, X, FileText, DollarSign, TrendingUp,
  Shield, CheckCircle,
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
  Plus,
  MoreVertical,
  Edit
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, serverTimestamp, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '@/lib/firebase';

// Report type definition
type Report = {
  id: string;
  name: string;
  type: string;
  category: string;
  frequency: string;
  status: 'completed' | 'processing' | 'scheduled' | 'failed';
  fileSize: string | null;
  fileFormat: string;
  generatedDate: string | null;
  generatedBy: string | null;
  schedule: any;
  lastRun: string | null;
  nextRun: string | null;
  recordCount: number | null;
  description: string;
  parameters: any;
  downloadCount: number;
  isScheduled: boolean;
  recipients: string[];
  columns: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Firestore-backed reports hook
const useFirestoreReports = (setState: React.Dispatch<React.SetStateAction<Report[]>>) => {
  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Report[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const toIso = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v ? String(v) : null);
        
        return {
          id: d.id,
          name: data.name || 'Unnamed Report',
          type: data.type || 'general',
          category: data.category || 'analytical',
          frequency: data.frequency || 'once',
          status: data.status || 'completed',
          fileSize: data.fileSize || null,
          fileFormat: data.fileFormat || 'PDF',
          generatedDate: toIso(data.generatedDate),
          generatedBy: data.generatedBy,
          schedule: data.schedule || null,
          lastRun: toIso(data.lastRun),
          nextRun: toIso(data.nextRun),
          recordCount: data.recordCount || null,
          description: data.description || '',
          parameters: data.parameters || {},
          downloadCount: data.downloadCount || 0,
          isScheduled: data.isScheduled || false,
          recipients: data.recipients || [],
          columns: data.columns || [],
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt)
        };
      });
      setState(items);
    });
    return () => unsub();
  }, [setState]);
};

// New Report Form
const NewReportForm = ({ onClose, onCreated, initialData }: { onClose: () => void; onCreated?: (r: Report) => void; initialData?: Report | null }) => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [type, setType] = useState('disbursement');
  const [category, setCategory] = useState('financial');
  const [frequency, setFrequency] = useState('once');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('PDF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { value: 'disbursement', label: t('extracted.report_type_disbursement') },
    { value: 'verification', label: t('extracted.report_type_verification') },
    { value: 'grievance', label: t('extracted.report_type_grievance') },
    { value: 'financial', label: t('extracted.report_type_financial') },
    { value: 'performance', label: t('extracted.report_type_performance') },
    { value: 'analytical', label: t('extracted.report_type_analytical') }
  ];

  const categories = [
    { value: 'financial', label: t('extracted.category_financial') },
    { value: 'compliance', label: t('extracted.category_compliance') },
    { value: 'performance', label: t('extracted.category_performance') },
    { value: 'statistical', label: t('extracted.category_statistical') },
    { value: 'analytical', label: t('extracted.category_analytical') },
    { value: 'technical', label: t('extracted.category_technical') }
  ];

  const frequencies = [
    { value: 'once', label: t('extracted.frequency_once') },
    { value: 'daily', label: t('extracted.frequency_daily') },
    { value: 'weekly', label: t('extracted.frequency_weekly') },
    { value: 'monthly', label: t('extracted.frequency_monthly') },
    { value: 'quarterly', label: t('extracted.frequency_quarterly') }
  ];

  const formats = [
    { value: 'PDF', label: t('extracted.format_pdf') },
    { value: 'Excel', label: t('extracted.format_excel') },
    { value: 'CSV', label: t('extracted.format_csv') }
  ];

  // Prefill when editing
  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name || '');
    setType(initialData.type || 'disbursement');
    setCategory(initialData.category || 'financial');
    setFrequency(initialData.frequency || 'once');
    setDescription(initialData.description || '');
    setFormat(initialData.fileFormat || 'PDF');
  }, [initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(t('extracted.report_name_required') || 'Report name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseData: any = {
        name: name.trim(),
        type,
        category,
        frequency,
        description: description.trim(),
        fileFormat: format,
        status: 'processing',
        downloadCount: 0,
        isScheduled: frequency !== 'once',
        parameters: {},
        recipients: [],
        columns: [],
        lastUpdated: serverTimestamp()
      };

      if (initialData && initialData.id) {
        // Update existing report
        await updateDoc(doc(db, 'reports', initialData.id), baseData);
        const updated: Report = { ...initialData, ...baseData, updatedAt: new Date().toISOString() };
        onCreated?.(updated);
        onClose();
      } else {
        // Create new report
        const newId = `REP-${Date.now()}`;
        const payload = {
          ...baseData,
          createdAt: serverTimestamp(),
          generatedDate: serverTimestamp(),
          generatedBy: 'System',
          fileSize: null,
          recordCount: null,
          schedule: frequency !== 'once' ? {
            frequency,
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            recipients: [],
            format
          } : null
        };

        await setDoc(doc(db, 'reports', newId), payload);
        
        const created: Report = {
          id: newId,
          name: payload.name,
          type: payload.type,
          category: payload.category,
          frequency: payload.frequency,
          status: payload.status,
          fileSize: payload.fileSize,
          fileFormat: payload.fileFormat,
          generatedDate: new Date().toISOString(),
          generatedBy: payload.generatedBy,
          schedule: payload.schedule,
          lastRun: payload.lastRun,
          nextRun: payload.nextRun,
          recordCount: payload.recordCount,
          description: payload.description,
          parameters: payload.parameters,
          downloadCount: payload.downloadCount,
          isScheduled: payload.isScheduled,
          recipients: payload.recipients,
          columns: payload.columns,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        onCreated?.(created);
        onClose();
      }
    } catch (err) {
      console.error('Create report failed', err);
      setError(t('extracted.create_failed') || 'Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm font-medium theme-text-muted block mb-2">
            {t('extracted.report_name') || 'Report Name'}
          </label>
          <input
            placeholder={t('extracted.report_name_placeholder') || 'Enter report name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">
            {t('extracted.report_type') || 'Report Type'}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${
              theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'
            }`}
          >
            {reportTypes.map(rt => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">
            {t('extracted.category') || 'Category'}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${
              theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'
            }`}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">
            {t('extracted.frequency') || 'Frequency'}
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${
              theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'
            }`}
          >
            {frequencies.map(freq => (
              <option key={freq.value} value={freq.value}>{freq.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium theme-text-muted block mb-2">
            {t('extracted.format') || 'Format'}
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${
              theme === 'light' ? 'bg-white text-gray-800 border' : 'bg-[#0b1220] text-slate-100 border border-gray-700'
            }`}
          >
            {formats.map(fmt => (
              <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium theme-text-muted block mb-2">
            {t('extracted.description') || 'Description'}
          </label>
          <textarea
            placeholder={t('extracted.description_placeholder') || 'Enter report description'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-cancel">
          {t('extracted.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg accent-gradient text-white font-semibold shadow"
        >
          {isSubmitting
            ? t('extracted.saving') || 'Saving...'
            : initialData
            ? t('extracted.save') || 'Save'
            : t('extracted.create_report') || 'Create Report'
          }
        </button>
      </div>
    </form>
  );
};

const ReportsPage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('all');
  const [statusFilter] = useState('all');
  const [categoryFilter] = useState('all');
  const [frequencyFilter] = useState('all');
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<'reports' | 'templates' | 'scheduled'>('reports');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to Firestore reports collection
  useFirestoreReports(setReports);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

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

      // Handle null/undefined consistently
      if (aNull && bNull) return 0;
      if (aNull) return sortOrder === 'asc' ? 1 : -1;
      if (bNull) return sortOrder === 'asc' ? -1 : 1;

      // If both can be parsed as valid dates, compare by timestamp
      const aTime = Date.parse(String(aVal));
      const bTime = Date.parse(String(bVal));
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // Fallback to string comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc'
        ? aStr.localeCompare(bStr, undefined, { numeric: true })
        : bStr.localeCompare(aStr, undefined, { numeric: true });
    });

    return filtered;
  }, [reports, searchQuery, typeFilter, statusFilter, categoryFilter, frequencyFilter, viewMode, sortBy, sortOrder]);

  // Pagination
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const processing = reports.filter(r => r.status === 'processing').length;
    const scheduled = reports.filter(r => r.status === 'scheduled').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0);
    const avgProcessingTime = 2.3;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      processing,
      scheduled,
      failed,
      totalDownloads,
      avgProcessingTime,
      successRate
    };
  }, [reports]);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      'financial': reports.filter(r => r.category === 'financial').length,
      'compliance': reports.filter(r => r.category === 'compliance').length,
      'performance': reports.filter(r => r.category === 'performance').length,
      'statistical': reports.filter(r => r.category === 'statistical').length,
      'analytical': reports.filter(r => r.category === 'analytical').length,
      'technical': reports.filter(r => r.category === 'technical').length
    };
  }, [reports]);

  // Recent Activities
  const recentActivities = useMemo(() => {
    // Helper function to format time ago
    const formatTimeAgo = (dateString: string) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    };

    const activities: Array<{
      action: string;
      user: string;
      time: string;
      status: 'success' | 'info' | 'error';
      timestamp: number;
    }> = [];

    // Add activities based on reports
    reports.forEach(report => {
      // Report creation
      if (report.createdAt) {
        activities.push({
          action: `${report.name} report created`,
          user: report.generatedBy || 'System',
          time: formatTimeAgo(report.createdAt),
          status: 'info',
          timestamp: new Date(report.createdAt).getTime()
        });
      }

      // Report completion
      if (report.status === 'completed' && report.generatedDate) {
        activities.push({
          action: `${report.name} report generated`,
          user: report.generatedBy || 'System',
          time: formatTimeAgo(report.generatedDate),
          status: 'success',
          timestamp: new Date(report.generatedDate).getTime()
        });
      }

      // Report failure
      if (report.status === 'failed' && report.updatedAt) {
        activities.push({
          action: `${report.name} report failed`,
          user: 'System',
          time: formatTimeAgo(report.updatedAt),
          status: 'error',
          timestamp: new Date(report.updatedAt).getTime()
        });
      }
    });

    // Sort by timestamp (most recent first) and take last 3
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  }, [reports]);

  // Three.js canvas background
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

  const formatFileSize = (size: string | null) => {
    return size || '--';
  };

  const handleDownload = async (reportId: string) => {
    try {
      // Update download count
      await updateDoc(doc(db, 'reports', reportId), {
        downloadCount: (reports.find(r => r.id === reportId)?.downloadCount || 0) + 1,
        lastUpdated: serverTimestamp()
      });
      
      // In a real app, this would trigger the actual file download
      console.log(`Downloading report: ${reportId}`);
      // Show download progress/notification
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleScheduleReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
    }
  };

  // Export utilities
  const exportReportsData = (items: Report[]) => {
    const headers = [
      'Report ID',
      'Name',
      'Type',
      'Category',
      'Status',
      'File Format',
      'File Size',
      'Generated Date',
      'Generated By',
      'Record Count',
      'Download Count',
      'Frequency',
      'Is Scheduled'
    ];

    const rows = items.map(r => [
      r.id,
      r.name,
      r.type,
      r.category,
      r.status,
      r.fileFormat,
      r.fileSize || '',
      r.generatedDate || '',
      r.generatedBy || '',
      r.recordCount?.toString() || '',
      r.downloadCount.toString(),
      r.frequency,
      r.isScheduled ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${(field ?? '')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReportsPDF = (items: Report[]) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 56, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Reports Export', margin, 36);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Total: ${items.length}`, pageWidth - margin, 44, { align: 'right' });

    const head = [[
      'Report ID', 'Name', 'Type', 'Category', 'Status', 'Format', 'Records', 'Downloads'
    ]];

    const body: any[] = [];
    items.forEach(r => {
      body.push([
        r.id,
        r.name,
        r.type,
        r.category,
        r.status,
        r.fileFormat,
        r.recordCount || '--',
        r.downloadCount.toString()
      ]);
    });

    autoTable(doc, {
      head,
      body,
      startY: 70,
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', cellWidth: 'wrap' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 251] },
      margin: { left: margin, right: margin, top: 70 },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 120 },
        2: { cellWidth: 80 },
        3: { cellWidth: 80 },
        4: { cellWidth: 70 },
        5: { cellWidth: 50 },
        6: { cellWidth: 50 },
        7: { cellWidth: 50 }
      }
    });

    doc.save(`reports_export_${new Date().toISOString().split('T')[0]}.pdf`);
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
        
        .btn-cancel {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        [data-theme="light"] .btn-cancel:hover {
          background: rgba(0,0,0,0.04);
        }
        [data-theme="dark"] .btn-cancel:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>

      {/* Header Section - Real-time Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-indigo-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium theme-text-secondary">
              {t('extracted.live_tracking')} • {t('extracted.report_hub')}
            </span>
          </div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            {t('extracted.report_hub')} <span className="text-accent-gradient inline-block leading-normal ml-2">{t('extracted.monitoring_center')}</span>
          </h1>
          <p className="theme-text-secondary max-w-2xl mx-auto lg:mx-0">
            {t('extracted.generate_analyze_schedule_comprehensive_reports')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExportModal(true)}
              aria-label={t('extracted.export_data_1')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border flex items-center gap-3 glass-effect focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme === 'light' ? 'bg-white text-gray-800 border-gray-200' : 'theme-bg-glass theme-border-glass text-white'}`}
            >
              <Download className={`w-5 h-5 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`} />
              <span className="font-semibold text-sm">{t('extracted.export_data')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewReportModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-3 shadow-xl"
            >
              <FilePlus className="w-5 h-5" />
              <span className="font-semibold text-sm">{t('extracted.generate_report')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* New Report Modal */}
      <AnimatePresence>
        {showNewReportModal && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 mb-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold theme-text-primary">
                  {selectedReport ? (t('extracted.edit_report') || 'Edit Report') : (t('extracted.new_report') || 'New Report')}
                </h3>
                <p className="text-sm theme-text-muted">
                  {selectedReport ? (t('extracted.edit_report_description') || 'Edit the report details and save changes.') : (t('extracted.new_report_description') || 'Create a new report with custom parameters.')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowNewReportModal(false); setSelectedReport(null); }} className="btn-cancel text-sm">
                  <X className="w-4 h-4 inline-block" /> <span>{t('extracted.cancel')}</span>
                </button>
              </div>
            </div>
            <NewReportForm
              initialData={selectedReport}
              onClose={() => { setShowNewReportModal(false); setSelectedReport(null); }}
              onCreated={(r) => { setSelectedReport(r); setShowNewReportModal(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              className="relative w-full max-w-3xl mx-4 p-6 rounded-xl theme-border-glass border shadow-lg"
              style={{ background: theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(6,8,20,0.98)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary flex items-center gap-3">
                    <Download className="w-5 h-5 text-accent-gradient" />
                    {t('extracted.export') || 'Export Data'}
                  </h3>
                  <p className="text-sm theme-text-muted mt-1">{t('extracted.exportDescription') || 'Export reports as CSV or a printable PDF report.'}</p>
                </div>
                <button onClick={() => setShowExportModal(false)} aria-label="Close export modal" className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors">
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`rounded-lg p-4 border ${theme === 'light' ? 'bg-white' : 'bg-gray-900/90'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold theme-text-primary">{t('extracted.exportAll') || 'Export All'}</h4>
                          <p className="text-xs theme-text-muted">{t('extracted.exportAllDescription') || 'Download the full reports dataset in the chosen format.'}</p>
                        </div>
                      </div>
                      <p className="text-sm theme-text-muted">{reports.length} {t('extracted.reports') || 'reports'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => { exportReportsData(reports); setShowExportModal(false); }} className="px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary">CSV</button>
                      <button onClick={() => { exportReportsPDF(reports); setShowExportModal(false); }} className="px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow">PDF</button>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 border ${theme === 'light' ? 'bg-white' : 'bg-gray-900/90'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold theme-text-primary">{t('extracted.exportFiltered') || 'Export Filtered'}</h4>
                          <p className="text-xs theme-text-muted">{t('extracted.exportFilteredDescription') || 'Download only the results matching your current filters.'}</p>
                        </div>
                      </div>
                      <p className="text-sm theme-text-muted">{filteredReports.length} {t('extracted.reports') || 'reports'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button disabled={filteredReports.length === 0} onClick={() => { exportReportsData(filteredReports); setShowExportModal(false); }} className="px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed">CSV</button>
                      <button disabled={filteredReports.length === 0} onClick={() => { exportReportsPDF(filteredReports); setShowExportModal(false); }} className="px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow disabled:opacity-50">PDF</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Detail Section */}
      {selectedReport && (
        <motion.section
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-4 mb-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center text-white shadow-lg">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold theme-text-primary">{selectedReport.name}</h2>
                  <span className={`px-3 py-1 ${getStatusColor(selectedReport.status)} text-sm font-bold rounded-full`}>
                    {selectedReport.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="theme-text-muted text-lg">{selectedReport.id}</p>
                  <span className="text-sm theme-text-muted">•</span>
                  <p className="theme-text-muted">{selectedReport.category} • {selectedReport.frequency}</p>
                  <span className="text-sm theme-text-muted">•</span>
                  <p className="theme-text-muted">Generated: {formatDateTime(selectedReport.generatedDate)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedReport(null)} className="btn-cancel">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                  <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.report_details')}</h4>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.type')}:</strong> {selectedReport.type}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.category')}:</strong> {selectedReport.category}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.frequency')}:</strong> {selectedReport.frequency}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.format')}:</strong> {selectedReport.fileFormat}</p>
                </div>

                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                  <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.generation_info')}</h4>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.generated_by')}:</strong> {selectedReport.generatedBy || t('extracted.system')}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.generated_date')}:</strong> {formatDateTime(selectedReport.generatedDate)}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.last_run')}:</strong> {formatDateTime(selectedReport.lastRun)}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.next_run')}:</strong> {formatDateTime(selectedReport.nextRun)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                  <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.statistics')}</h4>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.record_count')}:</strong> {selectedReport.recordCount || '--'}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.file_size')}:</strong> {formatFileSize(selectedReport.fileSize)}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.download_count')}:</strong> {selectedReport.downloadCount}</p>
                  <p className="text-sm theme-text-muted"><strong>{t('extracted.is_scheduled')}:</strong> {selectedReport.isScheduled ? t('extracted.yes') : t('extracted.no')}</p>
                </div>

                <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                  <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.description')}</h4>
                  <p className="text-sm theme-text-muted">{selectedReport.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDownload(selectedReport.id)}
              disabled={selectedReport.status !== 'completed'}
              className={`px-4 py-3 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                selectedReport.status === 'completed'
                  ? theme === 'light'
                    ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                    : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
                  : 'opacity-50 cursor-not-allowed theme-bg-glass theme-border-glass'
              }`}
            >
              <Download className="w-5 h-5" />
              {t('extracted.download')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowNewReportModal(true); }}
              className={`px-4 py-3 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                theme === 'light'
                  ? 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
              }`}
            >
              <Edit className="w-5 h-5" />
              {t('extracted.edit')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-3 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                theme === 'light'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
              }`}
            >
              <Share2 className="w-5 h-5" />
              {t('extracted.share')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-3 rounded-xl border font-semibold flex items-center justify-center gap-3 transition-colors ${
                theme === 'light'
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  : 'theme-bg-glass theme-border-glass hover:theme-bg-card'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Analyze
            </motion.button>
          </div>
        </motion.section>
      )}

      {/* Dashboard Grid */}
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
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.report_analytics')}</h3>
            <div className="space-y-4">
              {[
                { labelKey: 'extracted.total_generated', value: stats.total.toString(), trend: '+12%', icon: FileText, color: 'from-blue-500 to-cyan-500' },
                { labelKey: 'extracted.avg_processing_time', value: `${stats.avgProcessingTime}s`, trend: '-0.4s', icon: Zap, color: 'from-green-500 to-emerald-500' },
                { labelKey: 'extracted.success_rate_label', value: `${stats.successRate}%`, trend: '+1.2%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
                { labelKey: 'extracted.active_schedules', value: stats.scheduled.toString(), trend: '+3', icon: Clock, color: 'from-orange-500 to-red-500' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl theme-bg-glass">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold theme-text-primary">{stat.value}</p>
                      <p className="text-sm theme-text-muted">{t(stat.labelKey)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-400">{stat.trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.quick_actions_1')}</h3>
            <div className="space-y-3">
              {[
                { labelKey: 'extracted.generate_disbursement', icon: FilePlus, color: 'bg-blue-500/20 text-blue-400' },
                { labelKey: 'extracted.schedule_weekly', icon: Calendar, color: 'bg-purple-500/20 text-purple-400' },
                { labelKey: 'extracted.download_all', icon: Download, color: 'bg-green-500/20 text-green-400' },
                { labelKey: 'extracted.view_templates', icon: BookOpen, color: 'bg-orange-500/20 text-orange-400' }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.color} transition-colors`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{t(action.labelKey)}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Report Categories */}
          <div className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.report_categories_header')}</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count], idx) => {
                const Icon = getCategoryIcon(category);
                const categoryLabel = t(`extracted.category_${category}`) || category;
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg theme-bg-glass">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 theme-text-primary" />
                      <span className="text-sm theme-text-primary">{categoryLabel}</span>
                    </div>
                    <span className="text-sm theme-text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-9 xl:col-span-9 space-y-6 order-1 lg:order-2"
        >
          {/* View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 theme-bg-card theme-border-glass border rounded-2xl glass-effect">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold theme-text-primary">{t('extracted.recent_reports')}</h2>
                <p className="text-sm theme-text-muted">{viewMode === 'templates' ? t('extracted.no_templates') : `${filteredReports.length} ${t('extracted.reports_found')}`}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-48 lg:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                <input
                  type="text"
                  placeholder={t('extracted.search_reports')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 theme-bg-glass rounded-xl p-1">
                {[
                  { mode: 'reports', labelKey: 'extracted.reports', icon: FileText },
                  { mode: 'templates', labelKey: 'extracted.templates', icon: BookOpen },
                  { mode: 'scheduled', labelKey: 'extracted.scheduled', icon: Clock }
                ].map(({ mode, labelKey, icon: Icon }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode as 'reports' | 'templates' | 'scheduled')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      viewMode === mode 
                        ? 'accent-gradient text-white shadow-sm' 
                        : 'theme-text-muted hover:theme-text-primary'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{t(labelKey)}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
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
                    <p className="theme-text-muted text-xs">{t('extracted.records')}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {(() => {
                        const FormatIcon = getFileFormatIcon(report.fileFormat || 'PDF');
                        return <FormatIcon className="w-3 h-3 theme-text-muted" />;
                      })()}
                      <p className="text-sm font-bold theme-text-primary">{formatFileSize(report.fileSize)}</p>
                    </div>
                    <p className="theme-text-muted text-xs">{t('extracted.size')}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <p className="text-sm font-bold theme-text-primary">{report.downloadCount}</p>
                    <p className="theme-text-muted text-xs">{t('extracted.downloads')}</p>
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
                    <div className={`w-2 h-2 rounded-full ${
                      report.status === 'completed' ? 'bg-green-500' :
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
                  { label: 'Success Rate', value: stats.successRate, color: 'bg-green-500', icon: CheckCircle },
                  { label: 'Processing Speed', value: Math.max(10, Math.min(100, 100 - (stats.processing * 5))), color: 'bg-blue-500', icon: Zap },
                  { label: 'User Satisfaction', value: Math.max(70, Math.min(100, stats.successRate + 10)), color: 'bg-purple-500', icon: TrendingUp }
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
                {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
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
                )) : (
                  <div className="text-center py-4">
                    <p className="text-sm theme-text-muted">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;