"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { db } from '@/lib/firebase';
import { generateBeneficiaryId } from '@/lib/id';
import { collection, setDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { X, Upload, File, Loader2 } from 'lucide-react';

/**
 * Slide-in drawer form used by officers to create or edit a beneficiary record.
 */
const OfficerBeneficiaryForm = ({ onCancel, initialData, onSaved, showToast }: {
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
        className="absolute inset-y-0 right-0 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
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
                  className={`flex-1 min-w-0 px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${validationErrors.scStCertificate ? 'border-red-500' : ''}`}
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

export default OfficerBeneficiaryForm;
