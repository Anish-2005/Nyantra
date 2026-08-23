'use client';

import { Heart, Scale, Wallet } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { computeActBreakdown } from '@/utils/disbursementSelectors';
import { formatCurrency } from './shared';

interface Props {
  stats: { disbursedAmount: number; totalAmount: number; pendingAmount: number };
  items: readonly DisbursementRaw[];
  className?: string;
}

export function FinancialOverview({ stats, items, className = '' }: Props) {
  const { t } = useLocale();
  const breakdown = computeActBreakdown(items);
  const pct =
    stats.totalAmount > 0
      ? Math.min(100, Math.round((stats.disbursedAmount / stats.totalAmount) * 100))
      : 0;

  return (
    <div className={`theme-bg-card theme-border-glass border rounded-xl overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b theme-border-glass">
        <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.financial_overview')}</h3>
        <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted tabular-nums">
          {pct}% {t('extracted.disbursed')}
        </span>
      </div>

      <div className="flex-1 divide-y theme-border-glass">
        {/* Total disbursed */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            <Wallet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{t('extracted.total_disbursed')}</span>
          </div>
          <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">
            {formatCurrency(stats.disbursedAmount)}
          </p>
          <div className="mt-2.5 h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full accent-gradient transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] theme-text-muted mt-1.5 tabular-nums">
            <span>{t('extracted.total')}: {formatCurrency(stats.totalAmount)}</span>
            <span>{t('extracted.pending')}: {formatCurrency(stats.pendingAmount)}</span>
          </div>
        </div>

        {/* PCR Act */}
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium theme-text-primary truncate leading-tight">
                {t('extracted.pcr_act_disbursements')}
              </p>
              <p className="text-[11px] theme-text-muted mt-0.5 tabular-nums">{breakdown.pcrCount}</p>
            </div>
          </div>
          <p className="text-sm font-semibold theme-text-primary tabular-nums shrink-0">
            {formatCurrency(breakdown.pcrDisbursed)}
          </p>
        </div>

        {/* PoA Act */}
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium theme-text-primary truncate leading-tight">
                {t('extracted.poa_act_disbursements')}
              </p>
              <p className="text-[11px] theme-text-muted mt-0.5 tabular-nums">{breakdown.poaCount}</p>
            </div>
          </div>
          <p className="text-sm font-semibold theme-text-primary tabular-nums shrink-0">
            {formatCurrency(breakdown.poaDisbursed)}
          </p>
        </div>
      </div>
    </div>
  );
}
