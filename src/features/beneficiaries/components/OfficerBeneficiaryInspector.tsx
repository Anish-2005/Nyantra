"use client";
import React from 'react';
import { Edit, X, FileText } from 'lucide-react';
import type { TranslateFnLike } from '../helpers';
import {
  getStatusColor,
  getVerificationColor,
  formatOfficerActType,
  formatOfficerCurrency,
  formatDate,
  OFFICER_INLINE_INPUT_CLS,
} from '../helpers';
import OfficerMetaPair from './OfficerMetaPair';

/**
 * Inline detail inspector for the selected beneficiary: full record fields,
 * certificate link and status/verification controls.
 */
export default function OfficerBeneficiaryInspector({
  t,
  beneficiary,
  detailRef,
  statusValue,
  onStatusValueChange,
  onSaveStatus,
  verificationValue,
  onVerificationValueChange,
  onSaveVerification,
  onClose,
  onEdit,
}: {
  t: TranslateFnLike;
  beneficiary: any;
  detailRef?: React.RefObject<HTMLDivElement | null>;
  statusValue: string;
  onStatusValueChange: (v: string) => void;
  onSaveStatus: () => void;
  verificationValue: string;
  onVerificationValueChange: (v: string) => void;
  onSaveVerification: () => void;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div ref={detailRef} className="theme-bg-card theme-border-glass border rounded-xl w-full overflow-hidden scroll-mt-20">
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{beneficiary.name}</h2>
          <span className="hidden sm:inline text-xs theme-text-muted font-mono flex-shrink-0">{beneficiary.id}</span>
          <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
            {beneficiary.status.replace('-', ' ')}
          </span>
          <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
            {beneficiary.verificationStatus.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 md:p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
            title={t('extracted.edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 md:p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3.5">
        <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
          <OfficerMetaPair label={t('extracted.full_name')} value={beneficiary.name} />
          <OfficerMetaPair label={t('extracted.father_name') || 'Father'} value={beneficiary.fatherName || '\u2014'} />
          <OfficerMetaPair label={t('extracted.aadhaar_number')} value={beneficiary.aadhaarNumber} mono />
          <OfficerMetaPair label={t('extracted.phone_number')} value={beneficiary.phone} />
          <OfficerMetaPair label={t('extracted.email')} value={beneficiary.email || '\u2014'} />
          <OfficerMetaPair label={t('extracted.location')} value={`${beneficiary.district}, ${beneficiary.state}`} />
          <OfficerMetaPair label={t('extracted.act_type')} value={formatOfficerActType(t, beneficiary.actType)} />
          <OfficerMetaPair label={t('extracted.category')} value={beneficiary.category} />
          <OfficerMetaPair label={t('extracted.registration_date') || 'Registered'} value={formatDate(beneficiary.registrationDate)} />
          <OfficerMetaPair label={t('extracted.age') || 'Age'} value={beneficiary.age ?? '\u2014'} />
          <OfficerMetaPair label={t('extracted.gender') || 'Gender'} value={beneficiary.gender || '\u2014'} />
          <OfficerMetaPair label={t('extracted.marital_status') || 'Marital Status'} value={beneficiary.maritalStatus || '\u2014'} />
          <OfficerMetaPair label={t('extracted.bank_name') || 'Bank'} value={beneficiary.bankName || '\u2014'} />
          <OfficerMetaPair label={t('extracted.ifsc_code') || 'IFSC'} value={beneficiary.ifsc || '\u2014'} mono />
          <OfficerMetaPair label={t('extracted.assigned_officer')} value={beneficiary.assignedOfficer || '\u2014'} />
          <OfficerMetaPair label={t('extracted.disbursed')} value={formatOfficerCurrency(beneficiary.disbursedAmount)} />
        </dl>

        <div className="mt-3.5 pt-3 border-t theme-border-glass flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 theme-text-muted flex-shrink-0" />
          <span className="text-[11px] uppercase tracking-wider theme-text-muted flex-shrink-0">{t('extracted.sc_st_certificate')}</span>
          {beneficiary.scStCertificate ? (
            <a
              href={beneficiary.scStCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium underline underline-offset-2 theme-text-primary hover:opacity-80 transition-opacity truncate"
            >
              {t('extracted.view_file') || 'View file'}
            </a>
          ) : (
            <span className="text-[13px] theme-text-muted">Not provided</span>
          )}
        </div>

        <div className="mt-3.5 pt-3 border-t theme-border-glass flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <select value={statusValue} onChange={(e) => onStatusValueChange(e.target.value)} className={`${OFFICER_INLINE_INPUT_CLS} flex-1 min-w-0`} aria-label={t('extracted.application_status')}>
              <option value="pending-verification">{t('extracted.pending_verification') || 'Pending Verification'}</option>
              <option value="verified">{t('extracted.verified') || 'Verified'}</option>
              <option value="rejected">{t('extracted.rejected') || 'Rejected'}</option>
              <option value="documents-required">{t('extracted.documents_required') || 'Documents Required'}</option>
            </select>
            <button onClick={onSaveStatus} className="h-9 px-3 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex-shrink-0">
              {t('extracted.save')}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <select value={verificationValue} onChange={(e) => onVerificationValueChange(e.target.value)} className={`${OFFICER_INLINE_INPUT_CLS} flex-1 min-w-0`} aria-label={t('extracted.verification_status')}>
              <option value="pending">{t('extracted.pending') || 'Pending'}</option>
              <option value="verified">{t('extracted.verified') || 'Verified'}</option>
              <option value="rejected">{t('extracted.rejected') || 'Rejected'}</option>
              <option value="documents-required">{t('extracted.documents_required') || 'Documents Required'}</option>
            </select>
            <button onClick={onSaveVerification} className="h-9 px-3 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-500 transition-colors flex-shrink-0">
              {t('extracted.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
