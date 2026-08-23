'use client';

import {
  AlertTriangle, Calendar, CreditCard, Eye, MapPin, RotateCcw, Scale, Trash2,
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import {
  formatCurrency,
  formatDateGB,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  translateStatus,
} from './shared';

interface Props {
  items: readonly DisbursementRaw[];
  onView: (record: DisbursementRaw) => void;
  onDelete: (record: DisbursementRaw) => void;
}

/** Mobile "table" layout (cards). */
export function MobileDisbursementsList({ items, onView, onDelete }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="p-3 space-y-2.5">
      {items.map((disbursement) => (
        <div
          key={disbursement.id}
          className="theme-bg-card theme-border-glass border rounded-xl p-3.5 cursor-pointer hover:border-[var(--accent-primary)]/40 transition-colors"
          onClick={() => onView(disbursement)}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
                <p className="text-[11px] theme-text-muted truncate leading-tight mt-0.5">{disbursement.id}</p>
              </div>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(theme, disbursement.priority ?? '')}`}
            >
              {disbursement.priority ?? '-'}
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-end justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider theme-text-muted">
                {t('extracted.relief_amount')}
              </p>
              <p className="text-base font-semibold tabular-nums theme-text-primary mt-0.5">
                {formatCurrency(disbursement.reliefAmount)}
              </p>
            </div>
            {disbursement.status === 'completed' && (
              <div className="text-right shrink-0">
                <p className="text-[10px] font-medium uppercase tracking-wider theme-text-muted">
                  {t('extracted.net_amount')}
                </p>
                <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(disbursement.netAmount)}
                </p>
              </div>
            )}
          </div>

          {/* Info Rows */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="theme-text-muted flex items-center gap-1.5 shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
                {t('transaction_id')}
              </span>
              <span className="theme-text-secondary font-mono text-[10px] truncate">
                {disbursement.transactionId}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="theme-text-muted flex items-center gap-1.5 shrink-0">
                <Scale className="w-3.5 h-3.5" />
                {t('act_type')}
              </span>
              <span className="theme-text-secondary font-medium truncate">{disbursement.actType}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="theme-text-muted flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                {t('location')}
              </span>
              <span className="theme-text-secondary font-medium truncate">{disbursement.district}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="theme-text-muted flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {t('initiated_date')}
              </span>
              <span className="theme-text-secondary font-medium tabular-nums">
                {formatDateGB(disbursement.initiatedDate as string | null)}
              </span>
            </div>
          </div>

          {/* Status + Failure */}
          <div className="pt-2.5 border-t theme-border-glass">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(theme, disbursement.status)}`}
            >
              {(() => {
                const Icon = getStatusIcon(disbursement.status);
                return <Icon className="w-3 h-3" />;
              })()}
              {translateStatus(t, disbursement.status)}
            </span>
            {(disbursement.retryCount ?? 0) > 0 && (
              <p className="text-[11px] theme-text-muted mt-1.5 flex items-center gap-1 tabular-nums">
                <RotateCcw className="w-3 h-3" />
                {t('extracted.retries')}: {disbursement.retryCount}
              </p>
            )}
            {disbursement.failureReason && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{disbursement.failureReason}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(disbursement);
              }}
              className="h-8 accent-gradient text-white rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1 active:opacity-90 transition-opacity"
            >
              <Eye className="w-3.5 h-3.5" />
              {t('extracted.view')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(disbursement);
              }}
              className="h-8 border theme-border-glass rounded-md text-xs font-semibold theme-text-secondary hover:bg-red-500/10 hover:text-red-500 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('extracted.delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
