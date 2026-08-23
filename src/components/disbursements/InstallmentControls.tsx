'use client';

/**
 * Installment select + disburse button shared by the desktop table and cards
 * views. Purely presentational — all writes are delegated via callbacks.
 */
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementRaw } from '@/models/Disbursement';

interface Props {
  record: DisbursementRaw;
  selection: number | null;
  onSelect: (recordId: string, value: number | null) => void;
  onDisburseTablePath: (record: DisbursementRaw, selection: number | null) => void;
}

export function InstallmentControls({ record, selection, onSelect, onDisburseTablePath }: Props) {
  const { t } = useLocale();
  const completedInstallments = record.completedInstallments || 0;
  const totalInstallments = record.totalInstallments || 3;
  const nextInstallment = completedInstallments + 1;
  const percentages = record.installmentPercentages ?? [25, 50, 25];

  // If all installments are completed, don't show anything
  if (completedInstallments >= totalInstallments) {
    return (
      <span className="text-[11px] theme-text-muted whitespace-nowrap tabular-nums">
        ✓ {totalInstallments}/{totalInstallments} {t('disbursements.installments_word')}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={selection ?? ''}
        className="h-7 text-xs px-1.5 rounded-md theme-bg-input theme-border-glass border theme-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-colors max-w-[110px]"
        onChange={(e) => {
          const value = e.target.value ? parseInt(e.target.value) : null;
          onSelect(record.id || '', value);
        }}
      >
        <option value="">{t('disbursements.select')}</option>
        <option value={nextInstallment}>
          {t('disbursements.installment_word')} {nextInstallment}
          {percentages[nextInstallment - 1] !== undefined ? ` (${percentages[nextInstallment - 1]}%)` : ''}
        </option>
      </select>
      <button
        className="h-7 px-2.5 accent-gradient text-white rounded-md text-[11px] font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        disabled={!selection}
        onClick={(e) => {
          e.stopPropagation();
          onDisburseTablePath(record, selection);
        }}
      >
        {t('disbursements.disburse')}
      </button>
    </div>
  );
}
