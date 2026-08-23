"use client";
import React from 'react';
import { Download, Edit, Share2, X } from 'lucide-react';
import type { Report, TranslateFn } from '../helpers';
import {
  OFFICER_INPUT_CLS,
  OFFICER_STATUS_OPTIONS,
  getOfficerStatusPillClass,
  getOfficerCategoryLabel,
  formatDateTime,
  formatFileSize,
} from '../helpers';
import OfficerDetailItem from './OfficerDetailItem';

/**
 * Inline report detail inspector: header actions bar plus full meta grid,
 * description and status-update control for the selected officer report.
 */
export default function OfficerReportInspector({
  report,
  containerRef,
  t,
  onClose,
  onDownload,
  onEdit,
  onShare,
  onStatusUpdate,
}: {
  report: Report;
  containerRef: React.RefObject<HTMLDivElement | null>;
  t: TranslateFn;
  onClose: () => void;
  onDownload: (reportId: string) => void;
  onEdit: () => void;
  onShare: (report: Report) => void;
  onStatusUpdate: (reportId: string, status: Report['status']) => void;
}) {
  return (
    <div
      ref={containerRef}
      className="theme-bg-card theme-border-glass border rounded-xl w-full overflow-hidden scroll-mt-20"
      aria-live="polite"
    >
      {/* Header bar */}
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="min-w-0 flex items-center gap-2.5">
          <h2 className="text-sm font-semibold theme-text-primary truncate">{report.name}</h2>
          <span className="text-xs theme-text-muted truncate hidden sm:inline">{report.id}</span>
          <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getOfficerStatusPillClass(report.status)}`}>
            {report.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              if (report.status === 'completed') {
                onDownload(report.id);
              }
            }}
            disabled={report.status !== 'completed'}
            className="h-8 sm:h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">{t('extracted.download')}</span>
          </button>
          <button
            onClick={onEdit}
            className="h-8 sm:h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors inline-flex items-center gap-1.5"
          >
            <Edit className="w-3 h-3" />
            <span className="hidden sm:inline">{t('extracted.edit')}</span>
          </button>
          <button
            onClick={() => onShare(report)}
            className="h-8 sm:h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">{t('extracted.share')}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 sm:p-1 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
            aria-label={t('extracted.close_sidebar') || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5 space-y-3.5">
        <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
          <OfficerDetailItem label={t('extracted.type')}>{report.type}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.category')}>{getOfficerCategoryLabel(t, report.category)}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.frequency')}>
            <span className="capitalize">{report.frequency}</span>
          </OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.format')}>{report.fileFormat}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.record_count')}>{report.recordCount || '--'}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.file_size')}>{formatFileSize(report.fileSize)}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.download_count')}>{report.downloadCount}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.is_scheduled')}>
            {report.isScheduled ? t('extracted.yes') : t('extracted.no')}
          </OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.generated_by')}>{report.generatedBy || t('extracted.system')}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.generated_date')}>{formatDateTime(report.generatedDate)}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.last_run')}>{formatDateTime(report.lastRun)}</OfficerDetailItem>
          <OfficerDetailItem label={t('extracted.next_run')}>{formatDateTime(report.nextRun)}</OfficerDetailItem>
        </dl>

        {/* Description */}
        <div className="pt-3 border-t theme-border-glass">
          <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">
            {t('extracted.description')}
          </dt>
          <dd className="text-sm theme-text-secondary leading-relaxed">
            {report.description || '—'}
          </dd>
        </div>

        {/* Status update */}
        <div className="pt-3 border-t theme-border-glass">
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">
            {t('extracted.update_status') || 'Update Status'}
          </p>
          <select
            value={report.status}
            onChange={(e) => onStatusUpdate(report.id, e.target.value as Report['status'])}
            className={`${OFFICER_INPUT_CLS} w-full sm:w-44`}
          >
            {OFFICER_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
