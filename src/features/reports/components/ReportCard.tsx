"use client";
import React from 'react';
import { Eye, Download, FileText } from 'lucide-react';
import type { Report } from '../helpers';
import {
  CATEGORY_ICONS,
  SPINE_BG,
  getTypePillClass,
  getFormatPillClass,
  getStatusPillClass,
  formatDate,
  formatFileSize,
} from '../helpers';

const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Library card for a single report: category spine, icon tile, meta grid
 * and status/format pills with view + download actions.
 */
export default function ReportCard({
  report,
  selected,
  onOpen,
  onDownload,
  t,
}: {
  report: Report;
  selected: boolean;
  onOpen: () => void;
  onDownload: (e: React.MouseEvent) => void;
  t: (key: string) => string;
}) {
  const Icon = CATEGORY_ICONS[report.category] || FileText;

  return (
    <div
      onClick={onOpen}
      className={`p-3.5 rounded-lg border cursor-pointer transition-colors relative overflow-hidden ${
        selected
          ? 'border-[var(--accent-primary)] theme-bg-glass'
          : 'theme-border-glass hover:theme-bg-hover'
      }`}
    >
      <span className={`absolute left-0 inset-y-0 w-0.5 ${SPINE_BG[report.category] || 'bg-transparent'}`} />
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

      <div className="flex items-center justify-between gap-2 pt-2.5 border-t theme-border-glass flex-wrap">
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
}
