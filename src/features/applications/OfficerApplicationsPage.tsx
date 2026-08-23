"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicationDetail from '@/components/dashboard/ApplicationDetail';
import PrintHeader from '@/components/dashboard/PrintHeader';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import ExportModal from '@/components/dashboard/ExportModal';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import {
    Download, Plus, ChevronLeft, ChevronRight, Loader2, SearchX
} from 'lucide-react';

import { POA_OFFENCES } from "@/components/dashboard/POAOffencesTable";
import { EmptyState, PageHeader } from '@/components/dashboard/ui';
import NewApplicationDrawer from './NewApplicationDrawer';
import OfficerApplicationsTable from './components/OfficerApplicationsTable';
import OfficerApplicationsCardGrid from './components/OfficerApplicationsCardGrid';
import OfficerApplicationsStats from './components/OfficerApplicationsStats';
import OfficerApplicationsToolbar from './components/OfficerApplicationsToolbar';
import type { OfficerApplication } from './helpers';
import {
    buildApplicationsCsv,
    buildApplicationsAttachment,
    buildApplicationsEmailHtml,
    exportApplicationsPDF,
    formatOfficerDate,
    formatOfficerCurrency,
    sliderStyles,
} from './helpers';

/** Module-scope spinning loader icon for the kit EmptyState (static component) */
const LoadingIcon = ({ className }: { className?: string }) =>
    React.createElement(Loader2, { className: `${className ?? ''} animate-spin` });

const ApplicationsPage = () => {
    const { theme } = useTheme();
    const { t } = useLocale();
    const { profile, loading: authLoading } = useAuth();
    const isOfficer = !!profile && profile.role === 'officer';

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actTypeFilter, setActTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('status');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<OfficerApplication | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [applications, setApplications] = useState<OfficerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
    const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; id?: string; message?: string }>({ open: false });
    const [expectedAmount, setExpectedAmount] = useState<number>(0);

    // Filter and sort applications
    const filteredApplications = useMemo(() => {
        let filtered = [...applications];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(app =>
                app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.district.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Act type filter
        if (actTypeFilter !== 'all') {
            filtered = filtered.filter(app => app.actType === actTypeFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(app => app.priority === priorityFilter);
        }

        // Custom sorting logic
        filtered.sort((a, b) => {
            let aVal: any, bVal: any;

            if (sortBy === 'amount') {
                // Numeric sorting for amount
                aVal = a.amount || 0;
                bVal = b.amount || 0;
            } else if (sortBy === 'status') {
                // Custom status order: approved -> in-review -> pending -> documents-required -> rejected
                const statusOrder = {
                    'approved': 1,
                    'in-review': 2,
                    'pending': 3,
                    'documents-required': 4,
                    'rejected': 5
                };
                aVal = statusOrder[a.status as keyof typeof statusOrder] || 99;
                bVal = statusOrder[b.status as keyof typeof statusOrder] || 99;
            } else if (sortBy === 'priority') {
                // Custom priority order: high -> medium -> low
                const priorityOrder = {
                    'high': 1,
                    'medium': 2,
                    'low': 3
                };
                aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 99;
                bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 99;
            } else {
                // Default string sorting for other fields
                const rawA = a[sortBy as keyof OfficerApplication];
                const rawB = b[sortBy as keyof OfficerApplication];
                aVal = rawA == null ? '' : String(rawA);
                bVal = rawB == null ? '' : String(rawB);
            }

            if (aVal === bVal) return 0;

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [applications, searchQuery, statusFilter, actTypeFilter, priorityFilter, sortBy, sortOrder]);

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

    // Function to export applications data as CSV
    const exportApplicationsData = (items: OfficerApplication[]) => {
        const csvContent = buildApplicationsCsv(items, t);

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `applications_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to send applications data via email
    const sendApplicationsEmail = async (items: OfficerApplication[], format: 'csv' | 'pdf') => {
        if (!emailAddress.trim()) {
            alert('Please enter an email address');
            return;
        }

        setSendingEmail(true);
        try {
            // Send email
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: emailAddress,
                    subject: `Nyantra Applications Report - ${new Date().toLocaleDateString()}`,
                    html: buildApplicationsEmailHtml(items, format),
                    attachments: [buildApplicationsAttachment(items, format, t)],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            alert('Email sent successfully!');
            setEmailAddress('');
            setShowExportModal(false);
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

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

    // Fetch applications from Firebase
    useEffect(() => {
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, orderBy('applicationDate', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const apps: OfficerApplication[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const toIso = (val: any) => {
                    if (!val) return '';
                    if (val.toDate && typeof val.toDate === 'function') {
                        try { return val.toDate().toISOString(); } catch { return String(val); }
                    }
                    return typeof val === 'string' ? val : String(val);
                };

                apps.push({
                    id: doc.id,
                    applicantName: data.applicantName || '',
                    aadhaar: data.aadhaar || '',
                    phone: data.phone || '',
                    district: data.district || '',
                    state: data.state || '',
                    actType: data.actType || '',
                    beneficiaryId: data.beneficiaryId || '',
                    incidentDate: data.incidentDate || '',
                    applicationDate: toIso(data.applicationDate),
                    status: data.status || 'pending',
                    amount: data.amount || 0,
                    priority: data.priority || 'medium',
                    assignedOfficer: data.assignedOfficer || '',
                    documents: data.documents || 0,
                    lastUpdate: toIso(data.lastUpdate),
                    offenceCategory: data.offenceCategory || '',
                    offenceType: data.offenceType || ''
                });
            });
            setApplications(apps);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching applications:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Toast helpers
    const showToast = (type: 'success' | 'error' | 'info', message: string, ttl = 4000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts(prev => [...prev, { id, type, message }]);
        window.setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, ttl);
    };

    // Request delete: open confirm modal
    const requestDeleteApplication = (id?: string) => {
        if (!id) return;
        setConfirmModal({ open: true, id, message: t('applications.confirmDeleteMessage').replace('{id}', id) });
    };

    const cancelConfirmDelete = () => setConfirmModal({ open: false });

    const confirmDeleteApplication = async () => {
        const id = confirmModal.id;
        if (!id) return;
        setConfirmModal({ open: false });
        try {
            await deleteDoc(doc(db, 'applications', id));
            // Optimistically update local state; onSnapshot will also reflect this change
            setApplications(prev => prev.filter(a => a.id !== id));
            setSelectedApplication(prev => (prev && prev.id === id ? null : prev));
            showToast('success', `Deleted application ${id}`);
        } catch (err) {
            // Show error, include message if available
            const message = (err as any)?.message || String(err);
            showToast('error', `Failed to delete ${id}: ${message}`);

            // Try soft-delete fallback (update status) in case deletes are blocked by rules
            try {
                await updateDoc(doc(db, 'applications', id), { status: 'deleted', deletedAt: Timestamp.fromDate(new Date()) });
                // update local list to reflect status change
                setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'deleted' } : a));
                showToast('success', `Soft-deleted application ${id} (status set to deleted)`);
            } catch (err2) {
                const m2 = (err2 as any)?.message || String(err2);
                showToast('error', `Also failed to update status: ${m2}`);
            }
        }
    };

    // Selected application detail status state (keeps the inline selector controlled)
    const [detailStatus, setDetailStatus] = useState<string>('');

    useEffect(() => {
        setDetailStatus(selectedApplication?.status || 'pending');
        setExpectedAmount(selectedApplication?.amount || 0);
    }, [selectedApplication]);

    // Highlight + scroll-to-row after a new application is created
    const [highlightId, setHighlightId] = useState<string | null>(null);
    const filteredRef = useRef<OfficerApplication[]>([]);
    filteredRef.current = filteredApplications;
    const pageRef = useRef(currentPage);
    pageRef.current = currentPage;

    const scrollToApplication = (id: string) => {
        let attempts = 0;
        const tick = () => {
            const idx = filteredRef.current.findIndex(a => a.id === id);
            if (idx !== -1) {
                const targetPage = Math.floor(idx / itemsPerPage) + 1;
                if (targetPage !== pageRef.current) {
                    setCurrentPage(targetPage);
                    window.setTimeout(tick, 120);
                    return;
                }
                window.setTimeout(() => {
                    document.getElementById(`app-row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightId(id);
                    window.setTimeout(() => setHighlightId(null), 5000);
                }, 150);
            } else if (attempts++ < 20) {
                window.setTimeout(tick, 150);
            }
        };
        tick();
    };

    // Allow officers to update application status
    const updateApplicationStatus = async (id: string, status: string) => {
        if (!id) return;
        try {
            await updateDoc(doc(db, 'applications', id), { status, lastUpdate: Timestamp.fromDate(new Date()) });
            setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            setSelectedApplication(prev => prev ? { ...prev, status } : prev);
            showToast('success', `Updated status for ${id} to ${status}`);
        } catch (err) {
            const m = (err as any)?.message || String(err);
            showToast('error', `Failed to update status: ${m}`);
        }
    };

    // Allow officers to update application amount
    const updateApplicationAmount = async (id: string, amount: number) => {
        if (!id) return;
        try {
            await updateDoc(doc(db, 'applications', id), { amount, lastUpdate: Timestamp.fromDate(new Date()) });
            setApplications(prev => prev.map(a => a.id === id ? { ...a, amount } : a));
            setSelectedApplication(prev => prev ? { ...prev, amount } : prev);
            showToast('success', `Updated amount for ${id} to ₹${amount.toLocaleString('en-IN')}`);
        } catch (err) {
            const m = (err as any)?.message || String(err);
            showToast('error', `Failed to update amount: ${m}`);
        }
    };

    // Generic in-place edit from the detail panel
    const updateApplicationFields = async (id: string, data: Record<string, unknown>) => {
        if (!id) return;
        try {
            await updateDoc(doc(db, 'applications', id), { ...data, lastUpdate: Timestamp.fromDate(new Date()) });
            setApplications(prev => prev.map(a => a.id === id ? { ...a, ...(data as any) } : a));
            setSelectedApplication(prev => prev ? { ...prev, ...(data as any) } : prev);
            showToast('success', `Updated ${id}`);
        } catch (err) {
            const m = (err as any)?.message || String(err);
            showToast('error', `Failed to update: ${m}`);
        }
    };

    if (authLoading) return (
        <div className="space-y-4 max-w-[1400px]">
            <div className="theme-bg-card theme-border-glass border rounded-xl p-5">Loading...</div>
        </div>
    );

    if (!isOfficer) return (
        <div className="space-y-4 max-w-[1400px]">
            <div className="theme-bg-card theme-border-glass border rounded-xl p-5">
                <h2 className="text-base font-semibold theme-text-primary">Access restricted</h2>
                <p className="theme-text-muted">This page is restricted to officers only. If you believe this is an error, contact your administrator.</p>
            </div>
        </div>
    );

return (
  <div className="space-y-4 max-w-[1400px]">
    <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />

    {/* Print Header - Only visible when printing */}
    <PrintHeader title={`${t("extracted.application")} ${t("extracted.monitoring_center")}`} />

    {/* Header */}
    <PageHeader
      title={t("extracted.application")}
      highlight={t("extracted.monitoring_center")}
      subtitle={t("extracted.realtime_application_tracking_description")}
    >
      <button
        onClick={() => setShowExportModal(true)}
        className="h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t("extracted.export_data")}</span>
      </button>
      <button
        onClick={() => setShowNewApplicationForm(true)}
        className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t("extracted.new_application")}</span>
      </button>
    </PageHeader>

    {/* Toast container (top-right) */}
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-[calc(100vw-1.5rem)]">
      {toasts.map((toast: any) => {
        const toastClass =
          toast.type === "success"
            ? "bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400"
            : toast.type === "error"
            ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
            : "bg-gray-500/10 border-gray-500/40 theme-text-primary";

        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full p-3 rounded-md border shadow-sm ${toastClass}`}
            role="status"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm">{toast.message}</div>
              <button
                onClick={() =>
                  setToasts((prev: any[]) =>
                    prev.filter((x) => x.id !== toast.id)
                  )
                }
                className="ml-2 p-2 -m-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors theme-text-muted"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Confirm delete modal */}
    <ConfirmDeleteModal
      open={confirmModal.open}
      message={confirmModal.message ?? ''}
      onCancel={cancelConfirmDelete}
      onConfirm={confirmDeleteApplication}
      theme={theme}
      t={t}
    />

    {/* Export Drawer */}
    <ExportModal
      open={showExportModal}
      onClose={() => setShowExportModal(false)}
      items={applications}
      filteredItems={filteredApplications}
      onExportCsv={exportApplicationsData}
      onExportPdf={exportApplicationsPDF}
      emailAddress={emailAddress}
      setEmailAddress={setEmailAddress}
      sendingEmail={sendingEmail}
      onSendEmail={sendApplicationsEmail}
      title={t("applications.exportTitle") || "Export Applications"}
      subtitle={t("applications.exportSubtitle") || ""}
      allTitle={t("applications.exportAllTitle") || "All Applications"}
      filteredTitle={t("applications.exportFilteredTitle") || "Filtered Results"}
    />

    {/* New Application Drawer */}
    <AnimatePresence>
      {showNewApplicationForm && (
        <NewApplicationDrawer
          onCancel={() => setShowNewApplicationForm(false)}
          onCreated={(newId) => {
            setShowNewApplicationForm(false);
            setSelectedApplication(null);
            setSearchQuery('');
            setStatusFilter('all');
            setActTypeFilter('all');
            setPriorityFilter('all');
            scrollToApplication(newId);
          }}
        />
      )}
    </AnimatePresence>

    {/* Main Content */}
    <>
      {/* Statistics Cards */}
      <OfficerApplicationsStats stats={stats} t={t} />


        {/* Filters and Search */}
        <OfficerApplicationsToolbar
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          actTypeFilter={actTypeFilter}
          setActTypeFilter={setActTypeFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          stats={stats}
        />

        {/* Applications List */}
        {loading ? (
          <EmptyState
            icon={LoadingIcon}
            title={t("extracted.loading_applications")}
          />
) : filteredApplications.length === 0 ? (
  <EmptyState
    icon={SearchX}
    title={applications.length === 0 ? t('extracted.no_applications_yet') : t('extracted.no_matching_applications')}
    hint={t('extracted.try_adjusting_search_terms')}
  />
) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="theme-bg-card theme-border-glass border rounded-xl backdrop-blur-sm shadow-sm overflow-hidden"
        >
          {viewMode === "table" ? (
  <OfficerApplicationsTable
    applications={paginatedApplications}
    highlightId={highlightId}
    t={t}
    onView={setSelectedApplication}
    onDelete={requestDeleteApplication}
  />
)

: (
            <OfficerApplicationsCardGrid
              applications={paginatedApplications}
              highlightId={highlightId}
              t={t}
              onView={setSelectedApplication}
              onDelete={requestDeleteApplication}
            />
          )}

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t theme-border-glass">
            <p className="text-xs theme-text-muted">
              {t("extracted.showing")}{" "}
              {(currentPage - 1) * itemsPerPage + 1} {t("extracted.to")}{" "}
              {Math.min(currentPage * itemsPerPage, filteredApplications.length)}{" "}
              {t("extracted.of")} {filteredApplications.length}
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p: number) => p - 1)}
                className="w-10 h-10 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i: number) => {
                  const pageNum = i + Math.max(1, currentPage - 2);
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-10 sm:min-w-8 h-10 sm:h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                        currentPage === pageNum
                          ? "theme-bg-glass text-accent-gradient"
                          : "theme-text-muted hover:theme-bg-glass hover:theme-text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p: number) => p + 1)}
                className="w-10 h-10 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
)}
    </>

    {/* Application Detail Inline Section */}
    <ApplicationDetail
      selectedApplication={selectedApplication}
      setSelectedApplication={setSelectedApplication}
      t={t}
      theme={theme}
      expectedAmount={expectedAmount}
      setExpectedAmount={setExpectedAmount}
      updateApplicationAmount={updateApplicationAmount}
      detailStatus={detailStatus}
      setDetailStatus={setDetailStatus}
      updateApplicationStatus={updateApplicationStatus}
      onUpdateFields={updateApplicationFields}
      formatDate={formatOfficerDate}
      formatCurrency={formatOfficerCurrency}
      POA_OFFENCES={POA_OFFENCES}
      setShowExportModal={setShowExportModal}
    />
  </div>
);

};

export default ApplicationsPage;
