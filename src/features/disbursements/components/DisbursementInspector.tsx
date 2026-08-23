"use client";
import React from 'react';
import { X } from 'lucide-react';
import type { Disbursement, TranslateFn } from '../helpers';
import { PILL_BASE, formatCurrency, formatDate, getStatusColor, getTranslatedStatus } from '../helpers';
import ProgressivePaymentCard from './ProgressivePaymentCard';

/** Detail field for the inspector body */
const Item = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`min-w-0 ${className || ''}`}>
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 break-words">{children}</dd>
  </div>
);

/** Selected-disbursement inspector panel: payment overview, progressive schedule, beneficiary info and identifiers. */
export default function DisbursementInspector({
  disbursement,
  beneficiary,
  onClose,
  innerRef,
  t,
}: {
  disbursement: Disbursement;
  beneficiary: any;
  onClose: () => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
  t: TranslateFn;
}) {
  return (
    <div
      ref={innerRef}
      className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden scroll-mt-20"
      aria-live="polite"
    >
      {/* Header Bar */}
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="min-w-0 flex items-center gap-2.5">
          <h2 className="font-mono text-sm font-semibold theme-text-primary truncate">
            {disbursement.id}
          </h2>
          <span className={`${PILL_BASE} shrink-0 ${getStatusColor(disbursement.status)}`}>
            {getTranslatedStatus(t, disbursement.status)}
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
        {/* Payment Overview */}
        <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
          <Item label={t('extracted.amount')}>
            {disbursement.isProgressivePayment
              ? formatCurrency(disbursement.disbursedAmount || 0)
              : formatCurrency(disbursement.netAmount)}
            {disbursement.isProgressivePayment && disbursement.reliefAmount > 0 && (
              <span className="text-[11px] theme-text-muted font-normal"> / {formatCurrency(disbursement.reliefAmount)}</span>
            )}
          </Item>
          <Item label={t('extracted.relief_amount')}>{formatCurrency(disbursement.reliefAmount)}</Item>
          <Item label={t('extracted.net_amount')}>{formatCurrency(disbursement.netAmount)}</Item>
          <Item label={t('extracted.transaction_fee')}>{formatCurrency(disbursement.transactionFee)}</Item>
          <Item label={t('extracted.payment_method')}>{disbursement.paymentMethod || '—'}</Item>
          <Item label={t('extracted.act_type')}>{disbursement.actType}</Item>
          <Item label={t('extracted.initiated_date')}>
            <span className="tabular-nums">{formatDate(disbursement.initiatedDate)}</span>
          </Item>
          {disbursement.completedDate && (
            <Item label={t('extracted.completed_date')}>
              <span className="tabular-nums">{formatDate(disbursement.completedDate)}</span>
            </Item>
          )}
          {disbursement.applicationId && (
            <Item label={t('extracted.application_id') || 'Application'}>
              <span className="font-mono">{disbursement.applicationId}</span>
            </Item>
          )}
        </dl>

        {/* Progressive Payment Schedule */}
        {disbursement.isProgressivePayment && (
          <ProgressivePaymentCard disbursement={disbursement} t={t} />
        )}

        {/* Beneficiary Information */}
        <div className="pt-3 border-t theme-border-glass">
          <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
            {t('extracted.beneficiary_information')}
          </p>
          <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <Item label={t('extracted.phone_number')}>
              {beneficiary?.phone || t('extracted.not_provided')}
            </Item>
            <Item label={t('extracted.email')}>
              {beneficiary?.email || t('extracted.not_provided')}
            </Item>
            <Item label={t('extracted.bank_account')}>
              <span className="font-mono">{beneficiary?.bankAccount || t('extracted.not_provided')}</span>
            </Item>
            <Item label={t('extracted.ifsc_code')}>
              <span className="font-mono">{beneficiary?.ifsc || t('extracted.not_provided')}</span>
            </Item>
            <Item
              label={t('extracted.address')}
              className="col-span-2 md:col-span-4 lg:col-span-6"
            >
              {beneficiary?.address || t('extracted.not_provided')}
            </Item>
          </dl>
        </div>

        {/* Transaction Identifiers */}
        {(disbursement.transactionId || disbursement.utrNumber) && (
          <div className="pt-3 border-t theme-border-glass">
            <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.transaction_details') || 'Transaction Details'}
            </p>
            <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              {disbursement.transactionId && (
                <Item label={t('extracted.transaction_id')} className="col-span-2 md:col-span-2 lg:col-span-3">
                  <span className="font-mono break-all">{disbursement.transactionId}</span>
                </Item>
              )}
              {disbursement.utrNumber && (
                <Item label={t('extracted.utr_number')} className="col-span-2 md:col-span-2 lg:col-span-3">
                  <span className="font-mono break-all">{disbursement.utrNumber}</span>
                </Item>
              )}
            </dl>
          </div>
        )}

        {/* Officer Notes / Internal Reference (read-only) */}
        {(disbursement.officerNotes || disbursement.internalReference) && (
          <div className="pt-3 border-t theme-border-glass">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              {disbursement.officerNotes && (
                <Item label={t('extracted.officer_notes')}>
                  <span className="font-normal leading-relaxed">{disbursement.officerNotes}</span>
                </Item>
              )}
              {disbursement.internalReference && (
                <Item label={t('extracted.internal_reference')}>
                  <span className="font-mono">{disbursement.internalReference}</span>
                </Item>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
