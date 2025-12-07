"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingState from '@/components/LoadingState';
import {
  Search, Filter, Plus, Eye, Edit, Trash, ChevronLeft, ChevronRight, X, Check,
  Clock, AlertCircle, FileText, User, Phone, MapPin, DollarSign, MessageSquare,
  Shield, BadgeCheck, Banknote, Download, Copy
} from 'lucide-react';

// Application data type
interface Application {
  id: string;
  ownerId: string;
  applicantName: string;
  aadhaar: string;
  phone: string;
  district: string;
  state: string;
  actType: string;
  beneficiaryId: string;
  incidentDate: string;
  firReport?: string;
  medicalReport?: string;
  policeStation?: string;
  caseNumber?: string;
  courtName?: string;
  applicationDate: string;
  status: string;
  amount: number;
  priority: string;
  assignedOfficer: string;
  documents: number;
  lastUpdate: string;
  // common beneficiary fields
  fatherName?: string;
  email?: string;
  address?: string;
  registrationDate?: any;
  category?: string;
  age?: number | null;
  gender?: string;
  maritalStatus?: string;
  bankAccount?: string;
  ifsc?: string;
}

// New Application Form Component for Users
const NewApplicationForm = ({ onCancel, initialData, onSaved, userBeneficiary }: { 
  onCancel: () => void, 
  initialData?: Application | null, 
  onSaved?: () => void,
  userBeneficiary: any | null
}) => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    applicantName: '',
    aadhaar: '',
    phone: '',
    district: '',
    state: '',
    actType: '',
    beneficiaryId: '',
    incidentDate: '',
    firReport: '',
    medicalReport: '',
    policeStation: '',
    caseNumber: '',
    courtName: '',
    amount: '',
    // beneficiary common fields
    fatherName: '',
    email: '',
    address: '',
    registrationDate: '',
    category: '',
    age: '',
    gender: '',
    maritalStatus: '',
    bankAccount: '',
    ifsc: '',
    priority: 'medium',
    assignedOfficer: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beneficiaryExists, setBeneficiaryExists] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate beneficiary exists
      if (!formData.beneficiaryId) {
        alert(t('applications.beneficiaryIdRequired'));
        setIsSubmitting(false);
        return;
      }

      // Check if beneficiary exists in Firestore
      const beneficiaryRef = doc(db, 'beneficiaries', formData.beneficiaryId);
      const beneficiarySnap = await getDoc(beneficiaryRef);
      if (!beneficiarySnap.exists()) {
        alert(t('applications.beneficiaryNotFound'));
        setIsSubmitting(false);
        return;
      }

      if (initialData && initialData.id) {
        // Editing existing application
        const ref = doc(db, 'applications', initialData.id);
        const updatedApplication = {
          applicantName: formData.applicantName,
          aadhaar: formData.aadhaar,
          phone: formData.phone,
          district: formData.district,
          state: formData.state,
          actType: formData.actType,
          beneficiaryId: formData.beneficiaryId,
          incidentDate: formData.incidentDate,
          firReport: (formData as any).firReport || null,
          medicalReport: (formData as any).medicalReport || null,
          policeStation: (formData as any).policeStation || null,
          caseNumber: (formData as any).caseNumber || null,
          courtName: (formData as any).courtName || null,
          // copy common beneficiary fields into the application
          fatherName: (formData as any).fatherName || null,
          email: (formData as any).email || null,
          address: (formData as any).address || null,
          registrationDate: (formData as any).registrationDate || null,
          lastUpdate: Timestamp.fromDate(new Date()),
          status: initialData.status || 'pending',
          amount: parseFloat(formData.amount) || 0,
          priority: formData.priority,
          assignedOfficer: formData.assignedOfficer,
          documents: initialData.documents || 0,
        };

        await updateDoc(ref, updatedApplication);
        onSaved?.();
        onCancel();
      } else {
        // Create new application
        const newId = `APP${Date.now()}`;
        const newApplication = {
          ownerId: user?.uid,
          applicantName: formData.applicantName,
          aadhaar: formData.aadhaar,
          phone: formData.phone,
          district: formData.district,
          state: formData.state,
          actType: formData.actType,
          beneficiaryId: formData.beneficiaryId,
          incidentDate: formData.incidentDate,
          firReport: (formData as any).firReport || null,
          medicalReport: (formData as any).medicalReport || null,
          policeStation: (formData as any).policeStation || null,
          caseNumber: (formData as any).caseNumber || null,
          courtName: (formData as any).courtName || null,
          // copy common beneficiary fields into the application
          fatherName: (formData as any).fatherName || null,
          email: (formData as any).email || null,
          address: (formData as any).address || null,
          caseNumber: (formData as any).caseNumber || null,
          registrationDate: (formData as any).registrationDate || null,
          applicationDate: Timestamp.fromDate(new Date()),
          status: 'pending',
          amount: parseFloat(formData.amount) || 0,
          priority: formData.priority,
          assignedOfficer: formData.assignedOfficer,
          documents: 0,
          lastUpdate: Timestamp.fromDate(new Date()),
          id: newId
        };

        const ref = doc(db, 'applications', newId);
        await setDoc(ref, newApplication);
        onCancel();
      }
    } catch (error) {
      console.error('Error creating application:', error);
      alert(t('applications.creationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'beneficiaryId') {
      setBeneficiaryExists(null);
    }
  };

  // Prefill form when editing or when user has a beneficiary
  useEffect(() => {
    if (initialData) {
      setFormData({
        applicantName: initialData.applicantName || '',
        aadhaar: initialData.aadhaar || '',
        phone: initialData.phone || '',
        district: initialData.district || '',
        state: initialData.state || '',
        actType: initialData.actType || '',
        beneficiaryId: initialData.beneficiaryId || '',
        incidentDate: typeof initialData.incidentDate === 'string' ? initialData.incidentDate : (initialData.incidentDate ? (initialData.incidentDate as any).toDate?.()?.toISOString?.().split('T')[0] || '' : ''),
        firReport: (initialData as any).firReport || '',
        medicalReport: (initialData as any).medicalReport || '',
        policeStation: (initialData as any).policeStation || '',
        caseNumber: (initialData as any).caseNumber || '',
        courtName: (initialData as any).courtName || '',
        amount: String(initialData.amount || ''),
        // populate beneficiary fields if present on the application
        fatherName: (initialData as any).fatherName || '',
        email: (initialData as any).email || '',
        address: (initialData as any).address || '',
        caseNumber: (initialData as any).caseNumber || '',
        registrationDate: (initialData as any).registrationDate && (initialData as any).registrationDate.toDate ? (initialData as any).registrationDate.toDate().toISOString() : ((initialData as any).registrationDate || ''),
        category: (initialData as any).category || '',
        age: (initialData as any).age ? String((initialData as any).age) : '',
        gender: (initialData as any).gender || '',
        maritalStatus: (initialData as any).maritalStatus || '',
        bankAccount: (initialData as any).bankAccount || '',
        ifsc: (initialData as any).ifsc || '',
        priority: initialData.priority || 'medium',
        assignedOfficer: initialData.assignedOfficer || ''
      });
      if (initialData.beneficiaryId) {
        setBeneficiaryExists(true);
      }
    } else {
      // Reset form for new application
      setFormData({
        applicantName: userBeneficiary?.name || '',
        aadhaar: userBeneficiary?.aadhaarNumber || '',
        phone: userBeneficiary?.phone || '',
        district: userBeneficiary?.district || '',
        state: userBeneficiary?.state || '',
        actType: userBeneficiary?.actType || '',
        beneficiaryId: userBeneficiary?.id || '',
        incidentDate: userBeneficiary?.incidentDate || '',
        firReport: '',
        medicalReport: '',
        policeStation: '',
        caseNumber: '',
        courtName: '',
        amount: userBeneficiary?.reliefAmount ? String(userBeneficiary.reliefAmount) : '',
        fatherName: userBeneficiary?.fatherName || '',
        email: userBeneficiary?.email || '',
        address: userBeneficiary?.address || '',
        registrationDate: userBeneficiary?.registrationDate || '',
        category: userBeneficiary?.category || '',
        age: userBeneficiary?.age ? String(userBeneficiary.age) : '',
        gender: userBeneficiary?.gender || '',
        maritalStatus: userBeneficiary?.maritalStatus || '',
        bankAccount: userBeneficiary?.bankAccount || '',
        ifsc: userBeneficiary?.ifsc || '',
        priority: 'medium',
        assignedOfficer: ''
      });
      setBeneficiaryExists(userBeneficiary ? true : null);
    }
  }, [initialData, userBeneficiary]);

  // Check beneficiary existence
  const checkBeneficiaryExists = async (id: string) => {
    if (!id) { 
      setBeneficiaryExists(null); 
      return false; 
    }
    try {
      const ref = doc(db, 'beneficiaries', id);
      const snap = await getDoc(ref);
      const exists = snap.exists();
      setBeneficiaryExists(exists);
      
      if (exists) {
        const data = snap.data();
        // Auto-fill form with beneficiary data
        setFormData(prev => ({
          ...prev,
          applicantName: data?.name || prev.applicantName,
          aadhaar: data?.aadhaarNumber || prev.aadhaar,
          phone: data?.phone || prev.phone,
          district: data?.district || prev.district,
          state: data?.state || prev.state,
          actType: data?.actType || prev.actType,
          fatherName: data?.fatherName || prev.fatherName,
          email: data?.email || prev.email,
          address: data?.address || prev.address,
          caseNumber: data?.caseNumber || prev.caseNumber,
          registrationDate: data?.registrationDate && typeof data.registrationDate.toDate === 'function' ? data.registrationDate.toDate().toISOString() : (data?.registrationDate || prev.registrationDate),
          category: data?.category || prev['category'] || '',
          age: data?.age ? String(data.age) : prev['age'] || '',
          gender: data?.gender || prev['gender'] || '',
          maritalStatus: data?.maritalStatus || prev['maritalStatus'] || '',
          bankAccount: data?.bankAccount || prev['bankAccount'] || '',
          ifsc: data?.ifsc || prev['ifsc'] || ''
        }));
      }
      return exists;
    } catch (err) {
      console.error('Error checking beneficiary', err);
      setBeneficiaryExists(false);
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Applicant Information */}
      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('applications.applicantInformation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.full_name')} *</label>
            <input
              type="text"
              required
              value={formData.applicantName}
              onChange={(e) => handleInputChange('applicantName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder={t('applications.enterApplicantFullName')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.phone_number')} *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder={t('applications.enterPhoneNumber')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.aadhaar_number')} *</label>
            <input
              type="text"
              required
              value={formData.aadhaar}
              onChange={(e) => handleInputChange('aadhaar', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder={t('applications.enter12DigitAadhaarNumber')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.beneficiaryId')} *</label>
            <div className="space-y-2">
              <input
                type="text"
                required
                value={formData.beneficiaryId}
                onChange={(e) => handleInputChange('beneficiaryId', e.target.value)}
                onBlur={(e) => checkBeneficiaryExists(e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder={t('applications.enterBeneficiaryId')}
              />
              {userBeneficiary && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, beneficiaryId: userBeneficiary.id }));
                    checkBeneficiaryExists(userBeneficiary.id);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Use my beneficiary ID: {userBeneficiary.id}
                </button>
              )}
              {beneficiaryExists === true && (
                <span className="text-green-500 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {t('applications.beneficiaryFound')}
                </span>
              )}
              {beneficiaryExists === false && (
                <span className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {t('applications.beneficiaryNotFound')}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.district')} *</label>
            <input
              type="text"
              required
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder={t('applications.enterDistrict')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.state')} *</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder={t('applications.enterState')}
            />
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div>
        <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('applications.applicationDetails')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.act_type')} *</label>
            <select
              required
              value={formData.actType}
              onChange={(e) => handleInputChange('actType', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              <option value="">{t('applications.selectActType')}</option>
              <option value="PCR Act">{t('extracted.pcr_act')}</option>
              <option value="PoA Act">{t('extracted.poa_act')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('extracted.incident_date')} *</label>
            <input
              type="date"
              required
              value={formData.incidentDate}
              onChange={(e) => handleInputChange('incidentDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        {/* Case Details */}
        <div className="mt-6">
          <h4 className="text-md font-semibold theme-text-primary mb-4">{t('applications.caseDetails')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.firReport')}</label>
              <input
                type="text"
                value={(formData as any).firReport}
                onChange={(e) => handleInputChange('firReport', e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder={t('applications.enterFirReport')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.medicalReport')}</label>
              <input
                type="text"
                value={(formData as any).medicalReport}
                onChange={(e) => handleInputChange('medicalReport', e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder={t('applications.enterMedicalReport')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.policeStation')}</label>
              <input
                type="text"
                value={(formData as any).policeStation}
                onChange={(e) => handleInputChange('policeStation', e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder={t('applications.enterPoliceStation')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.caseNumber')}</label>
              <input
                type="text"
                value={(formData as any).caseNumber}
                onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder={t('applications.enterCaseNumber')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.courtName')}</label>
              <input
                type="text"
                value={(formData as any).courtName}
                onChange={(e) => handleInputChange('courtName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder={t('applications.enterCourtName')}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.reliefAmountINR')} *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder={t('applications.enterReliefAmount')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium theme-text-muted mb-2">{t('applications.priorityLevel')}</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              <option value="low">{t('extracted.low')}</option>
              <option value="medium">{t('extracted.medium')}</option>
              <option value="high">{t('extracted.high')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t theme-border-glass">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2 theme-text-primary"
        >
          {t('extracted.cancel')}
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting || beneficiaryExists !== true}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-3 rounded-xl accent-gradient text-white font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('extracted.creating')}...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              {initialData ? t('applications.updateApplication') : t('applications.createApplication')}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default function ApplicationsPage() {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [userBeneficiary, setUserBeneficiary] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
  };

  // Format helpers
  const formatCurrency = (n?: number) => {
    if (n == null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
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

  // Status colors and icons
  const getStatusColor = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'approved': return 'text-green-300 bg-green-900/30';
        case 'pending': return 'text-amber-300 bg-amber-900/30';
        case 'in-review': return 'text-blue-300 bg-blue-900/30';
        case 'rejected': return 'text-red-300 bg-red-900/30';
        case 'documents-required': return 'text-purple-300 bg-purple-900/30';
        default: return 'text-gray-300 bg-gray-800';
      }
    }
    switch (status) {
      case 'approved': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-amber-700 bg-amber-100';
      case 'in-review': return 'text-blue-700 bg-blue-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'documents-required': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': Clock,
      'in-review': Eye,
      'approved': Check,
      'rejected': X,
      'documents-required': AlertCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  // Fetch user's applications and beneficiary
  useEffect(() => {
    if (!user) {
      setApplications([]);
      setUserBeneficiary(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch user's applications (no server-side orderBy to avoid requiring a composite index)
    const applicationsQuery = query(
      collection(db, 'applications'), 
      where('ownerId', '==', user.uid)
    );

    const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
      const apps: Application[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        apps.push({
          id: doc.id,
          ownerId: data.ownerId,
          applicantName: data.applicantName || '',
          aadhaar: data.aadhaar || '',
          phone: data.phone || '',
          district: data.district || '',
          state: data.state || '',
          actType: data.actType || '',
          beneficiaryId: data.beneficiaryId || '',
          incidentDate: data.incidentDate || '',
          // copy stored beneficiary fields if present
          fatherName: data.fatherName || '',
          email: data.email || '',
          address: data.address || '',
          caseNumber: data.caseNumber || '',
          registrationDate: data.registrationDate || null,
          category: data.category || '',
          age: data.age || null,
          gender: data.gender || '',
          maritalStatus: data.maritalStatus || '',
          bankAccount: data.bankAccount || '',
          ifsc: data.ifsc || '',
          applicationDate: data.applicationDate?.toDate?.()?.toISOString() || '',
          status: data.status || 'pending',
          amount: data.amount || 0,
          priority: data.priority || 'medium',
          assignedOfficer: data.assignedOfficer || '',
          documents: data.documents || 0,
          lastUpdate: data.lastUpdate?.toDate?.()?.toISOString() || ''
        });
      });

      // Sort client-side by applicationDate desc (ISO strings sort lexicographically)
      apps.sort((a, b) => {
        const da = a.applicationDate || '';
        const dbs = b.applicationDate || '';
        if (da === dbs) return 0;
        return da < dbs ? 1 : -1; // newer first
      });

      setApplications(apps);
    });

    // Fetch user's beneficiary
    const beneficiaryQuery = query(
      collection(db, 'beneficiaries'), 
      where('ownerId', '==', user.uid)
    );

    const unsubscribeBeneficiary = onSnapshot(beneficiaryQuery, (snapshot) => {
      if (!snapshot.empty) {
        const beneficiaryDoc = snapshot.docs[0];
        setUserBeneficiary({
          id: beneficiaryDoc.id,
          ...beneficiaryDoc.data()
        });
      } else {
        setUserBeneficiary(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeApplications();
      unsubscribeBeneficiary();
    };
  }, [user]);

  const deleteApplication = async (id: string) => {
    if (!window.confirm(t('applications.confirmDeleteMessage'))) return;
    
    try {
      await deleteDoc(doc(db, 'applications', id));
      setApplications(prev => prev.filter(app => app.id !== id));
      if (selectedApplication?.id === id) setSelectedApplication(null);
      showToast('success', t('applications.deletedSuccess'));
    } catch (err) {
      console.error('Error deleting application:', err);
      showToast('error', t('applications.deletedFailed'));
    }
  };

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app =>
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.beneficiaryId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    return filtered;
  }, [applications, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      inReview: applications.filter(a => a.status === 'in-review').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      documentsRequired: applications.filter(a => a.status === 'documents-required').length
    };
  }, [applications]);

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('extracted.login_required')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.login_to_view_applications')}</p>
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
    return <LoadingState message={t('loading_applications')} />;
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
            {t('extracted.my_applications')}
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            {t('extracted.manage_your_relief_applications')}
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
                    {applications.length === 0 ? t('extracted.create_first_application') : t('extracted.manage_applications')}
                  </h2>
                  <p className="theme-text-muted text-sm">
                    {applications.length === 0 
                      ? t('extracted.start_by_creating_application')
                      : t('extracted.you_have_applications', { count: applications.length })}
                  </p>
                  {!userBeneficiary && (
                    <p className="text-amber-600 text-sm mt-2">
                      {t('extracted.create_beneficiary_first')}
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingApplication(null);
                    setShowNewApplicationForm(true);
                  }}
                  disabled={!userBeneficiary}
                  className="px-6 py-3 accent-gradient text-white rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  {t('extracted.new_application')}
                </motion.button>
              </div>
            </motion.div>

            {/* New Application Form */}
            <AnimatePresence>
              {showNewApplicationForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl overflow-hidden"
                >
                  <NewApplicationForm
                    onCancel={() => {
                      setShowNewApplicationForm(false);
                      setEditingApplication(null);
                    }}
                    initialData={editingApplication}
                    onSaved={() => {
                      setShowNewApplicationForm(false);
                      setEditingApplication(null);
                      showToast('success', t('applications.savedSuccess'));
                    }}
                    userBeneficiary={userBeneficiary}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Applications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold theme-text-primary">
                  {t('extracted.application_history')} ({filteredApplications.length})
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-none sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 theme-text-muted" />
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder={t('applications.searchApplications')}
                      className="w-full px-4 py-2 pl-10 rounded-lg border theme-border-glass theme-bg-input theme-text-primary placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border theme-border-glass theme-bg-input theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="all">{t('applications.allStatuses')}</option>
                    <option value="pending">{t('applications.pending')}</option>
                    <option value="in-review">{t('applications.inReview')}</option>
                    <option value="approved">{t('applications.approved')}</option>
                    <option value="rejected">{t('applications.rejected')}</option>
                    <option value="documents-required">{t('applications.documentsRequired')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredApplications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
                    >
                      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 theme-text-muted" />
                      </div>
                      <p className="theme-text-muted mb-2">
                        {applications.length === 0 ? t('extracted.no_applications_yet') : t('extracted.no_matching_applications')}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {applications.length === 0 
                          ? t('extracted.create_your_first_application') 
                          : t('extracted.try_adjusting_search_terms')}
                      </p>
                    </motion.div>
                  ) : (
                    paginatedApplications.map((application, index) => (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedApplication?.id === application.id 
                            ? 'accent-gradient text-white' 
                            : 'theme-bg-glass hover:theme-border-primary'
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
                                {application.applicantName.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className={`font-semibold truncate ${
                                  selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {application.applicantName}
                                </h4>
                                <p className={`text-sm ${
                                  selectedApplication?.id === application.id ? 'text-white/80' : 'theme-text-muted'
                                }`}>
                                  {application.id} • {application.beneficiaryId}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className={`text-xs ${
                                  selectedApplication?.id === application.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.act_type')}
                                </p>
                                <p className={`font-medium ${
                                  selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {application.actType}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedApplication?.id === application.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.amount')}
                                </p>
                                <p className={`font-medium ${
                                  selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {formatCurrency(application.amount)}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedApplication?.id === application.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.district')}
                                </p>
                                <p className={`font-medium ${
                                  selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {application.district}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${
                                  selectedApplication?.id === application.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('extracted.application_date')}
                                </p>
                                <p className={`font-medium ${
                                  selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                }`}>
                                  {formatDate(application.applicationDate)}
                                </p>
                              </div>
                            </div>

                            {/* Case Details */}
                            {(application.incidentDate || application.firReport || application.caseNumber) && (
                              <div className="mt-3 pt-3 border-t theme-border-glass">
                                <p className={`text-xs font-medium mb-2 ${
                                  selectedApplication?.id === application.id ? 'text-white/70' : 'theme-text-muted'
                                }`}>
                                  {t('applications.caseDetails')}:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  {application.incidentDate && (
                                    <div>
                                      <span className={`font-medium ${
                                        selectedApplication?.id === application.id ? 'text-white/80' : 'theme-text-muted'
                                      }`}>
                                        {t('extracted.incident_date')}:
                                      </span>
                                      <span className={`ml-1 ${
                                        selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                      }`}>
                                        {new Date(application.incidentDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {application.firReport && (
                                    <div>
                                      <span className={`font-medium ${
                                        selectedApplication?.id === application.id ? 'text-white/80' : 'theme-text-muted'
                                      }`}>
                                        {t('applications.firReport')}:
                                      </span>
                                      <span className={`ml-1 ${
                                        selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                      }`}>
                                        {application.firReport}
                                      </span>
                                    </div>
                                  )}
                                  {application.caseNumber && (
                                    <div>
                                      <span className={`font-medium ${
                                        selectedApplication?.id === application.id ? 'text-white/80' : 'theme-text-muted'
                                      }`}>
                                        {t('applications.caseNumber')}:
                                      </span>
                                      <span className={`ml-1 ${
                                        selectedApplication?.id === application.id ? 'text-white' : 'theme-text-primary'
                                      }`}>
                                        {application.caseNumber}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                selectedApplication?.id === application.id 
                                  ? 'bg-white/20 text-white border-white/30' 
                                  : getStatusColor(application.status)
                              }`}>
                                {(() => {
                                  const Icon = getStatusIcon(application.status);
                                  return <Icon className="w-3 h-3" />;
                                })()}
                                {application.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingApplication(application);
                                setShowNewApplicationForm(true);
                              }}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                selectedApplication?.id === application.id 
                                  ? 'bg-white/20 text-white hover:bg-white/30' 
                                  : 'theme-bg-glass theme-text-muted hover:theme-border-primary'
                              }`}
                              title={t('extracted.edit_application')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteApplication(application.id);
                              }}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                selectedApplication?.id === application.id 
                                  ? 'bg-white/20 text-white hover:bg-red-400' 
                                  : 'theme-bg-glass theme-text-muted hover:text-red-600'
                              }`}
                              title={t('extracted.delete_application')}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {filteredApplications.length > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t theme-border-glass">
                    <p className="text-sm theme-text-muted">
                      {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, filteredApplications.length)} {t('extracted.of')} {filteredApplications.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary hover:bg-slate-200/60 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + Math.max(1, currentPage - 2);
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg ${currentPage === pageNum ? 'accent-gradient text-white' : 'theme-bg-card theme-border-glass border theme-text-primary hover:bg-slate-200/60'} transition-colors`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary hover:bg-slate-200/60 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
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
                  <div className="text-2xl font-bold theme-text-primary mb-1">{stats.total}</div>
                  <div className="text-xs theme-text-muted">{t('extracted.total')}</div>
                </div>
                <div className="theme-bg-glass rounded-xl p-4 border theme-border-glass text-center">
                  <div className="text-2xl font-bold theme-text-primary mb-1">
                    {stats.approved}
                  </div>
                  <div className="text-xs theme-text-muted">{t('extracted.approved')}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <div className="text-xs theme-text-muted mb-1">{t('extracted.beneficiary_id')}</div>
                <div className="font-medium theme-text-primary text-sm truncate">
                  {userBeneficiary?.id || t('extracted.not_created')}
                </div>
                <div className="text-xs theme-text-muted">
                  {userBeneficiary ? userBeneficiary.name : t('extracted.create_beneficiary_first')}
                </div>
              </div>
            </motion.div>

            {/* Selected Application Details */}
            <AnimatePresence>
              {selectedApplication && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">{t('extracted.application_details')}</h4>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.applicant')}</div>
                        <div className="font-medium theme-text-primary">{selectedApplication.applicantName}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.aadhaar_number')}</div>
                        <div className="font-medium theme-text-primary">{selectedApplication.aadhaar}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.phone_number')}</div>
                        <div className="font-medium theme-text-primary">{selectedApplication.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.location')}</div>
                        <div className="font-medium theme-text-primary">{selectedApplication.district}, {selectedApplication.state}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.act_type')}</div>
                        <div className="font-medium theme-text-primary">{selectedApplication.actType}</div>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.amount')}</div>
                        <div className="font-semibold theme-text-primary">{formatCurrency(selectedApplication.amount)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.status')}</div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedApplication.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(selectedApplication.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {selectedApplication.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.priority')}</div>
                        <div className="font-medium theme-text-primary">{selectedApplication.priority}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.beneficiary_id')}</div>
                      <div className="font-mono text-xs theme-text-primary theme-bg-glass px-2 py-1 rounded">
                        {selectedApplication.beneficiaryId}
                      </div>
                    </div>

                    {/* Case Details Section */}
                    {(selectedApplication.incidentDate || selectedApplication.firReport || selectedApplication.medicalReport || selectedApplication.policeStation || selectedApplication.caseNumber || selectedApplication.courtName) && (
                      <div className="pt-4 border-t theme-border-glass">
                        <div className="text-sm font-medium theme-text-primary mb-3">{t('applications.caseDetails')}</div>
                        <div className="space-y-2">
                          {selectedApplication.incidentDate && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('extracted.incident_date')}:</span>
                              <span className="text-sm font-medium theme-text-primary">{new Date(selectedApplication.incidentDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {selectedApplication.firReport && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.firReport')}:</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.firReport}</span>
                            </div>
                          )}
                          {selectedApplication.medicalReport && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.medicalReport')}:</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.medicalReport}</span>
                            </div>
                          )}
                          {selectedApplication.policeStation && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.policeStation')}:</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.policeStation}</span>
                            </div>
                          )}
                          {selectedApplication.caseNumber && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.caseNumber')}:</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.caseNumber}</span>
                            </div>
                          )}
                          {selectedApplication.courtName && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.courtName')}:</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.courtName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t theme-border-glass">
                      <div className="text-xs theme-text-muted">
                        {t('extracted.submitted')}: {formatDate(selectedApplication.applicationDate)}
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