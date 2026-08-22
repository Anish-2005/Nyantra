'use client';

/**
 * Installment select + disburse button shared by the desktop table and cards
 * views. Purely presentational — all writes are delegated via callbacks.
 */
import type { DisbursementRaw } from '@/models/Disbursement';

interface Props {
  record: DisbursementRaw;
  selection: number | null;
  onSelect: (recordId: string, value: number | null) => void;
  onDisburseTablePath: (record: DisbursementRaw, selection: number | null) => void;
}

export function InstallmentControls({ record, selection, onSelect, onDisburseTablePath }: Props) {
  const completedInstallments = record.completedInstallments || 0;
  const totalInstallments = record.totalInstallments || 3;
  const nextInstallment = completedInstallments + 1;

  // If all installments are completed, don't show anything
  if (completedInstallments >= totalInstallments) {
    return <span className="text-xs theme-text-muted">All installments completed</span>;
  }

  return (
    <>
      <select
        value={selection ?? ''}
        className="text-xs px-2 py-1 rounded theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
        onChange={(e) => {
          const value = e.target.value ? parseInt(e.target.value) : null;
          onSelect(record.id || '', value);
        }}
      >
        <option value="">Select</option>
        {nextInstallment === 1 && <option value="1">Inst 1 (25%)</option>}
        {nextInstallment === 2 && <option value="2">Inst 2 (50%)</option>}
        {nextInstallment === 3 && <option value="3">Inst 3 (25%)</option>}
      </select>
      <button
        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:bg-gray-400"
        disabled={!selection}
        onClick={(e) => {
          e.stopPropagation();
          onDisburseTablePath(record, selection);
        }}
      >
        Disburse
      </button>
    </>
  );
}
