"use client";
import React, { createElement } from 'react';
import { Search, Database, FileText, BookOpen, Clock, Loader2 } from 'lucide-react';
import type { Report, TranslateFn } from '../helpers';
import OfficerReportCard from './OfficerReportCard';

type OfficerViewMode = 'reports' | 'templates' | 'scheduled';

// Module-scope view-tab defs (react-hooks/static-components: render icons via createElement)
const OFFICER_VIEW_TABS: Array<{
  mode: OfficerViewMode;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { mode: 'reports', labelKey: 'extracted.reports', icon: FileText },
  { mode: 'templates', labelKey: 'extracted.templates', icon: BookOpen },
  { mode: 'scheduled', labelKey: 'extracted.scheduled', icon: Clock }
];

/**
 * Reports list panel: search + system export + view-mode toolbar above the
 * responsive card grid of officer report cards.
 */
export default function OfficerReportsPanel({
  t,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  loading,
  onSystemExport,
  filteredCount,
  reports,
  onOpen,
  onDownload,
  onSchedule,
  onStatusUpdate,
}: {
  t: TranslateFn;
  viewMode: OfficerViewMode;
  onViewModeChange: (mode: OfficerViewMode) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  onSystemExport: () => void;
  filteredCount: number;
  reports: Report[];
  onOpen: (report: Report) => void;
  onDownload: (reportId: string) => void;
  onSchedule: (reportId: string) => void;
  onStatusUpdate: (reportId: string, status: Report['status']) => void;
}) {
  const resultLabel = viewMode === 'templates'
    ? t('extracted.no_templates')
    : `${filteredCount} ${t('extracted.reports_found')}`;

  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.recent_reports')}</h2>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {resultLabel}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative sm:w-52 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={t('extracted.search_reports')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          {/* Full System Export */}
          <button
            onClick={onSystemExport}
            disabled={loading}
            title={t('extracted.comprehensiveExportDescription') || ''}
            className="h-9 px-3 rounded-md text-xs border theme-border-glass theme-text-secondary font-medium hover:theme-bg-glass inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{t('extracted.comprehensiveExport') || 'System Export'}</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 theme-bg-glass rounded-md p-1">
            {OFFICER_VIEW_TABS.map(({ mode, labelKey, icon }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`h-8 sm:h-7 px-3 sm:px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  viewMode === mode
                    ? 'accent-gradient text-white'
                    : 'theme-text-muted hover:theme-text-primary'
                }`}
              >
                {createElement(icon, { className: 'w-3 h-3' })}
                <span className="hidden md:inline">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {reports.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-xs theme-text-muted">{resultLabel}</p>
          </div>
        ) : reports.map(report => (
          <OfficerReportCard
            key={report.id}
            report={report}
            t={t}
            onSelect={onOpen}
            onDownload={onDownload}
            onSchedule={onSchedule}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>
    </div>
  );
}
