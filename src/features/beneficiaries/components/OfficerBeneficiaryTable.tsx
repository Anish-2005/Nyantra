"use client";
import React, { createElement } from 'react';
import { Eye, Edit, Trash, FileText, Loader2 } from 'lucide-react';
import type { TranslateFnLike } from '../helpers';
import {
  getStatusColor,
  getVerificationColor,
  getOfficerCategoryColor,
  getStatusIcon,
  getVerificationIcon,
  formatOfficerActType,
} from '../helpers';
import OfficerMetaPair from './OfficerMetaPair';

/**
 * Paginated beneficiaries listing: responsive desktop table plus a stacked mobile card list.
 */
export default function OfficerBeneficiaryTable({
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
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b theme-border-glass">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.beneficiary_id')}</th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.beneficiary')}</th>
              <th className="hidden lg:table-cell px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.aadhaar')}</th>
              <th className="hidden lg:table-cell px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.phone')}</th>
              <th className="hidden xl:table-cell px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.email')}</th>
              <th className="hidden lg:table-cell px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.district')}</th>
              <th className="hidden xl:table-cell px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.act_type')}</th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.status')}</th>
              <th className="hidden xl:table-cell px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.verification')}</th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((beneficiary: any) => (
              <tr key={beneficiary.id} className="border-b theme-border-glass last:border-b-0 hover:theme-bg-hover transition-colors">
                <td className="px-3 py-2.5 text-xs font-mono theme-text-primary whitespace-nowrap">{beneficiary.id}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                      {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium theme-text-primary truncate">{beneficiary.name}</p>
                      <p className="text-[11px] theme-text-muted truncate">{beneficiary.category}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-3 py-2.5 text-xs font-mono theme-text-primary">{beneficiary.aadhaarNumber}</td>
                <td className="hidden lg:table-cell px-3 py-2.5 text-[13px] theme-text-primary whitespace-nowrap">{beneficiary.phone}</td>
                <td className="hidden xl:table-cell px-3 py-2.5 text-[13px] theme-text-primary"><span className="block max-w-[160px] truncate">{beneficiary.email || '\u2014'}</span></td>
                <td className="hidden lg:table-cell px-3 py-2.5">
                  <p className="text-[13px] theme-text-primary">{beneficiary.district}</p>
                  <p className="text-[11px] theme-text-muted">{beneficiary.state}</p>
                </td>
                <td className="hidden xl:table-cell px-3 py-2.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass theme-bg-glass theme-text-secondary whitespace-nowrap">
                    {formatOfficerActType(t, beneficiary.actType)}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                    {createElement(getStatusIcon(beneficiary.status), { className: 'w-3 h-3' })}
                    {beneficiary.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="hidden xl:table-cell px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                    {createElement(getVerificationIcon(beneficiary.verificationStatus), { className: 'w-3 h-3' })}
                    {beneficiary.verificationStatus.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(beneficiary)}
                      className="p-2 md:p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                      title={t('extracted.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {beneficiary.scStCertificate && (
                      <button
                        onClick={() => onOpenCertificate(beneficiary.scStCertificate)}
                        className="p-2 md:p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-green-500 transition-colors"
                        title="View Certificate"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(beneficiary)}
                      className="p-2 md:p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                      title={t('extracted.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(beneficiary)}
                      disabled={deletingId === beneficiary.id || !canDelete}
                      title={!canDelete ? t('extracted.no_permission_delete') || 'Insufficient permissions' : t('extracted.delete')}
                      className="p-2 md:p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === beneficiary.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile flat list */}
      <div className="md:hidden">
        {rows.map((beneficiary: any) => (
          <div
            key={beneficiary.id}
            className="p-4 border-b theme-border-glass last:border-b-0 cursor-pointer hover:theme-bg-hover transition-colors"
            onClick={() => onView(beneficiary)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                  {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold theme-text-primary truncate">{beneficiary.name}</p>
                  <p className="text-xs theme-text-muted font-mono truncate">{beneficiary.id}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                {createElement(getStatusIcon(beneficiary.status), { className: 'w-3 h-3' })}
                {beneficiary.status.replace('-', ' ')}
              </span>
            </div>

            <dl className="mt-2.5 space-y-1.5">
              <OfficerMetaPair label={t('extracted.aadhaar')} value={beneficiary.aadhaarNumber} mono />
              <OfficerMetaPair label={t('extracted.location')} value={`${beneficiary.district}, ${beneficiary.state}`} />
              <OfficerMetaPair label={t('extracted.act_type')} value={formatOfficerActType(t, beneficiary.actType)} />
            </dl>

            <div className="mt-2.5 pt-2.5 border-t theme-border-glass flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                  {createElement(getVerificationIcon(beneficiary.verificationStatus), { className: 'w-3 h-3' })}
                  {beneficiary.verificationStatus.replace('-', ' ')}
                </span>
                {beneficiary.scStCertificate && (
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getOfficerCategoryColor(beneficiary.category)}`}>
                    <FileText className="w-3 h-3" />
                    Cert
                  </span>
                )}
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
    </>
  );
}
