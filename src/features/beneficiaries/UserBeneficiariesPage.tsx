"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardView } from '@/context/DashboardViewContext';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import LoadingState from '@/components/LoadingState';
import { PageHeader, EmptyState } from '@/components/dashboard/ui';
import BeneficiaryHero from './components/BeneficiaryHero';
import VerificationRail from './components/VerificationRail';
import type { Beneficiary } from './helpers';
import {
  humanize,
  formatDate,
  getStatusColor,
  getVerificationColor,
  getStatusIcon,
  getVerificationIcon,
} from './helpers';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateBeneficiaryId } from '@/lib/id';
import {
  Plus,
  Clock, AlertCircle, BadgeCheck, Banknote, X,
  Shield, FileText, File,
  Loader2, User, Landmark,
  UserPlus, Phone
} from 'lucide-react';

// Display helper: tolerate missing enum-ish fields coming from Firestore

const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:border-[var(--accent-primary)] transition-colors";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

const Pair = ({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{label}</dt>
    <dd className={`text-[13px] font-medium theme-text-primary mt-0.5 truncate ${mono ? 'font-mono' : ''}`}>{value}</dd>
  </div>
);

const NewBeneficiaryForm = ({ onCancel, initialData, onSaved }: { onCancel: () => void, initialData?: any | null, onSaved?: ((saved?: any) => void) | undefined }) => {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    aadhaarNumber: '',
    phone: '',
    email: '',
    district: '',
    state: '',
    address: '',
    registrationDate: '',
    priority: 'medium',
    assignedOfficer: '',
    category: 'SC',
    age: '',
    gender: '',
    maritalStatus: '',
    bankAccount: '',
    ifsc: '',
    scStCertificate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father\'s name is required';
    } else if (formData.fatherName.trim().length < 2) {
      newErrors.fatherName = 'Father\'s name must be at least 2 characters';
    }

    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber.trim())) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if ((formData.category === 'SC' || formData.category === 'ST') && !formData.scStCertificate.trim()) {
      newErrors.scStCertificate = 'SC/ST certificate URL is required for SC/ST category';
    }

    if (formData.age.trim() && (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age (0-120)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Marital status is required';
    }

    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = 'Bank account number is required';
    } else if (!/^\d{9,18}$/.test(formData.bankAccount.trim())) {
      newErrors.bankAccount = 'Bank account number must be 9-18 digits';
    }

    if (!formData.ifsc.trim()) {
      newErrors.ifsc = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.trim().toUpperCase())) {
      newErrors.ifsc = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData && initialData.id) {
        const regDate = formData.registrationDate
          ? Timestamp.fromDate(new Date(formData.registrationDate))
          : (initialData?.registrationDate && typeof initialData.registrationDate.toDate === 'function'
            ? initialData.registrationDate
            : (initialData?.registrationDate ? Timestamp.fromDate(new Date(initialData.registrationDate)) : Timestamp.fromDate(new Date())));

        const updated = {
          name: formData.name,
          fatherName: formData.fatherName,
          aadhaarNumber: formData.aadhaarNumber,
          phone: formData.phone,
          email: formData.email,
          district: formData.district,
          state: formData.state,
          address: formData.address,
          registrationDate: regDate,
          priority: formData.priority,
          assignedOfficer: formData.assignedOfficer,
          category: formData.category,
          age: parseInt(formData.age) || null,
          gender: formData.gender || null,
          maritalStatus: formData.maritalStatus || null,
          bankAccount: formData.bankAccount || null,
          ifsc: formData.ifsc || null,
          scStCertificate: formData.scStCertificate,
          lastUpdate: Timestamp.fromDate(new Date())
        };

        await updateDoc(doc(db, 'beneficiaries', initialData.id), updated);
        const saved = { id: initialData.id, ...updated };
        onSaved?.(saved);
        onCancel();
      }
    } catch (err) {
      console.error('Error updating beneficiary:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        fatherName: initialData.fatherName || '',
        aadhaarNumber: initialData.aadhaarNumber || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        district: initialData.district || '',
        state: initialData.state || '',
        address: initialData.address || '',
        registrationDate: initialData.registrationDate && initialData.registrationDate.toDate ? initialData.registrationDate.toDate().toISOString() : (initialData.registrationDate || ''),
        priority: initialData.priority || 'medium',
        assignedOfficer: initialData.assignedOfficer || '',
        category: initialData.category || 'SC',
        age: initialData.age ? String(initialData.age) : '',
        gender: initialData.gender || '',
        maritalStatus: initialData.maritalStatus || '',
        bankAccount: initialData.bankAccount || '',
        ifsc: initialData.ifsc || '',
        scStCertificate: initialData.scStCertificate || ''
      });
    }
  }, [initialData]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
      >
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{initialData ? t('extracted.edit_beneficiary') : t('extracted.create_new_beneficiary')}</h3>
            <p className="text-[11px] theme-text-muted truncate">{initialData ? t('extracted.edit_beneficiary_description') : t('extracted.create_new_beneficiary_description')}</p>
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors shrink-0" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="beneficiary-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <section>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{t('extracted.basic_details')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>{t('extracted.full_name')}</Label>
                <input required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`${inputCls} ${errors.name ? 'border-red-500' : ''}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="col-span-2">
                <Label>{t('extracted.fatheraposs_name')}</Label>
                <input required value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)} className={`${inputCls} ${errors.fatherName ? 'border-red-500' : ''}`} />
                {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
              </div>
              <div>
                <Label>{t('extracted.aadhaar_number')}</Label>
                <input required value={formData.aadhaarNumber} onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)} className={`${inputCls} ${errors.aadhaarNumber ? 'border-red-500' : ''}`} />
                {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
              </div>
              <div>
                <Label>{t('extracted.phone_number')}</Label>
                <input required value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`${inputCls} ${errors.phone ? 'border-red-500' : ''}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="col-span-2">
                <Label>{t('extracted.email')}</Label>
                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`${inputCls} ${errors.email ? 'border-red-500' : ''}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label>{t('extracted.district')}</Label>
                <input required value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} className={`${inputCls} ${errors.district ? 'border-red-500' : ''}`} />
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>
              <div>
                <Label>{t('extracted.state')}</Label>
                <input required value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className={`${inputCls} ${errors.state ? 'border-red-500' : ''}`} />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              <div className="col-span-2">
                <Label>{t('extracted.complete_address')}</Label>
                <input required value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className={`${inputCls} ${errors.address ? 'border-red-500' : ''}`} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{t('extracted.verification_details')}</h4>
            <div className="col-span-2">
              <Label>{t('extracted.sc_st_certificate')}</Label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData.scStCertificate}
                  onChange={(e) => handleInputChange('scStCertificate', e.target.value)}
                  placeholder="Enter certificate URL (e.g., https://example.com/certificate.pdf)"
                  className={`${inputCls} ${errors.scStCertificate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {formData.scStCertificate && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <File className="w-4 h-4 text-green-500" />
                    <span className="text-sm theme-text-primary">Certificate URL provided</span>
                    <button
                      type="button"
                      onClick={() => window.open(formData.scStCertificate, '_blank')}
                      className="text-blue-500 hover:text-blue-600 text-sm underline"
                    >
                      View File
                    </button>
                  </div>
                )}
                {errors.scStCertificate && <p className="text-red-500 text-xs mt-1">{errors.scStCertificate}</p>}
              </div>
            </div>
          </section>

          <section className="pt-4 border-t theme-border-glass">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{t('extracted.personal_details')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('extracted.age')}</Label>
                <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} className={`${inputCls} ${errors.age ? 'border-red-500' : ''}`} />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <Label>{t('extracted.gender')}</Label>
                <select required value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className={`${inputCls} ${errors.gender ? 'border-red-500' : ''}`}>
                  <option value="">{t('extracted.select_gender')}</option>
                  <option value="Male">{t('extracted.male')}</option>
                  <option value="Female">{t('extracted.female')}</option>
                  <option value="Other">{t('extracted.other')}</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              <div>
                <Label>{t('extracted.category_1') || 'Category'}</Label>
                <select required value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className={`${inputCls} ${errors.category ? 'border-red-500' : ''}`}>
                  <option value="">Select category</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                  <option value="General">General</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <Label>{t('extracted.marital_status')}</Label>
                <select required value={formData.maritalStatus} onChange={(e) => handleInputChange('maritalStatus', e.target.value)} className={`${inputCls} ${errors.maritalStatus ? 'border-red-500' : ''}`}>
                  <option value="">{t('extracted.select_marital_status')}</option>
                  <option value="Single">{t('extracted.single')}</option>
                  <option value="Married">{t('extracted.married')}</option>
                  <option value="Divorced">{t('extracted.divorced')}</option>
                  <option value="Widowed">{t('extracted.widowed')}</option>
                </select>
                {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
              </div>
              <div className="col-span-2">
                <Label>{t('extracted.bank_account')}</Label>
                <input required value={formData.bankAccount} onChange={(e) => handleInputChange('bankAccount', e.target.value)} className={`${inputCls} ${errors.bankAccount ? 'border-red-500' : ''}`} />
                {errors.bankAccount && <p className="text-red-500 text-xs mt-1">{errors.bankAccount}</p>}
              </div>
              <div className="col-span-2">
                <Label>{t('extracted.ifsc_code')}</Label>
                <input required value={formData.ifsc} onChange={(e) => handleInputChange('ifsc', e.target.value)} className={`${inputCls} ${errors.ifsc ? 'border-red-500' : ''}`} />
                {errors.ifsc && <p className="text-red-500 text-xs mt-1">{errors.ifsc}</p>}
              </div>
            </div>
          </section>
        </form>

        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary hover:theme-bg-hover hover:theme-text-primary transition-colors text-sm font-medium disabled:opacity-50"
          >
            {t('extracted.cancel')}
          </button>
          <button
            type="submit"
            form="beneficiary-form"
            disabled={isSubmitting}
            className="flex-1 h-9 rounded-md accent-gradient text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('extracted.save')}
          </button>
        </div>
      </motion.aside>
    </div>,
    document.body
  );
};

export default function BeneficiariesPage() {
  const { user } = useAuth();
  const { view } = useDashboardView();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { t } = useLocale();

  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'beneficiaries'), where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: Beneficiary[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ownerId: data.ownerId,
          name: data.name || '',
          fatherName: data.fatherName || '',
          aadhaarNumber: data.aadhaarNumber || '',
          phone: data.phone || '',
          email: data.email || '',
          district: data.district || '',
          state: data.state || '',
          address: data.address || '',
          registrationDate: data.registrationDate,
          priority: data.priority || 'medium',
          assignedOfficer: data.assignedOfficer || '',
          category: data.category || 'SC',
          age: data.age || null,
          gender: data.gender || '',
          maritalStatus: data.maritalStatus || '',
          bankAccount: data.bankAccount || '',
          ifsc: data.ifsc || '',
          status: data.status || 'pending-verification',
          verificationStatus: data.verificationStatus || 'pending',
          documents: data.documents || 0,
          lastUpdate: data.lastUpdate,
          createdAt: data.createdAt,
          scStCertificate: data.scStCertificate || ''
        });
      });

      setBeneficiaries(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching beneficiaries:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createNewBeneficiary = async () => {
    if (!user) {
      showToast('info', t('extracted.login_required'));
      return;
    }

    if (beneficiaries.length > 0) {
      showToast('info', t('extracted.only_one_beneficiary_allowed'));
      return;
    }

    try {
      const newId = generateBeneficiaryId();
      const newBeneficiary = {
        ownerId: user.uid,
        name: '',
        fatherName: '',
        aadhaarNumber: '',
        phone: '',
        email: '',
        district: '',
        state: '',
        address: '',
        registrationDate: Timestamp.fromDate(new Date()),
        priority: 'medium',
        assignedOfficer: '',
        category: 'SC',
        age: null,
        gender: '',
        maritalStatus: '',
        bankAccount: '',
        ifsc: '',
        status: 'pending-verification',
        verificationStatus: 'pending',
        documents: 0,
        lastUpdate: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date()),
        scStCertificate: ''
      };

      const ref = doc(db, 'beneficiaries', newId);
      await setDoc(ref, { ...newBeneficiary, id: newId });

      const saved = { id: newId, ...newBeneficiary };
      setBeneficiaries([saved]);
      setEditingBeneficiary({ ...saved, age: saved.age ?? 0 } as Beneficiary);
      setShowNewBeneficiaryForm(true);

      showToast('success', t('extracted.beneficiary_created'));
    } catch (err) {
      console.error('Error creating beneficiary:', err);
      showToast('error', t('extracted.failed_create_beneficiary'));
    }
  };

  const updateBeneficiary = async (savedBeneficiary: any) => {
    if (savedBeneficiary) {
      // Merge over the existing record so system fields (status, verificationStatus, ...)
      // never go missing when the form payload only contains editable fields
      setBeneficiaries(prev => {
        const exists = prev.some(b => b.id === savedBeneficiary.id);
        if (exists) return prev.map(b => b.id === savedBeneficiary.id ? { ...b, ...savedBeneficiary } : b);
        return [savedBeneficiary, ...prev];
      });

      showToast('success', t('extracted.beneficiary_updated'));
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const performDelete = async (id: string | null) => {
    if (!id) return;

    try {
      await deleteDoc(doc(db, 'beneficiaries', id));
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      if (editingBeneficiary?.id === id) {
        setEditingBeneficiary(null);
      }

      showToast('success', t('extracted.beneficiary_deleted'));
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
      showToast('error', t('extracted.failed_delete'));
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  // Single-beneficiary model: one profile per user
  const profile = beneficiaries.length > 0 ? beneficiaries[0] : null;

  // Verification completeness checks
  const profileChecks = profile ? [
    { icon: BadgeCheck, ok: !!profile.name && !!profile.aadhaarNumber, label: t('extracted.full_name'), detail: profile.name || t('extracted.not_provided') },
    { icon: Landmark, ok: !!profile.bankAccount && !!profile.ifsc, label: t('extracted.bank_account'), detail: profile.ifsc || t('extracted.not_provided') },
    { icon: FileText, ok: !!profile.scStCertificate, label: t('extracted.sc_st_certificate'), detail: profile.scStCertificate ? t('extracted.view_certificate') : t('extracted.not_provided') },
  ] : [];

  if (!user) {
    return (
      <div className="space-y-4 max-w-[1400px]">
        <div className="theme-bg-card theme-border-glass border rounded-xl p-5 text-center">
          <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.login_required')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.login_to_manage_beneficiaries')}</p>
        </div>
      </div>
    );
  }

  if (view !== 'user') {
    return (
      <div className="space-y-4 max-w-[1400px]">
        <div className="theme-bg-card theme-border-glass border rounded-xl p-5 text-center">
          <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.applicant_only_access')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.contact_admin_if_needed')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message={t('loading_beneficiaries')} />;
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <PageHeader
        title={t('extracted.beneficiary_management')}
        highlight={t('extracted.dashboard')}
        subtitle={t('extracted.manage_your_beneficiary_information')}
      >
        {beneficiaries.length === 0 && (
          <button
            onClick={createNewBeneficiary}
            className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('extracted.add_beneficiary')}</span>
          </button>
        )}
      </PageHeader>

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(tst => {
          const toastClass = tst.type === 'success'
            ? 'bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400'
            : tst.type === 'error'
              ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400'
              : 'bg-gray-500/10 border-gray-500/40 theme-text-primary';

          return (
            <div key={tst.id} className={`max-w-sm w-full p-3 rounded-md border shadow-sm ${toastClass}`} role="status">
              <div className="flex items-center justify-between">
                <div className="text-sm">{tst.message}</div>
                <button onClick={() => setToasts(prev => prev.filter(x => x.id !== tst.id))} className="ml-4 p-1 rounded hover:bg-gray-100">×</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal && !!deleteTargetId}
        message={t('extracted.are_you_sure_remove_beneficiary')}
        title={t('extracted.delete')}
        confirmLabel={t('extracted.delete')}
        onCancel={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
        onConfirm={() => performDelete(deleteTargetId)}
      />

      {/* Add/Edit Beneficiary Drawer */}
      <AnimatePresence>
        {showNewBeneficiaryForm && (
          <NewBeneficiaryForm
            onCancel={() => {
              setShowNewBeneficiaryForm(false);
              setEditingBeneficiary(null);
            }}
            initialData={editingBeneficiary}
            onSaved={(saved) => {
              updateBeneficiary(saved);
              setShowNewBeneficiaryForm(false);
              setEditingBeneficiary(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Single Beneficiary Profile */}
      {!profile ? (
        <EmptyState
          icon={UserPlus}
          title={t('extracted.no_beneficiaries_yet')}
          hint={t('extracted.add_your_beneficiary_details_to_get_started')}
          actionIcon={Plus}
          actionLabel={t('extracted.add_beneficiary')}
          onAction={createNewBeneficiary}
        />
      ) : (
        <>
          {/* ID card hero */}
          <BeneficiaryHero
            profile={profile}
            onEdit={(b) => {
              setEditingBeneficiary(b);
              setShowNewBeneficiaryForm(true);
            }}
            onDelete={confirmDelete}
            t={t}
          />

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Verification rail */}
            <VerificationRail
              title={t('extracted.verification')}
              completionLabel={t('extracted.completion_rate')}
              checks={profileChecks}
            />

            {/* Details */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              {/* Personal details */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b theme-border-glass flex items-center gap-2">
                  <User className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.personal_details')}</h3>
                </div>
                <div className="px-4 py-3.5">
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    <Pair label={t('extracted.full_name')} value={profile.name || '\u2014'} />
                    <Pair label={t('extracted.fatheraposs_name')} value={profile.fatherName || '\u2014'} />
                    <Pair label={t('extracted.aadhaar_number')} value={profile.aadhaarNumber || '\u2014'} mono />
                    <Pair label={t('extracted.age') || 'Age'} value={profile.age ?? '\u2014'} />
                    <Pair label={t('extracted.gender') || 'Gender'} value={profile.gender || '\u2014'} />
                    <Pair label={t('extracted.marital_status') || 'Marital Status'} value={profile.maritalStatus || '\u2014'} />
                  </dl>
                </div>
              </motion.div>

              {/* Contact & location */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.11 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b theme-border-glass flex items-center gap-2">
                  <Phone className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.contact')}</h3>
                </div>
                <div className="px-4 py-3.5">
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    <Pair label={t('extracted.phone')} value={profile.phone || '\u2014'} mono />
                    <Pair label={t('extracted.email')} value={profile.email || '\u2014'} />
                    <Pair label={t('extracted.district') || 'District'} value={profile.district || '\u2014'} />
                    <Pair label={t('extracted.state') || 'State'} value={profile.state || '\u2014'} />
                    <Pair label={t('extracted.registered_on')} value={formatDate(profile.createdAt)} />
                    <Pair label={t('extracted.last_updated')} value={formatDate(profile.lastUpdate)} />
                  </dl>
                  <div className="mt-3 pt-3 border-t theme-border-glass">
                    <Pair label={t('extracted.complete_address')} value={profile.address || '\u2014'} />
                  </div>
                </div>
              </motion.div>

              {/* Bank details */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b theme-border-glass flex items-center gap-2">
                  <Landmark className="w-4 h-4 theme-text-muted flex-shrink-0" />
                  <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.bank_account_details')}</h3>
                </div>
                <div className="px-4 py-3.5">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Pair label={t('extracted.bank_account') || 'Bank Account'} value={profile.bankAccount || '\u2014'} mono />
                    <Pair label={t('extracted.ifsc_code') || 'IFSC'} value={profile.ifsc || '\u2014'} mono />
                  </dl>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}
