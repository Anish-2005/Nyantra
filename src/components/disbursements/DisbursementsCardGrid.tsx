'use client';

import type { ReactNode } from 'react';
import { Calendar, CreditCard, Eye, Scale, Trash2 } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import {
  formatCurrency,
  formatDateGB,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
} from './shared';

interface Props {
  items: readonly DisbursementRaw[];
  onView: (record: DisbursementRaw) => void;
  onDelete: (record: DisbursementRaw) => void;
  renderInstallmentControls: (record: DisbursementRaw) => ReactNode;
}

/** CARDS VIEW — grid of disbursement cards. */
export function DisbursementsCardGrid({ items, onView, onDelete, renderInstallmentControls }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
      {items.map((disbursement) => {
        return (
          <div
            key={disbursement.id}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 cursor-pointer hover:border-[var(--accent-primary)]/40 transition-colors flex flex-col"
            onClick={() => onView(disbursement)}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full accent-gradient flex items-center justify-center text-white text-xs font-semibold">
                  {(disbursement.beneficiaryName ?? '')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold theme-text-primary truncate leading-tight">
                    {disbursement.beneficiaryName}
                  </p>
                  <p className="text-[11px] theme-text-muted truncate leading-tight mt-0.5">
                    {disbursement.id}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(theme, disbursement.priority ?? '')}`}
              >
                {disbursement.priority ?? '-'}
              </span>
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="theme-text-muted">{t('extracted.relief_amount')}</span>
                <span className="font-semibold theme-text-primary tabular-nums text-sm">
                  {formatCurrency(disbursement.isProgressivePayment ? disbursement.disbursedAmount || 0 : disbursement.reliefAmount)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs theme-text-secondary min-w-0">
                <CreditCard className="w-3.5 h-3.5 shrink-0 theme-text-muted" />
                <span className="font-mono truncate">{disbursement.transactionId}</span>
              </div>
              <div className="flex items-center gap-2 text-xs theme-text-secondary">
                <Scale className="w-3.5 h-3.5 shrink-0 theme-text-muted" />
                <span>{disbursement.actType}</span>
              </div>
              <div className="flex items-center gap-2 text-xs theme-text-secondary">
                <Calendar className="w-3.5 h-3.5 shrink-0 theme-text-muted" />
                <span className="tabular-nums">{formatDateGB(disbursement.initiatedDate as string | null)}</span>
              </div>
            </div>

            {disbursement.isProgressivePayment && (
              <div className="mb-3">
                <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full accent-gradient transition-all duration-300"
                    style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] theme-text-muted mt-1 tabular-nums">
                  <span>{(disbursement.disbursementProgress ?? 0).toFixed(2)}%</span>
                  <span>
                    {disbursement.completedInstallments || 0} / {disbursement.totalInstallments || 3}{' '}
                    {t('disbursements.installments_word')}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-auto pt-3 border-t theme-border-glass flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(theme, disbursement.status)}`}
              >
                {(() => {
                  const Icon = getStatusIcon(disbursement.status);
                  return <Icon className="w-3 h-3" />;
                })()}
                {(disbursement.status ?? '').replace('-', ' ')}
              </span>
              {disbursement.actType?.toLowerCase().includes('poa') && renderInstallmentControls(disbursement)}
              <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(disbursement);
                  }}
                  className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                  title={t('extracted.view')}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(disbursement);
                  }}
                  className="p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  title={t('extracted.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
