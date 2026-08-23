'use client';

import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { computeMonthlyTrend } from '@/utils/disbursementSelectors';

export function MonthlyTrendChart({ items, className = '' }: { items: readonly DisbursementRaw[]; className?: string }) {
  const { t } = useLocale();

  const trend = useMemo(() => {
    let monthLabels: string[] = [];
    try {
      monthLabels = JSON.parse(t('extracted.months_short'));
    } catch {
      monthLabels = [];
    }
    return computeMonthlyTrend(items, monthLabels, 6);
  }, [items, t]);

  const maxAdded = Math.max(...trend.map((p) => Math.max(p.added, p.completed)), 1);

  return (
    <div className={`theme-bg-card theme-border-glass border rounded-xl overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b theme-border-glass">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.disbursement_trend')}</h3>
          <p className="text-xs theme-text-muted mt-0.5 truncate">{t('extracted.monthly_disbursement_performance')}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium theme-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {t('extracted.added')}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium theme-text-muted">
            <span className="w-1.5 h-1.5 rounded-full accent-gradient" />
            {t('extracted.completed')}
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-6 gap-2 h-32" role="img" aria-label={t('extracted.disbursement_trend')}>
          {trend.map((point) => (
            <div key={point.label + point.added} className="flex flex-col items-center min-w-0">
              <div className="flex items-end justify-center w-full flex-1 gap-1">
                <div
                  title={`${point.label} · ${t('extracted.added')}: ${point.added}`}
                  className="w-full max-w-[14px] bg-blue-500/80 hover:bg-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max((point.added / maxAdded) * 100, point.added > 0 ? 4 : 1)}%` }}
                />
                <div
                  title={`${point.label} · ${t('extracted.completed')}: ${point.completed}`}
                  className="w-full max-w-[14px] accent-gradient rounded-t transition-all duration-500"
                  style={{ height: `${Math.max((point.completed / maxAdded) * 100, point.completed > 0 ? 4 : 1)}%` }}
                />
              </div>
              <span className="text-[11px] theme-text-muted mt-2 truncate">{point.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
