"use client";
import React from 'react';

/** Status → pill tone. Covers every status used across user + officer dashboards. */
const TONES: Record<string, string> = {
  // applications / disbursements
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'in-review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'documents-required': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disbursed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  released: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
  // grievance
  open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  escalated: 'bg-red-500/10 text-red-600 dark:text-red-400',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  closed: 'bg-gray-500/10 text-gray-500',
  // reports
  scheduled: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

export const getPillTone = (status?: string | null) =>
  TONES[status || ''] || 'bg-gray-500/10 text-gray-500';

export default function StatusPill({
  status,
  label,
  icon: Icon,
}: {
  status?: string | null;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getPillTone(status)}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label ?? status ?? '—'}
    </span>
  );
}
