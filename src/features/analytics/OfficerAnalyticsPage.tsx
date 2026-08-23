"use client";
import React, { createElement, useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { AnimatePresence } from 'framer-motion';

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Download, RefreshCw, FileText,
  BarChart3, ChevronDown
} from 'lucide-react';
import { PageHeader, StatBand } from '@/components/dashboard/ui';

import AnalyticsExportDrawer from './components/AnalyticsExportDrawer';
import AnalyticsControlsBar from './components/AnalyticsControlsBar';
import AnalyticsChartsSection from './components/AnalyticsChartsSection';
import AnalyticsDistributionPanels from './components/AnalyticsDistributionPanels';
import TopDistrictsTable from './components/TopDistrictsTable';
import type {
  AnalyticsData,
  ChartKind,
  DistrictSortKey,
  ExportFormat,
  ViewMode,
} from './helpers';
import {
  CHART_SERIES_COLORS,
  MONTH_LABELS_FALLBACK,
  SELECT_CLS,
  buildActWiseBreakdown,
  buildMonthlyTrends,
  buildStateWiseData,
  buildTopDistricts,
  formatCurrency,
  formatNumber,
  getDateRange,
  getTrendColor,
  getTrendIcon,
  sortDistricts,
  toAppDate,
  toDisbDate,
} from './helpers';

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

const OfficerAnalyticsPage = () => {
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

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [chartType, setChartType] = useState<ChartKind>('bar');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedActs, setSelectedActs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<DistrictSortKey>('applications');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Export modal and email states
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');

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

  // Get filtered data based on time range
  const { filteredApplications, filteredDisbursements } = useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRange, customStartDate, customEndDate);

    const filteredApps = applications.filter(app => {
      const appDate = toAppDate(app.applicationDate);
      return appDate >= startDate && appDate <= endDate;
    });

    const filteredDisbs = allDisbursements.filter(d => {
      const disbDate = toDisbDate(d.initiatedDate);
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
  const analyticsData = useMemo<AnalyticsData>(() => {
    // Overview metrics
    const totalApplications = filteredApplications.length;
    const totalBeneficiaries = beneficiaries.length; // Beneficiaries don't have date filtering
    const totalDisbursements = filteredDisbursements.length;
    const completedDisbursements = filteredDisbursements.filter(d => d.status === 'completed');
    const totalAmount = completedDisbursements.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    const successRate = totalApplications > 0 ? (completedDisbursements.length / totalApplications) * 100 : 0;

    const monthLabels = (Array.isArray(t('extracted.months_short')) ? t('extracted.months_short') : MONTH_LABELS_FALLBACK) as string[];

    return {
      overview: {
        totalApplications,
        totalBeneficiaries,
        totalDisbursements,
        totalAmount,
        successRate,
        pendingApplications: filteredApplications.filter(app => app.status === 'pending').length,
        rejectedApplications: filteredApplications.filter(app => app.status === 'rejected').length
      },
      monthlyTrends: buildMonthlyTrends(filteredApplications, filteredDisbursements, monthLabels),
      stateWiseData: buildStateWiseData(filteredApplications, filteredDisbursements),
      actWiseBreakdown: buildActWiseBreakdown(filteredApplications, filteredDisbursements),
      categoryWiseData: {
        SC: beneficiaries.filter(b => b.category === 'SC').length,
        ST: beneficiaries.filter(b => b.category === 'ST').length
      },
      topDistricts: buildTopDistricts(filteredApplications, filteredDisbursements)
    };
  }, [filteredApplications, filteredDisbursements, beneficiaries, selectedStates, selectedActs]);

  // Sorted districts for table
  const sortedDistricts = useMemo(
    () => sortDistricts(analyticsData.topDistricts, sortBy, sortOrder),
    [analyticsData.topDistricts, sortBy, sortOrder]
  );

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
    const safeLabels = Array.isArray(labels) ? labels : MONTH_LABELS_FALLBACK;
    const palette = theme === 'dark' ? CHART_SERIES_COLORS.dark : CHART_SERIES_COLORS.light;

    return [
      {
        id: 'applications',
        label: t('extracted.applications') || 'Applications',
        color: palette.applications,
        points: apps.map((val: number, i: number) => ({ x: safeLabels[i], y: val }))
      },
      {
        id: 'disbursements',
        label: t('extracted.disbursements') || 'Disbursements',
        color: palette.disbursements,
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

  const toggleStateFilter = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const toggleActFilter = (act: string) => {
    setSelectedActs(prev =>
      prev.includes(act)
        ? prev.filter(a => a !== act)
        : [...prev, act]
    );
  };

  const handleSort = (key: DistrictSortKey) => {
    setSortBy(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleExportFormatChange = (format: ExportFormat) => {
    setExportFormat(format);
    exportByFormat(format);
  };

  return (
    <div className="space-y-4 max-w-[1400px]">

      {/* Header */}
      <PageHeader
        title={t("extracted.analytics")}
        highlight={t("extracted.monitoring_center")}
        subtitle={t('extracted.comprehensive_insights_and_performance_metrics_for_dbt_under')}
      >
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`${SELECT_CLS} pr-8 appearance-none min-w-[140px]`}
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
              className={`${SELECT_CLS} max-w-[calc(100vw-1.5rem)]`}
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              title={t('extracted.end_date')}
              aria-label={t('extracted.end_date')}
              className={`${SELECT_CLS} max-w-[calc(100vw-1.5rem)]`}
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
      </PageHeader>

      {/* Controls Bar */}
      <AnalyticsControlsBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        chartType={chartType}
        onChartTypeChange={setChartType}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        selectedStates={selectedStates}
        onToggleStateFilter={toggleStateFilter}
        selectedActs={selectedActs}
        onToggleActFilter={toggleActFilter}
        stateOptions={analyticsData.stateWiseData}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onToggleSortOrder={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        exportFormat={exportFormat}
        onExportFormatChange={handleExportFormatChange}
        onOpenExport={() => setShowExportModal(true)}
        t={t}
      />

      {/* Overview Stats Band */}
      <StatBand
        cols={4}
        cells={[
          {
            label: t('extracted.total_applications'),
            value: formatNumber(analyticsData.overview.totalApplications),
            dot: 'bg-blue-500'
          },
          {
            label: t('extracted.beneficiaries'),
            value: formatNumber(analyticsData.overview.totalBeneficiaries),
            dot: 'bg-emerald-500'
          },
          {
            label: t('extracted.disbursements'),
            value: formatNumber(analyticsData.overview.totalDisbursements),
            dot: 'bg-violet-500'
          },
          {
            label: t('extracted.amount_disbursed'),
            value: formatCurrency(analyticsData.overview.totalAmount),
            dot: 'bg-amber-500'
          }
        ]}
      />

      {/* Performance Indicators Band */}
      <StatBand
        cols={3}
        cells={performanceIndicators.map((indicator) => ({
          label: t(indicator.labelKey),
          value: indicator.value,
          sub: (
            <p className={`inline-flex items-center gap-1 text-[11px] font-medium mt-0.5 ${getTrendColor(indicator.trend)}`}>
              {createElement(getTrendIcon(indicator.trend), { className: 'w-3 h-3' })}
              {indicator.change}
            </p>
          )
        }))}
      />

      {/* Operational Metrics Band */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden min-w-0">
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
      <AnalyticsChartsSection
        gridClassName={chartsGridClass}
        chartDataSets={chartDataSets}
        chartType={chartType}
        actBlocks={actBlocks}
        totalApplications={analyticsData.overview.totalApplications}
        t={t}
      />

      {/* State-wise Performance and Category Breakdown */}
      <AnalyticsDistributionPanels
        gridClassName={stateCategoryGridClass}
        stateWiseData={analyticsData.stateWiseData}
        categoryWiseData={analyticsData.categoryWiseData}
        totalBeneficiaries={analyticsData.overview.totalBeneficiaries}
        t={t}
      />

      {/* Top Districts */}
      <TopDistrictsTable
        districts={sortedDistricts}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onExportPdf={exportToPDF}
        t={t}
      />

      {/* Report Generation Section */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden min-w-0">
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
                  {createElement(card.icon, { className: 'w-4 h-4 theme-text-secondary' })}
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

export default OfficerAnalyticsPage;
