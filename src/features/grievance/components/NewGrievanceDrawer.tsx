"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useLocale } from '@/context/LocaleContext';
import { X, Plus, Loader2 } from 'lucide-react';

// Shared form control styles (drawer)
const grievanceInputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";
const grievanceTextareaCls = "w-full min-h-[80px] py-2 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-y";

const DrawerLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

// New Grievance Form — right portal drawer (mirrors NewApplicationDrawer pattern)
const NewGrievanceDrawer = ({
  onCancel,
  onSubmit,
  isSubmitting,
  beneficiaries,
  selectedBeneficiary,
  onSelectBeneficiary,
  beneficiaryName,
  onNameChange,
  beneficiaryPhone,
  onPhoneChange,
  beneficiaryEmail,
  onEmailChange,
  beneficiaryDisplayId,
  category,
  onCategoryChange,
  subCategory,
  onSubCategoryChange,
  description,
  onDescriptionChange
}: {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  beneficiaries: any[];
  selectedBeneficiary: any | null;
  onSelectBeneficiary: (beneficiary: any | null) => void;
  beneficiaryName: string;
  onNameChange: (v: string) => void;
  beneficiaryPhone: string;
  onPhoneChange: (v: string) => void;
  beneficiaryEmail: string;
  onEmailChange: (v: string) => void;
  beneficiaryDisplayId: string;
  category: string;
  onCategoryChange: (v: string) => void;
  subCategory: string;
  onSubCategoryChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.file_new_grievance')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} id="new-grievance-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Beneficiary Selection */}
          {beneficiaries.length > 1 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
                Beneficiary
              </h3>
              <select
                value={selectedBeneficiary?.id || ''}
                onChange={(e) => {
                  const beneficiary = beneficiaries.find(b => b.id === e.target.value);
                  onSelectBeneficiary(beneficiary || null);
                  if (!beneficiary) {
                    // Clear editable fields when no beneficiary is selected
                    onNameChange('');
                    onPhoneChange('');
                    onEmailChange('');
                  }
                }}
                className={grievanceInputCls}
              >
                <option value="">{t('extracted.select_a_beneficiary')}</option>
                {beneficiaries.map((beneficiary) => (
                  <option key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.name} - {beneficiary.id}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* Beneficiary Information */}
          <section className={beneficiaries.length > 1 ? 'pt-4 border-t theme-border-glass' : ''}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.beneficiary_name')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <DrawerLabel>{t('extracted.beneficiary_name')}</DrawerLabel>
                <input
                  value={beneficiaryName}
                  onChange={(e) => onNameChange(e.target.value)}
                  readOnly={!!selectedBeneficiary?.name}
                  placeholder={t('extracted.enterBeneficiaryName')}
                  className={grievanceInputCls}
                />
              </div>
              <div>
                <DrawerLabel>{t('extracted.phone')}</DrawerLabel>
                <input
                  value={beneficiaryPhone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  readOnly={!!selectedBeneficiary?.phone}
                  placeholder={t('extracted.enterPhoneNumber')}
                  className={grievanceInputCls}
                />
              </div>
              <div>
                <DrawerLabel>{t('extracted.email')}</DrawerLabel>
                <input
                  value={beneficiaryEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  readOnly={!!selectedBeneficiary?.email}
                  placeholder={t('extracted.enter_your_email')}
                  type="email"
                  className={grievanceInputCls}
                />
              </div>
              <div className="col-span-2">
                <DrawerLabel>{t('extracted.beneficiary_id')}</DrawerLabel>
                <input value={beneficiaryDisplayId} readOnly className={grievanceInputCls} />
              </div>
            </div>
          </section>

          {/* Grievance Details */}
          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.grievance_details')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <DrawerLabel>{t('extracted.category')}</DrawerLabel>
                <select
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className={grievanceInputCls}
                >
                  <option value="disbursement-delay">{t('extracted.disbursement_delay')}</option>
                  <option value="document-issues">{t('extracted.document_issues')}</option>
                  <option value="application-status">{t('extracted.application_status')}</option>
                  <option value="officer-behavior">{t('extracted.officer_behavior')}</option>
                  <option value="information-correction">{t('extracted.information_correction')}</option>
                  <option value="technical-issues">{t('extracted.technical_issues')}</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <DrawerLabel>{t('extracted.sub_category')}</DrawerLabel>
                <input
                  value={subCategory}
                  onChange={(e) => onSubCategoryChange(e.target.value)}
                  placeholder={t('extracted.optional_sub_category')}
                  className={grievanceInputCls}
                />
              </div>
              <div className="col-span-2">
                <DrawerLabel>{t('extracted.description')} *</DrawerLabel>
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder={t('extracted.please_provide_detailed_information_about_your_grievance')}
                  rows={4}
                  className={grievanceTextareaCls}
                  required
                />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel')}
          </button>
          <button
            type="submit"
            form="new-grievance-form"
            disabled={!description.trim() || isSubmitting}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? t('extracted.submitting') : t('extracted.submit_grievance')}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

export default NewGrievanceDrawer;
