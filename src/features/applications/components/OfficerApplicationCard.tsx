"use client";
import React, { createElement } from 'react';
import { Eye, Edit, Trash } from 'lucide-react';
import type { OfficerApplication, TranslateFn } from '../helpers';
import {
  STATUS_SPINE,
  formatOfficerCurrency,
  formatOfficerDate,
  getOfficerTranslatedStatus,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  getTranslatedPriority,
} from '../helpers';

/** Status → icon-tile tone (module scope for react-hooks/static-components) */
const STATUS_TILE_TONE: Record<string, string> = {
  pending: 'text-amber-600 dark:text-amber-400',
  'in-review': 'text-blue-600 dark:text-blue-400',
  approved: 'text-emerald-600 dark:text-emerald-400',
  rejected: 'text-red-600 dark:text-red-400',
  'documents-required': 'text-purple-600 dark:text-purple-400'
};

const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 h-10 sm:h-8 px-3 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors";

const MetaCell = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-[11px] uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className={`text-sm font-medium tabular-nums theme-text-primary mt-0.5 truncate ${mono ? 'font-mono' : ''}`}>
      {value}
    </dd>
  </div>
);

/**
 * Canonical officer list-card: status spine, icon tile, semibold name +
 * mono id, clamped case-description line, 2-col meta dl and a footer with
 * status/priority pills and right-aligned ghost actions.
 */
export default function OfficerApplicationCard({
  application: app,
  highlighted,
  t,
  onView,
  onDelete,
}: {
  application: OfficerApplication;
  highlighted?: boolean;
  t: TranslateFn;
  onView: (app: OfficerApplication) => void;
  onDelete: (id: string) => void;
}) {
  const StatusIcon = getStatusIcon(app.status);
  const descriptionParts = [
    app.actType,
    app.incidentDate ? `${t('extracted.incident_date')}: ${new Date(app.incidentDate).toLocaleDateString()}` : '',
    app.firReport ? `${t('applications.firReport')}: ${app.firReport}` : '',
    app.caseNumber ? `${t('applications.caseNumber')}: ${app.caseNumber}` : ''
  ].filter(Boolean);

  return (
    <div
      id={`app-row-${app.id}`}
      onClick={() => onView(app)}
      className={`relative overflow-hidden theme-bg-card theme-border-glass border rounded-xl p-3.5 cursor-pointer transition-colors duration-200 min-w-0 ${
        highlighted
          ? 'border-[var(--accent-primary)] theme-bg-glass ring-2 ring-blue-500/50'
          : 'hover:theme-bg-hover'
      }`}
    >
      <span className={`absolute left-0 inset-y-0 w-0.5 ${STATUS_SPINE[app.status] || 'bg-transparent'}`} />

      {/* Header: icon tile + name/id + priority */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md theme-bg-glass grid place-items-center shrink-0">
            {createElement(StatusIcon, { className: `w-4 h-4 ${STATUS_TILE_TONE[app.status] || 'theme-text-secondary'}` })}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold theme-text-primary truncate leading-tight">
              {app.applicantName}
            </h4>
            <p className="text-xs theme-text-muted truncate mt-0.5 font-mono">{app.id}</p>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(
            app.priority
          )}`}
        >
          {getTranslatedPriority(t, app.priority)}
        </span>
      </div>

      {/* Description */}
      {descriptionParts.length > 0 && (
        <p className="text-xs theme-text-secondary line-clamp-2 mb-3">{descriptionParts.join(' \u00b7 ')}</p>
      )}

      {/* Meta grid */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <MetaCell label={t('extracted.location')} value={`${app.district}, ${app.state}`} />
        <MetaCell label={t('applications.beneficiaryId')} value={app.beneficiaryId || '\u2014'} mono />
        <MetaCell label={t('extracted.submitted')} value={formatOfficerDate(app.applicationDate)} />
        <MetaCell label={t('extracted.amount')} value={formatOfficerCurrency(app.amount)} />
      </dl>

      {/* Footer: status pill + actions */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t theme-border-glass flex-wrap">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(
            app.status
          )}`}
        >
          {createElement(StatusIcon, { className: 'w-3 h-3' })}
          {getOfficerTranslatedStatus(t, app.status)}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            className={ghostBtn}
            onClick={(e) => {
              e.stopPropagation();
              onView(app);
            }}
            title={t('extracted.view')}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('extracted.view')}</span>
          </button>
          <button
            className={ghostBtn}
            onClick={(e) => {
              e.stopPropagation();
              onView(app);
            }}
            title={t('extracted.edit')}
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('extracted.edit')}</span>
          </button>
          <button
            className={`${ghostBtn} hover:bg-red-500/10 hover:text-red-500`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(app.id);
            }}
            aria-label={`Delete ${app.id}`}
            title={t('extracted.delete')}
          >
            <Trash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('extracted.delete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
