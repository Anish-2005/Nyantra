"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import ExportModal from '@/components/dashboard/ExportModal';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { db } from '@/lib/firebase';
import { generateBeneficiaryId } from '@/lib/id';
import { collection, onSnapshot, query, orderBy, addDoc, setDoc, doc, updateDoc, deleteDoc, Timestamp, getDoc, limit, getDocs } from 'firebase/firestore';
import { CldUploadWidget } from 'next-cloudinary';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import {
  Search, Filter, Download, Plus, Eye, Edit,
  ChevronLeft, ChevronRight, X,
  Trash, FileText,
  Upload, File, Loader2,
  Clock, AlertCircle, Shield, BadgeCheck, Banknote
} from 'lucide-react';

// All data is Firestore-backed now. Removed local mock data to rely solely on Firestore.

const inputCls = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:border-[var(--accent-primary)] transition-colors";
const inlineInputCls = "h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:border-[var(--accent-primary)] transition-colors";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

const Pair = ({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{label}</dt>
    <dd className={`text-[13px] font-medium theme-text-primary mt-0.5 truncate ${mono ? 'font-mono' : ''}`}>{value}</dd>
  </div>
);

// New Beneficiary Form Component (client-side)
const NewBeneficiaryForm = ({ onCancel, initialData, onSaved, showToast }: { 
  onCancel: () => void, 
  initialData?: any | null, 
  onSaved?: ((saved?: any) => void) | undefined,
  showToast: (type: 'success' | 'error' | 'info', message: string, ttl?: number) => void
}) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.aadhaarNumber.trim()) {
      errors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      errors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    // Email validation (optional but must be valid if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.district.trim()) {
      errors.district = 'District is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    // SC/ST Certificate validation - required when category is SC or ST
    if ((formData.category === 'SC' || formData.category === 'ST') && !formData.scStCertificate.trim()) {
      errors.scStCertificate = 'SC/ST certificate upload is required for SC/ST category';
    }

    // Bank account validation if provided
    if (formData.bankAccount.trim() && !/^\d{9,18}$/.test(formData.bankAccount)) {
      errors.bankAccount = 'Bank account number should be 9-18 digits';
    }

    // IFSC validation if provided
    if (formData.ifsc.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
      errors.ifsc = 'Invalid IFSC code format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const beneficiariesRef = collection(db, 'beneficiaries');
      if (initialData && initialData.id) {
        // update existing beneficiary
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
      } else {
        const newBeneficiary = {
          name: formData.name,
          fatherName: formData.fatherName,
          aadhaarNumber: formData.aadhaarNumber,
          phone: formData.phone,
          email: formData.email,
          district: formData.district,
          state: formData.state,
          address: formData.address,
          registrationDate: formData.registrationDate ? Timestamp.fromDate(new Date(formData.registrationDate)) : Timestamp.fromDate(new Date()),
          status: 'pending-verification',
          priority: formData.priority,
          assignedOfficer: formData.assignedOfficer,
          documents: 0,
          lastUpdate: Timestamp.fromDate(new Date()),
          verificationStatus: 'pending',
          category: formData.category,
          age: parseInt(formData.age) || null,
          gender: formData.gender || null,
          maritalStatus: formData.maritalStatus || null,
          bankAccount: formData.bankAccount || null,
          ifsc: formData.ifsc || null,
          scStCertificate: formData.scStCertificate
        };

        // Generate beneficiary id starting with `BEN` followed by digits
        const newId = generateBeneficiaryId();
        const ref = doc(db, 'beneficiaries', newId);
        await setDoc(ref, { ...newBeneficiary, id: newId });
        const saved = { id: newId, ...newBeneficiary };
        onSaved?.(saved);
        onCancel();
      }
    } catch (err) {
      console.error('Error adding/updating beneficiary:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prefill form when editing
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
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-y-0 right-0 w-full max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
      >
        <div className="h-12 px-4 flex items-center justify-between border-b theme-border-glass flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold tracking-tight theme-text-primary">{initialData ? t('extracted.edit_beneficiary') : t('extracted.create_new_beneficiary')}</h3>
            <p className="text-[11px] theme-text-muted">{initialData ? t('extracted.edit_beneficiary_description') : t('extracted.create_new_beneficiary_description')}</p>
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="new-beneficiary-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{t('extracted.add_beneficiary')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.full_name')}</label>
            <input required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.name ? 'border-red-500' : ''}`} />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.fatheraposs_name')}</label>
            <input value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.aadhaar_number')}</label>
            <input value={formData.aadhaarNumber} onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.aadhaarNumber ? 'border-red-500' : ''}`} />
            {validationErrors.aadhaarNumber && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.aadhaarNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.phone_number')}</label>
            <input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.phone ? 'border-red-500' : ''}`} />
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.email')}</label>
            <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.email ? 'border-red-500' : ''}`} />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.district')}</label>
            <input value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.district ? 'border-red-500' : ''}`} />
            {validationErrors.district && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.district}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.state')}</label>
            <input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.state ? 'border-red-500' : ''}`} />
            {validationErrors.state && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.complete_address')}</label>
            <input value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{t('extracted.verification_details')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.sc_st_certificate')}</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploading(true);
                      setUploadProgress(0);
                      try {
                        // Simple progress simulation
                        const progressInterval = setInterval(() => {
                          setUploadProgress(prev => Math.min(90, prev + 10));
                        }, 200);

                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);
                        uploadFormData.append('beneficiaryId', initialData?.id || 'temp');

                        console.log('Starting upload...');
                        const response = await fetch('/api/upload-certificate', {
                          method: 'POST',
                          body: uploadFormData,
                        });

                        clearInterval(progressInterval);
                        setUploadProgress(100);

                        console.log('Upload response status:', response.status);
                        const result = await response.json();
                        console.log('Upload result:', result);

                        if (result.success) {
                          console.log('Setting certificate URL:', result.url);
                          setFormData(prev => ({ ...prev, scStCertificate: result.url }));
                          setValidationErrors(prev => ({ ...prev, scStCertificate: '' }));
                          showToast('success', 'Certificate uploaded successfully');
                        } else {
                          showToast('error', result.error || 'Upload failed');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        showToast('error', 'Failed to upload certificate. Please check your internet connection or enter URL manually.');
                      } finally {
                        setIsUploading(false);
                        setUploadProgress(0);
                      }
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.scStCertificate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isUploading}
                />
                <button
                  type="button"
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                  className={`px-3.5 py-2 rounded-md theme-bg-glass theme-border-glass border theme-text-primary hover:bg-blue-500/10 transition-colors flex items-center gap-2 ${validationErrors.scStCertificate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isUploading}
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload'}
                </button>
              </div>
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm theme-text-muted">or</span>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter certificate URL:');
                    if (url && url.trim()) {
                      setFormData(prev => ({ ...prev, scStCertificate: url.trim() }));
                      setValidationErrors(prev => ({ ...prev, scStCertificate: '' }));
                      showToast('success', 'Certificate URL added manually');
                    }
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600 underline"
                  disabled={isSubmitting || isUploading}
                >
                  Enter URL manually
                </button>
              </div>
              {formData.scStCertificate && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <File className="w-4 h-4 text-green-500" />
                  <span className="text-sm theme-text-primary">Certificate uploaded successfully</span>
                  <a
                    href={formData.scStCertificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm underline"
                  >
                    View File
                  </a>
                </div>
              )}
              {validationErrors.scStCertificate && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.scStCertificate}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">{t('extracted.personal_details')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.age')}</label>
            <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.gender')}</label>
            <select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary">
              <option value="">{t('extracted.select_gender')}</option>
              <option value="Male">{t('extracted.male')}</option>
              <option value="Female">{t('extracted.female')}</option>
              <option value="Other">{t('extracted.other')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.category_1') || 'Category'}</label>
            <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary">
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.marital_status')}</label>
            <select value={formData.maritalStatus} onChange={(e) => handleInputChange('maritalStatus', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary">
              <option value="">{t('extracted.select_marital_status')}</option>
              <option value="Single">{t('extracted.single')}</option>
              <option value="Married">{t('extracted.married')}</option>
              <option value="Divorced">{t('extracted.divorced')}</option>
              <option value="Widowed">{t('extracted.widowed')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.bank_account')}</label>
            <input value={formData.bankAccount} onChange={(e) => handleInputChange('bankAccount', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.bankAccount ? 'border-red-500' : ''}`} />
            {validationErrors.bankAccount && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.bankAccount}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.ifsc_code')}</label>
            <input value={formData.ifsc} onChange={(e) => handleInputChange('ifsc', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.ifsc ? 'border-red-500' : ''}`} />
            {validationErrors.ifsc && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.ifsc}</p>
            )}
          </div>
        </div>

      </section>
    </form>

    <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting || isUploading}
        className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary hover:theme-bg-hover hover:theme-text-primary transition-colors text-sm font-medium disabled:opacity-50"
      >
        {t('extracted.cancel')}
      </button>
      <button
        type="submit"
        form="new-beneficiary-form"
        disabled={isSubmitting || isUploading}
        className="flex-1 h-9 rounded-md accent-gradient text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          initialData ? t('extracted.save') : t('extracted.create')
        )}
      </button>
    </div>
      </motion.aside>
    </div>,
    document.body
  );
};

const BeneficiariesPage = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { profile, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [fullBeneficiaries, setFullBeneficiaries] = useState<Record<string, any>>({});
  const [selectedBeneficiaryLoading, setSelectedBeneficiaryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [disbursements, setDisbursements] = useState<any[]>([]);

  // Email export state
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
  };

  // Export helpers
  const exportBeneficiariesData = (items: any[]) => {
    const headers = ['Beneficiary ID', 'Name', 'Aadhaar', 'Phone', 'Email', 'District', 'State', 'SC/ST Certificate', t("beneficiary.sortOptions.registrationDate") || 'Registration Date', 'Status', 'Verification', 'Disbursed (INR)', 'Priority', 'Assigned Officer', 'Documents', 'Last Update', 'Age', 'Gender', 'Marital Status', 'Bank Account', 'IFSC'];
    const rows = items.map(b => {
      const reg = b.registrationDate && typeof b.registrationDate.toDate === 'function'
        ? b.registrationDate.toDate().toISOString()
        : (b.registrationDate || '');
      return [
        b.id,
        b.name,
        b.aadhaarNumber,
        b.phone,
        b.email || '',
        b.district,
        b.state,
        b.scStCertificate || '',
        reg,
        b.status || '',
        b.verificationStatus || '',
        (b.disbursedAmount != null ? String(b.disbursedAmount) : '0'),
        b.priority || '',
        b.assignedOfficer || '',
        String(b.documents || 0),
        b.lastUpdate || '',
        b.age || '',
        b.gender || '',
        b.maritalStatus || '',
        b.bankAccount || '',
        b.ifsc || ''
      ];
    });

    const csv = [headers, ...rows].map(r => r.map(f => `"${(f ?? '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `beneficiaries_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBeneficiariesPDF = (items: any[]) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Professional header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('NYANTRA - Beneficiaries Report', margin, 22);

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Direct Benefit Transfer System under PCR & PoA Acts', margin, 30);

    // Report metadata
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
    doc.text(`Total Records: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

    let yPosition = 50;

    // Summary section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 25, 'F');

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

    // Summary stats
    const statusCounts = items.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const verificationCounts = items.reduce((acc, b) => {
        acc[b.verificationStatus] = (acc[b.verificationStatus] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Beneficiaries: ${items.length}`, margin + 5, yPosition + 18);

    yPosition += 35;

    // Status breakdown
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Status Breakdown:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    Object.entries(statusCounts).forEach(([status, count]) => {
        const statusText = status.replace(/-/g, ' ').toUpperCase();
        const percentage = (((count as number) / items.length) * 100).toFixed(1);
        doc.text(`${statusText}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
    });

    yPosition += 10;

    // Verification breakdown
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Verification Breakdown:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    Object.entries(verificationCounts).forEach(([verification, count]) => {
        const verificationText = verification.replace(/-/g, ' ').toUpperCase();
        const percentage = (((count as number) / items.length) * 100).toFixed(1);
        doc.text(`${verificationText}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
    });

    yPosition += 10;

    // Beneficiaries table
    const tableColumns = [
        { header: 'Beneficiary ID', dataKey: 'id', width: 30 },
        { header: 'Name', dataKey: 'name', width: 35 },
        { header: 'Phone', dataKey: 'phone', width: 30 },
        { header: 'District', dataKey: 'district', width: 30 },
        { header: 'Status', dataKey: 'status', width: 25 },
        { header: 'Verification', dataKey: 'verificationStatus', width: 25 },
        { header: 'Assigned Officer', dataKey: 'assignedOfficer', width: 35 }
    ];

    const tableRows = items.map(b => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        district: `${b.district}${b.state ? `, ${b.state}` : ''}`,
        status: (b.status || '').toString().replace(/-/g, ' ').toUpperCase(),
        verificationStatus: (b.verificationStatus || '').toString().replace(/-/g, ' ').toUpperCase(),
        assignedOfficer: b.assignedOfficer || 'Not Assigned'
    }));

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
    }

    // Table header
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    let xPos = margin + 2;
    tableColumns.forEach(col => {
        doc.text(col.header, xPos, yPosition + 5.5);
        xPos += col.width;
    });

    yPosition += 10;

    // Table rows
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    tableRows.forEach((row, index) => {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;

            // Repeat header on new page
            doc.setFillColor(30, 64, 175);
            doc.rect(margin, yPosition, contentWidth, 8, 'F');

            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');

            xPos = margin + 2;
            tableColumns.forEach(col => {
                doc.text(col.header, xPos, yPosition + 5.5);
                xPos += col.width;
            });

            yPosition += 10;
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
        }

        // Alternate row colors
        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, yPosition - 3, contentWidth, 6, 'F');
        }

        xPos = margin + 2;
        tableColumns.forEach(col => {
            const value = row[col.dataKey as keyof typeof row] || '';
            doc.text(String(value), xPos, yPosition + 2);
            xPos += col.width;
        });

        yPosition += 6;
    });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(6);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text('This report is generated by Nyantra - Direct Benefit Transfer System', margin, footerY);
    doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

    // Save the PDF
    doc.save(`nyantra_beneficiaries_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Email export function
  const sendBeneficiariesEmail = async (items: any[], format: 'csv' | 'pdf') => {
    if (!emailAddress.trim()) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      let attachmentData: string | Buffer;
      let attachmentName: string;
      let attachmentType: string;

      if (format === 'csv') {
        const headers = ['Beneficiary ID', 'Name', 'Aadhaar', 'Phone', 'Email', 'District', 'State', 'SC/ST Certificate', t("beneficiary.sortOptions.registrationDate") || 'Registration Date', 'Status', 'Verification', 'Disbursed (INR)', 'Priority', 'Assigned Officer', 'Documents', 'Last Update', 'Age', 'Gender', 'Marital Status', 'Bank Account', 'IFSC'];
        const rows = items.map(b => {
          const reg = b.registrationDate && typeof b.registrationDate.toDate === 'function'
            ? b.registrationDate.toDate().toISOString()
            : (b.registrationDate || '');
          return [
            b.id,
            b.name,
            b.aadhaarNumber,
            b.phone,
            b.email || '',
            b.district,
            b.state,
            b.scStCertificate || '',
            reg,
            b.status || '',
            b.verificationStatus || '',
            (b.disbursedAmount != null ? String(b.disbursedAmount) : '0'),
            b.priority || '',
            b.assignedOfficer || '',
            String(b.documents || 0),
            b.lastUpdate || '',
            b.age || '',
            b.gender || '',
            b.maritalStatus || '',
            b.bankAccount || '',
            b.ifsc || ''
          ];
        });

        attachmentData = [headers, ...rows].map(r => r.map(f => `"${(f ?? '')}"`).join(',')).join('\n');
        attachmentName = `beneficiaries_export_${new Date().toISOString().split('T')[0]}.csv`;
        attachmentType = 'text/csv';
      } else {
        // Generate PDF as base64
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Professional header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, pageWidth, 35, 'F');

        // Title
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('NYANTRA - Beneficiaries Report', margin, 22);

        // Subtitle
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.text('Direct Benefit Transfer System under PCR & PoA Acts', margin, 30);

        // Report metadata
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generated: ${currentDate}`, pageWidth - margin, 22, { align: 'right' });
        doc.text(`Total Records: ${items.length}`, pageWidth - margin, 30, { align: 'right' });

        let yPosition = 50;

        // Summary section
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition, contentWidth, 25, 'F');

        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        doc.setFont('helvetica', 'bold');
        doc.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);

        // Summary stats
        const statusCounts = items.reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const verificationCounts = items.reduce((acc, b) => {
            acc[b.verificationStatus] = (acc[b.verificationStatus] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Beneficiaries: ${items.length}`, margin + 5, yPosition + 18);

        yPosition += 35;

        // Status breakdown
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('Status Breakdown:', margin, yPosition);

        yPosition += 8;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        Object.entries(statusCounts).forEach(([status, count]) => {
            const statusText = status.replace(/-/g, ' ').toUpperCase();
            const percentage = (((count as number) / items.length) * 100).toFixed(1);
            doc.text(`${statusText}: ${count} (${percentage}%)`, margin + 5, yPosition);
            yPosition += 5;
        });

        yPosition += 10;

        // Verification breakdown
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('Verification Breakdown:', margin, yPosition);

        yPosition += 8;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        Object.entries(verificationCounts).forEach(([verification, count]) => {
            const verificationText = verification.replace(/-/g, ' ').toUpperCase();
            const percentage = (((count as number) / items.length) * 100).toFixed(1);
            doc.text(`${verificationText}: ${count} (${percentage}%)`, margin + 5, yPosition);
            yPosition += 5;
        });

        yPosition += 10;

        // Beneficiaries table
        const tableColumns = [
            { header: 'Beneficiary ID', dataKey: 'id', width: 30 },
            { header: 'Name', dataKey: 'name', width: 35 },
            { header: 'Phone', dataKey: 'phone', width: 30 },
            { header: 'District', dataKey: 'district', width: 30 },
            { header: 'Status', dataKey: 'status', width: 25 },
            { header: 'Verification', dataKey: 'verificationStatus', width: 25 },
            { header: 'Assigned Officer', dataKey: 'assignedOfficer', width: 35 }
        ];

        const tableRows = items.map(b => ({
            id: b.id,
            name: b.name,
            phone: b.phone,
            district: `${b.district}${b.state ? `, ${b.state}` : ''}`,
            status: (b.status || '').toString().replace(/-/g, ' ').toUpperCase(),
            verificationStatus: (b.verificationStatus || '').toString().replace(/-/g, ' ').toUpperCase(),
            assignedOfficer: b.assignedOfficer || 'Not Assigned'
        }));

        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
        }

        // Table header
        doc.setFillColor(30, 64, 175);
        doc.rect(margin, yPosition, contentWidth, 8, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        let xPos = margin + 2;
        tableColumns.forEach(col => {
            doc.text(col.header, xPos, yPosition + 5.5);
            xPos += col.width;
        });

        yPosition += 10;

        // Table rows
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        tableRows.forEach((row, index) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;

                // Repeat header on new page
                doc.setFillColor(30, 64, 175);
                doc.rect(margin, yPosition, contentWidth, 8, 'F');

                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');

                xPos = margin + 2;
                tableColumns.forEach(col => {
                    doc.text(col.header, xPos, yPosition + 5.5);
                    xPos += col.width;
                });

                yPosition += 10;
                doc.setFontSize(7);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(margin, yPosition - 3, contentWidth, 6, 'F');
            }

            xPos = margin + 2;
            tableColumns.forEach(col => {
                const value = row[col.dataKey as keyof typeof row] || '';
                doc.text(String(value), xPos, yPosition + 2);
                xPos += col.width;
            });

            yPosition += 6;
        });

        // Footer
        const footerY = pageHeight - 15;
        doc.setFontSize(6);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'italic');
        doc.text('This report is generated by Nyantra - Direct Benefit Transfer System', margin, footerY);
        doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

        // Get PDF as buffer
        const pdfBuffer = doc.output('arraybuffer');
        attachmentData = Buffer.from(pdfBuffer);
        attachmentName = `nyantra_beneficiaries_report_${new Date().toISOString().split('T')[0]}.pdf`;
        attachmentType = 'application/pdf';
      }

      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress.trim(),
          subject: `Nyantra Beneficiaries Report - ${items.length} Records`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Nyantra - Beneficiaries Report</h2>
              <p>Dear User,</p>
              <p>Please find attached the beneficiaries report containing ${items.length} records.</p>
              <p><strong>Report Details:</strong></p>
              <ul>
                <li>Total Records: ${items.length}</li>
                <li>Format: ${format.toUpperCase()}</li>
                <li>Generated: ${new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
              <p>This report is generated by the Nyantra Direct Benefit Transfer System.</p>
              <p>Best regards,<br>Nyantra Team</p>
            </div>
          `,
          attachments: [{
            filename: attachmentName,
            content: attachmentData,
            contentType: attachmentType,
            encoding: format === 'csv' ? 'utf8' : undefined
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      showToast('success', `Report sent successfully to ${emailAddress}! Check your Gmail inbox.`);
      setEmailAddress('');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('error', 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Detail controlled fields
  const [detailStatus, setDetailStatus] = useState<string>('');
  const [detailVerification, setDetailVerification] = useState<string>('');

  useEffect(() => {
    setDetailStatus(selectedBeneficiary?.status || 'pending-verification');
    setDetailVerification(selectedBeneficiary?.verificationStatus || 'pending');
  }, [selectedBeneficiary]);

  const updateBeneficiaryStatus = async (id: string, status: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'beneficiaries', id), { status, lastUpdate: Timestamp.fromDate(new Date()) });
      setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      setFullBeneficiaries(prev => prev[id] ? { ...prev, [id]: { ...prev[id], status } } : prev);
      setSelectedBeneficiary((prev: any) => prev ? { ...prev, status } : prev);
      showToast('success', `Updated status for ${id} to ${status}`);
    } catch (err) {
      showToast('error', `Failed to update status: ${(err as any)?.message || String(err)}`);
    }
  };

  const updateBeneficiaryVerification = async (id: string, verification: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'beneficiaries', id), { verificationStatus: verification, lastUpdate: Timestamp.fromDate(new Date()) });
      setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, verificationStatus: verification } : b));
      setFullBeneficiaries(prev => prev[id] ? { ...prev, [id]: { ...prev[id], verificationStatus: verification } } : prev);
      setSelectedBeneficiary((prev: any) => prev ? { ...prev, verificationStatus: verification } : prev);
      showToast('success', `Updated verification for ${id} to ${verification}`);
    } catch (err) {
      showToast('error', `Failed to update verification: ${(err as any)?.message || String(err)}`);
    }
  };

  // Open a UI confirmation modal (instead of window.confirm)
  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const performDelete = async (id: string | null) => {
    if (!id) return;
    try {
      setDeletingId(id);
      // perform deletion
      await deleteDoc(doc(db, 'beneficiaries', id));
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      setFullBeneficiaries(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (selectedBeneficiary?.id === id) setSelectedBeneficiary(null);
      showToast('success', t('deleted_success') || `Deleted ${id}`);
    } catch (err) {
      console.error('Failed to delete beneficiary:', err);
      const errCode = (err as any)?.code || (err && (err as any).message && String(err).toLowerCase().includes('permission') ? 'permission-denied' : undefined);
      if (errCode === 'permission-denied') {
        showToast('error', t('no_permission_delete') || 'Insufficient permissions to delete beneficiary. Contact your administrator.');
      } else {
        showToast('error', t('deleted_failed') || `Failed to delete: ${(err as any)?.message || String(err)}`);
      }
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const fetchFullBeneficiary = async (id: string) => {
    if (fullBeneficiaries[id]) return fullBeneficiaries[id];
    try {
      const docSnap = await getDoc(doc(db, 'beneficiaries', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const full = {
          id: docSnap.id,
          ...data
        };
        setFullBeneficiaries(prev => ({ ...prev, [id]: full }));
        return full;
      }
    } catch (err) {
      console.error('Error fetching full beneficiary:', err);
    }
    return null;
  };

  // Filter and sort beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    let filtered = [...beneficiaries];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(beneficiary =>
        beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.aadhaarNumber.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.category === categoryFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(beneficiary => beneficiary.verificationStatus === verificationFilter);
    }

    // Sort (normalize registrationDate/Timestamp/string numbers so ordering is consistent)
    const getComparable = (val: any) => {
      if (val == null) return -Infinity;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const t = Date.parse(val);
        if (!Number.isNaN(t)) return t;
        return val;
      }
      if (typeof val === 'object' && typeof val.toDate === 'function') {
        return val.toDate().getTime();
      }
      return String(val);
    };

    // Custom sorting for status and verification fields
    const getStatusOrder = (status: string) => {
      const order = {
        'pending-verification': 1,
        'verified': 2,
        'rejected': 3,
        'documents-required': 4
      };
      return order[status as keyof typeof order] || 999;
    };

    const getVerificationOrder = (verification: string) => {
      const order = {
        'pending': 1,
        'verified': 2,
        'rejected': 3,
        'documents-required': 4
      };
      return order[verification as keyof typeof order] || 999;
    };

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortBy === 'status') {
        aVal = getStatusOrder(a.status || '');
        bVal = getStatusOrder(b.status || '');
      } else if (sortBy === 'verificationStatus' || sortBy === 'verification') {
        aVal = getVerificationOrder(a.verificationStatus || '');
        bVal = getVerificationOrder(b.verificationStatus || '');
      } else {
        aVal = getComparable(a[sortBy as keyof typeof a]);
        bVal = getComparable(b[sortBy as keyof typeof b]);
      }

      if (aVal === bVal) return 0;
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [beneficiaries, searchQuery, statusFilter, categoryFilter, verificationFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const disbursedAmount = disbursements.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    
    // Calculate disbursed this month and last month
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const thisMonthDisbursed = disbursements
      .filter(d => d.status === 'completed' && d.initiatedDate)
      .filter(d => {
        const date = new Date(d.initiatedDate);
        return date >= thisMonth && date < nextMonth;
      })
      .reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    
    const lastMonthDisbursed = disbursements
      .filter(d => d.status === 'completed' && d.initiatedDate)
      .filter(d => {
        const date = new Date(d.initiatedDate);
        return date >= lastMonth && date < thisMonth;
      })
      .reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
    
    const percentageChange = lastMonthDisbursed > 0 ? ((thisMonthDisbursed - lastMonthDisbursed) / lastMonthDisbursed) * 100 : 0;
    
    return {
      total: beneficiaries.length,
      verified: beneficiaries.filter(b => b.verificationStatus === 'verified').length,
      pendingVerification: beneficiaries.filter(b => b.verificationStatus === 'pending').length,
      rejected: beneficiaries.filter(b => b.status === 'rejected').length,
      documentsRequired: beneficiaries.filter(b => b.status === 'documents-required').length,
      disbursedAmount,
      percentageChange
    };
  }, [beneficiaries, disbursements]);

  // Category distribution
  const categoryStats = useMemo(() => {
    return {
      SC: beneficiaries.filter(b => b.category === 'SC').length,
      ST: beneficiaries.filter(b => b.category === 'ST').length,
      OBC: beneficiaries.filter(b => b.category === 'OBC').length
    };
  }, [beneficiaries]);

  // Subscribe to beneficiaries collection in Firestore
  useEffect(() => {
    const beneficiariesRef = collection(db, 'beneficiaries');
    // Remove orderBy to include beneficiaries without registrationDate
    const q = query(beneficiariesRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const toIso = (val: any) => {
          if (!val) return '';
          if (val.toDate && typeof val.toDate === 'function') {
            try { return val.toDate().toISOString(); } catch { return String(val); }
          }
          return typeof val === 'string' ? val : String(val);
        };

        items.push({
          id: doc.id,
          name: data.name || '',
          aadhaarNumber: data.aadhaarNumber || data.aadhaar || '',
          district: data.district || '',
          state: data.state || '',
          actType: data.actType || '',
          reliefAmount: data.reliefAmount || 0,
          disbursedAmount: data.disbursedAmount || 0,
          status: data.status || 'pending-verification',
          verificationStatus: data.verificationStatus || 'pending',
          category: data.category || 'SC',
          registrationDate: toIso(data.registrationDate || data.createdAt),
          priority: data.priority || 'medium',
          assignedOfficer: data.assignedOfficer || '',
          age: data.age || null,
          gender: data.gender || null,
          maritalStatus: data.maritalStatus || null,
          bankAccount: data.bankAccount || null,
          ifsc: data.ifsc || null
        });
      });
      
      // Sort in memory to handle missing registrationDate
      items.sort((a, b) => {
        const aDateStr = a.registrationDate || '1970-01-01T00:00:00.000Z';
        const bDateStr = b.registrationDate || '1970-01-01T00:00:00.000Z';
        const aDate = new Date(aDateStr);
        const bDate = new Date(bDateStr);
        return bDate.getTime() - aDate.getTime();
      });
      
      setBeneficiaries(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching beneficiaries:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to disbursements collection in Firestore
  useEffect(() => {
    const disbursementsRef = collection(db, 'disbursements');
    const q = query(disbursementsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data
        });
      });
      setDisbursements(items);
    }, (error) => {
      console.error('Error fetching disbursements:', error);
    });

    return () => unsubscribe();
  }, []);

  // Detect small screens and adjust UI defaults for better mobile UX
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches;
      setIsMobile(matches);
    };

    handler(mq);
    if ('addEventListener' in mq) mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    else (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void }).addListener?.(handler as (e: MediaQueryListEvent) => void);

    return () => {
      if ('removeEventListener' in mq) mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      else (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handler as (e: MediaQueryListEvent) => void);
    };
  }, []);

  // Prefer cards view on mobile for readability
  useEffect(() => {
    if (isMobile) setViewMode('cards');
  }, [isMobile]);

  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'verified': return 'text-green-300 bg-green-900/30';
        case 'disbursed': return 'text-emerald-300 bg-emerald-900/30';
        case 'pending-verification': return 'text-amber-300 bg-amber-900/30';
        case 'rejected': return 'text-red-300 bg-red-900/30';
        case 'documents-required': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'verified': return 'text-green-700 bg-green-100';
      case 'disbursed': return 'text-emerald-700 bg-emerald-100';
      case 'pending-verification': return 'text-amber-700 bg-amber-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'documents-required': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getVerificationColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'verified': return 'text-green-300 bg-green-900/30';
        case 'pending': return 'text-amber-300 bg-amber-900/30';
        case 'rejected': return 'text-red-300 bg-red-900/30';
        case 'documents-required': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (status) {
      case 'verified': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'documents-required': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (theme === 'dark') {
      switch (priority) {
        case 'high': return 'text-red-300 bg-red-900/30';
        case 'medium': return 'text-amber-300 bg-amber-900/30';
        case 'low': return 'text-green-300 bg-green-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-amber-700 bg-amber-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    if (theme === 'dark') {
      switch (category) {
        case 'SC': return 'text-blue-300 bg-blue-900/30';
        case 'ST': return 'text-green-300 bg-green-900/30';
        case 'OBC': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }

    switch (category) {
      case 'SC': return 'text-blue-700 bg-blue-100';
      case 'ST': return 'text-green-700 bg-green-100';
      case 'OBC': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
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

  const formatActType = (val?: string) => {
    if (!val) return '—';
    const v = String(val).toLowerCase();
    if (v.includes('pcr')) return t('extracted.pcr_act') || 'PCR Act';
    if (v.includes('poa') || v.includes('poa')) return t('extracted.poa_act') || 'PoA Act';
    return val;
  };

  // Deterministic formatting helpers to avoid SSR/client hydration mismatches
  

  const formatCurrency = (n?: number | null) => {
    if (n == null || Number.isNaN(n)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n as number);
  };

  const formatDate = (s?: string | null) => {
    if (!s) return '—';
    try {
      // Handle Firestore Timestamp
      if (typeof (s as any)?.toDate === 'function') {
        const d = (s as any).toDate();
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
      }
      const d = new Date(s as any);
      if (Number.isNaN(d.getTime())) return String(s);
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    } catch { return String(s); }
  };

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || verificationFilter !== 'all' || sortBy !== 'registrationDate' || sortOrder !== 'desc';
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBeneficiary?.id) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedBeneficiary?.id]);

  // Pagination helpers
  const totalItems = filteredBeneficiaries.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);
  const noPages = totalPages === 0;

  if (authLoading) return (
    <div className="space-y-4 max-w-[1400px]">
      <div className="theme-bg-card theme-border-glass border rounded-xl p-5">Loading...</div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary">
            {t("beneficiary.beneficiary")}{' '}
            <span className="text-accent-gradient">{t("beneficiary.management")}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5">
            {t('beneficiary.comprehensive_oversight_of_dbt_beneficiaries')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowExportModal(true)}
            className="h-9 px-3.5 rounded-md border theme-border-glass theme-text-secondary hover:theme-bg-hover hover:theme-text-primary transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('extracted.export_data')}</span>
          </button>
          <button
            onClick={() => setShowNewBeneficiaryForm(true)}
            className="h-9 px-3.5 rounded-md accent-gradient text-white inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('extracted.add_beneficiary')}</span>
          </button>
        </div>
      </motion.div>

      {/* New Beneficiary Form (moved below stats) - will render under statistics/cards when opened */}

      {/* Toast container (top-right) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(tst => {
          const toastClass = tst.type === 'success'
            ? (theme === 'light' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-green-900/30 border-green-800 text-green-200')
            : tst.type === 'error'
              ? (theme === 'light' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-900/30 border-red-800 text-red-200')
              : (theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-gray-900/30 border-gray-800 text-gray-200');

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

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={beneficiaries}
        filteredItems={filteredBeneficiaries}
        onExportCsv={exportBeneficiariesData}
        onExportPdf={exportBeneficiariesPDF}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        sendingEmail={sendingEmail}
        onSendEmail={sendBeneficiariesEmail}
        title={t("beneficiary.exportTitle") || "Export Beneficiaries"}
        subtitle={t("beneficiary.exportSubtitle") || "Choose export format for beneficiaries data"}
        allTitle={t("beneficiary.exportAllTitle") || "All Beneficiaries"}
        filteredTitle={t("beneficiary.exportFilteredTitle") || "Filtered Results"}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal && !!deleteTargetId}
        message={t('confirm_delete_beneficiary') || 'Are you sure you want to delete this beneficiary? This action cannot be undone.'}
        title={t('confirm_delete_beneficiary_title') || t('confirm_delete_beneficiary')}
        confirmLabel={t('extracted.delete')}
        onCancel={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
        onConfirm={() => performDelete(deleteTargetId)}
      />

      {/* Statistics band */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-px theme-bg-glass theme-border-glass border rounded-xl overflow-hidden"
      >
        {[
          { labelKey: 'extracted.total', value: stats.total },
          { labelKey: 'extracted.verified', value: stats.verified },
          { labelKey: 'extracted.pending', value: stats.pendingVerification },
          { labelKey: 'extracted.rejected', value: stats.rejected },
          { labelKey: 'extracted.documents_required', value: stats.documentsRequired },
          { labelKey: 'SC', value: categoryStats.SC },
          { labelKey: 'ST', value: categoryStats.ST }
        ].map((stat, idx) => (
          <div key={idx} className="theme-bg-card p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted truncate">{stat.labelKey === 'SC' || stat.labelKey === 'ST' ? stat.labelKey : t(stat.labelKey)}</p>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Financial band */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-px theme-bg-glass theme-border-glass border rounded-xl overflow-hidden"
      >
        <div className="theme-bg-card p-3.5 md:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.total_disbursed_amount')}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-semibold tabular-nums theme-text-primary">{formatCurrency(stats.disbursedAmount)}</span>
            <span className={`text-[11px] font-medium ${stats.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange.toFixed(1)}% this month
            </span>
          </div>
        </div>
        <div className="theme-bg-card p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">% Change This Month</p>
          <p className={`text-xl font-semibold tabular-nums mt-1 ${stats.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange.toFixed(1)}%
          </p>
        </div>
      </motion.div>



      {/* Filters and Search Toolbar */}
      <div className="theme-bg-card theme-border-glass border rounded-xl">
        {/* Header row: search + view mode + filter toggle */}
        <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center rounded-md border theme-border-glass p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${viewMode === 'table' ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-text-primary'}`}
              >
                {t('extracted.table')}
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${viewMode === 'cards' ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-text-primary'}`}
              >
                {t('extracted.cards')}
              </button>
            </div>
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

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                <div>
                  <Label>{t("beneficiary.sortBy") || "Sort By"}</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={inputCls}
                  >
                    <option value="registrationDate">{t("beneficiary.sortOptions.registrationDate") || "Registration Date"}</option>
                    <option value="status">{t("beneficiary.sortOptions.status") || "Status"}</option>
                    <option value="verification">{t("beneficiary.sortOptions.verification") || "Verification"}</option>
                  </select>
                </div>
              </div>

              <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label>{t("beneficiary.sortOrder") || "Sort Order"}</Label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className={inputCls}
                  >
                    <option value="desc">
                      {sortBy === 'status' ? (t("beneficiary.sortOrderOptions.verifiedToPending") || 'Verified to Pending') :
                        sortBy === 'verification' ? (t("beneficiary.sortOrderOptions.verifiedToPending") || 'Verified to Pending') : (t("beneficiary.sortOrderOptions.newestFirst") || 'Newest First')}
                    </option>
                    <option value="asc">
                      {sortBy === 'status' ? (t("beneficiary.sortOrderOptions.pendingToVerified") || 'Pending to Verified') :
                        sortBy === 'verification' ? (t("beneficiary.sortOrderOptions.pendingToVerified") || 'Pending to Verified') : (t("beneficiary.sortOrderOptions.oldestFirst") || 'Oldest First')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
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
                  {(sortBy !== 'registrationDate' || sortOrder !== 'desc') && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                      Sort: {sortBy === 'status' ? 'Status' : sortBy === 'verificationStatus' || sortBy === 'verification' ? 'Verification' : 'Registration Date'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                      <button
                        onClick={() => {
                          setSortBy('registrationDate');
                          setSortOrder('desc');
                        }}
                        className="rounded-full p-0.5 hover:theme-text-primary transition-colors"
                        aria-label="Reset sorting"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setVerificationFilter('all');
                      setSortBy('registrationDate');
                      setSortOrder('desc');
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

      {/* New/Edit Beneficiary Drawer */}
      <AnimatePresence>
        {showNewBeneficiaryForm && (
          <NewBeneficiaryForm
            onCancel={() => { setShowNewBeneficiaryForm(false); setSelectedBeneficiary(null); }}
            initialData={selectedBeneficiary}
            showToast={showToast}
            onSaved={(saved) => {
              if (saved) {
                setBeneficiaries(prev => {
                  const exists = prev.some(b => b.id === saved.id);
                  if (exists) return prev.map(b => b.id === saved.id ? { ...b, ...saved } : b);
                  return [saved, ...prev];
                });
                setFullBeneficiaries(prev => ({ ...prev, [saved.id]: saved }));
                // Ensure user sees the new/updated record immediately
                setCurrentPage(1);
                setViewMode('table');
                // Reset filters to show the new beneficiary
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setVerificationFilter('all');
              }
              setSelectedBeneficiary(null);
              showToast('success', 'Beneficiary saved');
              setShowNewBeneficiaryForm(false);
            }}
          />
        )}
      </AnimatePresence>
      {/* Beneficiaries List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
        key={refreshKey}
      >
        {viewMode === 'table' ? (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
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
                  {paginatedBeneficiaries.map((beneficiary) => {
                    const StatusIcon = getStatusIcon(beneficiary.status);
                    const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);

                    return (
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
                        <td className="hidden xl:table-cell px-3 py-2.5 text-[13px] theme-text-primary"><span className="block max-w-[160px] truncate">{beneficiary.email || '—'}</span></td>
                        <td className="hidden lg:table-cell px-3 py-2.5">
                          <p className="text-[13px] theme-text-primary">{beneficiary.district}</p>
                          <p className="text-[11px] theme-text-muted">{beneficiary.state}</p>
                        </td>
                        <td className="hidden xl:table-cell px-3 py-2.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border theme-border-glass theme-bg-glass theme-text-secondary whitespace-nowrap">
                            {formatActType(beneficiary.actType)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {beneficiary.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                            <VerificationIcon className="w-3 h-3" />
                            {beneficiary.verificationStatus.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
                              className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                              title={t('extracted.view')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {beneficiary.scStCertificate && (
                              <button
                                onClick={() => window.open(beneficiary.scStCertificate, '_blank')}
                                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-green-500 transition-colors"
                                title="View Certificate"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                              className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                              title={t('extracted.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(beneficiary.id)}
                              disabled={deletingId === beneficiary.id || !profile || profile.role !== 'officer'}
                              title={!profile || profile.role !== 'officer' ? t('extracted.no_permission_delete') || 'Insufficient permissions' : t('extracted.delete')}
                              className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-red-500 transition-colors disabled:opacity-50"
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
                    className="p-4 border-b theme-border-glass last:border-b-0 cursor-pointer hover:theme-bg-hover transition-colors"
                    onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
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
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {beneficiary.status.replace('-', ' ')}
                      </span>
                    </div>

                    <dl className="mt-2.5 space-y-1.5">
                      <Pair label={t('extracted.aadhaar')} value={beneficiary.aadhaarNumber} mono />
                      <Pair label={t('extracted.location')} value={`${beneficiary.district}, ${beneficiary.state}`} />
                      <Pair label={t('extracted.act_type')} value={formatActType(beneficiary.actType)} />
                    </dl>

                    <div className="mt-2.5 pt-2.5 border-t theme-border-glass flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                          <VerificationIcon className="w-3 h-3" />
                          {beneficiary.verificationStatus.replace('-', ' ')}
                        </span>
                        {beneficiary.scStCertificate && (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getCategoryColor(beneficiary.category)}`}>
                            <FileText className="w-3 h-3" />
                            Cert
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {beneficiary.scStCertificate && (
                          <button
                            aria-label="View certificate"
                            onClick={(e) => { e.stopPropagation(); window.open(beneficiary.scStCertificate, '_blank'); }}
                            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-green-500 transition-colors"
                            title="View Certificate"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          aria-label="Edit beneficiary"
                          onClick={(e) => { e.stopPropagation(); setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                          title={t('extracted.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          aria-label="Delete beneficiary"
                          onClick={(e) => { e.stopPropagation(); confirmDelete(beneficiary.id); }}
                          disabled={deletingId === beneficiary.id || !profile || profile.role !== 'officer'}
                          title={!profile || profile.role !== 'officer' ? t('extracted.no_permission_delete') || 'Insufficient permissions' : t('extracted.delete')}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-red-500 transition-colors disabled:opacity-50"
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
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {paginatedBeneficiaries.map((beneficiary) => {
              const StatusIcon = getStatusIcon(beneficiary.status);
              const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);

              return (
                <div
                  key={beneficiary.id}
                  className="theme-bg-card theme-border-glass border rounded-lg p-3.5 cursor-pointer hover:theme-bg-hover transition-colors"
                  onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
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
                      <span className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getPriorityColor(beneficiary.priority)}`}>
                        {beneficiary.priority}
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 space-y-1.5">
                    <Pair label={t('extracted.aadhaar')} value={beneficiary.aadhaarNumber} mono />
                    <Pair label={t('extracted.location')} value={`${beneficiary.district}, ${beneficiary.state}`} />
                    <Pair label={t('extracted.act_type')} value={formatActType(beneficiary.actType)} />
                    <Pair label={t('extracted.assigned_officer')} value={beneficiary.assignedOfficer || '—'} />
                  </dl>

                  <div className="mt-3 pt-2.5 border-t theme-border-glass flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {beneficiary.status.replace('-', ' ')}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getVerificationColor(beneficiary.verificationStatus)}`}>
                        <VerificationIcon className="w-3 h-3" />
                        {beneficiary.verificationStatus.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {beneficiary.scStCertificate && (
                        <button
                          aria-label="View certificate"
                          onClick={(e) => { e.stopPropagation(); window.open(beneficiary.scStCertificate, '_blank'); }}
                          className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-green-500 transition-colors"
                          title="View Certificate"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        aria-label="Edit beneficiary"
                        onClick={(e) => { e.stopPropagation(); setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                        className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                        title={t('extracted.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Delete beneficiary"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(beneficiary.id); }}
                        disabled={deletingId === beneficiary.id || !profile || profile.role !== 'officer'}
                        title={!profile || profile.role !== 'officer' ? t('extracted.no_permission_delete') || 'Insufficient permissions' : t('extracted.delete')}
                        className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:text-red-500 transition-colors disabled:opacity-50"
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
              );
            })}
          </div>
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
              <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getStatusColor(selectedBeneficiary.status)}`}>
                {selectedBeneficiary.status.replace('-', ' ')}
              </span>
              <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap ${getVerificationColor(selectedBeneficiary.verificationStatus)}`}>
                {selectedBeneficiary.verificationStatus.replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(selectedBeneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                title={t('extracted.edit')}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSelectedBeneficiary(null); setDetailStatus(''); setDetailVerification(''); }}
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-hover hover:theme-text-primary transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-4 py-3.5">
            <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <Pair label={t('extracted.full_name')} value={selectedBeneficiary.name} />
              <Pair label={t('extracted.father_name') || 'Father'} value={selectedBeneficiary.fatherName || '—'} />
              <Pair label={t('extracted.aadhaar_number')} value={selectedBeneficiary.aadhaarNumber} mono />
              <Pair label={t('extracted.phone_number')} value={selectedBeneficiary.phone} />
              <Pair label={t('extracted.email')} value={selectedBeneficiary.email || '—'} />
              <Pair label={t('extracted.location')} value={`${selectedBeneficiary.district}, ${selectedBeneficiary.state}`} />
              <Pair label={t('extracted.act_type')} value={formatActType(selectedBeneficiary.actType)} />
              <Pair label={t('extracted.category')} value={selectedBeneficiary.category} />
              <Pair label={t('extracted.registration_date') || 'Registered'} value={formatDate(selectedBeneficiary.registrationDate)} />
              <Pair label={t('extracted.age') || 'Age'} value={selectedBeneficiary.age ?? '—'} />
              <Pair label={t('extracted.gender') || 'Gender'} value={selectedBeneficiary.gender || '—'} />
              <Pair label={t('extracted.marital_status') || 'Marital Status'} value={selectedBeneficiary.maritalStatus || '—'} />
              <Pair label={t('extracted.bank_name') || 'Bank'} value={selectedBeneficiary.bankName || '—'} />
              <Pair label={t('extracted.ifsc_code') || 'IFSC'} value={selectedBeneficiary.ifsc || '—'} mono />
              <Pair label={t('extracted.assigned_officer')} value={selectedBeneficiary.assignedOfficer || '—'} />
              <Pair label={t('extracted.disbursed')} value={formatCurrency(selectedBeneficiary.disbursedAmount)} />
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
                  {t('extracted.view_file') || 'View file'}
                </a>
              ) : (
                <span className="text-[13px] theme-text-muted">Not provided</span>
              )}
            </div>

            <div className="mt-3.5 pt-3 border-t theme-border-glass flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <select value={detailStatus} onChange={(e) => setDetailStatus(e.target.value)} className={`${inlineInputCls} flex-1`} aria-label={t('extracted.application_status')}>
                  <option value="pending-verification">{t('extracted.pending_verification') || 'Pending Verification'}</option>
                  <option value="verified">{t('extracted.verified') || 'Verified'}</option>
                  <option value="rejected">{t('extracted.rejected') || 'Rejected'}</option>
                  <option value="documents-required">{t('extracted.documents_required') || 'Documents Required'}</option>
                </select>
                <button onClick={() => updateBeneficiaryStatus(selectedBeneficiary.id, detailStatus)} className="h-9 px-3 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex-shrink-0">
                  {t('extracted.save')}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <select value={detailVerification} onChange={(e) => setDetailVerification(e.target.value)} className={`${inlineInputCls} flex-1`} aria-label={t('extracted.verification_status')}>
                  <option value="pending">{t('extracted.pending') || 'Pending'}</option>
                  <option value="verified">{t('extracted.verified') || 'Verified'}</option>
                  <option value="rejected">{t('extracted.rejected') || 'Rejected'}</option>
                  <option value="documents-required">{t('extracted.documents_required') || 'Documents Required'}</option>
                </select>
                <button onClick={() => updateBeneficiaryVerification(selectedBeneficiary.id, detailVerification)} className="h-9 px-3 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-500 transition-colors flex-shrink-0">
                  {t('extracted.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiariesPage;
