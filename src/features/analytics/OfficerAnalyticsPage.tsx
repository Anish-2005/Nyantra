"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import {
  Download, Eye, RefreshCw, TrendingUp, TrendingDown, FileText,
  BarChart3, Filter, ChevronDown, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AnalyticsChart from '@/components/AnalyticsChart';

const selectCls = "h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)]";

const btnGhost =
  "flex-1 h-8 rounded-md border theme-border-glass theme-bg-glass theme-text-secondary text-xs font-medium hover:theme-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";
const btnPrimary =
  "flex-1 h-8 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";

const Spinner = ({ invert }: { invert?: boolean }) => (
  <span className={`w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${invert ? 'border-white' : 'border-current'}`} />
);

const Item = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums truncate">{children}</dd>
  </div>
);

const MetricCell = ({
  label,
  value,
  dotClass,
  delta,
}: {
  label: React.ReactNode;
  value: string;
  dotClass?: string;
  delta?: React.ReactNode;
}) => (
  <div className="theme-bg-card p-3.5">
    <div className="flex items-center gap-1.5 min-w-0">
      {dotClass && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
      <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{label}</span>
    </div>
    <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">{value}</p>
    {delta}
  </div>
);

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`h-7 px-2 rounded-md text-xs font-medium transition-colors ${active
      ? 'accent-gradient text-white'
      : 'border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary'
      }`}
  >
    {children}
  </button>
);

interface AnalyticsExportDrawerProps {
  onClose: () => void;
  allCount: number;
  filteredCount: number;
  emailAddress: string;
  setEmailAddress: (value: string) => void;
  sendingEmail: boolean;
  onCsv: () => void;
  onPdf: () => void;
  onSendEmail: (format: 'csv' | 'pdf') => void | Promise<void>;
}

const AnalyticsExportDrawer = ({
  onClose,
  allCount,
  filteredCount,
  emailAddress,
  setEmailAddress,
  sendingEmail,
  onCsv,
  onPdf,
  onSendEmail,
}: AnalyticsExportDrawerProps) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!mounted) return null;

  const groups = [
    {
      title: t('extracted.exportAll') || 'All Analytics',
      description: t('extracted.exportAllDescription') || '',
      count: allCount,
    },
    {
      title: t('extracted.exportFiltered') || 'Filtered',
      description: t('extracted.exportFilteredDescription') || '',
      count: filteredCount,
    },
  ];

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
              {t('extracted.export') || 'Export'}
            </h2>
            <p className="text-[11px] theme-text-muted truncate">
              {t('extracted.exportDescription') || 'Export analytics data as CSV or PDF report.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {groups.map((group, gi) => (
            <section key={gi} className={gi === 1 ? 'pt-4 border-t theme-border-glass' : ''}>
              <div className="flex items-baseline justify-between mb-2 gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary truncate">{group.title}</h3>
                <span className="text-[11px] tabular-nums theme-text-muted shrink-0">{group.count}</span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={group.count === 0}
                  onClick={() => { onCsv(); onClose(); }}
                  className={btnGhost}
                >
                  CSV
                </button>
                <button
                  disabled={group.count === 0}
                  onClick={() => { onPdf(); onClose(); }}
                  className={btnPrimary}
                >
                  PDF
                </button>
              </div>
              {group.description && (
                <p className="text-[11px] theme-text-muted mt-2 leading-relaxed">{group.description}</p>
              )}
            </section>
          ))}

          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2">
              {t('extracted.emailExport') || 'Email Export'}
            </h3>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder={t('extracted.enterEmailAddress') || 'Enter email address'}
              className={`w-full ${selectCls}`}
            />
            <div className="flex gap-2 mt-2">
              <button
                disabled={!emailAddress.trim() || sendingEmail}
                onClick={() => onSendEmail('csv')}
                className={btnGhost}
              >
                {sendingEmail ? <Spinner /> : null}
                {t('extracted.sendCsv') || 'Send CSV'}
              </button>
              <button
                disabled={!emailAddress.trim() || sendingEmail}
                onClick={() => onSendEmail('pdf')}
                className={btnPrimary}
              >
                {sendingEmail ? <Spinner invert /> : null}
                {t('extracted.sendPdf') || 'Send PDF'}
              </button>
            </div>
          </section>
        </div>

        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel') || 'Cancel'}
          </button>
          <button
            onClick={() => { onPdf(); onClose(); }}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            {t('extracted.export_pdf') || 'PDF'}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

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

  // Export modal and email states
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

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
    // Remove orderBy to include beneficiaries without registrationDate
    const q = query(collection(db, 'beneficiaries'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
      // Sort in memory to handle missing registrationDate
      items.sort((a, b) => {
        const aDate = new Date((a.registrationDate || a.createdAt)?.toDate?.() || '1970-01-01');
        const bDate = new Date((b.registrationDate || b.createdAt)?.toDate?.() || '1970-01-01');
        return bDate.getTime() - aDate.getTime();
      });
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
        existing.disbursements += completed.length;
        existing.amount += amount;
        existing.successRate = disbursements.length > 0 ? (completed.length / disbursements.length) * 100 : 0;
      } else {
        acc.push({
          state,
          applications: 1,
          disbursements: completed.length,
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
      ST: beneficiaries.filter(b => b.category === 'ST').length
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
        existing.disbursements += completed.length;
      } else {
        acc.push({
          district,
          state,
          applications: 1,
          disbursements: completed.length,
          successRate: disbursements.length > 0 ? (completed.length / disbursements.length) * 100 : 0
        });
      }
      return acc;
    }, []).sort((a, b) => b.applications - a.applications).slice(0, 5);

    // Monthly trends (last 12 months)
    const monthlyTrends = {
      labels: Array.isArray(t('extracted.months_short')) ? t('extracted.months_short') : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
        trend: 'up'
      },
      {
        labelKey: 'extracted.disbursement_rate',
        value: `${disbursementRate.toFixed(1)}%`,
        change: '+4.1%',
        trend: 'up'
      },
      {
        labelKey: 'extracted.amount_disbursed',
        value: `₹${(analyticsData.overview.totalAmount / 10000000).toFixed(1)}Cr`,
        change: '+12.5%',
        trend: 'up'
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
      else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `INR ${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `INR ${(amount / 100000).toFixed(1)}L`;
    } else {
      return `INR ${(amount / 1000).toFixed(1)}K`;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  // View mode layout helpers
  const chartsGridClass = useMemo(() => {
    if (viewMode === 'list') return 'grid grid-cols-1 gap-4';
    if (viewMode === 'compact') return 'grid grid-cols-1 lg:grid-cols-2 gap-3';
    return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
  }, [viewMode]);

  const stateCategoryGridClass = useMemo(() => {
    if (viewMode === 'list') return 'grid grid-cols-1 gap-4';
    if (viewMode === 'compact') return 'grid grid-cols-1 lg:grid-cols-2 gap-3';
    return 'grid grid-cols-1 lg:grid-cols-2 gap-4';
  }, [viewMode]);

  // Prepare data for AnalyticsChart
  const chartDataSets = useMemo(() => {
    const labels = analyticsData.monthlyTrends.labels;
    const apps = analyticsData.monthlyTrends.applications;
    const disbs = analyticsData.monthlyTrends.disbursements;

    // Ensure labels is an array of strings
    const safeLabels = Array.isArray(labels) ? labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return [
      {
        id: 'applications',
        label: t('extracted.applications') || 'Applications',
        color: theme === 'dark' ? 'rgba(59, 130, 246, 1)' : 'rgba(37, 99, 235, 1)',
        points: apps.map((val: number, i: number) => ({ x: safeLabels[i], y: val }))
      },
      {
        id: 'disbursements',
        label: t('extracted.disbursements') || 'Disbursements',
        color: theme === 'dark' ? 'rgba(16, 185, 129, 1)' : 'rgba(5, 150, 105, 1)',
        points: disbs.map((val: number, i: number) => ({ x: safeLabels[i], y: val }))
      }
    ];
  }, [analyticsData, theme, t]);

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

  const exportToCSV = (filename = 'analytics-report.csv') => {
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
    if (Array.isArray(analyticsData.monthlyTrends.labels)) {
      analyticsData.monthlyTrends.labels.forEach((month: string, index: number) => {
        csvContent += `${month},${analyticsData.monthlyTrends.applications[index]},${analyticsData.monthlyTrends.disbursements[index]},₹${(analyticsData.monthlyTrends.amounts[index] / 100000).toFixed(2)}L\n`;
      });
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // CSV is compatible with Excel; provide .xlsx extension for convenience
    exportToCSV('analytics-report.xlsx');
  };

  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');

  const exportByFormat = (format: string) => {
    switch (format) {
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      default:
        exportToCSV();
    }
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
    const monthlyData = Array.isArray(analyticsData.monthlyTrends.labels)
      ? analyticsData.monthlyTrends.labels.map((month: string, index: number) => [
        month,
        analyticsData.monthlyTrends.applications[index].toString(),
        analyticsData.monthlyTrends.disbursements[index].toString(),
        (analyticsData.monthlyTrends.amounts[index] / 100000).toFixed(2) + 'L'
      ])
      : [];

    autoTable(doc, {
      head: monthlyHeaders,
      body: monthlyData,
      startY: 80,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save('monthly-analytics-report.pdf');
  };

  // Email export function
  const sendAnalyticsEmail = async (format: 'csv' | 'pdf') => {
    if (!emailAddress.trim()) {
      alert(t('extracted.please_enter_valid_email') || 'Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      let attachmentData: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        // Generate CSV data
        const csvData = [
          ['Metric', 'Value'],
          ['Total Applications', analyticsData.overview.totalApplications.toString()],
          ['Total Disbursements', analyticsData.overview.totalDisbursements.toString()],
          ['Total Amount', `₹${analyticsData.overview.totalAmount.toLocaleString()}`],
          ['Success Rate', `${analyticsData.overview.successRate.toFixed(1)}%`],
          ['Pending Applications', analyticsData.overview.pendingApplications.toString()],
          ['Rejected Applications', analyticsData.overview.rejectedApplications.toString()],
          ['Top District', analyticsData.topDistricts[0]?.district || 'N/A'],
          ['Top State', analyticsData.stateWiseData[0]?.state || 'N/A'],
          ['Report Period', timeRange],
          ['Generated Date', new Date().toLocaleDateString()]
        ];

        // Add state-wise data
        csvData.push(['', '']);
        csvData.push(['State-wise Data', '']);
        csvData.push(['State', 'Applications', 'Disbursements', 'Amount', 'Success Rate']);
        analyticsData.stateWiseData.forEach((state: any) => {
          csvData.push([
            state.state,
            state.applications.toString(),
            state.disbursements.toString(),
            `₹${state.amount.toLocaleString()}`,
            `${state.successRate.toFixed(1)}%`
          ]);
        });

        attachmentData = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        filename = 'analytics-report.csv';
        mimeType = 'text/csv';
      } else {
        // Generate PDF
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Analytics Report', 20, 30);
        doc.setFontSize(12);
        doc.text(`Report Period: ${timeRange}`, 20, 40);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 50);

        // Summary metrics
        doc.setFontSize(16);
        doc.text('Summary Metrics', 20, 70);

        const summaryData = [
          ['Total Applications', analyticsData.overview.totalApplications.toString()],
          ['Total Disbursements', analyticsData.overview.totalDisbursements.toString()],
          ['Total Amount', `₹${analyticsData.overview.totalAmount.toLocaleString()}`],
          ['Success Rate', `${analyticsData.overview.successRate.toFixed(1)}%`],
          ['Pending Applications', analyticsData.overview.pendingApplications.toString()],
          ['Rejected Applications', analyticsData.overview.rejectedApplications.toString()],
          ['Top District', analyticsData.topDistricts[0]?.district || 'N/A'],
          ['Top State', analyticsData.stateWiseData[0]?.state || 'N/A']
        ];

        autoTable(doc, {
          body: summaryData,
          startY: 80,
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: [240, 240, 240] }
          }
        });

        // State-wise data
        doc.addPage();
        doc.setFontSize(16);
        doc.text('State-wise Analytics', 20, 30);

        const stateHeaders = [['State', 'Applications', 'Disbursements', 'Amount (₹)', 'Success Rate']];
        const stateData = analyticsData.stateWiseData.map((state: any) => [
          state.state,
          state.applications.toString(),
          state.disbursements.toString(),
          state.amount.toLocaleString(),
          `${state.successRate.toFixed(1)}%`
        ]);

        autoTable(doc, {
          head: stateHeaders,
          body: stateData,
          startY: 40,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] }
        });

        attachmentData = doc.output('datauristring').split(',')[1];
        filename = 'analytics-report.pdf';
        mimeType = 'application/pdf';
      }

      // Send email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress.trim(),
          subject: `Nyantra Analytics Report - ${timeRange}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Nyantra - Analytics Report</h2>
              <p>Dear User,</p>
              <p>Please find attached the analytics report for the ${timeRange} period.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Report Period: ${timeRange}</li>
                <li>Format: ${format.toUpperCase()}</li>
                <li>Generated: ${new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</li>
              </ul>
              <p>This report is generated by the Nyantra Analytics Dashboard.</p>
              <p>Best regards,<br>Nyantra Team</p>
            </div>
          `,
          attachments: [{
            filename,
            content: attachmentData,
            contentType: mimeType,
            encoding: format === 'csv' ? 'utf8' : 'base64'
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      await response.json();
      alert(t('extracted.email_sent_successfully') || 'Email sent successfully!');
      setEmailAddress('');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert(t('extracted.failed_to_send_email') || 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const generatePerformanceReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Analytics Report', 20, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);

    let yPos = 60;

    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This report provides a comprehensive analysis of DBT performance metrics, including application success rates, disbursement statistics, and act-wise performance breakdown for the selected time period.`;
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, yPos);
    yPos += splitSummary.length * 5 + 10;

    // Key Performance Indicators
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 20, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    performanceIndicators.forEach((indicator) => {
      const displayLabel = indicator.labelKey.replace('extracted.', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      doc.text(`${displayLabel}: ${indicator.value}`, 20, yPos);
      yPos += 8;
    });

    yPos += 10;

    // Overall Statistics
    if (yPos > 220) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Statistics', 20, yPos);
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const overallStats = [
      ['Total Applications', formatNumber(analyticsData.overview.totalApplications)],
      ['Total Beneficiaries', formatNumber(analyticsData.overview.totalBeneficiaries)],
      ['Total Disbursements', formatNumber(analyticsData.overview.totalDisbursements)],
      ['Total Amount Disbursed', formatCurrency(analyticsData.overview.totalAmount)],
      ['Success Rate', `${analyticsData.overview.successRate.toFixed(1)}%`],
      ['Pending Applications', formatNumber(analyticsData.overview.pendingApplications)],
      ['Rejected Applications', formatNumber(analyticsData.overview.rejectedApplications)]
    ];

    overallStats.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Act-wise Performance
    if (yPos > 180) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Act-wise Performance Breakdown', 20, yPos);
    yPos += 12;

    const actHeaders = [['Act Type', 'Apps', 'Disb', 'Amount', 'Success', 'Avg/Disb']];
    const actData = [
      [
        'PCR Act',
        formatNumber(analyticsData.actWiseBreakdown.pcr.applications),
        formatNumber(analyticsData.actWiseBreakdown.pcr.disbursements),
        formatCurrency(analyticsData.actWiseBreakdown.pcr.amount),
        `${analyticsData.actWiseBreakdown.pcr.successRate.toFixed(1)}%`,
        analyticsData.actWiseBreakdown.pcr.disbursements > 0
          ? `INR ${(analyticsData.actWiseBreakdown.pcr.amount / analyticsData.actWiseBreakdown.pcr.disbursements / 1000).toFixed(1)}K`
          : 'INR 0K'
      ],
      [
        'PoA Act',
        formatNumber(analyticsData.actWiseBreakdown.poa.applications),
        formatNumber(analyticsData.actWiseBreakdown.poa.disbursements),
        formatCurrency(analyticsData.actWiseBreakdown.poa.amount),
        `${analyticsData.actWiseBreakdown.poa.successRate.toFixed(1)}%`,
        analyticsData.actWiseBreakdown.poa.disbursements > 0
          ? `INR ${(analyticsData.actWiseBreakdown.poa.amount / analyticsData.actWiseBreakdown.poa.disbursements / 1000).toFixed(1)}K`
          : 'INR 0K'
      ]
    ];

    autoTable(doc, {
      head: actHeaders,
      body: actData,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20, halign: 'right' },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 30, halign: 'right' }
      }
    });

    // Add page for additional insights if needed
    const finalY = yPos + 80; // Approximate height for the table
    if (finalY > 200) {
      doc.addPage();
      yPos = 30;
    } else {
      yPos = finalY;
    }

    // Performance Insights
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Insights', 20, yPos);
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const insights: string[] = [];

    const pcrRate = analyticsData.actWiseBreakdown.pcr.successRate;
    const poaRate = analyticsData.actWiseBreakdown.poa.successRate;

    if (pcrRate > poaRate) {
      insights.push(`• PCR Act shows higher success rate (${pcrRate.toFixed(1)}%) compared to PoA Act (${poaRate.toFixed(1)}%)`);
    } else if (poaRate > pcrRate) {
      insights.push(`• PoA Act shows higher success rate (${poaRate.toFixed(1)}%) compared to PCR Act (${pcrRate.toFixed(1)}%)`);
    } else {
      insights.push(`• Both acts show similar success rates (${pcrRate.toFixed(1)}%)`);
    }

    if (analyticsData.overview.pendingApplications > 0) {
      const pendingPercentage = (analyticsData.overview.pendingApplications / analyticsData.overview.totalApplications) * 100;
      insights.push(`• ${pendingPercentage.toFixed(1)}% of applications are still pending processing`);
    }

    if (analyticsData.overview.successRate >= 80) {
      insights.push('• Overall performance is excellent with success rate above 80%');
    } else if (analyticsData.overview.successRate >= 60) {
      insights.push('• Overall performance is good with success rate above 60%');
    } else {
      insights.push('• Overall performance needs improvement with success rate below 60%');
    }

    insights.forEach(insight => {
      doc.text(insight, 20, yPos);
      yPos += 7;
    });

    doc.save('performance-analytics-report.pdf');
  };

  const reportCards = [
    {
      id: 'monthly',
      icon: FileText,
      badge: 'A4 Ready',
      title: t('extracted.monthly_report'),
      description: 'Comprehensive monthly overview with application trends, disbursement statistics, and performance metrics formatted for A4 printing.',
      features: ['Application Summary', 'Monthly Trends & Charts', 'State-wise Performance'],
      onClick: generateMonthlyReport
    },
    {
      id: 'performance',
      icon: BarChart3,
      badge: 'Analytics',
      title: t('extracted.performance_report'),
      description: 'Detailed performance analysis with KPIs, success rates, and actionable insights optimized for A4 document format.',
      features: ['Key Performance Indicators', 'Success Rate Analysis', 'Trend Analysis & Insights'],
      onClick: generatePerformanceReport
    },
    {
      id: 'export-all',
      icon: Download,
      badge: 'Complete',
      title: t('extracted.export_all_data'),
      description: 'Complete dataset export including all applications, disbursements, and beneficiary data in structured CSV format.',
      features: ['All Applications Data', 'Disbursement Records', 'Beneficiary Information'],
      onClick: () => exportToCSV()
    }
  ];

  const operationalMetrics = [
    {
      labelKey: 'extracted.total_pending',
      value: formatNumber(analyticsData.overview.pendingApplications),
      dotClass: 'bg-amber-500'
    },
    {
      labelKey: 'extracted.total_rejected',
      value: formatNumber(analyticsData.overview.rejectedApplications),
      dotClass: 'bg-red-500'
    },
    {
      labelKey: 'extracted.pcr_ratio',
      value: `${analyticsData.overview.totalApplications > 0 ? ((analyticsData.actWiseBreakdown.pcr.applications / analyticsData.overview.totalApplications) * 100).toFixed(1) : 0}%`,
      dotClass: 'bg-blue-500'
    },
    {
      labelKey: 'extracted.poa_ratio',
      value: `${analyticsData.overview.totalApplications > 0 ? ((analyticsData.actWiseBreakdown.poa.applications / analyticsData.overview.totalApplications) * 100).toFixed(1) : 0}%`,
      dotClass: 'bg-violet-500'
    },
    {
      labelKey: 'extracted.success_rate',
      value: `${analyticsData.overview.successRate.toFixed(1)}%`,
      dotClass: 'bg-emerald-500'
    }
  ];

  const actBlocks = [
    {
      key: 'pcr' as const,
      label: t('extracted.pcr_act'),
      data: analyticsData.actWiseBreakdown.pcr
    },
    {
      key: 'poa' as const,
      label: t('extracted.poa_act'),
      data: analyticsData.actWiseBreakdown.poa
    }
  ];

  return (
    <div className="space-y-4 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t("extracted.analytics")} <span className="text-accent-gradient">{t("extracted.monitoring_center")}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.comprehensive_insights_and_performance_metrics_for_dbt_under')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`${selectCls} pr-8 appearance-none min-w-[140px]`}
            >
              <option value="week">{t('extracted.last_week')}</option>
              <option value="month">{t('extracted.last_month')}</option>
              <option value="quarter">{t('extracted.last_quarter')}</option>
              <option value="year">{t('extracted.last_year')}</option>
              <option value="custom">{t('extracted.custom_range')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
          </div>
          {timeRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                title={t('extracted.start_date')}
                aria-label={t('extracted.start_date')}
                className={selectCls}
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                title={t('extracted.end_date')}
                aria-label={t('extracted.end_date')}
                className={selectCls}
              />
            </>
          )}
          <button
            onClick={() => window.print()}
            className="h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('extracted.export_data')}</span>
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${autoRefresh
              ? 'accent-gradient text-white'
              : 'border theme-border-glass theme-text-secondary hover:theme-bg-glass hover:theme-text-primary'
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{t('extracted.refresh_data')}</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="theme-bg-card theme-border-glass border rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.view_mode')}</span>
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className={`${selectCls} pr-8 appearance-none`}
            >
              <option value="grid">{t('extracted.grid')}</option>
              <option value="list">{t('extracted.list')}</option>
              <option value="compact">{t('extracted.compact')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.chart_type')}</span>
          <div className="relative">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className={`${selectCls} pr-8 appearance-none`}
            >
              <option value="bar">{t('extracted.bar')}</option>
              <option value="line">{t('extracted.line')}</option>
              <option value="area">{t('extracted.area')}</option>
              <option value="pie">{t('extracted.pie')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-2.5 rounded-md inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${showFilters
              ? 'accent-gradient text-white'
              : 'border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary'
              }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {t('extracted.filters')}
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
            title={t('extracted.export')}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <select
            value={exportFormat}
            onChange={(e) => {
              const v = e.target.value as any;
              setExportFormat(v);
              exportByFormat(v);
            }}
            className={`${selectCls} min-w-[110px]`}
          >
            <option value="pdf">{t('extracted.export_pdf')}</option>
            <option value="csv">{t('extracted.export_csv')}</option>
            <option value="excel">{t('extracted.export_excel')}</option>
          </select>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="pt-3 mt-1 border-t theme-border-glass grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5 block">{t('extracted.filter_by_state')}</label>
                  <div className="flex flex-wrap gap-1">
                    {analyticsData.stateWiseData.slice(0, 5).map((state: any) => (
                      <Chip
                        key={state.state}
                        active={selectedStates.includes(state.state)}
                        onClick={() => {
                          setSelectedStates(prev =>
                            prev.includes(state.state)
                              ? prev.filter(s => s !== state.state)
                              : [...prev, state.state]
                          );
                        }}
                      >
                        {state.state}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5 block">{t('extracted.filter_by_act')}</label>
                  <div className="flex gap-1">
                    {['PCR Act', 'PoA Act'].map((act) => (
                      <Chip
                        key={act}
                        active={selectedActs.includes(act)}
                        onClick={() => {
                          setSelectedActs(prev =>
                            prev.includes(act)
                              ? prev.filter(a => a !== act)
                              : [...prev, act]
                          );
                        }}
                      >
                        {act}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5 block">{t('extracted.sort_by')}</label>
                  <div className="flex gap-1">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="h-7 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                    >
                      <option value="applications">{t('extracted.applications')}</option>
                      <option value="disbursements">{t('extracted.disbursements')}</option>
                      <option value="successRate">{t('extracted.success_rate')}</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="h-7 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs font-medium hover:theme-text-primary transition-colors"
                      aria-label="Toggle sort order"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overview Stats Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        <MetricCell
          label={t('extracted.total_applications')}
          value={formatNumber(analyticsData.overview.totalApplications)}
          dotClass="bg-blue-500"
        />
        <MetricCell
          label={t('extracted.beneficiaries')}
          value={formatNumber(analyticsData.overview.totalBeneficiaries)}
          dotClass="bg-emerald-500"
        />
        <MetricCell
          label={t('extracted.disbursements')}
          value={formatNumber(analyticsData.overview.totalDisbursements)}
          dotClass="bg-violet-500"
        />
        <MetricCell
          label={t('extracted.amount_disbursed')}
          value={formatCurrency(analyticsData.overview.totalAmount)}
          dotClass="bg-amber-500"
        />
      </div>

      {/* Performance Indicators Band */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        {performanceIndicators.map((indicator, idx) => {
          const TrendIcon = getTrendIcon(indicator.trend);
          return (
            <MetricCell
              key={idx}
              label={t(indicator.labelKey)}
              value={indicator.value}
              delta={
                <p className={`inline-flex items-center gap-1 text-[11px] font-medium mt-0.5 ${getTrendColor(indicator.trend)}`}>
                  <TrendIcon className="w-3 h-3" />
                  {indicator.change}
                </p>
              }
            />
          );
        })}
      </div>

      {/* Operational Metrics Band */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        {operationalMetrics.map((metric, idx) => (
          <MetricCell
            key={idx}
            label={t(metric.labelKey)}
            value={metric.value}
            dotClass={metric.dotClass}
          />
        ))}
      </div>

      {/* Charts and Visualizations */}
      <div className={chartsGridClass}>
        {/* Monthly Trends Chart */}
        <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.monthly_trends')}</h3>
              <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.applications_vs_disbursements')}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] theme-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t('extracted.applications')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] theme-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('extracted.disbursements')}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="h-64 sm:h-80 w-full">
              <AnalyticsChart
                dataSets={chartDataSets}
                chartType={chartType === 'pie' ? 'bar' : chartType as any}
                xScaleType="category"
              />
            </div>
          </div>
        </section>

        {/* Act-wise Breakdown */}
        <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.actwise_performance')}</h3>
              <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.pcr_act_vs_poa_act')}</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {actBlocks.map(({ key, label, data }) => (
              <div key={key}>
                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <h4 className="text-sm font-semibold theme-text-primary truncate">{label}</h4>
                  <span className="text-lg font-semibold tracking-tight theme-text-primary tabular-nums">
                    {analyticsData.overview.totalApplications > 0 ? Math.round((data.applications / analyticsData.overview.totalApplications) * 100) : 0}%
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                  <Item label={t('extracted.applications_lowercase')}>{formatNumber(data.applications)}</Item>
                  <Item label={t('extracted.disbursed')}>{formatNumber(data.disbursements)}</Item>
                  <Item label={t('extracted.success_lowercase')}>{data.successRate.toFixed(1)}%</Item>
                </dl>
                <div className="h-1.5 rounded-full theme-bg-glass mt-3 overflow-hidden">
                  <div className="h-full rounded-full accent-gradient" style={{ width: `${Math.min(100, data.successRate)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* State-wise Performance and Category Breakdown */}
      <div className={stateCategoryGridClass}>
        {/* State-wise Performance */}
        <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.statewise_performance_1')}</h3>
              <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.top_performing_states')}</p>
            </div>
          </div>
          <div className="p-4">
            {analyticsData.stateWiseData.map((state: any, index: number) => (
              <div key={state.state} className="py-2.5 border-b theme-border-glass last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 shrink-0 text-[11px] font-semibold tabular-nums theme-text-muted">{index + 1}</span>
                    <span className="text-[13px] theme-text-primary truncate">{state.state}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[13px] font-semibold tabular-nums theme-text-primary">{state.disbursements}</span>
                    <span className="text-[11px] theme-text-muted ml-2">
                      {state.applications} {t('extracted.applications_lowercase')} · {state.successRate.toFixed(2)}% {t('extracted.success_lowercase')}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full theme-bg-glass mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full accent-gradient" style={{ width: `${Math.min(100, state.successRate)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category-wise Distribution */}
        <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.categorywise_distribution_1')}</h3>
              <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.beneficiary_categories')}</p>
            </div>
          </div>
          <div className="p-4">
            {Object.entries(analyticsData.categoryWiseData).map(([category, count]) => {
              const percentage = analyticsData.overview.totalBeneficiaries > 0 ? ((count as number) / analyticsData.overview.totalBeneficiaries) * 100 : 0;
              return (
                <div key={category} className="py-2.5 border-b theme-border-glass last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-medium theme-text-primary">{category}</span>
                    <span className="text-[13px] font-semibold tabular-nums theme-text-primary">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full theme-bg-glass mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full accent-gradient" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] theme-text-muted mt-1">
                    <span>{formatNumber(count as number)} {t('extracted.beneficiaries_lowercase')}</span>
                    <span>{category} Category</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Top Districts */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.top_performing_districts')}</h3>
            <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.districts_with_highest_disbursement_rates')}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportToPDF}
              className="h-9 px-2.5 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('extracted.export')}</span>
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`${selectCls} h-8 px-2 text-xs`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b theme-border-glass">
              <tr>
                <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.rank')}</th>
                <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => {
                  setSortBy('district');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  {t('extracted.district')}{sortBy === 'district' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
                <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.state')}</th>
                <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => {
                  setSortBy('applications');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  {t('extracted.applications')}{sortBy === 'applications' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
                <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => {
                  setSortBy('disbursements');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  {t('extracted.disbursements')}{sortBy === 'disbursements' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
                <th className="hidden lg:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => {
                  setSortBy('successRate');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>
                  {t('extracted.success_rate')}{sortBy === 'successRate' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
                <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border-glass">
              {sortedDistricts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((district, idx) => (
                <tr
                  key={`${district.district}-${district.state}`}
                  className="hover:theme-bg-hover transition-colors"
                >
                  <td className="py-2.5 px-3 text-[13px] font-semibold tabular-nums theme-text-muted">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="py-2.5 px-3 text-[13px] font-medium theme-text-primary">{district.district}</td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-[13px] theme-text-secondary">{district.state}</td>
                  <td className="hidden md:table-cell py-2.5 px-3 text-[13px] tabular-nums theme-text-secondary">{district.applications}</td>
                  <td className="hidden md:table-cell py-2.5 px-3 text-[13px] tabular-nums theme-text-secondary">{district.disbursements}</td>
                  <td className="hidden lg:table-cell py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${district.successRate >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : district.successRate >= 60
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                      {district.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex justify-end gap-1">
                      <button
                        className="p-1.5 rounded-md border theme-border-glass theme-text-muted hover:theme-text-primary hover:theme-bg-glass transition-colors"
                        title={t('extracted.view_details')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-md border theme-border-glass theme-text-muted hover:theme-text-primary hover:theme-bg-glass transition-colors"
                        title={t('extracted.export_data')}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 border-t theme-border-glass flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs theme-text-muted">
              {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, sortedDistricts.length)} {t('extracted.of')} {sortedDistricts.length} {t('extracted.entries')}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs font-medium hover:theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('extracted.previous')}
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 min-w-[2rem] px-2 rounded-md text-xs font-medium transition-colors ${currentPage === pageNum
                      ? 'accent-gradient text-white'
                      : 'border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs font-medium hover:theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('extracted.next')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Report Generation Section */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.generate_custom_reports')}</h3>
          <p className="text-[11px] theme-text-muted mt-0.5">{t('extracted.create_detailed_reports_for_analysis_and_compliance')}</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportCards.map((card) => (
            <button
              key={card.id}
              onClick={card.onClick}
              className="text-left rounded-xl border theme-border-glass p-4 hover:theme-bg-hover transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-md theme-bg-glass flex items-center justify-center shrink-0">
                  <card.icon className="w-4 h-4 theme-text-secondary" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full theme-bg-glass theme-text-muted">
                  {card.badge}
                </span>
              </div>
              <h4 className="text-sm font-semibold theme-text-primary truncate">{card.title}</h4>
              <p className="text-xs theme-text-muted mt-1 leading-relaxed">{card.description}</p>
              <ul className="mt-3 space-y-1.5">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[11px] theme-text-muted">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)] shrink-0" />
                    <span className="truncate">{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </section>

      {/* Export Drawer */}
      <AnimatePresence>
        {showExportModal && (
          <AnalyticsExportDrawer
            onClose={() => setShowExportModal(false)}
            allCount={analyticsData.overview.totalApplications}
            filteredCount={analyticsData.overview.totalApplications}
            emailAddress={emailAddress}
            setEmailAddress={setEmailAddress}
            sendingEmail={sendingEmail}
            onCsv={() => exportToCSV()}
            onPdf={() => exportToPDF()}
            onSendEmail={sendAnalyticsEmail}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsPage;
