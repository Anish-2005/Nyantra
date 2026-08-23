"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocale } from '@/context/LocaleContext';
import type { Grievance } from '../helpers';
import { inputCls, textareaCls, Label, SectionTitle } from '../officerHelpers';

interface OfficerNewCaseDrawerProps {
  initialData?: Grievance | null;
  onClose: () => void;
  onCreated?: (g: Grievance) => void;
}

/** Officer create/edit case drawer: beneficiary lookup + classification form writing to Firestore. */
const OfficerNewCaseDrawer = ({ initialData, onClose, onCreated }: OfficerNewCaseDrawerProps) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('disbursement-delay');
  const [subCategory, setSubCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'disbursement-delay', label: 'Disbursement Delay' },
    { value: 'document-issues', label: 'Document Issues' },
    { value: 'application-status', label: 'Application Status' },
    { value: 'officer-behavior', label: 'Officer Behavior' },
    { value: 'information-correction', label: 'Information Correction' },
    { value: 'technical-issues', label: 'Technical Issues' }
  ];

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

  const handleLookupBeneficiary = async (id: string) => {
    setBeneficiaryName('');
    if (!id) return;
    try {
      const snap = await getDoc(doc(db, 'beneficiaries', id));
      if (snap.exists()) {
        const data = snap.data() as any;
        setBeneficiaryName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setError(null);
      } else {
        setError(t('extracted.beneficiary_not_found') || 'Beneficiary not found');
      }
    } catch (err) {
      console.error('Lookup beneficiary error', err);
      setError(t('extracted.lookup_failed') || 'Lookup failed');
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (!initialData) return;
    setBeneficiaryId(initialData.beneficiaryId || '');
    setBeneficiaryName(initialData.beneficiaryName || '');
    setPhone(initialData.phone || '');
    setEmail(initialData.email || '');
    setCategory(initialData.category || 'disbursement-delay');
    setSubCategory(initialData.subCategory || '');
    setPriority((initialData.priority as any) || 'medium');
    setDescription(initialData.description || '');
  }, [initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!beneficiaryId) return setError(t('extracted.enter_beneficiary_id') || 'Enter a beneficiary ID');
    setIsSubmitting(true);
    try {
      // validate beneficiary exists
      const snap = await getDoc(doc(db, 'beneficiaries', beneficiaryId));
      if (!snap.exists()) {
        setError(t('extracted.beneficiary_not_found') || 'Beneficiary not found');
        setIsSubmitting(false);
        return;
      }

      const base: any = {
        beneficiaryId,
        beneficiaryName: beneficiaryName || (snap.data() as any).name || '',
        phone: phone || (snap.data() as any).phone || null,
        email: email || (snap.data() as any).email || null,
        category,
        subCategory: subCategory || null,
        priority,
        description: description || null,
        status: initialData ? (initialData.status || 'open') : 'open',
        lastUpdated: serverTimestamp(),
        attachments: initialData ? (initialData.attachments || 0) : 0,
        communication: initialData ? (initialData.communication || []) : [],
        escalationLevel: initialData ? (initialData.escalationLevel || 0) : 0,
        followUpRequired: initialData ? (initialData.followUpRequired || false) : false
      };

      if (initialData && initialData.id) {
        // update existing grievance
        await updateDoc(doc(db, 'grievances', initialData.id), { ...base, lastUpdated: serverTimestamp() });
        const updated: Grievance = { ...initialData, ...base, lastUpdated: new Date().toISOString() } as Grievance;
        onCreated?.(updated);
        onClose();
      } else {
        // create with deterministic id: GRV-<timestamp>
        const newId = `GRV-${Date.now()}`;
        const payload = { ...base, createdDate: serverTimestamp() };
        await setDoc(doc(db, 'grievances', newId), payload);
        const created: Grievance = {
          id: newId,
          beneficiaryId: payload.beneficiaryId,
          beneficiaryName: payload.beneficiaryName,
          phone: payload.phone,
          email: payload.email,
          category: payload.category,
          subCategory: payload.subCategory,
          priority: payload.priority,
          description: payload.description,
          status: payload.status,
          attachments: payload.attachments || 0,
          communication: payload.communication || [],
          escalationLevel: payload.escalationLevel || 0,
          followUpRequired: payload.followUpRequired || false,
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        onCreated?.(created);
        onClose();
      }
    } catch (err) {
      console.error('Create grievance failed', err);
      setError(t('extracted.create_failed') || 'Failed to create grievance');
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
        className="fixed inset-y-0 right-0 w-full max-w-[min(28rem,calc(100vw-1.5rem))] z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
            {initialData ? (t('extracted.edit_case') || 'Edit Case') : (t('extracted.new_case') || 'New Case')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="new-grievance-form" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <section>
            <Label>{t('extracted.beneficiary_id') || 'Beneficiary ID'} *</Label>
            <input
              placeholder={t('extracted.beneficiary_id') || 'Beneficiary ID'}
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              onBlur={() => handleLookupBeneficiary(beneficiaryId)}
              className={inputCls}
              required
            />
            {beneficiaryName && <p className="text-xs theme-text-muted mt-1.5">{beneficiaryName}</p>}
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <SectionTitle>{t('extracted.contact')}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.phone_number') || 'Phone Number'}</Label>
                <input type="tel" placeholder={t('extracted.phone_number') || 'Phone Number'} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>{t('extracted.email') || 'Email'}</Label>
                <input type="email" placeholder={t('extracted.email') || 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <SectionTitle>{t('extracted.category_1') || 'Classification'}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.category_1') || 'Category'}</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>{t('extracted.sub_category') || 'Sub-category'}</Label>
                <input placeholder={t('extracted.sub_category') || 'Sub-category'} value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <SectionTitle>{t('extracted.description') || 'Assessment'}</SectionTitle>
            <div className="space-y-3">
              <div>
                <Label>{t('extracted.priority') || 'Priority'}</Label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')} className={inputCls}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label>{t('extracted.description') || 'Description'}</Label>
                <textarea placeholder={t('extracted.description') || 'Description'} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={textareaCls} />
              </div>
            </div>
          </section>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </form>

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
            form="new-grievance-form"
            disabled={isSubmitting}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (t('extracted.saving') || 'Saving...') : (initialData ? (t('extracted.save') || 'Save') : (t('extracted.create') || 'Create'))}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

export default OfficerNewCaseDrawer;
