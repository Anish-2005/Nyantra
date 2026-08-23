"use client";
import type { Disbursement, TranslateFn } from '../helpers';
import { formatCurrency } from '../helpers';

/**
 * Installment schedule block for progressive disbursements:
 * progress bar, per-installment ledger rows and next-installment hint.
 */
export default function ProgressivePaymentCard({
  disbursement,
  t,
}: {
  disbursement: Disbursement;
  t: TranslateFn;
}) {
  const count =
    disbursement.installmentAmounts?.length ||
    disbursement.installmentPercentages?.length ||
    disbursement.totalInstallments || 0;
  const done = disbursement.completedInstallments || 0;

  return (
    <div className="pt-3 border-t theme-border-glass">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
          Installment Schedule ·{' '}
          {(disbursement.disbursementProgress ?? 0).toFixed(2)}%
        </p>
        <span className="text-xs theme-text-muted tabular-nums shrink-0">
          {done} / {disbursement.totalInstallments || 3}{' '}
          {t('extracted.completed')}
        </span>
      </div>

      <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
          style={{ width: `${disbursement.disbursementProgress || 0}%` }}
        />
      </div>

      {count > 0 && (
        <div className="space-y-1">
          {Array.from({ length: count }, (_, i) => {
            const isDone = i < done;
            const amount =
              disbursement.installmentAmounts?.[i] ??
              Math.round(
                (disbursement.reliefAmount * (disbursement.installmentPercentages?.[i] ?? 0)) / 100
              );
            const pct = disbursement.installmentPercentages?.[i];
            return (
              <div key={i} className="flex items-center gap-2.5 py-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isDone ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                <span className="text-[13px] theme-text-primary flex-1 min-w-0 truncate">
                  {t('disbursements.installment_word')} {i + 1}
                </span>
                {pct !== undefined && (
                  <span className="text-[11px] theme-text-muted tabular-nums">{pct}%</span>
                )}
                <span
                  className={`text-[11px] font-medium tabular-nums shrink-0 ${
                    isDone ? 'text-emerald-600 dark:text-emerald-400' : 'theme-text-muted'
                  }`}
                >
                  {formatCurrency(amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {disbursement.nextInstallmentAmount && disbursement.nextInstallmentPercentage && (
        <p className="text-[11px] theme-text-muted tabular-nums mt-2.5">
          {t('extracted.next_installment')}: {formatCurrency(disbursement.nextInstallmentAmount)} ({disbursement.nextInstallmentPercentage}%)
        </p>
      )}
    </div>
  );
}
