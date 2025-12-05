"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, X, FileText,
  BarChart3,
  Database,
  ArrowUpRight,
  Activity,
  Calendar,
  Clock,
  Filter,
  Grid3X3,
  Table
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'financial': return Database;
    case 'compliance': return FileText;
    case 'performance': return BarChart3;
    case 'statistical': return Activity;
    case 'analytical': return BarChart3;
    case 'technical': return Database;
    default: return FileText;
  }
};

const UserReportsPage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Subscribe to Firestore reports collection
  useFirestoreReports(setReports);

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

  return (
    <div data-theme={theme} className="min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              theme === 'dark' ? '#1e40af' : '#3b82f6'
          }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              theme === 'dark' ? '#7c3aed' : '#8b5cf6'
          }}
        ></div>
      </div>

      <div className="relative z-10 p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
        >
          {/* Animated gradient background - theme aware */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                : 'bg-gradient-to-br from-blue-400/15 to-purple-400/15'
            }`}
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
                {t('extracted.reports')} • {t('extracted.download')}
              </span>
            </div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              {t('extracted.reports')}{' '}
              <span className="text-accent-gradient inline-block leading-normal ml-2">
                {t('extracted.download')}
              </span>
            </h1>
            <p className="theme-text-secondary max-w-2xl mx-auto lg:mx-0">
              {t('extracted.access_download_view_available_reports')}
            </p>
          </div>
        </motion.div>

{/* Report Detail Section (Inline, not popup) */}
<AnimatePresence>
  {selectedReport && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-6"
    >
      <div className="rounded-2xl theme-bg-card theme-border-glass border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border-glass">
          <div>
            <h2 className="text-2xl font-bold theme-text-primary">
              {selectedReport.name}
            </h2>
            <p className="text-sm theme-text-muted mt-1">
              {selectedReport.id}
            </p>
          </div>
          <button
            onClick={() => setSelectedReport(null)}
            className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/10 transition-colors"
          >
            <X className="w-5 h-5 theme-text-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                <h4 className="text-sm font-semibold theme-text-primary mb-2">
                  {t('extracted.report_details')}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="theme-text-muted">
                    <strong>{t('extracted.type')}:</strong>{' '}
                    {selectedReport.type}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.category')}:</strong>{' '}
                    {selectedReport.category}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.frequency')}:</strong>{' '}
                    {selectedReport.frequency}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.format')}:</strong>{' '}
                    {selectedReport.fileFormat}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                <h4 className="text-sm font-semibold theme-text-primary mb-2">
                  {t('extracted.generation_info')}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="theme-text-muted">
                    <strong>{t('extracted.generated_by')}:</strong>{' '}
                    {selectedReport.generatedBy || t('extracted.system')}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.generated_date')}:</strong>{' '}
                    {formatDateTime(selectedReport.generatedDate)}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.last_run')}:</strong>{' '}
                    {formatDateTime(selectedReport.lastRun)}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.next_run')}:</strong>{' '}
                    {formatDateTime(selectedReport.nextRun)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                <h4 className="text-sm font-semibold theme-text-primary mb-2">
                  {t('extracted.statistics')}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="theme-text-muted">
                    <strong>{t('extracted.record_count')}:</strong>{' '}
                    {selectedReport.recordCount || '--'}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.file_size')}:</strong>{' '}
                    {formatFileSize(selectedReport.fileSize)}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.download_count')}:</strong>{' '}
                    {selectedReport.downloadCount}
                  </p>
                  <p className="theme-text-muted">
                    <strong>{t('extracted.is_scheduled')}:</strong>{' '}
                    {selectedReport.isScheduled
                      ? t('extracted.yes')
                      : t('extracted.no')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg theme-bg-glass theme-border-glass border">
                <h4 className="text-sm font-semibold theme-text-primary mb-2">
                  {t('extracted.description')}
                </h4>
                <p className="text-sm theme-text-muted leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>
            </div>
          </div>

          {/* Status and Download */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg theme-bg-glass theme-border-glass border">
            <div>
              <h4 className="text-sm font-semibold theme-text-primary mb-1">
                {t('extracted.status')}
              </h4>
              <p className="text-sm theme-text-muted">
                {t('extracted.current_status')}:{' '}
                <span
                  className="font-medium"
                  style={{
                    color:
                      selectedReport.status === 'completed'
                        ? (theme === 'dark' ? '#10b981' : '#059669')
                        : selectedReport.status === 'processing'
                        ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                        : selectedReport.status === 'scheduled'
                        ? (theme === 'dark' ? '#f59e0b' : '#d97706')
                        : selectedReport.status === 'failed'
                        ? (theme === 'dark' ? '#ef4444' : '#dc2626')
                        : (theme === 'dark' ? '#9ca3af' : '#6b7280')
                  }}
                >
                  {selectedReport.status}
                </span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (selectedReport.status === 'completed') {
                  handleDownload(selectedReport.id);
                }
              }}
              disabled={selectedReport.status !== 'completed'}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedReport.status === 'completed'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-5 h-5" />
              {t('extracted.download')}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>


        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="theme-bg-card theme-border-glass border rounded-2xl p-6 glass-effect"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
              <input
                type="text"
                placeholder={t('extracted.search_reports')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 theme-text-muted" />
                <span className="text-sm theme-text-primary">
                  {t('extracted.filters')}:
                </span>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">{t('extracted.all_statuses')}</option>
                <option value="completed">{t('extracted.completed')}</option>
                <option value="processing">{t('extracted.processing')}</option>
                <option value="scheduled">{t('extracted.scheduled')}</option>
                <option value="failed">{t('extracted.failed')}</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium theme-text-primary">
              {t('extracted.view_mode')}:
            </span>
            <div className="flex rounded-lg theme-bg-glass theme-border-glass border p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'theme-text-primary hover:theme-bg-glass'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                {t('extracted.grid')}
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'theme-text-primary hover:theme-bg-glass'
                }`}
              >
                <Table className="w-4 h-4" />
                {t('extracted.table')}
              </button>
            </div>
          </div>
          <div className="text-sm theme-text-muted">
            {filteredReports.length} {t('extracted.reports_found')}
          </div>
        </motion.div>

        {/* Reports Views */}
        {viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="theme-bg-card theme-border-glass border rounded-2xl p-5 glass-effect cursor-pointer group hover:shadow-lg transition-all duration-300"
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
                      <p className="theme-text-muted text-xs truncate">
                        {report.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                    <div
                      className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1"
                      style={{
                        backgroundColor:
                          report.status === 'completed'
                            ? (theme === 'dark' ? '#16a34a' : '#059669')
                            : report.status === 'processing'
                            ? (theme === 'dark' ? '#2563eb' : '#2563eb')
                            : report.status === 'scheduled'
                            ? (theme === 'dark' ? '#d97706' : '#d97706')
                            : report.status === 'failed'
                            ? (theme === 'dark' ? '#dc2626' : '#dc2626')
                            : (theme === 'dark' ? '#6b7280' : '#6b7280'),
                        color: 'white',
                        boxShadow:
                          theme === 'light'
                            ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                            : '0 1px 3px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            report.status === 'completed'
                              ? '#10b981'
                              : report.status === 'processing'
                              ? '#3b82f6'
                              : report.status === 'scheduled'
                              ? '#f59e0b'
                              : report.status === 'failed'
                              ? '#ef4444'
                              : '#9ca3af'
                        }}
                      />
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="theme-text-secondary text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <p className="text-sm font-bold theme-text-primary">
                      {report.recordCount ?? '--'}
                    </p>
                    <p className="theme-text-muted text-xs">
                      {t('extracted.records')}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {(() => {
                        const FormatIcon = FileText;
                        return (
                          <FormatIcon className="w-3 h-3 theme-text-muted" />
                        );
                      })()}
                      <p className="text-sm font-bold theme-text-primary">
                        {formatFileSize(report.fileSize)}
                      </p>
                    </div>
                    <p className="theme-text-muted text-xs">
                      {t('extracted.size')}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg theme-bg-glass">
                    <p className="text-sm font-bold theme-text-primary">
                      {report.downloadCount}
                    </p>
                    <p className="theme-text-muted text-xs">
                      {t('extracted.downloads')}
                    </p>
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
                    <span className="text-xs theme-text-muted">
                      {t('extracted.type')}: {report.type}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (report.status === 'completed') {
                        handleDownload(report.id);
                      }
                    }}
                    disabled={report.status !== 'completed'}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      report.status === 'completed'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    {t('extracted.download')}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Table View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="theme-bg-card theme-border-glass border rounded-2xl overflow-hidden glass-effect"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="theme-bg-glass">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.report')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.type')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.category')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.status')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.records')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.size')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.generated_date')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold theme-text-primary uppercase tracking-wider">
                      {t('extracted.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border-glass">
                  {filteredReports.map((report, idx) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:theme-bg-glass cursor-pointer transition-colors"
                      onClick={() => setSelectedReport(report)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                            {(() => {
                              const Icon = getCategoryIcon(report.category) || FileText;
                              return <Icon className="w-4 h-4" />;
                            })()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium theme-text-primary truncate">
                              {report.name}
                            </div>
                            <div className="text-xs theme-text-muted truncate">
                              {report.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm theme-text-primary capitalize">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm theme-text-primary capitalize">
                          {report.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                report.status === 'completed'
                                  ? '#10b981'
                                  : report.status === 'processing'
                                  ? '#3b82f6'
                                  : report.status === 'scheduled'
                                  ? '#f59e0b'
                                  : report.status === 'failed'
                                  ? '#ef4444'
                                  : '#9ca3af'
                            }}
                          />
                          <span
                            className="text-sm font-medium capitalize"
                            style={{
                              color:
                                report.status === 'completed'
                                  ? (theme === 'dark' ? '#10b981' : '#059669')
                                  : report.status === 'processing'
                                  ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                                  : report.status === 'scheduled'
                                  ? (theme === 'dark' ? '#f59e0b' : '#d97706')
                                  : report.status === 'failed'
                                  ? (theme === 'dark' ? '#ef4444' : '#dc2626')
                                  : (theme === 'dark' ? '#9ca3af' : '#6b7280')
                            }}
                          >
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm theme-text-primary">
                          {report.recordCount ?? '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm theme-text-primary">
                          {formatFileSize(report.fileSize)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm theme-text-primary">
                          {formatDate(report.generatedDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (report.status === 'completed') {
                              handleDownload(report.id);
                            }
                          }}
                          disabled={report.status !== 'completed'}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            report.status === 'completed'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          {t('extracted.download')}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

       

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 theme-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold theme-text-primary mb-2">
              {t('extracted.no_reports_found')}
            </h3>
            <p className="theme-text-muted">
              {t('extracted.try_adjusting_filters')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserReportsPage;
