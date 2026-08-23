"use client";
import React, { useEffect } from 'react';
import {
  Activity, BarChart3, Cpu, Database, DollarSign, FileCheck, FileText,
  PieChart, Shield, TrendingUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Report type definition
export type Report = {
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

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: Database,
  compliance: FileText,
  performance: BarChart3,
  statistical: Activity,
  analytical: BarChart3,
  technical: Database
};

// Category → left spine color (card library metaphor)
export const SPINE_BG: Record<string, string> = {
  financial: 'bg-blue-500/70',
  compliance: 'bg-purple-500/70',
  performance: 'bg-emerald-500/70',
  analytical: 'bg-indigo-500/70',
  statistical: 'bg-amber-500/70',
  technical: 'bg-cyan-500/70',
};

// Format → composition-bar segment color
export const FORMAT_COLORS: Record<string, string> = {
  pdf: 'bg-red-500',
  csv: 'bg-teal-500',
  excel: 'bg-green-500',
  xlsx: 'bg-green-500',
};

export const getTypePillClass = (type: string) => {
  switch ((type || '').toLowerCase()) {
    case 'financial': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'compliance': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'performance': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'analytical': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
    case 'statistical': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'technical': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const getFormatPillClass = (format: string) => {
  switch ((format || '').toLowerCase()) {
    case 'pdf': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'csv': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
    case 'excel':
    case 'xlsx': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const getStatusPillClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'scheduled': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'failed': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

export const formatDate = (s?: string | null) => {
  if (!s) return '--';
  try {
    const d = new Date(s);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return '--';
  }
};

export const formatDateTime = (s?: string | null) => {
  if (!s) return '--';
  try {
    const d = new Date(s);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return '--';
  }
};

export const formatFileSize = (size: string | null) => {
  return size || '--';
};

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

// ---------------------------------------------------------------------------
// Officer reports page additions (moved from OfficerReportsPage module scope)
// ---------------------------------------------------------------------------

/** Recent activity entry rendered by the officer analytics section. */
export type OfficerActivityItem = {
  action: string;
  user: string;
  time: string;
  status: 'success' | 'info' | 'error';
  timestamp: number;
};

export const OFFICER_INPUT_CLS = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

export const OFFICER_GHOST_BTN = "h-8 px-3 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed";

export interface OfficerStatusOption {
  value: Report['status'];
  labelKey: string;
}

export const OFFICER_STATUS_OPTIONS: OfficerStatusOption[] = [
  { value: 'scheduled', labelKey: 'extracted.scheduled' },
  { value: 'processing', labelKey: 'extracted.processing' },
  { value: 'completed', labelKey: 'extracted.completed' },
  { value: 'failed', labelKey: 'extracted.failed' }
];

// Key-map for translated status pills (i18n-check/no-orphan-t: no literal-key calls).
// Note: officer page intentionally renders 'scheduled' as purple (unlike getStatusPillClass).
const OFFICER_STATUS_PILL_CLASSES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  scheduled: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

export const getOfficerStatusPillClass = (status: string) =>
  OFFICER_STATUS_PILL_CLASSES[status] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';

/**
 * Module-scope icon maps for dynamic icon selection (react-hooks/static-components):
 * render via createElement(getOfficerCategoryIcon(category), { className }).
 */
export const OFFICER_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: DollarSign,
  compliance: Shield,
  performance: TrendingUp,
  statistical: BarChart3,
  analytical: PieChart,
  audit: FileCheck,
  technical: Cpu
};

export const getOfficerCategoryIcon = (category: string) =>
  OFFICER_CATEGORY_ICONS[category] || FileText;

export const OFFICER_FORMAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  Excel: BarChart3,
  CSV: Database
};

export const getOfficerFormatIcon = (format: string) =>
  OFFICER_FORMAT_ICONS[format] || FileText;

// Key-map for translated category labels (i18n-check/no-orphan-t: no literal-key calls)
const OFFICER_CATEGORY_LABEL_KEYS: Record<string, string> = {
  financial: 'extracted.category_financial',
  compliance: 'extracted.category_compliance',
  performance: 'extracted.category_performance',
  statistical: 'extracted.category_statistical',
  analytical: 'extracted.category_analytical',
  technical: 'extracted.category_technical'
};

export const getOfficerCategoryLabel = (t: TranslateFn, category: string) => {
  const key = OFFICER_CATEGORY_LABEL_KEYS[category];
  return key ? (t(key) || category) : category;
};

// CSV builder shared by file download + email attachment
export const buildOfficerReportsCsv = (items: Report[]) => {
  const headers = ['Report Name', 'Type', 'Category', 'Frequency', 'Status', 'File Size', 'Format', 'Generated Date', 'Generated By', 'Record Count', 'Download Count'];
  const rows = items.map(r => [
    r.name,
    r.type,
    r.category,
    r.frequency,
    r.status,
    r.fileSize || '',
    r.fileFormat,
    r.generatedDate || '',
    r.generatedBy || '',
    r.recordCount || '',
    r.downloadCount
  ]);
  return [headers, ...rows].map(r => r.map(f => `"${(f ?? '')}"`).join(',')).join('\n');
};

// PDF document builder shared by file download + email attachment
export const createOfficerReportsPdfDocument = (items: Report[]) => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Professional header
  pdf.setFillColor(30, 64, 175);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NYANTRA - Reports Export', margin, 22);

  // Subtitle
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Direct Benefit Transfer System Reports', margin, 30);

  // Report metadata
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
  pdf.text(`Total Reports: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

  let yPosition = 50;

  // Summary section
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, contentWidth, 25, 'F');

  pdf.setFontSize(12);
  pdf.setTextColor(30, 64, 175);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REPORTS SUMMARY', margin + 5, yPosition + 8);

  // Summary stats
  const statusCounts = items.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = items.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Reports: ${items.length}`, margin + 5, yPosition + 18);

  yPosition += 35;

  // Status breakdown
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 64, 175);
  pdf.text('Status Breakdown:', margin, yPosition);

  yPosition += 8;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  Object.entries(statusCounts).forEach(([status, count]) => {
    const statusText = status.replace(/-/g, ' ').toUpperCase();
    const percentage = (((count as number) / items.length) * 100).toFixed(1);
    pdf.text(`${statusText}: ${count} (${percentage}%)`, margin + 5, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Type breakdown
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 64, 175);
  pdf.text('Type Breakdown:', margin, yPosition);

  yPosition += 8;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  Object.entries(typeCounts).forEach(([type, count]) => {
    const typeText = type.replace(/-/g, ' ').toUpperCase();
    const percentage = (((count as number) / items.length) * 100).toFixed(1);
    pdf.text(`${typeText}: ${count} (${percentage}%)`, margin + 5, yPosition);
    yPosition += 5;
  });

  // Reports table
  const tableColumns = [
    { header: 'Report Name', width: 40 },
    { header: 'Type', width: 25 },
    { header: 'Category', width: 30 },
    { header: 'Status', width: 25 },
    { header: 'Generated', width: 30 },
    { header: 'Records', width: 20 },
    { header: 'Downloads', width: 20 }
  ];

  autoTable(pdf, {
    head: [tableColumns.map(col => col.header)],
    body: items.map(r => [
      r.name,
      r.type,
      r.category,
      r.status,
      r.generatedDate || 'N/A',
      r.recordCount || 'N/A',
      r.downloadCount
    ]),
    startY: yPosition,
    styles: {
      fontSize: 7,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 }
    }
  });

  return pdf;
};

// Firestore-backed reports hook
export const useOfficerFirestoreReports = (setState: React.Dispatch<React.SetStateAction<Report[]>>) => {
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
