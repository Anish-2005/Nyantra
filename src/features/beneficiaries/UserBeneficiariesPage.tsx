"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardView } from '@/context/DashboardViewContext';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import LoadingState from '@/components/LoadingState';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateBeneficiaryId } from '@/lib/id';
import {
  Search, Filter, Plus, Edit, Trash, Eye,
  Clock, AlertCircle, BadgeCheck, Banknote, X,
  Shield, FileText, File,
  ChevronLeft, ChevronRight, Loader2, User
} from 'lucide-react';

type Beneficiary = {
  id: string;
  ownerId: string;
  name: string;
  fatherName: string;
  aadhaarNumber: string;
  phone: string;
  email: string;
  district: string;
  state: string;
  address: string;
  registrationDate: any;
  priority: string;
  assignedOfficer: string;
  category: string;
  age: number | null;
  gender: string;
  maritalStatus: string;
  bankAccount: string;
  ifsc: string;
  status: string;
  verificationStatus: string;
  documents: number;
  lastUpdate: any;
  createdAt: any;
  scStCertificate: string;
};

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
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { t } = useLocale();
  const detailRef = useRef<HTMLDivElement>(null);

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

      if (items.length > 0 && !selectedBeneficiary) {
        setSelectedBeneficiary(items[0]);
      }
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
      setSelectedBeneficiary(beneficiaries[0]);
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
      setSelectedBeneficiary(saved);
      setEditingBeneficiary({ ...saved, age: saved.age ?? 0 });
      setShowNewBeneficiaryForm(true);

      showToast('success', t('extracted.beneficiary_created'));
    } catch (err) {
      console.error('Error creating beneficiary:', err);
      showToast('error', t('extracted.failed_create_beneficiary'));
    }
  };

  const updateBeneficiary = async (savedBeneficiary: any) => {
    if (savedBeneficiary) {
      setBeneficiaries(prev => {
        const exists = prev.some(b => b.id === savedBeneficiary.id);
        if (exists) return prev.map(b => b.id === savedBeneficiary.id ? { ...b, ...savedBeneficiary } : b);
        return [savedBeneficiary, ...prev];
      });

      setSelectedBeneficiary(savedBeneficiary);
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

      if (selectedBeneficiary?.id === id) {
        setSelectedBeneficiary(null);
      }
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

  const formatDate = (date: any) => {
    if (!date) return '—';
    try {
      if (typeof date?.toDate === 'function') {
        const d = date.toDate();
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
      }
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return String(date);
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    } catch { return String(date); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'disbursed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'pending-verification': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'documents-required': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'documents-required': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending-verification': Clock,
      'verified': BadgeCheck,
      'disbursed': Banknote,
      'rejected': X,
      'documents-required': AlertCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getVerificationIcon = (status: string) => {
    const icons = {
      'verified': Shield,
      'pending': Clock,
      'rejected': X,
      'documents-required': AlertCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const filteredBeneficiaries = useMemo(() => {
    let filtered = [...beneficiaries];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(beneficiary =>
        beneficiary.name.toLowerCase().includes(q) ||
        beneficiary.id.toLowerCase().includes(q) ||
        beneficiary.district.toLowerCase().includes(q) ||
        beneficiary.aadhaarNumber.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.category === categoryFilter);
    }

    if (verificationFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.verificationStatus === verificationFilter);
    }

    return filtered;
  }, [beneficiaries, searchQuery, statusFilter, categoryFilter, verificationFilter]);

  const stats = useMemo(() => ({
    total: beneficiaries.length,
    verified: beneficiaries.filter(b => b.verificationStatus === 'verified').length,
    pendingVerification: beneficiaries.filter(b => b.verificationStatus === 'pending').length,
    rejected: beneficiaries.filter(b => b.status === 'rejected').length,
    documentsRequired: beneficiaries.filter(b => b.status === 'documents-required').length
  }), [beneficiaries]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalItems = filteredBeneficiaries.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);
  const noPages = totalPages === 0;

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || verificationFilter !== 'all';

  useEffect(() => {
    if (selectedBeneficiary?.id) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedBeneficiary?.id]);

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.beneficiary_management')} <span className="text-accent-gradient">{t('extracted.dashboard')}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.manage_your_beneficiary_information')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={createNewBeneficiary}
            className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('extracted.add_beneficiary')}</span>
          </button>
        </div>
      </motion.div>

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

      {/* Statistics band */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-px theme-bg-glass theme-border-glass border rounded-xl overflow-hidden"
      >
        {[
          { labelKey: 'extracted.total', value: stats.total },
          { labelKey: 'extracted.verified', value: stats.verified },
          { labelKey: 'extracted.pending', value: stats.pendingVerification },
          { labelKey: 'extracted.rejected', value: stats.rejected },
          { labelKey: 'extracted.documents_required', value: stats.documentsRequired }
        ].map((stat, idx) => (
          <div key={idx} className="theme-bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{t(stat.labelKey)}</p>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters and Search Toolbar */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={t('extracted.search_by_name_aadhaar_id_or_district')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${showFilters ? 'accent-gradient text-white' : 'theme-text-secondary hover:theme-bg-glass hover:theme-text-primary'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{t('extracted.filters')}</span>
              {hasActiveFilters && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label>{t('extracted.status')}</Label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={inputCls}
                  >
                    <option value="all">{t('extracted.all_statuses')}</option>
                    <option value="verified">{t('extracted.verified')}</option>
                    <option value="pending-verification">{t('extracted.pending_verification')}</option>
                    <option value="rejected">{t('extracted.rejected')}</option>
                    <option value="documents-required">{t('extracted.documents_required')}</option>
                  </select>
                </div>
                <div>
                  <Label>{t('extracted.category_1')}</Label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={inputCls}
                  >
                    <option value="all">{t('extracted.all_categories')}</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                </div>
                <div>
                  <Label>{t('extracted.verification')}</Label>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className={inputCls}
                  >
                    <option value="all">{t('extracted.all_verification')}</option>
                    <option value="verified">{t('extracted.verified')}</option>
                    <option value="pending">{t('extracted.pending')}</option>
                    <option value="rejected">{t('extracted.rejected')}</option>
                    <option value="documents-required">{t('extracted.documents_required')}</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                      Status: {statusFilter.replace('-', ' ')}
                      <button onClick={() => setStatusFilter('all')} className="rounded-full p-0.5 hover:theme-text-primary transition-colors" aria-label="Clear status filter">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                      Category: {categoryFilter}
                      <button onClick={() => setCategoryFilter('all')} className="rounded-full p-0.5 hover:theme-text-primary transition-colors" aria-label="Clear category filter">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {verificationFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                      Verification: {verificationFilter.replace('-', ' ')}
                      <button onClick={() => setVerificationFilter('all')} className="rounded-full p-0.5 hover:theme-text-primary transition-colors" aria-label="Clear verification filter">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setVerificationFilter('all');
                    }}
                    className="px-2 py-1 rounded-md theme-bg-glass theme-text-muted text-xs font-medium hover:theme-text-primary transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      {/* Beneficiaries List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
      >
        {paginatedBeneficiaries.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-12 h-12 theme-bg-glass rounded-full flex items-center justify-center mb-3">
              <User className="w-5 h-5 theme-text-muted" />
            </div>
            <p className="theme-text-muted mb-1">
              {beneficiaries.length === 0 ? t('extracted.no_beneficiaries_yet') : t('extracted.try_adjusting_search_terms')}
            </p>
            {beneficiaries.length === 0 && (
              <p className="text-sm theme-text-muted">
                {t('extracted.click_create_to_get_started')}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b theme-border-glass">
                  <tr>
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.beneficiary')}</th>
                    <th className="hidden lg:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.aadhaar_number')}</th>
                    <th className="hidden lg:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.phone')}</th>
                    <th className="hidden xl:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.email')}</th>
                    <th className="hidden lg:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.location')}</th>
                    <th className="hidden xl:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.category_1')}</th>
                    <th className="hidden xl:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.registration_date')}</th>
                    <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.status')}</th>
                    <th className="hidden xl:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.verification')}</th>
                    <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">{t('extracted.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBeneficiaries.map((beneficiary) => {
                    const StatusIcon = getStatusIcon(beneficiary.status);
                    const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);

                    return (
                      <tr
                        key={beneficiary.id}
                        className={`border-b theme-border-glass last:border-b-0 cursor-pointer hover:theme-bg-hover transition-colors ${
                          selectedBeneficiary?.id === beneficiary.id ? 'theme-bg-glass' : ''
                        }`}
                        onClick={() => setSelectedBeneficiary(beneficiary)}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full accent-gradient text-white text-[11px] font-bold grid place-items-center uppercase flex-shrink-0">
                              {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium theme-text-primary truncate">{beneficiary.name}</p>
                              <p className="text-[11px] theme-text-muted font-mono truncate">{beneficiary.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell py-2.5 px-3 text-xs font-mono theme-text-primary">{beneficiary.aadhaarNumber}</td>
                        <td className="hidden lg:table-cell py-2.5 px-3 text-[13px] theme-text-primary whitespace-nowrap">{beneficiary.phone}</td>
                        <td className="hidden xl:table-cell py-2.5 px-3 text-[13px] theme-text-primary"><span className="block max-w-[160px] truncate">{beneficiary.email || '—'}</span></td>
                        <td className="hidden lg:table-cell py-2.5 px-3">
                          <p className="text-[13px] theme-text-primary">{beneficiary.district}</p>
                          <p className="text-[11px] theme-text-muted">{beneficiary.state}</p>
                        </td>
                        <td className="hidden xl:table-cell py-2.5 px-3 text-[13px] theme-text-primary">{beneficiary.category}</td>
                        <td className="hidden xl:table-cell py-2.5 px-3 text-[13px] theme-text-primary tabular-nums whitespace-nowrap">{formatDate(beneficiary.registrationDate)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {beneficiary.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                            <VerificationIcon className="w-3 h-3" />
                            {beneficiary.verificationStatus.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-end gap-1">
                            {beneficiary.scStCertificate && (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open(beneficiary.scStCertificate, '_blank'); }}
                                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-green-500 transition-colors"
                                title="View Certificate"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBeneficiary(beneficiary);
                                setShowNewBeneficiaryForm(true);
                              }}
                              className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                              title={t('extracted.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); confirmDelete(beneficiary.id); }}
                              className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-red-500 transition-colors"
                              title={t('extracted.delete')}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile flat list */}
            <div className="md:hidden">
              {paginatedBeneficiaries.map((beneficiary) => {
                const StatusIcon = getStatusIcon(beneficiary.status);
                const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);

                return (
                  <div
                    key={beneficiary.id}
                    className={`p-3.5 border-b theme-border-glass last:border-b-0 cursor-pointer hover:theme-bg-hover transition-colors ${
                      selectedBeneficiary?.id === beneficiary.id ? 'theme-bg-glass' : ''
                    }`}
                    onClick={() => setSelectedBeneficiary(beneficiary)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full accent-gradient text-white text-[11px] font-bold grid place-items-center uppercase flex-shrink-0">
                          {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold theme-text-primary truncate">{beneficiary.name}</p>
                          <p className="text-xs theme-text-muted font-mono truncate">{beneficiary.id}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {beneficiary.status.replace('-', ' ')}
                      </span>
                    </div>

                    <dl className="mt-2.5 space-y-1.5">
                      <Pair label={t('extracted.aadhaar_number')} value={beneficiary.aadhaarNumber} mono />
                      <Pair label={t('extracted.location')} value={`${beneficiary.district}, ${beneficiary.state}`} />
                      <Pair label={t('extracted.registration_date')} value={formatDate(beneficiary.registrationDate)} />
                    </dl>

                    <div className="mt-2.5 pt-2.5 border-t theme-border-glass flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                        <VerificationIcon className="w-3 h-3" />
                        {beneficiary.verificationStatus.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {beneficiary.scStCertificate && (
                          <button
                            aria-label="View certificate"
                            onClick={(e) => { e.stopPropagation(); window.open(beneficiary.scStCertificate, '_blank'); }}
                            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-green-500 transition-colors"
                            title="View Certificate"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          aria-label="Edit beneficiary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBeneficiary(beneficiary);
                            setShowNewBeneficiaryForm(true);
                          }}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                          title={t('extracted.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          aria-label="Delete beneficiary"
                          onClick={(e) => { e.stopPropagation(); confirmDelete(beneficiary.id); }}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-red-500 transition-colors"
                          title={t('extracted.delete')}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t theme-border-glass">
          <p className="text-xs theme-text-muted">
            {t('extracted.showing')} {startItem} {t('extracted.to')} {endItem} {t('extracted.of')} {totalItems}
          </p>
          {!noPages && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1 || noPages}
                onClick={() => setCurrentPage((p: number) => p - 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i).map((pageNum: number) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${currentPage === pageNum ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-bg-glass hover:theme-text-primary'}`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || noPages}
                onClick={() => setCurrentPage((p: number) => p + 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Beneficiary Detail Inspector */}
      {selectedBeneficiary && (
        <div ref={detailRef} className="theme-bg-card theme-border-glass border rounded-xl w-full overflow-hidden scroll-mt-20">
          <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">{selectedBeneficiary.name}</h2>
              <span className="hidden sm:inline text-xs theme-text-muted font-mono flex-shrink-0">{selectedBeneficiary.id}</span>
              <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(selectedBeneficiary.status)}`}>
                {selectedBeneficiary.status.replace('-', ' ')}
              </span>
              <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${getVerificationColor(selectedBeneficiary.verificationStatus)}`}>
                {selectedBeneficiary.verificationStatus.replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setEditingBeneficiary(selectedBeneficiary);
                  setShowNewBeneficiaryForm(true);
                }}
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                title={t('extracted.edit')}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-4 py-3.5">
            <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <Pair label={t('extracted.full_name')} value={selectedBeneficiary.name} />
              <Pair label={t('extracted.fatheraposs_name')} value={selectedBeneficiary.fatherName || '—'} />
              <Pair label={t('extracted.aadhaar_number')} value={selectedBeneficiary.aadhaarNumber} mono />
              <Pair label={t('extracted.beneficiary_id')} value={selectedBeneficiary.id} mono />
              <Pair label={t('extracted.phone_number')} value={selectedBeneficiary.phone} />
              <Pair label={t('extracted.email')} value={selectedBeneficiary.email || '—'} />
              <Pair label={t('extracted.location')} value={`${selectedBeneficiary.district}, ${selectedBeneficiary.state}`} />
              <Pair label={t('extracted.complete_address')} value={selectedBeneficiary.address || '—'} />
              <Pair label={t('extracted.category_1') || 'Category'} value={selectedBeneficiary.category} />
              <Pair label={t('extracted.age') || 'Age'} value={selectedBeneficiary.age ?? '—'} />
              <Pair label={t('extracted.gender') || 'Gender'} value={selectedBeneficiary.gender || '—'} />
              <Pair label={t('extracted.marital_status') || 'Marital Status'} value={selectedBeneficiary.maritalStatus || '—'} />
              <Pair label={t('extracted.bank_account') || 'Bank Account'} value={selectedBeneficiary.bankAccount || '—'} mono />
              <Pair label={t('extracted.ifsc_code') || 'IFSC'} value={selectedBeneficiary.ifsc || '—'} mono />
              <Pair label={t('extracted.registered_on')} value={formatDate(selectedBeneficiary.createdAt)} />
              <Pair label={t('extracted.last_updated')} value={formatDate(selectedBeneficiary.lastUpdate)} />
            </dl>

            <div className="mt-3.5 pt-3 border-t theme-border-glass flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 theme-text-muted flex-shrink-0" />
              <span className="text-[11px] uppercase tracking-wider theme-text-muted flex-shrink-0">{t('extracted.sc_st_certificate')}</span>
              {selectedBeneficiary.scStCertificate ? (
                <a
                  href={selectedBeneficiary.scStCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium underline underline-offset-2 theme-text-primary hover:opacity-80 transition-opacity truncate"
                >
                  {t('extracted.view_certificate')}
                </a>
              ) : (
                <span className="text-[13px] theme-text-muted">{t('extracted.not_provided')}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
