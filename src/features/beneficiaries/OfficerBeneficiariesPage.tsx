"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import type * as THREE from 'three';
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
  ChevronLeft, ChevronRight, X, Check,
  Trash,
  Clock, AlertCircle, FileText, User, Phone, MapPin,
  Calendar, DollarSign, MessageSquare, MoreVertical,
  Shield, Award, Heart, Scale, BadgeCheck,
  Banknote, Fingerprint, Sparkles, Zap, TrendingUp,
  Target, Globe, Layers, Star,
  CheckCircle, Tag, Upload, File, ArrowUpDown
} from 'lucide-react';

// All data is Firestore-backed now. Removed local mock data to rely solely on Firestore.

// New Beneficiary Form Component (client-side)
const NewBeneficiaryForm = ({ onCancel, initialData, onSaved, showToast }: { 
  onCancel: () => void, 
  initialData?: any | null, 
  onSaved?: ((saved?: any) => void) | undefined,
  showToast: (type: 'success' | 'error' | 'info', message: string, ttl?: number) => void
}) => {
  const { theme } = useTheme();
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

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.add_beneficiary')}</h3>
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
      </div>

      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.verification_details')}</h3>
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
      </div>

      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.personal_details')}</h3>
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
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t theme-border-glass">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary hover:bg-red-500/10 transition-colors"
          disabled={isSubmitting || isUploading}
        >
          {t('extracted.cancel')}
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-sm transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : initialData ? (
            <>
              <Edit className="w-4 h-4" />
              {t('extracted.save')}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t('extracted.create')}
            </>
          )}
        </motion.button>
      </div>
    </form>
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

  // Pagination helpers
  const totalItems = filteredBeneficiaries.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);
  const noPages = totalPages === 0;

  if (authLoading) return (
    <div data-theme={theme} className="p-4 lg:p-5 space-y-5">
      <div className="theme-bg-card theme-border-glass border rounded-xl p-5">Loading...</div>
    </div>
  );

  return (
    <div data-theme={theme} className="relative z-10 theme-text-primary flex ">
      <div className="p-4 lg:p-5 space-y-5 flex-1">
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.7);
          --card-border: rgba(255, 255, 255, 0.08);
          --nav-bg: rgba(15, 23, 42, 0.95);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --accent-primary: #06b6d4;
          --accent-secondary: #8b5cf6;
          --glass-bg: rgba(15, 23, 42, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        [data-theme="light"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          --card-bg: rgba(255, 255, 255, 0.8);
          --card-border: rgba(0, 0, 0, 0.06);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        .theme-bg-nav { background: var(--nav-bg) !important; }
        
        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }
        
        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        /* Icon improvements: ensure lucide SVGs inherit text color and use stroke=currentColor */
        svg {
          vertical-align: middle;
          stroke: currentColor;
          fill: none;
        }

        /* Small icon helper sizes (use with class 'icon-sm' etc if needed) */
        .icon-sm { width: 0.875rem; height: 0.875rem; }
        .icon-md { width: 1rem; height: 1rem; }
        .icon-lg { width: 1.25rem; height: 1.25rem; }
      `}</style>
      
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="theme-bg-card theme-border-glass border rounded-xl p-5 backdrop-blur-sm shadow-sm"
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                       <h1 className="text-lg font-semibold tracking-tight theme-text-primary mb-2 inline-block leading-tight pt-4">
                        {t("beneficiary.beneficiary")}{" "}
                        <span className="text-accent-gradient inline-block leading-normal">
                          {t("beneficiary.management")}
                        </span>
                      </h1>

                        <p className="theme-text-secondary text-base">
                            {t('beneficiary.comprehensive_oversight_of_dbt_beneficiaries')}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowExportModal(true)}
                          className="px-4 py-2.5 theme-bg-glass theme-border-glass border rounded-lg flex items-center gap-2 theme-text-primary shadow-sm hover:shadow-sm transition-shadow"
                        >
                          <Download className="w-4 h-4" />
                          <span>{t('extracted.export_data')}</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowNewBeneficiaryForm(true)}
                            className="px-4 py-2.5 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-sm transition-shadow font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('extracted.add_beneficiary')}</span>
                        </motion.button>
                    </div>
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
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowExportModal(false)} />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-md mx-4 p-5 rounded-xl theme-border-glass border shadow-sm"
              style={{ background: theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(6,8,20,0.98)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold theme-text-primary flex items-center gap-3">
                    <Download className="w-5 h-5 text-accent-gradient" />
                    {t("beneficiary.exportTitle") || "Export Beneficiaries"}
                  </h3>
                  <p className="text-sm theme-text-muted mt-1">
                    {t("beneficiary.exportSubtitle") || "Choose export format for beneficiaries data"}
                  </p>
                </div>
                <button onClick={() => setShowExportModal(false)} aria-label="Close export modal" className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors">
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Export All Section */}
                <div className="p-4 rounded-lg border theme-border-glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium theme-text-primary">{t("beneficiary.exportAllTitle") || "All Beneficiaries"}</h4>
                      <p className="text-sm theme-text-muted">{beneficiaries.length} {t("beneficiary.records", { count: beneficiaries.length })}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { exportBeneficiariesData(beneficiaries); setShowExportModal(false); }} className="flex-1 px-3.5 py-2 rounded-md border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary transition-colors">{t("beneficiary.exportCsv") || "Export CSV"}</button>
                    <button onClick={() => { exportBeneficiariesPDF(beneficiaries); setShowExportModal(false); }} className="flex-1 px-3.5 py-2 rounded-md text-sm accent-gradient text-white shadow hover:shadow-sm transition-shadow">{t("beneficiary.exportPdf") || "Export PDF"}</button>
                  </div>
                </div>

                {/* Export Filtered Section */}
                <div className="p-4 rounded-lg border theme-border-glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium theme-text-primary">{t("beneficiary.exportFilteredTitle") || "Filtered Results"}</h4>
                      <p className="text-sm theme-text-muted">{filteredBeneficiaries.length} {t("beneficiary.records", { count: filteredBeneficiaries.length })}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button disabled={filteredBeneficiaries.length === 0} onClick={() => { exportBeneficiariesData(filteredBeneficiaries); setShowExportModal(false); }} className="flex-1 px-3.5 py-2 rounded-md border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{t("beneficiary.exportCsv") || "Export CSV"}</button>
                    <button disabled={filteredBeneficiaries.length === 0} onClick={() => { exportBeneficiariesPDF(filteredBeneficiaries); setShowExportModal(false); }} className="flex-1 px-3.5 py-2 rounded-md text-sm accent-gradient text-white shadow hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-shadow">{t("beneficiary.exportPdf") || "Export PDF"}</button>
                  </div>
                </div>

                {/* Email Export Section */}
                <div className="p-4 rounded-lg border theme-border-glass">
                  <div className="mb-3">
                    <h4 className="font-medium theme-text-primary mb-2">{t("beneficiary.emailExport")}</h4>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder={t("beneficiary.enterEmailAddress")}
                      className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <button
                        disabled={!emailAddress.trim() || sendingEmail}
                        onClick={() => sendBeneficiariesEmail(beneficiaries, 'csv')}
                        className="flex-1 px-3.5 py-2 rounded-md border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                        {t("beneficiary.sendCsv")}
                      </button>
                      <button
                        disabled={!emailAddress.trim() || sendingEmail}
                        onClick={() => sendBeneficiariesEmail(beneficiaries, 'pdf')}
                        className="flex-1 px-3.5 py-2 rounded-md text-sm accent-gradient text-white shadow hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        {t("beneficiary.sendPdf")}
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        disabled={!emailAddress.trim() || filteredBeneficiaries.length === 0 || sendingEmail}
                        onClick={() => sendBeneficiariesEmail(filteredBeneficiaries, 'csv')}
                        className="flex-1 px-3.5 py-2 rounded-md border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                        {t("beneficiary.sendFilteredCsv")}
                      </button>
                      <button
                        disabled={!emailAddress.trim() || filteredBeneficiaries.length === 0 || sendingEmail}
                        onClick={() => sendBeneficiariesEmail(filteredBeneficiaries, 'pdf')}
                        className="flex-1 px-3.5 py-2 rounded-md text-sm accent-gradient text-white shadow hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                      >
                        {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        {t("beneficiary.sendFilteredPdf")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (UI based, theme-aware, i18n) */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => { if (!deletingId) { setShowDeleteModal(false); setDeleteTargetId(null); } }} />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-lg mx-4 p-5 rounded-xl theme-border-glass border shadow-sm"
              style={{ background: theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(6,8,20,0.98)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold theme-text-primary">{t('confirm_delete_beneficiary_title') || t('confirm_delete_beneficiary')}</h3>
                  <p className="text-sm theme-text-muted mt-1">{t('confirm_delete_beneficiary') || 'Are you sure you want to delete this beneficiary? This action cannot be undone.'}</p>
                </div>
                <button onClick={() => { if (!deletingId) { setShowDeleteModal(false); setDeleteTargetId(null); } }} aria-label="Close" className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors">
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }} className="px-3.5 py-2 rounded-md theme-bg-glass theme-border-glass border theme-text-primary">{t('extracted.cancel')}</button>
                <button disabled={!deleteTargetId || deletingId === deleteTargetId} onClick={() => performDelete(deleteTargetId)} className="px-3.5 py-2 rounded-md bg-red-600 text-white flex items-center gap-2">
                  {deletingId === deleteTargetId ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash className="w-4 h-4" />}
                  <span>{t('extracted.delete')}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4"
      >
        {[
          { labelKey: 'extracted.total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: User },
          { labelKey: 'extracted.verified', value: stats.verified, color: 'from-green-500 to-emerald-500', icon: BadgeCheck },
          { labelKey: 'extracted.pending', value: stats.pendingVerification, color: 'from-amber-500 to-orange-500', icon: Clock },
          { labelKey: 'extracted.rejected', value: stats.rejected, color: 'from-red-500 to-rose-500', icon: X },
          { labelKey: 'extracted.documents_required', value: stats.documentsRequired, color: 'from-purple-500 to-pink-500', icon: AlertCircle },
          { labelKey: 'SC', value: categoryStats.SC, color: 'from-indigo-500 to-blue-500', icon: Shield },
          { labelKey: 'ST', value: categoryStats.ST, color: 'from-green-500 to-lime-500', icon: Award }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold theme-text-primary">{stat.value}</span>
            </div>
            <p className="text-sm font-medium theme-text-muted">{stat.labelKey === 'SC' || stat.labelKey === 'ST' ? stat.labelKey : t(stat.labelKey)}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Financial Overview Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            labelKey: 'extracted.total_disbursed_amount',
            value: formatCurrency(stats.disbursedAmount),
            color: 'from-green-500 to-emerald-500',
            icon: DollarSign,
            subtitle: `Disbursed ${stats.percentageChange > 0 ? '+' : ''}${stats.percentageChange.toFixed(1)}% this month`
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold theme-text-primary">{card.value}</span>
            </div>
            <p className="text-sm font-medium theme-text-muted mb-1">{t(card.labelKey)}</p>
            <p className="text-xs theme-text-secondary">{card.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>



      {/* Enhanced Filters and Search Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative theme-bg-card theme-border-glass border-2 rounded-3xl p-5 backdrop-blur-xl overflow-hidden group"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Floating search icons */}
          <motion.div
            className="absolute top-4 right-8 w-8 h-8 opacity-10"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Search className="w-full h-full text-blue-500" />
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-12 w-6 h-6 opacity-10"
            animate={{
              y: [0, 8, 0],
              x: [0, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Filter className="w-full h-full text-purple-500" />
          </motion.div>

          {/* Gradient waves */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent, rgba(147, 197, 253, 0.1), transparent)',
              backgroundSize: '400% 400%'
            }}
          />
        </div>

        <div className="relative z-10 space-y-5">
          {/* Enhanced Search Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <Search className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold theme-text-primary">{t('beneficiary.advanced_search')}</h3>
                <p className="text-sm theme-text-muted">{t('beneficiary.find_beneficiaries_by_name_id_or_location')}</p>
              </div>
            </div>

            <div className="relative">
              <motion.input
                type="text"
                placeholder={t('extracted.search_by_name_aadhaar_id_or_district')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl theme-bg-glass theme-border-glass border-2 theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-lg font-medium shadow-sm"
                style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-6 h-6 theme-text-muted" />
              </motion.div>

              {/* Search suggestions indicator */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
                >
                  <span className="text-sm theme-text-muted font-medium">
                    {filteredBeneficiaries.length} results
                  </span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold theme-text-muted uppercase tracking-wide">{t('extracted.view_mode')}</span>
              <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded ${viewMode === 'table' ? 'accent-gradient text-white' : 'theme-text-muted hover:theme-text-primary'} transition-colors`}
                >
                  {t('extracted.table')}
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded ${viewMode === 'cards' ? 'accent-gradient text-white' : 'theme-text-muted hover:theme-text-primary'} transition-colors`}
                >
                  {t('extracted.cards')}
                </button>
              </div>
            </div>

                            {/* Filter Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-3 py-2 rounded-md theme-border-glass border flex items-center gap-2 ${showFilters ? 'accent-gradient text-white' : 'theme-bg-glass theme-text-primary'} transition-colors`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>{t('extracted.filters')}</span>
                                {(statusFilter !== 'all' || categoryFilter !== 'all' || verificationFilter !== 'all' || sortBy !== 'registrationDate' || sortOrder !== 'desc') && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </motion.button>
          </div>

          {/* Enhanced Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative pt-6 border-t-2 theme-border-glass">
                  {/* Filter background decoration */}
                  <div className="absolute inset-0 opacity-5">
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                      style={{
                        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1), rgba(196, 181, 253, 0.1), rgba(251, 207, 232, 0.1))',
                        backgroundSize: '400% 400%',
                        borderRadius: '16px'
                      }}
                      className="absolute inset-0 rounded-xl"
                    />
                  </div>

                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Status Filter */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <label className="text-sm font-bold theme-text-primary uppercase tracking-wide">{t('extracted.status')}</label>
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-md theme-bg-glass theme-border-glass border-2 theme-text-primary focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-sm font-medium shadow-sm"
                        style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                      >
                        <option value="all">{t('extracted.all_statuses')}</option>
                        <option value="verified">{t('extracted.verified')}</option>
                        <option value="pending-verification">{t('extracted.pending_verification')}</option>
                        <option value="rejected">{t('extracted.rejected')}</option>
                        <option value="documents-required">{t('extracted.documents_required')}</option>
                      </select>
                    </motion.div>

                    {/* Category Filter */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <label className="text-sm font-bold theme-text-primary uppercase tracking-wide">{t('extracted.category_1')}</label>
                      </div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-md theme-bg-glass theme-border-glass border-2 theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm font-medium shadow-sm"
                        style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                      >
                        <option value="all">{t('extracted.all_categories')}</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                      </select>
                    </motion.div>

                    {/* Verification Filter */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <label className="text-sm font-bold theme-text-primary uppercase tracking-wide">{t('extracted.verification')}</label>
                      </div>
                      <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-md theme-bg-glass theme-border-glass border-2 theme-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm font-medium shadow-sm"
                        style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                      >
                        <option value="all">{t('extracted.all_verification')}</option>
                        <option value="verified">{t('extracted.verified')}</option>
                        <option value="pending">{t('extracted.pending')}</option>
                        <option value="rejected">{t('extracted.rejected')}</option>
                        <option value="documents-required">{t('extracted.documents_required')}</option>
                      </select>
                    </motion.div>
                  </div>

                  {/* Sorting Controls */}
                  <div className="mt-6 pt-4 border-t theme-border-glass relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Sort By */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3 relative z-30"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <ArrowUpDown className="w-4 h-4 text-white" />
                          </div>
                          <label className="text-sm font-bold theme-text-primary uppercase tracking-wide">{t("beneficiary.sortBy") || "Sort By"}</label>
                        </div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 rounded-md theme-bg-glass theme-border-glass border-2 theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium shadow-sm relative z-40"
                          style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                        >
                          <option value="registrationDate">{t("beneficiary.sortOptions.registrationDate") || "Registration Date"}</option>
                          <option value="status">{t("beneficiary.sortOptions.status") || "Status"}</option>
                          <option value="verification">{t("beneficiary.sortOptions.verification") || "Verification"}</option>
                        </select>
                      </motion.div>

                      {/* Sort Order */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3 relative z-30"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                            <ArrowUpDown className="w-4 h-4 text-white" />
                          </div>
                          <label className="text-sm font-bold theme-text-primary uppercase tracking-wide">{t("beneficiary.sortOrder") || "Sort Order"}</label>
                        </div>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                          className="w-full px-3 py-2 rounded-md theme-bg-glass theme-border-glass border-2 theme-text-primary focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm font-medium shadow-sm relative z-40"
                          style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
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
                      </motion.div>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(statusFilter !== 'all' || categoryFilter !== 'all' || verificationFilter !== 'all' || sortBy !== 'registrationDate' || sortOrder !== 'desc') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 pt-4 border-t theme-border-glass"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 theme-text-muted" />
                        <span className="text-sm font-semibold theme-text-primary">Active Filters</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statusFilter !== 'all' && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-500/30"
                          >
                            Status: {statusFilter.replace('-', ' ')}
                            <button
                              onClick={() => setStatusFilter('all')}
                              className="hover:bg-green-500/30 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}
                        {categoryFilter !== 'all' && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium border border-purple-500/30"
                          >
                            Category: {categoryFilter}
                            <button
                              onClick={() => setCategoryFilter('all')}
                              className="hover:bg-purple-500/30 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}
                        {verificationFilter !== 'all' && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-500/30"
                          >
                            Verification: {verificationFilter.replace('-', ' ')}
                            <button
                              onClick={() => setVerificationFilter('all')}
                              className="hover:bg-amber-500/30 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}
                        {(sortBy !== 'registrationDate' || sortOrder !== 'desc') && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-500/30"
                          >
                            Sort: {sortBy === 'status' ? 'Status' : sortBy === 'verificationStatus' || sortBy === 'verification' ? 'Verification' : 'Registration Date'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                            <button
                              onClick={() => {
                                setSortBy('registrationDate');
                                setSortOrder('desc');
                              }}
                              className="hover:bg-blue-500/30 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setStatusFilter('all');
                            setCategoryFilter('all');
                            setVerificationFilter('all');
                            setSortBy('registrationDate');
                            setSortOrder('desc');
                          }}
                          className="px-3 py-1.5 bg-gray-500/20 text-gray-700 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-500/30 hover:bg-gray-500/30"
                        >
                          Clear All
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom accent gradient */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-3xl"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>

      {/* Inline New Beneficiary Form (under stats) */}
      {showNewBeneficiaryForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="theme-bg-card theme-border-glass border rounded-xl p-4 mb-4 backdrop-blur-sm shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">{selectedBeneficiary ? t('extracted.edit_beneficiary') : t('extracted.create_new_beneficiary')}</h3>
              <p className="text-sm theme-text-muted">{selectedBeneficiary ? t('extracted.edit_beneficiary_description') : t('extracted.create_new_beneficiary_description')}</p>
            </div>
            <button onClick={() => { setShowNewBeneficiaryForm(false); setSelectedBeneficiary(null); }} className="p-2 rounded-lg theme-bg-card theme-border-glass border hover:bg-red-500/20 theme-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
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
        </motion.div>
      )}

      {/* Inline detail moved below the list (see below) */}

      {/* Beneficiaries List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl overflow-hidden"
        key={refreshKey}
      >
        {viewMode === 'table' ? (
          isMobile ? (
            <div className="p-3 space-y-3">
              {paginatedBeneficiaries.map((beneficiary, idx) => {
                const StatusIcon = getStatusIcon(beneficiary.status);
                const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);
                
                return (
                  <motion.div
                    key={beneficiary.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileTap={{ scale: 0.995 }}
                    className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
                    onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                          {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold theme-text-primary truncate">{beneficiary.name}</p>
                          <p className="text-xs theme-text-muted truncate">{beneficiary.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getCategoryColor(beneficiary.category)}`}>
                        {beneficiary.category}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5" />
                          {t('extracted.aadhaar')}
                        </span>
                        <span className="theme-text-primary font-mono text-[10px]">{beneficiary.aadhaarNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {t('extracted.location')}
                        </span>
                        <span className="theme-text-primary font-medium">{beneficiary.district}, {beneficiary.state}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          {t('extracted.act_type')}
                        </span>
                        <span className="theme-text-primary font-medium">{formatActType(beneficiary.actType)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {t('extracted.sc_st_certificate')}
                        </span>
                        {beneficiary.scStCertificate ? (
                          <a
                            href={beneficiary.scStCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-text-primary font-medium underline hover:text-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View File
                          </a>
                        ) : (
                          <span className="theme-text-primary font-medium">Not provided</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5" />
                          {t('extracted.disbursed')}
                        </span>
                        <span className="theme-text-primary font-medium">{formatCurrency(beneficiary.disbursedAmount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="theme-text-muted flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {t('extracted.assigned_officer')}
                        </span>
                        <span className="theme-text-primary font-medium truncate max-w-[150px]">{beneficiary.assignedOfficer}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b theme-border-glass">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{beneficiary.status.replace('-', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                        <VerificationIcon className="w-3 h-3" />
                        <span className="capitalize">{beneficiary.verificationStatus.replace('-', ' ')}</span>
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
                        className="px-3 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('extracted.view')} </span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/10 active:scale-95 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{t('extracted.edit')} </span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(beneficiary.id); }}
                        disabled={deletingId === beneficiary.id || !profile || profile.role !== 'officer'}
                        title={!profile || profile.role !== 'officer' ? t('extracted.no_permission_delete') || 'Insufficient permissions' : undefined}
                        className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/10 hover:text-red-500 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {deletingId === beneficiary.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash className="w-3.5 h-3.5 text-red-600" />
                        )}
                        <span>{t('extracted.delete') || 'Delete'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="theme-bg-glass border-b theme-border-glass">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.beneficiary_id')} </th>
                    <th className="px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.beneficiary')} </th>
                    <th className="hidden sm:table-cell px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.aadhaar')} </th>
                    <th className="hidden md:table-cell px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.phone')} </th>
                    <th className="hidden md:table-cell px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.email')} </th>
                    <th className="hidden md:table-cell px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.district')} </th>
                    <th className="hidden md:table-cell px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.act_type')} </th>
                    <th className="px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.status')} </th>
                    <th className="hidden sm:table-cell px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.verification')} </th>
                    <th className="px-3 py-2.5 text-left text-sm font-semibold theme-text-primary">{t('extracted.actions')} </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBeneficiaries.map((beneficiary, idx) => (
                    <motion.tr
                      key={beneficiary.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
                    >
                      <td className="px-3 py-2.5 text-sm font-medium theme-text-primary">{beneficiary.id}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                            {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium theme-text-primary">{beneficiary.name}</p>
                            <p className="text-xs theme-text-muted">{beneficiary.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2.5 text-sm theme-text-primary">
                        {beneficiary.aadhaarNumber}
                      </td>
                      <td className="hidden md:table-cell px-3 py-2.5 text-sm theme-text-primary">
                        {beneficiary.phone}
                      </td>
                      <td className="hidden md:table-cell px-3 py-2.5 text-sm theme-text-primary">
                        {beneficiary.email || '—'}
                      </td>
                      <td className="hidden md:table-cell px-3 py-2.5">
                        <div>
                          <p className="text-sm theme-text-primary">{beneficiary.district}</p>
                          <p className="text-xs theme-text-muted">{beneficiary.state}</p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 py-2.5">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(beneficiary.category)}`}>
                          {formatActType(beneficiary.actType)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(beneficiary.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {beneficiary.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                          {(() => {
                            const Icon = getVerificationIcon(beneficiary.verificationStatus);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {beneficiary.verificationStatus.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors theme-text-primary"
                            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {beneficiary.scStCertificate && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => window.open(beneficiary.scStCertificate, '_blank')}
                              className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors theme-text-primary"
                              style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                              title="View Certificate"
                            >
                              <FileText className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors theme-text-primary"
                            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
                            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                          onClick={() => confirmDelete(beneficiary.id)}
                          disabled={deletingId === beneficiary.id || !profile || profile.role !== 'officer'}
                          title={!profile || profile.role !== 'officer' ? t('extracted.no_permission_delete') || 'Insufficient permissions' : undefined}
                          >
                            {deletingId === beneficiary.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4 text-red-600" />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 p-4`}>
            {paginatedBeneficiaries.map((beneficiary, idx) => {
              const StatusIcon = getStatusIcon(beneficiary.status);
              const VerificationIcon = getVerificationIcon(beneficiary.verificationStatus);
              
              return (
                <motion.div
                  key={beneficiary.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={isMobile ? {} : { y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
                  onClick={() => { setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); }); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white font-bold flex-shrink-0">
                        {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium theme-text-primary truncate">{beneficiary.name}</p>
                        <p className="text-xs theme-text-muted truncate">{beneficiary.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(beneficiary.priority)}`}>
                      {beneficiary.priority}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <Fingerprint className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{beneficiary.aadhaarNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{beneficiary.district}, {beneficiary.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <Scale className="w-4 h-4 flex-shrink-0" />
                      <span>{formatActType(beneficiary.actType)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm theme-text-secondary">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className={beneficiary.scStCertificate ? 'text-green-500' : 'theme-text-muted'}>
                        {beneficiary.scStCertificate ? 'Certificate uploaded' : 'No certificate'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{beneficiary.status.replace('-', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                        <VerificationIcon className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="View beneficiary"
                        className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors theme-text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); });
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {beneficiary.scStCertificate && (
                        <button
                          aria-label="View certificate"
                          className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors theme-text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(beneficiary.scStCertificate, '_blank');
                          }}
                          title="View Certificate"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        aria-label="Edit beneficiary"
                        className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors theme-text-primary"
                        onClick={(e) => { e.stopPropagation(); setSelectedBeneficiaryLoading(true); fetchFullBeneficiary(beneficiary.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); }); }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Delete beneficiary"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(beneficiary.id); }}
                        disabled={deletingId === beneficiary.id || !profile || profile.role !== 'officer'}
                        title={!profile || profile.role !== 'officer' ? t('extracted.no_permission_delete') || 'Insufficient permissions' : undefined}
                        className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/10 hover:text-red-500 transition-colors theme-text-primary disabled:opacity-50"
                      >
                        {deletingId === beneficiary.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-2.5 border-t theme-border-glass theme-bg-glass">
          <p className="text-sm theme-text-muted">
            {t('extracted.showing')} {startItem} {t('extracted.to')} {endItem} {t('extracted.of')} {totalItems}
          </p>
          <div className="flex items-center gap-2">
            {isMobile ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1 || noPages}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
                  className="px-3.5 py-2 rounded-md theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  {t('extracted.prev')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages || noPages}
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="px-3.5 py-2 rounded-md theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  {t('extracted.next')}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1 || noPages}
                  onClick={() => setCurrentPage((p: number) => p - 1)}
                  className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1.5 rounded-lg ${currentPage === i + 1 ? 'accent-gradient text-white' : 'theme-bg-card theme-border-glass border theme-text-primary'}`}
                    style={currentPage !== i + 1 && theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages || noPages}
                  onClick={() => setCurrentPage((p: number) => p + 1)}
                  className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Inline Beneficiary View (rendered under the table) */}
      <AnimatePresence>
        {selectedBeneficiary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="theme-bg-card theme-border-glass border rounded-xl w-full overflow-hidden mt-6">
            <div className="p-5 border-b theme-border-glass flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight theme-text-primary">{selectedBeneficiary.name}</h2>
                <p className="theme-text-muted">{selectedBeneficiary.id} • {formatActType(selectedBeneficiary.actType)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedBeneficiary(null); setDetailStatus(''); setDetailVerification(''); }} className="p-2 rounded-lg theme-bg-card theme-border-glass border hover:bg-red-500/20 theme-text-primary"><X className="w-5 h-5" /></button>
                <button onClick={() => { setShowNewBeneficiaryForm(true); }} className="px-3 py-2 rounded-lg theme-bg-card theme-border-glass border theme-text-primary">{t('extracted.edit')}</button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs theme-text-muted">{t('extracted.full_name')}</p>
                  <p className="font-medium theme-text-primary">{selectedBeneficiary.name}</p>
                </div>
                <div>
                  <p className="text-xs theme-text-muted">{t('extracted.aadhaar_number')}</p>
                  <p className="font-medium theme-text-primary">{selectedBeneficiary.aadhaarNumber}</p>
                </div>
                <div>
                  <p className="text-xs theme-text-muted">{t('extracted.phone_number')}</p>
                  <p className="font-medium theme-text-primary">{selectedBeneficiary.phone}</p>
                </div>
                <div>
                  <p className="text-xs theme-text-muted">{t('extracted.email')}</p>
                  <p className="font-medium theme-text-primary">{selectedBeneficiary.email || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                  <p className="text-sm theme-text-muted mb-2">{t('extracted.application_status')}</p>
                  <div className="flex items-center gap-3">
                    <select value={detailStatus} onChange={(e) => setDetailStatus(e.target.value)} className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary flex-1">
                      <option value="pending-verification">{t('extracted.pending_verification') || 'Pending Verification'}</option>
                      <option value="verified">{t('extracted.verified') || 'Verified'}</option>
                      <option value="rejected">{t('extracted.rejected') || 'Rejected'}</option>
                      <option value="documents-required">{t('extracted.documents_required') || 'Documents Required'}</option>
                    </select>
                    <button onClick={() => updateBeneficiaryStatus(selectedBeneficiary.id, detailStatus)} className="px-3 py-2 rounded-lg bg-blue-600 text-white">{t('extracted.save')}</button>
                  </div>
                </div>

                <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                  <p className="text-sm theme-text-muted mb-2">{t('extracted.verification_status')}</p>
                  <div className="flex items-center gap-3">
                    <select value={detailVerification} onChange={(e) => setDetailVerification(e.target.value)} className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary flex-1">
                      <option value="pending">{t('extracted.pending') || 'Pending'}</option>
                      <option value="verified">{t('extracted.verified') || 'Verified'}</option>
                      <option value="rejected">{t('extracted.rejected') || 'Rejected'}</option>
                      <option value="documents-required">{t('extracted.documents_required') || 'Documents Required'}</option>
                    </select>
                    <button onClick={() => updateBeneficiaryVerification(selectedBeneficiary.id, detailVerification)} className="px-3 py-2 rounded-lg bg-green-600 text-white">{t('extracted.save')}</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      </div>
  );
};

export default BeneficiariesPage;