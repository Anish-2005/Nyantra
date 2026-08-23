"use client";
import React from 'react';
import { Eye, Edit } from 'lucide-react';
import type { Grievance, TranslateFn } from '../helpers';
import {
  OFFICER_STATUSES, iconBtn, pillCls,
  getOfficerStatusColor, getOfficerPriorityColor
} from '../officerHelpers';

/** List-view body: stacked cards under lg, full table with inline status control above lg. */
export default function OfficerGrievanceTable({
  grievances,
  onUpdateStatus,
  onView,
  onEdit,
  t,
}: {
  grievances: Grievance[];
  onUpdateStatus: (id: string, status: string) => void;
  onView: (grievance: Grievance) => void;
  onEdit: (grievance: Grievance) => void;
  t: TranslateFn;
}) {
  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden p-3 grid grid-cols-1 gap-3">
        {grievances.map((g) => (
          <div key={g.id} className="theme-bg-card theme-border-glass border rounded-lg p-3.5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold theme-text-primary truncate">{g.beneficiaryName}</p>
                <p className="text-xs theme-text-muted truncate">{g.id} \u2022 {g.district}</p>
              </div>
              <span className={`${pillCls} ${getOfficerPriorityColor(g.priority)} shrink-0`}>
                {g.priority ? g.priority.toUpperCase() : '-'}
              </span>
            </div>
            <p className="text-[13px] theme-text-secondary line-clamp-2 mb-2.5">{g.description}</p>
            <div className="pt-2.5 border-t theme-border-glass flex items-center gap-2">
              <select
                value={g.status}
                onChange={(e) => onUpdateStatus(g.id, e.target.value)}
                className={`max-sm:py-1.5 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass cursor-pointer ${getOfficerStatusColor(g.status)}`}
              >
                {OFFICER_STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
              </select>
              <div className="ml-auto flex items-center gap-0.5">
                <button className={`${iconBtn} max-sm:p-2`} onClick={() => onView(g)} aria-label={`View ${g.id}`}>
                  <Eye className="w-4 h-4" />
                </button>
                <button className={`${iconBtn} max-sm:p-2`} onClick={() => onEdit(g)} aria-label={`Edit ${g.id}`}>
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {grievances.length === 0 && (
          <div className="py-10 text-center text-sm theme-text-muted">
            {t('extracted.no_activity')}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b theme-border-glass">
            <tr className="whitespace-nowrap">
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">ID</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.beneficiary')}</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.district')}</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.priority')}</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.status')}</th>
              <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y theme-border-glass">
            {grievances.map((g) => (
              <tr key={g.id} className="hover:theme-bg-hover transition-colors">
                <td className="py-2.5 px-3 text-[13px] font-medium theme-text-primary whitespace-nowrap">{g.id}</td>
                <td className="py-2.5 px-3 text-[13px] theme-text-primary">{g.beneficiaryName}</td>
                <td className="py-2.5 px-3 text-[13px] theme-text-muted">{g.district}</td>
                <td className="py-2.5 px-3">
                  <span className={`${pillCls} ${getOfficerPriorityColor(g.priority)}`}>{g.priority ? g.priority.toUpperCase() : '-'}</span>
                </td>
                <td className="py-2.5 px-3">
                  <select
                    value={g.status}
                    onChange={(e) => onUpdateStatus(g.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass cursor-pointer ${getOfficerStatusColor(g.status)}`}
                  >
                    {OFFICER_STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
                  </select>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="inline-flex items-center gap-0.5">
                    <button className={iconBtn} onClick={() => onView(g)} aria-label={`View ${g.id}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className={iconBtn} onClick={() => onEdit(g)} aria-label={`Edit ${g.id}`}>
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {grievances.length === 0 && (
          <div className="py-10 text-center text-sm theme-text-muted">{t('extracted.no_activity')}</div>
        )}
      </div>
    </>
  );
}
