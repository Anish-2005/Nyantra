"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';
import {
  Search, Download, Eye, X, FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
import { db } from '@/lib/firebase';
import { PageHeader, StatBand, EmptyState } from '@/components/dashboard/ui';
import ReportCard from './components/ReportCard';
import type { Report } from './helpers';
import {
  CATEGORY_ICONS,
  FORMAT_COLORS,
  formatDate,
  formatDateTime,
  formatFileSize,
  getStatusPillClass,
} from './helpers';

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

const UserReportsPage = () => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
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

  // Format distribution for composition bar
  const formatSegments = useMemo(() => {
    const counts = new Map<string, number>();
    reports.forEach(r => {
      const fmt = (r.fileFormat || 'other').toLowerCase();
      counts.set(fmt, (counts.get(fmt) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [reports]);

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
      <PageHeader
        title={t('extracted.reports')}
        highlight={t('extracted.download')}
        subtitle={t('extracted.access_download_view_available_reports')}
      />

      {/* Stats Band */}
      <StatBand
        cols={4}
        cells={[
          { label: t('extracted.total'), value: stats.total, icon: FileText },
          { label: t('extracted.completed'), value: stats.completed, icon: CheckCircle2 },
          { label: t('extracted.scheduled'), value: stats.scheduled, icon: Clock },
          { label: t('extracted.downloads'), value: stats.downloads, icon: Download }
        ]}
      />

      {/* Format Composition */}
      <div className="theme-bg-card theme-border-glass border rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.format')}</span>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {(formatSegments.length > 0 ? formatSegments : []).map(([fmt, count]) => (
              <span key={fmt} className="inline-flex items-center gap-1.5 text-[11px] theme-text-muted tabular-nums capitalize">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${FORMAT_COLORS[fmt] || 'bg-gray-400'}`} />
                {fmt} · {count}
              </span>
            ))}
          </div>
        </div>
        <div className="flex h-1.5 gap-px rounded-full overflow-hidden bg-black/5 dark:bg-white/10" aria-hidden="true">
          {formatSegments.map(([fmt, count]) => (
            <div
              key={fmt}
              className={FORMAT_COLORS[fmt] || 'bg-gray-400'}
              style={{ flexGrow: count }}
              title={`${fmt}: ${count}`}
            />
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary shrink-0">
            {t('extracted.reports')} <span className="theme-text-muted font-normal">({filteredReports.length})</span>
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {filteredReports.map(renderCard)}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <EmptyState
              icon={FileText}
              title={t('extracted.no_reports_found')}
              hint={t('extracted.try_adjusting_filters')}
            />
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
