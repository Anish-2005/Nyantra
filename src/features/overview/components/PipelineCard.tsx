"use client";
import type { OverviewStats, TranslateFn } from '../helpers';

/** Approval-rate conic-gradient ring card with pipeline status chips. */
export default function PipelineCard({
  stats,
  t,
}: {
  stats: OverviewStats;
  t: TranslateFn;
}) {
  const approvalRate = stats.totalApplications > 0
    ? Math.round((stats.approvedCount / stats.totalApplications) * 100)
    : 0;
  const ringStyle = {
    background: `conic-gradient(var(--accent-primary) 0%, var(--accent-secondary) ${approvalRate}%, var(--glass-bg) ${approvalRate}%, var(--glass-bg) 100%)`,
  };

  const pipelineChips = [
    { label: t('extracted.pending_applications'), count: stats.pendingCount, dot: 'bg-amber-500' },
    { label: 'In review', count: stats.inReviewCount, dot: 'bg-blue-500' },
    { label: t('extracted.approved_applications'), count: stats.approvedCount, dot: 'bg-emerald-500' },
    { label: 'Rejected', count: stats.rejectedCount, dot: 'bg-red-500' },
  ];

  return (
    <div className="theme-bg-card border theme-border-glass rounded-xl p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
      <div className="relative w-20 h-20 shrink-0 rounded-full grid place-items-center" style={ringStyle} role="img" aria-label={`${approvalRate}%`}>
        <div className="absolute inset-[5px] rounded-full" style={{ background: 'var(--card-bg)' }} />
        <span className="relative text-base font-semibold tracking-tight theme-text-primary tabular-nums">{approvalRate}%</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold theme-text-primary">{t('extracted.approval_rate')}</p>
        <p className="text-xs theme-text-muted mt-0.5 leading-relaxed">
          {t('extracted.approved_of_total', { approved: stats.approvedCount, total: stats.totalApplications })}
          {stats.pendingCount > 0 && ` · ${t('extracted.in_progress_count', { count: stats.pendingCount })}`}
        </p>
        <div className="flex items-center gap-3 flex-wrap mt-2.5">
          {pipelineChips.map(({ label, count, dot }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 text-[11px] tabular-nums ${count > 0 ? 'theme-text-primary font-medium' : 'theme-text-muted opacity-60'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {label} · {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
