"use client";
import React, { createElement } from 'react';
import { Download, Eye, Clock } from 'lucide-react';
import type { Report, TranslateFn } from '../helpers';
import {
  OFFICER_GHOST_BTN,
  OFFICER_STATUS_OPTIONS,
  getOfficerStatusPillClass,
  getOfficerFormatIcon,
  getOfficerCategoryLabel,
  formatDate,
  formatFileSize,
} from '../helpers';
import OfficerDetailItem from './OfficerDetailItem';

/**
 * Officer report card: status pill, meta grid with format icon, inline
 * status select and download/analyze/schedule actions.
 */
export default function OfficerReportCard({
  report,
  t,
  onSelect,
  onDownload,
  onSchedule,
  onStatusUpdate,
}: {
  report: Report;
  t: TranslateFn;
  onSelect: (report: Report) => void;
  onDownload: (reportId: string) => void;
  onSchedule: (reportId: string) => void;
  onStatusUpdate: (reportId: string, status: Report['status']) => void;
}) {
  return (
    <div
      className="theme-bg-card theme-border-glass border rounded-lg p-3.5 flex flex-col cursor-pointer hover:theme-bg-hover transition-colors"
      onClick={() => onSelect(report)}
    >
      {/* Title + status pill */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold theme-text-primary truncate">{report.name}</h3>
          <p className="text-[11px] theme-text-muted truncate font-mono mt-0.5">{report.id}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getOfficerStatusPillClass(report.status)}`}>
          {report.status}
        </span>
      </div>

      {/* Description */}
      {report.description && (
        <p className="text-xs theme-text-secondary line-clamp-2 leading-relaxed mb-2.5">
          {report.description}
        </p>
      )}

      {/* Meta definition pairs */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 mb-3">
        <OfficerDetailItem label={t('extracted.type')}>{report.type}</OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.category')}>{getOfficerCategoryLabel(t, report.category)}</OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.format')}>
          <span className="inline-flex items-center gap-1">
            {createElement(getOfficerFormatIcon(report.fileFormat || 'PDF'), { className: 'w-3 h-3 theme-text-muted shrink-0' })}
            {report.fileFormat}
          </span>
        </OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.frequency')}>
          <span className="capitalize">{report.frequency}</span>
        </OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.records')}>{report.recordCount ?? '--'}</OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.size')}>{formatFileSize(report.fileSize)}</OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.downloads')}>{report.downloadCount}</OfficerDetailItem>
        <OfficerDetailItem label={t('extracted.generated_date')}>{formatDate(report.generatedDate)}</OfficerDetailItem>
      </dl>

      {/* Footer hairline actions */}
      <div className="mt-auto pt-2.5 border-t theme-border-glass flex flex-wrap items-center gap-1.5 gap-y-2">
        <select
          value={report.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onStatusUpdate(report.id, e.target.value as Report['status']);
          }}
          className="h-8 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-xs focus:outline-none focus:border-[var(--accent-primary)] transition-colors min-w-0 max-w-[130px]"
        >
          {OFFICER_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            title={t('extracted.download')}
            aria-label={t('extracted.download')}
            disabled={report.status !== 'completed'}
            onClick={(e) => { e.stopPropagation(); onDownload(report.id); }}
            className={OFFICER_GHOST_BTN}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            title={t('extracted.analyze')}
            aria-label={t('extracted.analyze')}
            onClick={(e) => { e.stopPropagation(); onSelect(report); }}
            className={OFFICER_GHOST_BTN}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {!report.isScheduled && (
            <button
              title={t('extracted.update_status') || 'Schedule'}
              aria-label={t('extracted.update_status') || 'Schedule'}
              onClick={(e) => { e.stopPropagation(); onSchedule(report.id); }}
              className={OFFICER_GHOST_BTN}
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
