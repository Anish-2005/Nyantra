"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardView } from '@/context/DashboardViewContext';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import NewApplicationDrawer from './NewApplicationDrawer';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingState from '@/components/LoadingState';
import {
  Search, Filter, Plus, Eye, Edit, Trash, ChevronLeft, ChevronRight, X, Check,
  Clock, AlertCircle, FileText, User, Phone, MapPin, DollarSign, MessageSquare,
  Shield, BadgeCheck, Banknote, Download, Copy
} from 'lucide-react';

// PoA Act Offences Data Structure
const POA_OFFENCES = {
  "1. Offences leading to Death / Murder": {
    "Murder of SC/ST person": 825000,
    "Death due to injury inflicted during atrocity": 825000,
    "Death after rape / gang rape": 825000
  },
  "2. Rape and Sexual Offences": {
    "Rape": 500000,
    "Gang rape": 825000,
    "Attempt to rape": 100000,
    "Parading naked / semi-naked": 200000,
    "Sexual harassment / use of criminal force": 100000
  },
  "3. Grievous Hurt / Injury": {
    "Grievous hurt": 125000,
    "Permanent disability": 500000,
    "Partial disability": 250000,
    "Acid attack – deformity / disability": 825000,
    "Acid attack – injury without deformity": 500000
  },
  "4. Offences Against Women & Dignity": {
    "Outraging modesty of SC/ST woman": 100000,
    "Sexual exploitation / trafficking": 200000,
    "Forced to work naked / semi-naked": 200000
  },
  "5. Property Damage / Arson": {
    "Burning of house / arson": "225000-425000",
    "Destruction of household / property": "100000-200000",
    "Destruction of crops": 100000,
    "Destruction of cattle / livestock": 60000
  },
  "6. Land & Economic Offences": {
    "Wrongful dispossession from land": 200000,
    "Destruction of standing crops": 100000,
    "Economic boycott": 100000,
    "Social boycott": 100000,
    "Bonded labour / forced labour": 100000
  },
  "7. Caste Atrocity / Humiliation Offences": {
    "Intentional insult, intimidation, caste abuse": 100000,
    "Preventing entry into public place": 100000,
    "Preventing access to public well/tank/roads": 100000,
    "Compelling to eat inedible / obnoxious substances": 100000
  },
  "8. Kidnapping / Abduction": {
    "Kidnapping SC/ST person": "100000-200000",
    "Abduction with intent to outrage modesty": 200000
  },
  "9. Mental Torture / Harassment": {
    "Harassing, humiliating, intimidating": 100000,
    "Public humiliation": "100000-200000"
  },
  "10. Other Serious Offences": {
    "Preventing from voting": 100000,
    "Poll violence against SC/ST": 200000,
    "False, malicious, vexatious legal cases": 100000
  }
};

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
  // PoA specific fields
  offenceCategory?: string;
  offenceType?: string;
}

export default function ApplicationsPage() {
  const { user, profile } = useAuth();
  const { view } = useDashboardView();
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
  const toastIdCounterRef = useRef(0);

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
    toastIdCounterRef.current += 1;
    const id = `toast-${toastIdCounterRef.current}`;
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
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'in-review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'documents-required': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
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

  // Get translated status text
  const getTranslatedStatus = (status: string) => {
    const statusKey = `applications.status.${status.replace('-', '_')}`;
    return t(statusKey) || status.replace('-', ' ');
  };

  // Get translated priority text
  const getTranslatedPriority = (priority: string) => {
    const priorityKey = `applications.priority.${priority.toLowerCase()}`;
    return t(priorityKey) || priority;
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
          firReport: data.firReport || '',
          medicalReport: data.medicalReport || '',
          policeStation: data.policeStation || '',
          caseNumber: data.caseNumber || '',
          // copy stored beneficiary fields if present
          fatherName: data.fatherName || '',
          email: data.email || '',
          address: data.address || '',
          registrationDate: data.registrationDate || null,
          category: data.category || '',
          age: data.age || null,
          gender: data.gender || '',
          maritalStatus: data.maritalStatus || '',
          bankAccount: data.bankAccount || '',
          ifsc: data.ifsc || '',
          // PoA specific fields
          offenceCategory: data.offenceCategory || '',
          offenceType: data.offenceType || '',
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

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const requestDeleteApplication = (id: string) => setDeleteTargetId(id);

  const deleteApplication = async (id: string) => {
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
      <div className="p-5 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('extracted.login_required')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.login_to_view_applications')}</p>
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
    return <LoadingState message={t('loading_applications')} />;
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
              {t('extracted.my_applications')} <span className="text-accent-gradient">{t('extracted.dashboard')}</span>
            </h1>
            <p className="text-xs theme-text-muted mt-0.5 truncate">
              {t('extracted.manage_your_relief_applications')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4 min-w-0">
            {/* Action Card */}
            <div className={`theme-bg-card theme-border-glass border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${!userBeneficiary ? 'border-amber-500/40' : ''}`}>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold theme-text-primary">
                  {applications.length === 0 ? t('extracted.create_first_application') : t('extracted.manage_applications')}
                </h2>
                <p className="theme-text-muted text-xs mt-0.5">
                  {applications.length === 0
                    ? t('extracted.start_by_creating_application')
                    : t('extracted.you_have_applications', { count: applications.length })}
                  {!userBeneficiary && ` · ${t('extracted.create_beneficiary_first')}`}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingApplication(null);
                  setShowNewApplicationForm(true);
                }}
                disabled={!userBeneficiary}
                className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('extracted.new_application')}
              </button>
            </div>

            {/* New / Edit Application Drawer */}
            <AnimatePresence>
              {showNewApplicationForm && (
                <NewApplicationDrawer
                  onCancel={() => {
                    setShowNewApplicationForm(false);
                    setEditingApplication(null);
                  }}
                  initialData={editingApplication}
                  userBeneficiary={userBeneficiary}
                  onSaved={() => {
                    setShowNewApplicationForm(false);
                    setEditingApplication(null);
                    showToast('success', t('applications.savedSuccess'));
                  }}
                />
              )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <ConfirmDeleteModal
              open={!!deleteTargetId}
              message={t('applications.confirmDeleteMessage')}
              onCancel={() => setDeleteTargetId(null)}
              onConfirm={() => {
                if (deleteTargetId) deleteApplication(deleteTargetId);
                setDeleteTargetId(null);
              }}
            />

            {/* Applications List */}
            <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b theme-border-glass">
                <h3 className="text-sm font-semibold theme-text-primary">
                  {t('extracted.application_history')} <span className="theme-text-muted font-normal">({filteredApplications.length})</span>
                </h3>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted" />
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder={t('applications.searchApplications')}
                      className="w-full sm:w-52 h-9 pl-8 pr-3 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
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

              <div className="p-2.5 space-y-2">
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
                    paginatedApplications.map((application) => (
                      <div
                        key={application.id}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedApplication?.id === application.id
                            ? 'border-[var(--accent-primary)] theme-bg-glass'
                            : 'theme-border-glass hover:theme-bg-hover'
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <div className="w-8 h-8 rounded-md theme-bg-glass flex items-center justify-center theme-text-primary text-[11px] font-semibold shrink-0">
                                {application.applicantName.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold truncate theme-text-primary leading-tight">
                                  {application.applicantName}
                                </h4>
                                <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">
                                  {application.id} • {application.beneficiaryId}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2.5">
                              <div>
                                <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.act_type')}</p>
                                <p className="font-medium text-sm theme-text-primary">{application.actType}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.amount')}</p>
                                <p className="font-medium text-sm theme-text-primary tabular-nums">{formatCurrency(application.amount)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.district')}</p>
                                <p className="font-medium text-sm theme-text-primary">{application.district}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.application_date')}</p>
                                <p className="font-medium text-sm theme-text-primary tabular-nums">{formatDate(application.applicationDate)}</p>
                              </div>
                            </div>

                            {/* Case Details */}
                            {(application.incidentDate || application.firReport || application.caseNumber) && (
                              <div className="mt-2 pt-2 border-t theme-border-glass">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                                  {application.incidentDate && (
                                    <span className="theme-text-secondary">
                                      <span className="theme-text-muted">{t('extracted.incident_date')}: </span>
                                      {new Date(application.incidentDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {application.firReport && (
                                    <span className="theme-text-secondary">
                                      <span className="theme-text-muted">{t('applications.firReport')}: </span>
                                      {application.firReport}
                                    </span>
                                  )}
                                  {application.caseNumber && (
                                    <span className="theme-text-secondary">
                                      <span className="theme-text-muted">{t('applications.caseNumber')}: </span>
                                      {application.caseNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(application.status)}`}>
                                {(() => {
                                  const Icon = getStatusIcon(application.status);
                                  return <Icon className="w-3 h-3" />;
                                })()}
                                {getTranslatedStatus(application.status)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingApplication(application);
                                setShowNewApplicationForm(true);
                              }}
                              className={`p-1.5 rounded-md transition-colors ${
                                selectedApplication?.id === application.id
                                  ? 'text-accent-gradient'
                                  : 'theme-text-muted hover:theme-bg-glass hover:text-blue-500'
                              }`}
                              title={t('extracted.edit_application')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteApplication(application.id);
                              }}
                              className={`p-1.5 rounded-md transition-colors ${
                                selectedApplication?.id === application.id
                                  ? 'text-red-500'
                                  : 'theme-text-muted hover:bg-red-500/10 hover:text-red-500'
                              }`}
                              title={t('extracted.delete_application')}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {filteredApplications.length > 0 && (
                  <div className="flex items-center justify-between pt-3 px-1.5 pb-0.5 border-t theme-border-glass">
                    <p className="text-xs theme-text-muted">
                      {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, filteredApplications.length)} {t('extracted.of')} {filteredApplications.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
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
                            className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${currentPage === pageNum ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-bg-glass hover:theme-text-primary'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 min-w-0">
            {/* Summary Card */}
            <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b theme-border-glass">
                <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.summary')}</h3>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-px theme-bg-glass">
                {[
                  { label: t('extracted.total'), value: stats.total, dot: '' },
                  { label: t('extracted.approved'), value: stats.approved, dot: 'bg-emerald-500' },
                  { label: t('applications.pending'), value: stats.pending, dot: 'bg-amber-500' },
                  { label: t('applications.rejected'), value: stats.rejected, dot: 'bg-red-500' },
                ].map(({ label, value, dot }) => (
                  <div key={label} className="theme-bg-card p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot || 'accent-gradient'}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    <p className="text-xl font-semibold tracking-tight theme-text-primary mt-1 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              {/* Beneficiary Information */}
              <div className="px-4 py-3 border-t theme-border-glass">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md theme-bg-glass flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 theme-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-0.5">
                      {t('extracted.beneficiary_id')}
                    </div>
                    <div className="font-mono text-sm theme-text-primary font-semibold truncate leading-tight">
                      {userBeneficiary?.id || t('extracted.not_created')}
                    </div>
                    <div className="text-xs theme-text-muted truncate mt-0.5">
                      {userBeneficiary ? userBeneficiary.name : t('extracted.create_beneficiary_first')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Application Details */}
            <AnimatePresence>
              {selectedApplication && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-xl p-5"
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

                    {/* PoA Offence Information */}
                    {selectedApplication.actType === 'PoA Act' && (selectedApplication.offenceCategory || selectedApplication.offenceType) && (
                      <div className="pt-4 border-t theme-border-glass">
                        <div className="text-sm font-medium theme-text-primary mb-3">{t('applications.poa_act_offence_details')}</div>
                        <div className="space-y-2">
                          {selectedApplication.offenceCategory && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.offence_category')}</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.offenceCategory}</span>
                            </div>
                          )}
                          {selectedApplication.offenceType && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.specific_offence')}</span>
                              <span className="text-sm font-medium theme-text-primary">{selectedApplication.offenceType}</span>
                            </div>
                          )}
                          {selectedApplication.offenceCategory && selectedApplication.offenceType && (
                            <div className="flex justify-between">
                              <span className="text-sm theme-text-muted">{t('applications.expected_compensation')}</span>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {(() => {
                                  const category = POA_OFFENCES[selectedApplication.offenceCategory as keyof typeof POA_OFFENCES];
                                  const compensation = category && selectedApplication.offenceType in category
                                    ? category[selectedApplication.offenceType as keyof typeof category] as string | number
                                    : null;
                                  if (compensation && typeof compensation === "string" && compensation.includes("-")) {
                                    return `₹${compensation.replace("-", " - ₹")}`;
                                  }
                                  return compensation ? `₹${(compensation as number).toLocaleString("en-IN")}` : "₹0";
                                })()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.status')}</div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedApplication.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(selectedApplication.status);
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {getTranslatedStatus(selectedApplication.status)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm theme-text-muted mb-1">{t('extracted.priority')}</div>
                        <div className="font-medium theme-text-primary">{getTranslatedPriority(selectedApplication.priority)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm theme-text-muted mb-1">{t('extracted.beneficiary_id')}</div>
                      <div className="font-mono text-xs theme-text-primary theme-bg-glass px-2 py-1 rounded">
                        {selectedApplication.beneficiaryId}
                      </div>
                    </div>

                    {/* Case Details Section */}
                    {(selectedApplication.incidentDate || selectedApplication.firReport || selectedApplication.medicalReport || selectedApplication.policeStation || selectedApplication.caseNumber) && (
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
      </div>
    </div>
  );
}