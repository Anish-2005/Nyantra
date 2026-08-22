"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardView } from '@/context/DashboardViewContext';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateBeneficiaryId } from '@/lib/id';
import LoadingState from '@/components/LoadingState';
import {
  User, Plus, Edit, Trash, Eye,
  Clock, AlertCircle, BadgeCheck, Banknote, X,
  Shield, Award, MapPin, Phone, Calendar,
  DollarSign, FileText, Check, ChevronLeft, ChevronRight,
  Upload, File, CheckCircle, XCircle, Hash
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

// New Beneficiary Form Component (same as officer page)
const NewBeneficiaryForm = ({ onCancel, initialData, onSaved }: { onCancel: () => void, initialData?: any | null, onSaved?: ((saved?: any) => void) | undefined }) => {
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
    scStCertificate: '' // Now stores Cloudinary URL
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Father's name validation
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father\'s name is required';
    } else if (formData.fatherName.trim().length < 2) {
      newErrors.fatherName = 'Father\'s name must be at least 2 characters';
    }

    // Aadhaar validation
    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber.trim())) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // District validation
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // SC/ST Certificate validation (required for SC/ST category)
    if ((formData.category === 'SC' || formData.category === 'ST') && !formData.scStCertificate.trim()) {
      newErrors.scStCertificate = 'SC/ST certificate URL is required for SC/ST category';
    }

    // Age validation (optional but must be valid number if provided)
    if (formData.age.trim() && (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age (0-120)';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Marital Status validation
    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Marital status is required';
    }

    // Bank Account validation
    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = 'Bank account number is required';
    } else if (!/^\d{9,18}$/.test(formData.bankAccount.trim())) {
      newErrors.bankAccount = 'Bank account number must be 9-18 digits';
    }

    // IFSC validation
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
      }
    } catch (err) {
      console.error('Error updating beneficiary:', err);
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
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.edit_beneficiary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.full_name')}</label>
            <input required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.name ? 'border-red-500' : ''}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.fatheraposs_name')}</label>
            <input required value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.fatherName ? 'border-red-500' : ''}`} />
            {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.aadhaar_number')}</label>
            <input required value={formData.aadhaarNumber} onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.aadhaarNumber ? 'border-red-500' : ''}`} />
            {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.phone_number')}</label>
            <input required value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.phone ? 'border-red-500' : ''}`} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.email')}</label>
            <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.email ? 'border-red-500' : ''}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.district')}</label>
            <input required value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.district ? 'border-red-500' : ''}`} />
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.state')}</label>
            <input required value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.state ? 'border-red-500' : ''}`} />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.complete_address')}</label>
            <input required value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.address ? 'border-red-500' : ''}`} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.verification_details')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.sc_st_certificate')}</label>
            <div className="space-y-2">
              <input
                type="url"
                value={formData.scStCertificate}
                onChange={(e) => handleInputChange('scStCertificate', e.target.value)}
                placeholder="Enter certificate URL (e.g., https://example.com/certificate.pdf)"
                className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.scStCertificate ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {formData.scStCertificate && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <File className="w-4 h-4 text-green-500" />
                  <span className="text-sm theme-text-primary">Certificate URL provided</span>
                  <button
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
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.personal_details')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.age')}</label>
            <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.age ? 'border-red-500' : ''}`} />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.gender')}</label>
            <select required value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.gender ? 'border-red-500' : ''}`}>
              <option value="">{t('extracted.select_gender')}</option>
              <option value="Male">{t('extracted.male')}</option>
              <option value="Female">{t('extracted.female')}</option>
              <option value="Other">{t('extracted.other')}</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.category_1') || 'Category'}</label>
            <select required value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.category ? 'border-red-500' : ''}`}>
              <option value="">Select category</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
              <option value="General">General</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.marital_status')}</label>
            <select required value={formData.maritalStatus} onChange={(e) => handleInputChange('maritalStatus', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.maritalStatus ? 'border-red-500' : ''}`}>
              <option value="">{t('extracted.select_marital_status')}</option>
              <option value="Single">{t('extracted.single')}</option>
              <option value="Married">{t('extracted.married')}</option>
              <option value="Divorced">{t('extracted.divorced')}</option>
              <option value="Widowed">{t('extracted.widowed')}</option>
            </select>
            {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.bank_account')}</label>
            <input required value={formData.bankAccount} onChange={(e) => handleInputChange('bankAccount', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.bankAccount ? 'border-red-500' : ''}`} />
            {errors.bankAccount && <p className="text-red-500 text-xs mt-1">{errors.bankAccount}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.ifsc_code')}</label>
            <input required value={formData.ifsc} onChange={(e) => handleInputChange('ifsc', e.target.value)} className={`w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary ${errors.ifsc ? 'border-red-500' : ''}`} />
            {errors.ifsc && <p className="text-red-500 text-xs mt-1">{errors.ifsc}</p>}
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
          disabled={isSubmitting}
        >
          {t('extracted.cancel')}
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-sm transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Edit className="w-4 h-4" />
              {t('extracted.save')}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default function BeneficiariesPage() {
  const { user, profile } = useAuth();
  const { view } = useDashboardView();
  const { theme } = useTheme();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();
  
  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
  };

  // Subscribe to user's beneficiaries
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
      
      // Auto-select the first beneficiary if none selected
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

    // Enforce single beneficiary per user
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

  const deleteBeneficiary = async (id: string) => {
    if (!window.confirm(t('extracted.are_you_sure_remove_beneficiary'))) return;
    
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
    }
  };

  const formatCurrency = (n?: number | null) => {
    if (n == null || Number.isNaN(n)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n as number);
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

  const filteredBeneficiaries = beneficiaries;

  if (!user) {
    return (
      <div className="p-5 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('extracted.login_required')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.login_to_manage_beneficiaries')}</p>
        </div>
      </div>
    );
  }

  if (view !== 'user') {
    return (
      <div className="p-5 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('extracted.applicant_only_access')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.contact_admin_if_needed')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message={t('loading_beneficiaries')} />;
  }

  return (
    <div data-theme={theme} className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              theme === 'dark' ? '#1e40af' : '#3b82f6'
          }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              theme === 'dark' ? '#7c3aed' : '#8b5cf6'
          }}
        ></div>
      </div>

      <div className="relative z-10 p-4 sm:p-5 space-y-4 sm:space-y-5">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
        >
          {/* Animated gradient background - theme aware */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
                : 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))'
            }}
          />

          <div className="relative z-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2">
              <motion.div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs sm:text-sm font-medium theme-text-secondary">
                {t('extracted.beneficiaries')} • {t('extracted.management')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-lg font-semibold tracking-tight theme-text-primary mb-2">
              {t('extracted.beneficiary_management')}{' '}
              <span className="text-accent-gradient inline-block leading-normal ml-1 sm:ml-2">
                {t('extracted.dashboard')}
              </span>
            </h1>
            <p className="theme-text-secondary text-sm sm:text-base max-w-2xl mx-auto lg:mx-0">
              {t('extracted.manage_your_beneficiary_information')}
            </p>
          </div>

         
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-5">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold theme-text-primary mb-2">
                    {beneficiaries.length === 0 ? t('extracted.create_beneficiary') : t('extracted.manage_beneficiary')}
                  </h2>
                  <p className="theme-text-muted text-sm">
                    {beneficiaries.length === 0 
                      ? t('extracted.add_your_beneficiary_details_to_get_started')
                      : t('extracted.view_and_edit_your_beneficiary_information')}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  {beneficiaries.length === 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={createNewBeneficiary}
                      className="px-6 py-3 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-sm transition-shadow font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      {t('extracted.create_beneficiary')}
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditingBeneficiary(selectedBeneficiary);
                          setShowNewBeneficiaryForm(true);
                        }}
                        className="px-6 py-3 theme-bg-glass theme-border-glass border rounded-lg flex items-center gap-2 theme-text-primary hover:shadow-sm transition-shadow"
                      >
                        <Edit className="w-5 h-5" />
                        {t('extracted.edit')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectedBeneficiary && deleteBeneficiary(selectedBeneficiary.id)}
                        className="px-6 py-3 theme-bg-glass theme-border-glass border rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash className="w-5 h-5" />
                        {t('extracted.delete')}
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* New Beneficiary Form */}
            <AnimatePresence>
              {showNewBeneficiaryForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Beneficiaries List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-bg-card theme-border-glass border rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  {t('extracted.your_beneficiary')}
                </h3>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredBeneficiaries.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <User className="w-8 h-8 theme-text-muted" />
                      </div>
                      <p className="theme-text-muted mb-2">
                        {t('extracted.no_beneficiaries_yet')}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {t('extracted.click_create_to_get_started')}
                      </p>
                    </motion.div>
                  ) : (
                    filteredBeneficiaries.map((beneficiary, index) => (
                      <motion.div
                        key={beneficiary.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedBeneficiary?.id === beneficiary.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                        onClick={() => setSelectedBeneficiary(beneficiary)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
                                {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className={`font-semibold truncate ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {beneficiary.name}
                                </h4>
                                <p className={`text-sm ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white/80' : 'theme-text-muted'
                                }`}>
                                  {beneficiary.aadhaarNumber} • {beneficiary.district}, {beneficiary.state}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className={`text-xs ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.email')}
                                </p>
                                <p className={`font-medium ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {beneficiary.email || 'Not provided'}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.sc_st_certificate')}
                                </p>
                                <p className={`font-medium ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {beneficiary.scStCertificate ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); window.open(beneficiary.scStCertificate, '_blank'); }}
                                      className="px-3 py-1.5 rounded-lg accent-gradient text-white text-sm font-medium shadow-sm hover:shadow-sm transition-shadow flex items-center gap-1.5 border border-white/20"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      View Certificate
                                    </button>
                                  ) : 'Not provided'}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.category_1')}
                                </p>
                                <p className={`font-medium ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {beneficiary.category}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.registration_date')}
                                </p>
                                <p className={`font-medium ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {formatDate(beneficiary.registrationDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                selectedBeneficiary?.id === beneficiary.id 
                                  ? 'bg-white/20 text-white border-white/30' 
                                  : getStatusColor(beneficiary.status)
                              }`}>
                                {(() => {
                                  const Icon = getStatusIcon(beneficiary.status);
                                  return <Icon className="w-3 h-3" />;
                                })()}
                                {beneficiary.status.replace('-', ' ')}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                selectedBeneficiary?.id === beneficiary.id 
                                  ? 'bg-white/20 text-white border-white/30' 
                                  : getVerificationColor(beneficiary.verificationStatus)
                              }`}>
                                {(() => {
                                  const Icon = getVerificationIcon(beneficiary.verificationStatus);
                                  return <Icon className="w-3 h-3" />;
                                })()}
                                {beneficiary.verificationStatus.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBeneficiary(beneficiary);
                                setShowNewBeneficiaryForm(true);
                              }}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                selectedBeneficiary?.id === beneficiary.id 
                                  ? 'bg-white/20 text-white hover:bg-white/30' 
                                  : 'theme-bg-glass theme-text-muted hover:theme-border-primary'
                              }`}
                              title={t('extracted.edit_beneficiary')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Selected Beneficiary Details */}
          <div className="space-y-5">
            {/* Beneficiary Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="theme-bg-card theme-border-glass border rounded-xl p-5"
            >
              <h3 className="font-semibold theme-text-primary mb-4">{t('extracted.beneficiary_status')}</h3>
              
              <div className="space-y-4">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm theme-text-muted">{t('extracted.status')}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      beneficiaries[0]?.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      beneficiaries[0]?.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      beneficiaries[0]?.status === 'documents-required' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                      {beneficiaries[0]?.status?.replace('-', ' ') || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm theme-text-muted">{t('extracted.verification')}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      beneficiaries[0]?.verificationStatus === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      beneficiaries[0]?.verificationStatus === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                      {beneficiaries[0]?.verificationStatus || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass">
                  <div className="text-xs theme-text-muted mb-1">{t('extracted.registered_on')}</div>
                  <div className="font-medium theme-text-primary text-sm">
                    {beneficiaries[0] ? formatDate(beneficiaries[0].createdAt) : '—'}
                  </div>
                  <div className="text-xs theme-text-muted mt-1">
                    {t('extracted.last_updated')}: {beneficiaries[0] ? formatDate(beneficiaries[0].lastUpdate) : '—'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selected Beneficiary Details */}
            <AnimatePresence>
              {selectedBeneficiary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-semibold theme-text-primary text-lg">{t('extracted.beneficiary_details')}</h4>
                      <p className="text-sm theme-text-muted mt-1">{t('extracted.detailed_information')}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBeneficiary(null)}
                      className="p-2 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Personal Information Card */}
                    <div className="theme-bg-glass rounded-xl p-5 border theme-border-glass">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium theme-text-primary">{t('extracted.personal_information')}</h5>
                          <p className="text-xs theme-text-muted">{t('extracted.basic_details')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.full_name')}</div>
                            <div className="font-medium theme-text-primary">{selectedBeneficiary.name}</div>
                          </div>
                          <div>
                            <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.fatheraposs_name')}</div>
                            <div className="font-medium theme-text-primary">{selectedBeneficiary.fatherName || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.aadhaar_number')}</div>
                            <div className="font-medium theme-text-primary font-mono">{selectedBeneficiary.aadhaarNumber}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.phone_number')}</div>
                            <div className="font-medium theme-text-primary">{selectedBeneficiary.phone}</div>
                          </div>
                          <div>
                            <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.email')}</div>
                            <div className="font-medium theme-text-primary">{selectedBeneficiary.email || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.category_1')}</div>
                            <div className="font-medium theme-text-primary">{selectedBeneficiary.category}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information Card */}
                    <div className="theme-bg-glass rounded-xl p-5 border theme-border-glass">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium theme-text-primary">{t('extracted.address_information')}</h5>
                          <p className="text-xs theme-text-muted">{t('extracted.location_details')}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs theme-text-muted mb-1 uppercase tracking-wide">{t('extracted.complete_address')}</div>
                        <div className="font-medium theme-text-primary leading-relaxed">
                          {selectedBeneficiary.address}<br />
                          {selectedBeneficiary.district}, {selectedBeneficiary.state}
                        </div>
                      </div>
                    </div>

                    {/* Documents & Status Card */}
                    <div className="theme-bg-glass rounded-xl p-5 border theme-border-glass">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium theme-text-primary">{t('extracted.documents_status')}</h5>
                          <p className="text-xs theme-text-muted">{t('extracted.verification_documents')}</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Certificate Section */}
                        <div className="p-4 rounded-lg theme-bg-card border theme-border-glass">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium theme-text-primary">{t('extracted.sc_st_certificate')}</div>
                              <div className="text-xs theme-text-muted">{t('extracted.required_verification_document')}</div>
                            </div>
                          </div>

                          {selectedBeneficiary.scStCertificate ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium theme-text-primary">{t('extracted.certificate_available')}</div>
                                  <div className="text-xs theme-text-muted">{t('extracted.click_to_view_document')}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => window.open(selectedBeneficiary.scStCertificate, '_blank')}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md accent-gradient text-white font-medium shadow-sm hover:shadow-sm transition-all hover:scale-105 border border-white/20"
                              >
                                <Eye className="w-4 h-4" />
                                {t('extracted.view_certificate')}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium theme-text-primary">{t('extracted.certificate_pending')}</div>
                                <div className="text-xs theme-text-muted italic">{t('extracted.not_provided')}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Section */}
                        <div className="p-4 rounded-lg theme-bg-card border theme-border-glass">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium theme-text-primary">{t('extracted.verification_status')}</div>
                              <div className="text-xs theme-text-muted">{t('extracted.current_application_status')}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
                                selectedBeneficiary.status === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                selectedBeneficiary.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                selectedBeneficiary.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                selectedBeneficiary.status === 'documents-required' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              }`}>
                                {selectedBeneficiary.status === 'verified' && <CheckCircle className="w-4 h-4" />}
                                {selectedBeneficiary.status === 'rejected' && <XCircle className="w-4 h-4" />}
                                {selectedBeneficiary.status === 'pending' && <Clock className="w-4 h-4" />}
                                {selectedBeneficiary.status === 'documents-required' && <AlertCircle className="w-4 h-4" />}
                                {selectedBeneficiary.status === 'verified' ? t('extracted.verified') :
                                 selectedBeneficiary.status === 'rejected' ? t('extracted.rejected') :
                                 selectedBeneficiary.status === 'pending' ? t('extracted.pending') :
                                 selectedBeneficiary.status === 'documents-required' ? t('extracted.documents_required') :
                                 t('extracted.unknown')}
                              </span>
                            </div>

                            <div className="text-right">
                              <div className="text-xs theme-text-muted uppercase tracking-wide">Status</div>
                              <div className="text-sm font-medium theme-text-primary">
                                {selectedBeneficiary.status === 'verified' ? t('extracted.approved') :
                                 selectedBeneficiary.status === 'rejected' ? t('extracted.denied') :
                                 selectedBeneficiary.status === 'pending' ? t('extracted.under_review') :
                                 selectedBeneficiary.status === 'documents-required' ? t('extracted.action_required') :
                                 t('extracted.processing')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Information Card */}
                    <div className="theme-bg-glass rounded-xl p-5 border theme-border-glass">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium theme-text-primary">{t('extracted.registration_info')}</h5>
                          <p className="text-xs theme-text-muted">{t('extracted.registration_details')}</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Beneficiary ID Section */}
                        <div className="p-4 rounded-lg theme-bg-card border theme-border-glass">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                              <Hash className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium theme-text-primary">{t('extracted.beneficiary_id')}</div>
                              <div className="text-xs theme-text-muted">{t('extracted.unique_identification_number')}</div>
                            </div>
                          </div>

                          <div className="font-mono text-lg theme-text-primary theme-bg-card px-3 py-2 rounded-md border theme-border-glass font-semibold">
                            {selectedBeneficiary.id}
                          </div>
                        </div>

                        {/* Registration Date Section */}
                        <div className="p-4 rounded-lg theme-bg-card border theme-border-glass">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium theme-text-primary">{t('extracted.registered_on')}</div>
                              <div className="text-xs theme-text-muted">{t('extracted.account_creation_date')}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold theme-text-primary">{formatDate(selectedBeneficiary.createdAt)}</div>
                              <div className="text-xs theme-text-muted">{t('extracted.registration_timestamp')}</div>
                            </div>
                          </div>
                        </div>

                        {/* Last Updated Section */}
                        {selectedBeneficiary.lastUpdate && (
                          <div className="p-4 rounded-lg theme-bg-card border theme-border-glass">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium theme-text-primary">{t('extracted.last_updated')}</div>
                                <div className="text-xs theme-text-muted">{t('extracted.most_recent_modification')}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <div className="text-lg font-semibold theme-text-primary">{formatDate(selectedBeneficiary.lastUpdate)}</div>
                                <div className="text-xs theme-text-muted">{t('extracted.last_activity_timestamp')}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Toast container */}
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
      </div>
    </div>
  );
}