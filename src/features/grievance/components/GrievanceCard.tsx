"use client";
import React from 'react';
import { Eye } from 'lucide-react';
import type { Grievance, TranslateFn } from '../helpers';
import { getStatusColor, getStatusIcon, getTranslatedStatus } from '../helpers';

/** Compact grievance row card for the user's grievance list. */
export default function GrievanceCard({
  grievance,
  selected,
  onSelect,
  t,
}: {
  grievance: Grievance;
  selected: boolean;
  onSelect: (grievance: Grievance) => void;
  t: TranslateFn;
}) {
  return (
    <div
      onClick={() => onSelect(grievance)}
      className={`p-3.5 rounded-lg border cursor-pointer transition-colors relative overflow-hidden ${
        selected
          ? 'border-[var(--accent-primary)] theme-bg-glass'
          : 'theme-border-glass hover:theme-bg-hover'
      }`}
    >
      {grievance.status === 'escalated' && (
        <span className="absolute left-0 inset-y-0 w-0.5 bg-red-500/80" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold theme-text-primary truncate leading-tight">
              {grievance.category || 'General Grievance'}
            </h4>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusColor(grievance.status)}`}>
              {React.createElement(getStatusIcon(grievance.status), { className: 'w-3 h-3' })}
              {getTranslatedStatus(t, grievance.status)}
            </span>
          </div>

          <p className="text-xs theme-text-muted truncate mt-0.5">
            {grievance.id}
            {' • '}{t('extracted.filed')}: {grievance.createdDate ? new Date(grievance.createdDate).toLocaleString() : 'Recent'}
            {grievance.assignedTo && ` • ${t('extracted.assigned_to')}: ${grievance.assignedTo}`}
          </p>

          <p className="text-xs theme-text-muted line-clamp-2 mt-1.5">
            {grievance.description}
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(grievance); }}
          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
          title={t('extracted.view_details')}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
