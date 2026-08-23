"use client";
import React from 'react';
import { Eye, Edit } from 'lucide-react';
import type { Grievance, TranslateFn } from '../helpers';
import {
  OFFICER_STATUSES, iconBtn, pillCls,
  getOfficerStatusColor, getOfficerPriorityColor
} from '../officerHelpers';

/** Dashboard-grid case card: avatar, priority pill, meta stats and inline status control. */
export default function OfficerGrievanceCard({
  grievance,
  onUpdateStatus,
  onView,
  onEdit,
  t,
}: {
  grievance: Grievance;
  onUpdateStatus: (id: string, status: string) => void;
  onView: (grievance: Grievance) => void;
  onEdit: (grievance: Grievance) => void;
  t: TranslateFn;
}) {
  return (
    <div
      onClick={() => onView(grievance)}
      className="theme-bg-card theme-border-glass border rounded-lg p-3.5 cursor-pointer hover:theme-bg-hover transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
            {grievance.beneficiaryName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold theme-text-primary truncate">{grievance.beneficiaryName}</p>
            <p className="text-xs theme-text-muted truncate">{grievance.id}</p>
          </div>
        </div>
        <span className={`${pillCls} ${getOfficerPriorityColor(grievance.priority)} shrink-0`}>
          {grievance.priority ? grievance.priority.toUpperCase() : '-'}
        </span>
      </div>

      <p className="text-[13px] theme-text-secondary line-clamp-2 mb-2.5">{grievance.description}</p>

      <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-2.5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.files')}</p>
          <p className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums">{grievance.attachments}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.messages')}</p>
          <p className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums">{grievance.communication?.length ?? 0}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.escalation')}</p>
          <p className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums">L{grievance.escalationLevel}</p>
        </div>
      </div>

      <div className="pt-2.5 border-t theme-border-glass flex items-center gap-2">
        <select
          onClick={(e) => e.stopPropagation()}
          value={grievance.status}
          onChange={(e) => { e.stopPropagation(); onUpdateStatus(grievance.id, e.target.value); }}
          className={`max-sm:py-1.5 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass cursor-pointer ${getOfficerStatusColor(grievance.status)}`}
        >
          {OFFICER_STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            className={`${iconBtn} max-sm:p-2`}
            aria-label={`View ${grievance.id}`}
            onClick={(e) => { e.stopPropagation(); onView(grievance); }}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className={`${iconBtn} max-sm:p-2`}
            aria-label={`Edit ${grievance.id}`}
            onClick={(e) => { e.stopPropagation(); onEdit(grievance); }}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
