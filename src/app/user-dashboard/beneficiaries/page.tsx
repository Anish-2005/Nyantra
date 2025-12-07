"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateBeneficiaryId } from '@/lib/id';
import LoadingState from '@/components/LoadingState';
import {
  User, Plus, Edit, Trash, Eye, Search,
  Clock, AlertCircle, BadgeCheck, Banknote, X,
  Shield, Award, MapPin, Phone, Calendar,
  DollarSign, FileText, Check, ChevronLeft, ChevronRight
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
  actType: string;
  registrationDate: any;
  reliefAmount: number;
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
    actType: '',
    registrationDate: '',
    reliefAmount: '',
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          actType: formData.actType,
          registrationDate: regDate,
          reliefAmount: parseFloat(formData.reliefAmount) || 0,
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
        actType: initialData.actType || '',
        registrationDate: initialData.registrationDate && initialData.registrationDate.toDate ? initialData.registrationDate.toDate().toISOString() : (initialData.registrationDate || ''),
        reliefAmount: initialData.reliefAmount ? String(initialData.reliefAmount) : '',
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
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.edit_beneficiary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.full_name')}</label>
            <input required value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.fatheraposs_name')}</label>
            <input value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.aadhaar_number')}</label>
            <input value={formData.aadhaarNumber} onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.phone_number')}</label>
            <input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.district')}</label>
            <input value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.state')}</label>
            <input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.complete_address')}</label>
            <input value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.financial_details')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.act_type')}</label>
            <select value={formData.actType} onChange={(e) => handleInputChange('actType', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary">
              <option value="PCR Act">{t('extracted.pcr_act') || 'PCR Act'}</option>
              <option value="PoA Act">{t('extracted.poa_act') || 'PoA Act'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.reliefAmountINR')}</label>
            <input type="number" value={formData.reliefAmount} onChange={(e) => handleInputChange('reliefAmount', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('extracted.verification_details')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.sc_st_certificate')}</label>
            <input value={formData.scStCertificate} onChange={(e) => handleInputChange('scStCertificate', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" placeholder="Certificate Number" />
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
            <input value={formData.bankAccount} onChange={(e) => handleInputChange('bankAccount', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.ifsc_code')}</label>
            <input value={formData.ifsc} onChange={(e) => handleInputChange('ifsc', e.target.value)} className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary" />
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
          className="px-6 py-2.5 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
  const { theme } = useTheme();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      setBeneficiaries([]);
      setLoading(false);
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
          actType: data.actType || '',
          registrationDate: data.registrationDate,
          reliefAmount: data.reliefAmount || 0,
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
        actType: 'PCR Act',
        registrationDate: Timestamp.fromDate(new Date()),
        reliefAmount: 0,
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

  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.aadhaarNumber.includes(searchTerm) ||
    beneficiary.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('extracted.login_required')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.login_to_manage_beneficiaries')}</p>
        </div>
      </div>
    );
  }

  if (profile && profile.role !== 'user') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
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
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            {t('extracted.beneficiary_management')}
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            {t('extracted.manage_your_beneficiary_information')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold theme-text-primary mb-2">
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
                      className="px-6 py-3 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow font-semibold"
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
                        className="px-6 py-3 theme-bg-glass theme-border-glass border rounded-lg flex items-center gap-2 theme-text-primary hover:shadow-md transition-shadow"
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
                  className="theme-bg-card theme-border-glass border rounded-2xl overflow-hidden"
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
              className="theme-bg-card theme-border-glass border rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  {t('extracted.your_beneficiary')}
                </h3>
                
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={t('extracted.search_beneficiaries')}
                    className="w-full px-4 py-2 pl-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 theme-text-muted" />
                </div>
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
                        {beneficiaries.length === 0 ? t('extracted.no_beneficiaries_yet') : t('extracted.no_matching_beneficiaries_found')}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {beneficiaries.length === 0 
                          ? t('extracted.click_create_to_get_started') 
                          : t('extracted.try_adjusting_search_terms')}
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
                              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
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
                                  {t('extracted.act_type')}
                                </p>
                                <p className={`font-medium ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {beneficiary.actType}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.relief_amount')}
                                </p>
                                <p className={`font-medium ${
                                  selectedBeneficiary?.id === beneficiary.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {formatCurrency(beneficiary.reliefAmount)}
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
          <div className="space-y-6">
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6"
            >
              <h3 className="font-semibold theme-text-primary mb-4">{t('extracted.summary')}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">{beneficiaries.length}</div>
                  <div className="text-xs theme-text-muted">{t('extracted.total')}</div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">
                    {beneficiaries.filter(b => b.verificationStatus === 'verified').length}
                  </div>
                  <div className="text-xs theme-text-muted">{t('extracted.verified')}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <div className="text-xs theme-text-muted mb-1">{t('extracted.most_recent')}</div>
                <div className="font-medium theme-text-primary text-sm truncate">
                  {beneficiaries[0]?.name || '—'}
                </div>
                <div className="text-xs theme-text-muted">
                  {beneficiaries[0] ? formatDate(beneficiaries[0].createdAt) : '--'}
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
                  className="theme-bg-card theme-border-glass border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">{t('extracted.beneficiary_details')}</h4>
                    <button
                      onClick={() => setSelectedBeneficiary(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.full_name')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.name}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.fatheraposs_name')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.fatherName || '—'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.aadhaar_number')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.aadhaarNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.phone_number')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.phone}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.address')}</div>
                      <div className="font-medium theme-text-primary">
                        {selectedBeneficiary.address}, {selectedBeneficiary.district}, {selectedBeneficiary.state}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.act_type')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.actType}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.sc_st_certificate')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.scStCertificate || '—'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.relief_amount')}</div>
                        <div className="font-medium theme-text-primary">{formatCurrency(selectedBeneficiary.reliefAmount)}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.category_1')}</div>
                        <div className="font-medium theme-text-primary">{selectedBeneficiary.category}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t theme-border-glass">
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.beneficiary_id')}</div>
                      <div className="font-mono text-xs theme-text-primary theme-bg-glass px-2 py-1 rounded">
                        {selectedBeneficiary.id}
                      </div>
                      <div className="text-xs theme-text-muted mt-2">
                        {t('extracted.added')}: {formatDate(selectedBeneficiary.createdAt)}
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