"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { X, FilePlus, Loader2 } from 'lucide-react';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Report } from '../helpers';
import { OFFICER_INPUT_CLS } from '../helpers';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

/**
 * Portal drawer for creating or editing a report definition (details,
 * classification, frequency/format and description).
 */
export default function OfficerNewReportDrawer({ onClose, onCreated, initialData }: { onClose: () => void; onCreated?: (r: Report) => void; initialData?: Report | null }) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [type, setType] = useState('disbursement');
  const [category, setCategory] = useState('financial');
  const [frequency, setFrequency] = useState('once');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('PDF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const reportTypes = [
    { value: 'disbursement', label: t('extracted.report_type_disbursement') },
    { value: 'verification', label: t('extracted.report_type_verification') },
    { value: 'grievance', label: t('extracted.report_type_grievance') },
    { value: 'financial', label: t('extracted.report_type_financial') },
    { value: 'performance', label: t('extracted.report_type_performance') },
    { value: 'analytical', label: t('extracted.report_type_analytical') }
  ];

  const categories = [
    { value: 'financial', label: t('extracted.category_financial') },
    { value: 'compliance', label: t('extracted.category_compliance') },
    { value: 'performance', label: t('extracted.category_performance') },
    { value: 'statistical', label: t('extracted.category_statistical') },
    { value: 'analytical', label: t('extracted.category_analytical') },
    { value: 'technical', label: t('extracted.category_technical') }
  ];

  const frequencies = [
    { value: 'once', label: t('extracted.frequency_once') },
    { value: 'daily', label: t('extracted.frequency_daily') },
    { value: 'weekly', label: t('extracted.frequency_weekly') },
    { value: 'monthly', label: t('extracted.frequency_monthly') },
    { value: 'quarterly', label: t('extracted.frequency_quarterly') }
  ];

  const formats = [
    { value: 'PDF', label: t('extracted.format_pdf') },
    { value: 'Excel', label: t('extracted.format_excel') },
    { value: 'CSV', label: t('extracted.format_csv') }
  ];

  // Prefill when editing
  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name || '');
    setType(initialData.type || 'disbursement');
    setCategory(initialData.category || 'financial');
    setFrequency(initialData.frequency || 'once');
    setDescription(initialData.description || '');
    setFormat(initialData.fileFormat || 'PDF');
  }, [initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(t('extracted.report_name_required') || 'Report name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseData: any = {
        name: name.trim(),
        type,
        category,
        frequency,
        description: description.trim(),
        fileFormat: format,
        status: 'processing',
        downloadCount: 0,
        isScheduled: frequency !== 'once',
        parameters: {},
        recipients: [],
        columns: [],
        lastUpdated: serverTimestamp()
      };

      if (initialData && initialData.id) {
        // Update existing report
        await updateDoc(doc(db, 'reports', initialData.id), baseData);
        const updated: Report = { ...initialData, ...baseData, updatedAt: new Date().toISOString() };
        onCreated?.(updated);
        onClose();
      } else {
        // Create new report
        const newId = `REP-${Date.now()}`;
        const payload = {
          ...baseData,
          createdAt: serverTimestamp(),
          generatedDate: serverTimestamp(),
          generatedBy: 'System',
          fileSize: null,
          recordCount: null,
          schedule: frequency !== 'once' ? {
            frequency,
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            recipients: [],
            format
          } : null
        };

        await setDoc(doc(db, 'reports', newId), payload);

        const created: Report = {
          id: newId,
          name: payload.name,
          type: payload.type,
          category: payload.category,
          frequency: payload.frequency,
          status: payload.status,
          fileSize: payload.fileSize,
          fileFormat: payload.fileFormat,
          generatedDate: new Date().toISOString(),
          generatedBy: payload.generatedBy,
          schedule: payload.schedule,
          lastRun: payload.lastRun,
          nextRun: payload.nextRun,
          recordCount: payload.recordCount,
          description: payload.description,
          parameters: payload.parameters,
          downloadCount: payload.downloadCount,
          isScheduled: payload.isScheduled,
          recipients: payload.recipients,
          columns: payload.columns,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        onCreated?.(created);
        onClose();
      }
    } catch (err) {
      console.error('Create report failed', err);
      setError(t('extracted.create_failed') || 'Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
              {initialData ? (t('extracted.edit_report') || 'Edit Report') : (t('extracted.new_report') || 'New Report')}
            </h2>
            <p className="text-[11px] theme-text-muted truncate">
              {initialData ? (t('extracted.edit_report_description') || 'Edit the report details and save changes.') : (t('extracted.new_report_description') || 'Create a new report with custom parameters.')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} id="new-report-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Details */}
          <section>
            <Label>{t('extracted.report_name') || 'Report Name'} *</Label>
            <input
              type="text"
              required
              placeholder={t('extracted.report_name_placeholder') || 'Enter report name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={OFFICER_INPUT_CLS}
            />
          </section>

          {/* Classification */}
          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.category') || 'Category'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.report_type') || 'Report Type'}</Label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={OFFICER_INPUT_CLS}>
                  {reportTypes.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t('extracted.category') || 'Category'}</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={OFFICER_INPUT_CLS}>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Schedule & Format */}
          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.frequency') || 'Frequency'} · {t('extracted.format') || 'Format'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.frequency') || 'Frequency'}</Label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={OFFICER_INPUT_CLS}>
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t('extracted.format') || 'Format'}</Label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className={OFFICER_INPUT_CLS}>
                  {formats.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
              {t('extracted.description') || 'Description'}
            </h3>
            <textarea
              placeholder={t('extracted.description_placeholder') || 'Enter report description'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${OFFICER_INPUT_CLS} h-auto py-2`}
            />
          </section>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel')}
          </button>
          <button
            type="submit"
            form="new-report-form"
            disabled={isSubmitting}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
            {isSubmitting
              ? t('extracted.saving') || 'Saving...'
              : initialData
                ? t('extracted.save') || 'Save'
                : t('extracted.create_report') || 'Create Report'
            }
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
}
