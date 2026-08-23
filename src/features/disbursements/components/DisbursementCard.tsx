"use client";
import { createElement } from 'react';
import { motion } from 'framer-motion';
import type { Disbursement, TranslateFn } from '../helpers';
import {
  PILL_BASE,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusIcon,
  getTranslatedStatus,
} from '../helpers';

/** History row card for a single disbursement: identity strip, meta grid, status pills and amount/progress column. */
export default function DisbursementCard({
  disbursement,
  isSelected,
  onSelect,
  index,
  t,
}: {
  disbursement: Disbursement;
  isSelected: boolean;
  onSelect: (disbursement: Disbursement) => void;
  index: number;
  t: TranslateFn;
}) {
  const StatusIcon = getStatusIcon(disbursement.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.15) }}
      onClick={() => onSelect(disbursement)}
      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? 'border-[var(--accent-primary)] theme-bg-glass'
          : 'theme-border-glass hover:theme-bg-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-md theme-bg-glass flex items-center justify-center theme-text-primary text-[11px] font-semibold shrink-0">
              {disbursement.beneficiaryName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate theme-text-primary leading-tight">
                {disbursement.beneficiaryName}
              </h3>
              <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">
                {disbursement.id}{disbursement.transactionId ? ` • ${disbursement.transactionId}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2.5">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.location')}</p>
              <p className="font-medium text-sm theme-text-primary truncate">{disbursement.district}, {disbursement.state}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.act_type')}</p>
              <p className="font-medium text-sm theme-text-primary truncate">{disbursement.actType}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.payment_method')}</p>
              <p className="font-medium text-sm theme-text-primary truncate">{disbursement.paymentMethod || '—'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.initiated_date')}</p>
              <p className="font-medium text-sm theme-text-primary tabular-nums truncate">{formatDate(disbursement.initiatedDate)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`${PILL_BASE} ${getStatusColor(disbursement.status)}`}>
              {createElement(StatusIcon, { className: 'w-3 h-3' })}
              {getTranslatedStatus(t, disbursement.status)}
            </span>
            {disbursement.isProgressivePayment && (
              <span className={`${PILL_BASE} theme-bg-glass theme-text-secondary shrink-0`}>
                {disbursement.completedInstallments || 0}/{disbursement.totalInstallments || 3}{' '}
                {t('disbursements.installments_word')}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums theme-text-primary">
            {formatCurrency(disbursement.disbursedAmount || 0)}
          </p>
          {disbursement.isProgressivePayment && disbursement.disbursementProgress !== undefined && (
            <p className="text-[11px] theme-text-muted tabular-nums mt-0.5">
              / {formatCurrency(disbursement.reliefAmount)}
            </p>
          )}
          {disbursement.isProgressivePayment && (
            <div className="mt-1.5 w-28 sm:w-32 ml-auto">
              <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                />
              </div>
              <p className="text-[11px] theme-text-accent tabular-nums mt-1">
                {(disbursement.disbursementProgress ?? 0).toFixed(2)}
                {t('disbursements.pct_disbursed')}
              </p>
            </div>
          )}
          {disbursement.status === 'completed' && !disbursement.isProgressivePayment && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
              ✓ {t('extracted.disbursed')} {formatCurrency(disbursement.disbursedAmount)}
            </p>
          )}
          {disbursement.status === 'failed' && disbursement.failureReason && (
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 max-w-[180px] ml-auto">
              {disbursement.failureReason}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
