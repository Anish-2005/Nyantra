'use client';

import { createElement } from 'react';
import { X } from 'lucide-react';
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
  record: DisbursementRaw;
  onClose: () => void;
  onEdit: (record: DisbursementRaw) => void;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className || ''}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
      <dd className="text-[13px] font-medium theme-text-primary mt-0.5 break-words">{children}</dd>
    </div>
  );
}

export function DisbursementDetailsPanel({ record, onClose, onEdit }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden" aria-live="polite">
      {/* Header Bar */}
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="min-w-0 flex items-center gap-2.5">
          <h2 className="font-mono text-sm font-semibold theme-text-primary truncate">{record.id}</h2>
          <span
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(theme, record.status)}`}
          >
            {createElement(getStatusIcon(record.status), { className: 'w-3 h-3' })}
            {translateStatus(t, record.status)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
          aria-label={t('extracted.close_sidebar') || 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5 space-y-4">
        {/* Beneficiary Information */}
        <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
          <Field label={t('extracted.beneficiary_name')}>{record.beneficiaryName}</Field>
          <Field label={t('extracted.aadhaar_number')}>
            <span className="font-mono">{record.aadhaarNumber}</span>
          </Field>
          <Field label={t('extracted.phone_number')}>
            <span className="tabular-nums">{record.phone}</span>
          </Field>
          <Field label={t('extracted.location')}>
            {record.district}, {record.state}
          </Field>
        </dl>

        {/* Transaction Details */}
        <div className="pt-3 border-t theme-border-glass">
          <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
            {t('extracted.transaction_details_1')}
          </p>
          <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <Field label={t('extracted.transaction_id')} className="col-span-2 md:col-span-2 lg:col-span-3">
              <span className="font-mono break-all">{record.transactionId}</span>
            </Field>
            <Field label={t('extracted.utr_number')} className="col-span-2 md:col-span-2 lg:col-span-3">
              <span className="font-mono break-all">{record.utrNumber || t('extracted.not_available')}</span>
            </Field>
            <Field label={t('extracted.payment_method')}>{record.paymentMethod}</Field>
            <Field label={t('extracted.relief_amount')}>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(record.reliefAmount)}</span>
            </Field>
            <Field label={t('extracted.act_type')}>{record.actType}</Field>
            {(record.retryCount ?? 0) > 0 && (
              <Field label={t('extracted.retry_attempts')}>
                <span className="tabular-nums">{record.retryCount}</span>
              </Field>
            )}
            {record.failureReason && (
              <Field label={t('extracted.failure_reason')} className="col-span-2 md:col-span-4 lg:col-span-6">
                <span className="font-normal text-red-500 dark:text-red-400">{record.failureReason}</span>
              </Field>
            )}
          </dl>
        </div>

        {/* Timeline */}
        <div className="pt-3 border-t theme-border-glass">
          <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
            {t('timeline_1')}
          </p>
          <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <Field label={t('extracted.initiated')}>
              <span className="tabular-nums">{formatDateGB(record.initiatedDate as string | null)}</span>
            </Field>
            {record.completedDate && (
              <Field label={t('extracted.completed')}>
                <span className="tabular-nums">{formatDateGB(record.completedDate as string | null)}</span>
              </Field>
            )}
            {record.disbursementDate && (
              <Field label={t('extracted.disbursed')}>
                <span className="tabular-nums">{formatDateGB(record.disbursementDate as string | null)}</span>
              </Field>
            )}
          </dl>
        </div>

        {/* Edit */}
        <div className="pt-3 border-t theme-border-glass flex justify-end">
          <button
            onClick={() => onEdit(record)}
            className="h-8 px-3 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            {t('extracted.edit')}
          </button>
        </div>
      </div>
    </div>
  );
}
