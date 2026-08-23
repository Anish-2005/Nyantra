"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardView } from '@/context/DashboardViewContext';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import NewApplicationDrawer from './NewApplicationDrawer';
import ApplicationTrackerCard from './components/ApplicationTrackerCard';
import type { Application, TranslateFn } from './helpers';
import {
  PageHeader,
  FilterPills,
  EmptyState,
} from '@/components/dashboard/ui';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingState from '@/components/LoadingState';
import { Plus, AlertCircle, FileText } from 'lucide-react';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { view } = useDashboardView();
  const { t } = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [userBeneficiary, setUserBeneficiary] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const toastIdCounterRef = useRef(0);

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
    toastIdCounterRef.current += 1;
    const id = `toast-${toastIdCounterRef.current}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
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

  const openNewApplication = () => {
    setEditingApplication(null);
    setShowNewApplicationForm(true);
  };

  const deleteApplication = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'applications', id));
      setApplications(prev => prev.filter(app => app.id !== id));
      if (expandedId === id) setExpandedId(null);
      showToast('success', t('applications.deletedSuccess'));
    } catch (err) {
      console.error('Error deleting application:', err);
      showToast('error', t('applications.deletedFailed'));
    }
  };

  // Filter applications (status pill filters)
  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  // Statistics
  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    inReview: applications.filter(a => a.status === 'in-review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    documentsRequired: applications.filter(a => a.status === 'documents-required').length
  }), [applications]);

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
      {/* Header */}
      <PageHeader
        title={t('extracted.my_applications')}
        highlight={t('extracted.dashboard')}
        subtitle={
          stats.total > 0
            ? t('extracted.you_have_applications', { count: stats.total })
            : t('extracted.manage_your_relief_applications')
        }
      >
        <button
          onClick={openNewApplication}
          disabled={!userBeneficiary}
          className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('extracted.new_application')}
        </button>
      </PageHeader>

      {/* Beneficiary prerequisite */}
      {!userBeneficiary && (
        <div className="theme-bg-card border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium theme-text-primary">{t('extracted.create_beneficiary_first')}</p>
            <p className="text-xs theme-text-muted mt-0.5">{t('extracted.start_by_creating_application')}</p>
          </div>
        </div>
      )}

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

      {/* Status filter pills */}
      {stats.total > 0 && (
        <FilterPills
          value={statusFilter}
          onChange={setStatusFilter}
          hideEmpty
          items={[
            { key: 'all', label: t('applications.allStatuses'), count: stats.total },
            { key: 'pending', label: t('applications.pending'), count: stats.pending },
            { key: 'in-review', label: t('applications.inReview'), count: stats.inReview },
            { key: 'approved', label: t('applications.approved'), count: stats.approved },
            { key: 'documents-required', label: t('applications.documentsRequired'), count: stats.documentsRequired },
            { key: 'rejected', label: t('applications.rejected'), count: stats.rejected },
          ]}
        />
      )}

      {/* Tracker list */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={applications.length === 0 ? t('extracted.no_applications_yet') : t('extracted.no_matching_applications')}
          hint={
            applications.length === 0
              ? t('extracted.create_your_first_application')
              : t('extracted.try_adjusting_search_terms')
          }
          actionIcon={Plus}
          actionLabel={applications.length === 0 && userBeneficiary ? t('extracted.new_application') : undefined}
          onAction={openNewApplication}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredApplications.map((application) => (
            <ApplicationTrackerCard
              key={application.id}
              application={application}
              expanded={expandedId === application.id}
              onToggle={() => setExpandedId(expandedId === application.id ? null : application.id)}
              onEdit={(a) => {
                setEditingApplication(a);
                setShowNewApplicationForm(true);
              }}
              onDelete={(id) => setDeleteTargetId(id)}
              t={t as TranslateFn}
            />
          ))}
        </div>
      )}
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
  );
}
