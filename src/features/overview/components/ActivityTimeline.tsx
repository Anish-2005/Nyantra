"use client";
import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import type { Submission, TranslateFn } from '../helpers';
import { STATUS_DOTS, STATUS_STYLES } from '../helpers';

const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status || ''] || 'bg-gray-500/10 text-gray-500'}`}>
    {status || '—'}
  </span>
);

/** Recent activity timeline feed with loading skeleton and empty state. */
export default function ActivityTimeline({
  recent,
  dataLoading,
  locale,
  onNavigate,
  t,
}: {
  recent: Submission[];
  dataLoading: boolean;
  locale: string;
  onNavigate: (href: string) => void;
  t: TranslateFn;
}) {
  return (
    <div className="theme-bg-card border theme-border-glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b theme-border-glass">
        <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.recent_activity')}</h3>
        <button onClick={() => onNavigate('/dashboard/applications')} className="text-xs font-medium text-accent-gradient hover:opacity-80 transition-opacity">
          {t('extracted.view_all')}
        </button>
      </div>

      {dataLoading ? (
        <div className="divide-y theme-border-glass">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full theme-bg-glass animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-36 rounded theme-bg-glass animate-pulse" />
                <div className="h-2.5 w-24 rounded theme-bg-glass animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <FileText className="w-8 h-8 mx-auto theme-text-muted" />
          <p className="mt-3 text-sm font-medium theme-text-primary">{t('extracted.no_submissions_yet')}</p>
          <p className="mt-1 text-xs theme-text-muted">{t('extracted.your_applications_will_appear_here')}</p>
          <button
            onClick={() => onNavigate('/dashboard/applications')}
            className="mt-3 text-xs font-medium text-accent-gradient hover:opacity-80 transition-opacity"
          >
            {t('extracted.create_your_first_application')} →
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-3 bottom-3 w-px theme-border-glass" style={{ background: 'var(--border-color, var(--glass-bg))' }} aria-hidden="true" />
          {recent.map((submission) => (
            <button
              key={submission.id}
              onClick={() => onNavigate('/dashboard/applications')}
              className="group relative w-full flex items-center gap-3 px-4 py-2.5 text-left hover:theme-bg-hover transition-colors"
            >
              <span className={`relative z-10 w-2.5 h-2.5 shrink-0 rounded-full ring-4 ${STATUS_DOTS[submission.status || ''] || 'bg-gray-400'}`} style={{ '--tw-ring-color': 'var(--card-bg)' } as React.CSSProperties} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium theme-text-primary truncate leading-tight">
                  {submission.applicantName ?? (submission.anonymous ? t('extracted.anonymous') : '—')}
                </p>
                <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">
                  FIR <span className="font-mono">{submission.firNumber || '—'}</span> · {submission.applicationDate ? new Date(submission.applicationDate.toDate ? submission.applicationDate.toDate() : submission.applicationDate).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-GB') : '—'}
                </p>
              </div>
              <div className="hidden sm:block text-sm font-medium theme-text-primary tabular-nums">
                ₹{Number(submission.amountRequested || 0).toLocaleString()}
              </div>
              <StatusBadge status={submission.status} />
              <ArrowRight className="w-3.5 h-3.5 theme-text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
