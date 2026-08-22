"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';
import {
  Search, Download, Eye, X, FileText,
  BarChart3,
  Database,
  Activity,
  Grid3X3,
  Table
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
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
        const toIso = (v: any) =>
          v && typeof v.toDate === 'function'
            ? v.toDate().toISOString()
            : (v ? String(v) : null);

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

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: Database,
  compliance: FileText,
  performance: BarChart3,
  statistical: Activity,
  analytical: BarChart3,
  technical: Database
};

const getTypePillClass = (type: string) => {
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

const getFormatPillClass = (format: string) => {
  switch ((format || '').toLowerCase()) {
    case 'pdf': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'csv': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
    case 'excel':
    case 'xlsx': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

const getStatusPillClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'scheduled': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'failed': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

const formatDate = (s?: string | null) => {
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

const formatDateTime = (s?: string | null) => {
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

const formatFileSize = (size: string | null) => {
  return size || '--';
};

const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const Item = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{children}</dd>
  </div>
);

const Num = ({ children }: { children: React.ReactNode }) => (
  <span className="tabular-nums">{children}</span>
);

const ReportCard = ({ report, selected, onOpen, onDownload, t }: {
  report: Report;
  selected: boolean;
  onOpen: () => void;
  onDownload: (e: React.MouseEvent) => void;
  t: (key: string) => string;
}) => {
  const Icon = CATEGORY_ICONS[report.category] || FileText;

  return (
    <div
      onClick={onOpen}
      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
        selected
          ? 'border-[var(--accent-primary)] theme-bg-glass'
          : 'theme-border-glass hover:theme-bg-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md theme-bg-glass flex items-center justify-center theme-text-secondary shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold theme-text-primary truncate leading-tight">
              {report.name}
            </h4>
            <p className="text-xs theme-text-muted truncate mt-0.5 font-mono">
              {report.id}
            </p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getTypePillClass(report.type)}`}>
          {report.type}
        </span>
      </div>

      {report.description && (
        <p className="text-xs theme-text-secondary line-clamp-2 mb-3">
          {report.description}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.records')}</dt>
          <dd className="text-sm font-medium tabular-nums theme-text-primary mt-0.5 truncate">{report.recordCount ?? '--'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.size')}</dt>
          <dd className="text-sm font-medium tabular-nums theme-text-primary mt-0.5 truncate">{formatFileSize(report.fileSize)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.generated_date')}</dt>
          <dd className="text-sm font-medium tabular-nums theme-text-primary mt-0.5 truncate">{formatDate(report.generatedDate)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.frequency')}</dt>
          <dd className="text-sm font-medium capitalize theme-text-primary mt-0.5 truncate">{report.frequency}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-2 pt-2.5 border-t theme-border-glass">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusPillClass(report.status)}`}>
            {report.status}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getFormatPillClass(report.fileFormat)}`}>
            {report.fileFormat}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className={ghostBtn}
            title={t('extracted.view')}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('extracted.view')}</span>
          </button>
          <button
            onClick={onDownload}
            disabled={report.status !== 'completed'}
            className={ghostBtn}
            title={t('extracted.download')}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('extracted.download')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const UserReportsPage = () => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const inspectorRef = useRef<HTMLDivElement>(null);

  // Subscribe to Firestore reports collection
  useFirestoreReports(setReports);

  // Scroll inspector into view when a report is opened
  useEffect(() => {
    if (selectedReport && inspectorRef.current) {
      inspectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedReport?.id]);

  // Filter reports
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

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    return filtered;
  }, [reports, searchQuery, typeFilter, categoryFilter, statusFilter]);

  // Get unique values for filters
  const reportTypes = useMemo(() => {
    const types = [...new Set(reports.map(r => r.type))];
    return types.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  }, [reports]);

  const categories = useMemo(() => {
    const cats = [...new Set(reports.map(r => r.category))];
    return cats.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }));
  }, [reports]);

  const stats = useMemo(() => ({
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    scheduled: reports.filter(r => r.status === 'scheduled' || r.status === 'processing').length,
    downloads: reports.reduce((sum, r) => sum + (r.downloadCount || 0), 0)
  }), [reports]);

  const handleDownload = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        console.error('Report not found');
        return;
      }

      // Update download count
      try {
        await updateDoc(doc(db, 'reports', reportId), {
          downloadCount: (report.downloadCount || 0) + 1,
          lastUpdated: serverTimestamp()
        });
      } catch (updateError) {
        console.warn('Failed to update download count:', updateError);
      }

      // Generate PDF for the report
      const pdfDoc = new jsPDF({ unit: 'pt', format: 'a4' });

      // Simple test content
      pdfDoc.setFontSize(20);
      pdfDoc.text('Report Download', 40, 60);
      pdfDoc.setFontSize(12);
      pdfDoc.text('Report Name: ' + report.name, 40, 80);
      pdfDoc.text('Report ID: ' + report.id, 40, 100);
      pdfDoc.text('Generated at: ' + new Date().toLocaleString(), 40, 120);

      // Save the PDF
      const fileName = `${report.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}_${report.id}.pdf`;
      pdfDoc.save(fileName);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const renderCard = (report: Report) => (
    <ReportCard
      key={report.id}
      report={report}
      selected={selectedReport?.id === report.id}
      onOpen={() => setSelectedReport(report)}
      onDownload={(e) => {
        e.stopPropagation();
        if (report.status === 'completed') {
          handleDownload(report.id);
        }
      }}
      t={t}
    />
  );

  const selectCls =
    "h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.reports')}{' '}
            <span className="text-accent-gradient">{t('extracted.download')}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.access_download_view_available_reports')}
          </p>
        </div>
      </div>

      {/* Stats Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        {[
          { label: t('extracted.total'), value: stats.total },
          { label: t('extracted.completed'), value: stats.completed },
          { label: t('extracted.scheduled'), value: stats.scheduled },
          { label: t('extracted.downloads'), value: stats.downloads }
        ].map(({ label, value }) => (
          <div key={label} className="theme-bg-card p-3.5">
            <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{label}</p>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary shrink-0">
            {t('extracted.reports')} <span className="theme-text-muted font-normal">({filteredReports.length})</span>
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-md theme-bg-glass theme-border-glass border p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'theme-bg-card text-accent-gradient shadow-sm'
                    : 'theme-text-muted hover:theme-text-primary'
                }`}
                title={t('extracted.grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'theme-bg-card text-accent-gradient shadow-sm'
                    : 'theme-text-muted hover:theme-text-primary'
                }`}
                title={t('extracted.table')}
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted" />
              <input
                type="text"
                placeholder={t('extracted.search_reports')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-44 h-9 pl-8 pr-3 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('extracted.all_acts')}</option>
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('extracted.all_categories')}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectCls}
            >
              <option value="all">{t('extracted.all_statuses')}</option>
              <option value="completed">{t('extracted.completed')}</option>
              <option value="processing">{t('extracted.processing')}</option>
              <option value="scheduled">{t('extracted.scheduled')}</option>
              <option value="failed">{t('extracted.failed')}</option>
            </select>
          </div>
        </div>

        {/* Body */}
        <div className="p-2.5">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {filteredReports.map(renderCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border theme-border-glass overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="theme-bg-glass">
                      <tr>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.report')}
                        </th>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.type')}
                        </th>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.category')}
                        </th>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.records')}
                        </th>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.size')}
                        </th>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.generated_date')}
                        </th>
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider theme-text-muted font-medium">
                          {t('extracted.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border-glass">
                      {filteredReports.map((report) => {
                        const Icon = CATEGORY_ICONS[report.category] || FileText;
                        return (
                          <tr
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`cursor-pointer transition-colors ${
                              selectedReport?.id === report.id
                                ? 'theme-bg-glass'
                                : 'hover:theme-bg-hover'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md theme-bg-glass flex items-center justify-center theme-text-secondary shrink-0">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium theme-text-primary truncate">
                                  {report.name}
                                </div>
                                <div className="text-xs theme-text-muted truncate font-mono">
                                  {report.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-sm theme-text-primary capitalize">
                              {report.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-sm theme-text-primary capitalize">
                              {report.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-sm theme-text-primary tabular-nums">
                            {report.recordCount ?? '--'}
                          </td>
                          <td className="py-2.5 px-3 text-sm theme-text-primary tabular-nums">
                            {formatFileSize(report.fileSize)}
                          </td>
                          <td className="py-2.5 px-3 text-sm theme-text-primary tabular-nums">
                            {formatDate(report.generatedDate)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReport(report);
                                }}
                                className={ghostBtn}
                                title={t('extracted.view')}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (report.status === 'completed') {
                                    handleDownload(report.id);
                                  }
                                }}
                                disabled={report.status !== 'completed'}
                                className={ghostBtn}
                                title={t('extracted.download')}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid grid-cols-1 gap-2">
                {filteredReports.map(renderCard)}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass">
              <FileText className="w-8 h-8 theme-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium theme-text-primary mb-1">
                {t('extracted.no_reports_found')}
              </p>
              <p className="text-xs theme-text-muted">
                {t('extracted.try_adjusting_filters')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Inspector */}
      {selectedReport && (
        <div
          ref={inspectorRef}
          className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden scroll-mt-20"
          aria-live="polite"
        >
          {/* Header */}
          <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
            <div className="min-w-0 flex items-center gap-2.5">
              <h2 className="text-sm font-semibold theme-text-primary truncate">
                {selectedReport.name}
              </h2>
              <span className="text-xs theme-text-muted truncate hidden sm:inline font-mono">
                {selectedReport.id}
              </span>
              <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusPillClass(selectedReport.status)}`}>
                {selectedReport.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  if (selectedReport.status === 'completed') {
                    handleDownload(selectedReport.id);
                  }
                }}
                disabled={selectedReport.status !== 'completed'}
                className={ghostBtn}
              >
                <Download className="w-3.5 h-3.5" />
                {t('extracted.download')}
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                aria-label={t('extracted.cancel')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-3.5">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <Item label={t('extracted.type')}>
                <span className="capitalize">{selectedReport.type}</span>
              </Item>
              <Item label={t('extracted.category')}>
                <span className="capitalize">{selectedReport.category}</span>
              </Item>
              <Item label={t('extracted.frequency')}>
                <span className="capitalize">{selectedReport.frequency}</span>
              </Item>
              <Item label={t('extracted.format')}>
                {selectedReport.fileFormat}
              </Item>
              <Item label={t('extracted.generated_by')}>
                {selectedReport.generatedBy || t('extracted.system')}
              </Item>
              <Item label={t('extracted.generated_date')}>
                <Num>{formatDateTime(selectedReport.generatedDate)}</Num>
              </Item>
              <Item label={t('extracted.last_run')}>
                <Num>{formatDateTime(selectedReport.lastRun)}</Num>
              </Item>
              <Item label={t('extracted.next_run')}>
                <Num>{formatDateTime(selectedReport.nextRun)}</Num>
              </Item>
              <Item label={t('extracted.record_count')}>
                <Num>{selectedReport.recordCount ?? '--'}</Num>
              </Item>
              <Item label={t('extracted.file_size')}>
                {formatFileSize(selectedReport.fileSize)}
              </Item>
              <Item label={t('extracted.download_count')}>
                <Num>{selectedReport.downloadCount}</Num>
              </Item>
              <Item label={t('extracted.is_scheduled')}>
                {selectedReport.isScheduled ? t('extracted.yes') : t('extracted.no')}
              </Item>
            </dl>

            {/* Summary */}
            <div className="pt-3 mt-3.5 border-t theme-border-glass">
              <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5">
                {t('extracted.description')}
              </p>
              <p className="text-sm theme-text-secondary leading-relaxed">
                {selectedReport.description || '--'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReportsPage;
