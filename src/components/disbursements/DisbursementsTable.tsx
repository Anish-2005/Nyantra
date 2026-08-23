'use client';

import type { ReactNode } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import {
  formatCurrency,
  formatDateGB,
  getStatusColor,
  getStatusIcon,
  translateStatus,
} from './shared';

interface Props {
  items: readonly DisbursementRaw[];
  onView: (record: DisbursementRaw) => void;
  onDelete: (record: DisbursementRaw) => void;
  renderInstallmentCell: (record: DisbursementRaw) => ReactNode;
}

const TH =
  'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-secondary whitespace-nowrap';

export function DisbursementsTable({ items, onView, onDelete, renderInstallmentCell }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full min-w-[900px]">
        <thead className="theme-bg-glass border-b theme-border-glass">
          <tr>
            <th className={TH}>{t('extracted.disbursement_id')}</th>
            <th className={TH}>{t('extracted.beneficiary')}</th>
            <th className={`hidden sm:table-cell ${TH}`}>{t('extracted.transaction_id')}</th>
            <th className={`hidden md:table-cell ${TH}`}>{t('extracted.act_type')}</th>
            <th className={`hidden lg:table-cell ${TH}`}>{t('extracted.amount')}</th>
            <th className={`hidden md:table-cell ${TH}`}>Installments</th>
            <th className={TH}>{t('extracted.status')}</th>
            <th className={`hidden sm:table-cell ${TH}`}>{t('extracted.initiated_date')}</th>
            <th className={`${TH} text-right`}>{t('extracted.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((disbursement) => (
            <tr
              key={disbursement.id}
              className="border-b theme-border-glass last:border-0 hover:theme-bg-hover transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium theme-text-primary whitespace-nowrap">
                {disbursement.id}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 shrink-0 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold">
                    {(disbursement.beneficiaryName ?? '')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium theme-text-primary truncate leading-tight">
                      {disbursement.beneficiaryName}
                    </p>
                    <p className="text-[11px] theme-text-muted truncate leading-tight mt-0.5">
                      {disbursement.district}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-xs font-mono theme-text-secondary max-w-[140px] truncate">
                {disbursement.transactionId}
              </td>
              <td className="hidden md:table-cell px-4 py-3 text-xs theme-text-secondary whitespace-nowrap">
                {disbursement.actType}
              </td>
              <td className="hidden lg:table-cell px-4 py-3">
                <p className="text-sm font-semibold theme-text-primary tabular-nums whitespace-nowrap">
                  {formatCurrency(disbursement.isProgressivePayment ? disbursement.disbursedAmount || 0 : disbursement.reliefAmount)}
                  {disbursement.isProgressivePayment && (
                    <span className="text-[11px] font-normal theme-text-muted ml-1 tabular-nums">
                      / {formatCurrency(disbursement.reliefAmount)}
                    </span>
                  )}
                </p>
                {disbursement.isProgressivePayment && (
                  <>
                    <div className="mt-1.5 w-28 h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full accent-gradient transition-all duration-300"
                        style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] theme-text-muted mt-1 tabular-nums">
                      {disbursement.completedInstallments || 0} / {disbursement.totalInstallments || 3}{' '}
                      {t('disbursements.installments_word')}
                    </p>
                  </>
                )}
                {!disbursement.isProgressivePayment && disbursement.status === 'completed' && (
                  <p className="text-[11px] theme-text-muted mt-0.5 tabular-nums">
                    Net: {formatCurrency(disbursement.netAmount)}
                  </p>
                )}
              </td>
              <td className="hidden md:table-cell px-4 py-3">
                {disbursement.actType?.toLowerCase().includes('poa') ? (
                  renderInstallmentCell(disbursement)
                ) : (
                  <span className="text-xs theme-text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(theme, disbursement.status)}`}
                >
                  {(() => {
                    const Icon = getStatusIcon(disbursement.status);
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {translateStatus(t, disbursement.status)}
                </span>
                {(disbursement.retryCount ?? 0) > 0 && (
                  <p className="text-[11px] theme-text-muted mt-1 tabular-nums">
                    {t('extracted.retries')}: {disbursement.retryCount}
                  </p>
                )}
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-xs theme-text-secondary tabular-nums whitespace-nowrap">
                {formatDateGB(disbursement.initiatedDate as string | null)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView(disbursement)}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
