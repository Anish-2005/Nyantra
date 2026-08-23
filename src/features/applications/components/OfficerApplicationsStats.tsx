"use client";
import React, { createElement } from 'react';
import { Users, Clock, Eye, Check, X, AlertCircle } from 'lucide-react';

interface StatCellConfig {
  status: string;
  label: string;
  count: number;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
}

/**
 * Officer applications stat band: icon-chip label row, tabular value and
 * a hover accent underline bar per cell (kit stat-cell anatomy).
 */
export default function OfficerApplicationsStats({
  stats,
  t,
}: {
  stats: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
    documentsRequired: number;
  };
  t: (key: string, options?: any) => string;
}) {
  const cells: StatCellConfig[] = [
    { status: 'total', label: t('applications.stats.total'), count: stats.total, Icon: Users, tone: 'text-blue-600 dark:text-blue-400' },
    { status: 'pending', label: t('applications.stats.pending'), count: stats.pending, Icon: Clock, tone: 'text-amber-600 dark:text-amber-400' },
    { status: 'in-review', label: t('applications.stats.inReview'), count: stats.inReview, Icon: Eye, tone: 'text-blue-600 dark:text-blue-400' },
    { status: 'approved', label: t('applications.stats.approved'), count: stats.approved, Icon: Check, tone: 'text-emerald-600 dark:text-emerald-400' },
    { status: 'rejected', label: t('applications.stats.rejected'), count: stats.rejected, Icon: X, tone: 'text-red-600 dark:text-red-400' },
    {
      status: 'documents-required',
      label: t('applications.stats.docsRequired') || t('applications.stats.documentsrequired'),
      count: stats.documentsRequired,
      Icon: AlertCircle,
      tone: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
      {cells.map(({ status, label, count, Icon, tone }) => (
        <div key={status} className="theme-bg-card p-3 sm:p-4 relative overflow-hidden group min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md theme-bg-glass grid place-items-center shrink-0">
              {createElement(Icon, { className: `w-3.5 h-3.5 ${tone}` })}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{label}</span>
          </div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums">
            {count}
          </p>
          <span className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>
      ))}
    </div>
  );
}
