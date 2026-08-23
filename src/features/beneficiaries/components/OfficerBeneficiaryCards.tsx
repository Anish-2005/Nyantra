"use client";
import React, { createElement } from 'react';
import { Edit, Trash, FileText, Loader2 } from 'lucide-react';
import type { TranslateFnLike } from '../helpers';
import {
  getStatusColor,
  getVerificationColor,
  getOfficerPriorityColor,
  getStatusIcon,
  getVerificationIcon,
  formatOfficerActType,
} from '../helpers';
import OfficerMetaPair from './OfficerMetaPair';

/**
 * Card-grid rendering of paginated beneficiaries (default on small screens).
 */
export default function OfficerBeneficiaryCards({
  t,
  rows,
  canDelete,
  deletingId,
  onView,
  onEdit,
  onDelete,
  onOpenCertificate,
}: {
  t: TranslateFnLike;
  rows: any[];
  canDelete: boolean;
  deletingId: string | null;
  onView: (b: any) => void;
  onEdit: (b: any) => void;
  onDelete: (b: any) => void;
  onOpenCertificate: (url: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {rows.map((beneficiary: any) => (
        <div
          key={beneficiary.id}
          className="theme-bg-card theme-border-glass border rounded-lg p-3.5 cursor-pointer hover:theme-bg-hover transition-colors"
          onClick={() => onView(beneficiary)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full accent-gradient flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
                {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold theme-text-primary truncate">{beneficiary.name}</p>
                <p className="text-xs theme-text-muted font-mono truncate">{beneficiary.id}</p>
              </div>
            </div>
            {beneficiary.priority && (
              <span className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getOfficerPriorityColor(beneficiary.priority)}`}>
                {beneficiary.priority}
              </span>
            )}
          </div>

          <dl className="mt-3 space-y-1.5">
            <OfficerMetaPair label={t('extracted.aadhaar')} value={beneficiary.aadhaarNumber} mono />
            <OfficerMetaPair label={t('extracted.location')} value={`${beneficiary.district}, ${beneficiary.state}`} />
            <OfficerMetaPair label={t('extracted.act_type')} value={formatOfficerActType(t, beneficiary.actType)} />
            <OfficerMetaPair label={t('extracted.assigned_officer')} value={beneficiary.assignedOfficer || '\u2014'} />
          </dl>

          <div className="mt-3 pt-2.5 border-t theme-border-glass flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                {createElement(getStatusIcon(beneficiary.status), { className: 'w-3 h-3' })}
                {beneficiary.status.replace('-', ' ')}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                {createElement(getVerificationIcon(beneficiary.verificationStatus), { className: 'w-3 h-3' })}
                {beneficiary.verificationStatus.replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {beneficiary.scStCertificate && (
                <button
                  aria-label="View certificate"
                  onClick={(e) => { e.stopPropagation(); onOpenCertificate(beneficiary.scStCertificate); }}
                  className="p-2 rounded-md theme-text-muted hover:theme-bg-hover hover:text-green-500 transition-colors"
                  title="View Certificate"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
              <button
                aria-label="Edit beneficiary"
                onClick={(e) => { e.stopPropagation(); onEdit(beneficiary); }}
                className="p-2 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                title={t('extracted.edit')}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                aria-label="Delete beneficiary"
                onClick={(e) => { e.stopPropagation(); onDelete(beneficiary); }}
                disabled={deletingId === beneficiary.id || !canDelete}
                title={!canDelete ? t('extracted.no_permission_delete') || 'Insufficient permissions' : t('extracted.delete')}
                className="p-2 rounded-md theme-text-muted hover:theme-bg-hover hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {deletingId === beneficiary.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
