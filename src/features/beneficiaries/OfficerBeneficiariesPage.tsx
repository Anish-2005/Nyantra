"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import ExportModal from '@/components/dashboard/ExportModal';
import { useLocale } from '@/context/LocaleContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, StatBand } from '@/components/dashboard/ui';
import { buildOfficerBeneficiaryCsv, formatOfficerCurrency } from './helpers';
import { downloadOfficerBeneficiariesCsv, exportOfficerBeneficiariesPdf, getOfficerBeneficiariesPdfBuffer } from './officerExporters';
import OfficerBeneficiaryForm from './components/OfficerBeneficiaryForm';
import OfficerBeneficiaryFilters from './components/OfficerBeneficiaryFilters';
import OfficerBeneficiaryTable from './components/OfficerBeneficiaryTable';
import OfficerBeneficiaryCards from './components/OfficerBeneficiaryCards';
import OfficerBeneficiaryInspector from './components/OfficerBeneficiaryInspector';

const BeneficiariesPage = () => {
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
    downloadOfficerBeneficiariesCsv(items, t);
  };

  const exportBeneficiariesPDF = (items: any[]) => {
    exportOfficerBeneficiariesPdf(items);
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
        attachmentData = buildOfficerBeneficiaryCsv(items, t);
        attachmentName = `beneficiaries_export_${new Date().toISOString().split('T')[0]}.csv`;
        attachmentType = 'text/csv';
      } else {
        // Generate PDF as base64
        attachmentData = getOfficerBeneficiariesPdfBuffer(items);
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

  // Row action handlers shared by table/cards views
  const openBeneficiaryDetail = (b: any) => {
    setSelectedBeneficiaryLoading(true);
    fetchFullBeneficiary(b.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); });
  };

  const editBeneficiary = (b: any) => {
    setSelectedBeneficiaryLoading(true);
    fetchFullBeneficiary(b.id).then(data => { setSelectedBeneficiary(data); setSelectedBeneficiaryLoading(false); setShowNewBeneficiaryForm(true); });
  };

  const openCertificate = (url: string) => {
    window.open(url, '_blank');
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

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || verificationFilter !== 'all' || sortBy !== 'registrationDate' || sortOrder !== 'desc';
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBeneficiary?.id) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedBeneficiary?.id]);

  const resetAllFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setVerificationFilter('all');
    setSortBy('registrationDate');
    setSortOrder('desc');
  };

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
      >
        <PageHeader
          title={t("beneficiary.beneficiary")}
          highlight={t("beneficiary.management")}
          subtitle={t('beneficiary.comprehensive_oversight_of_dbt_beneficiaries')}
        >
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
        </PageHeader>
      </motion.div>

      {/* New Beneficiary Form (moved below stats) - will render under statistics/cards when opened */}

      {/* Toast container (top-right) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(tst => {
          const toastClass = tst.type === 'success'
            ? 'bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400'
            : tst.type === 'error'
              ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400'
              : 'bg-gray-500/10 border-gray-500/40 theme-text-primary';

          return (
            <div key={tst.id} className={`max-w-[calc(100vw-2rem)] sm:max-w-sm w-full p-3 rounded-md border shadow-sm ${toastClass}`} role="status">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="text-sm min-w-0">{tst.message}</div>
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
      >
        <StatBand
          cols={4}
          cells={[
            { label: t('extracted.total'), value: stats.total },
            { label: t('extracted.verified'), value: stats.verified },
            { label: t('extracted.pending'), value: stats.pendingVerification },
            { label: t('extracted.rejected'), value: stats.rejected },
            { label: t('extracted.documents_required'), value: stats.documentsRequired },
            { label: 'SC', value: categoryStats.SC },
            { label: 'ST', value: categoryStats.ST }
          ]}
        />
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
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1 min-w-0">
            <span className="text-xl font-semibold tabular-nums theme-text-primary">{formatOfficerCurrency(stats.disbursedAmount)}</span>
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
      <OfficerBeneficiaryFilters
        t={t}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        verificationFilter={verificationFilter}
        onVerificationFilterChange={setVerificationFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onResetFilters={resetAllFilters}
      />

      {/* New/Edit Beneficiary Drawer */}
      <AnimatePresence>
        {showNewBeneficiaryForm && (
          <OfficerBeneficiaryForm
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
          <OfficerBeneficiaryTable
            t={t}
            rows={paginatedBeneficiaries}
            canDelete={!!profile && profile.role === 'officer'}
            deletingId={deletingId}
            onView={openBeneficiaryDetail}
            onEdit={editBeneficiary}
            onDelete={(b: any) => confirmDelete(b.id)}
            onOpenCertificate={openCertificate}
          />
        ) : (
          <OfficerBeneficiaryCards
            t={t}
            rows={paginatedBeneficiaries}
            canDelete={!!profile && profile.role === 'officer'}
            deletingId={deletingId}
            onView={openBeneficiaryDetail}
            onEdit={editBeneficiary}
            onDelete={(b: any) => confirmDelete(b.id)}
            onOpenCertificate={openCertificate}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 border-t theme-border-glass">
          <p className="text-xs theme-text-muted">
            {t('extracted.showing')} {startItem} {t('extracted.to')} {endItem} {t('extracted.of')} {totalItems}
          </p>
          {!noPages && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1 || noPages}
                onClick={() => setCurrentPage((p: number) => p - 1)}
                className="w-9 h-9 md:w-8 md:h-8 rounded-md flex items-center justify-center theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i).map((pageNum: number) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-9 md:min-w-8 h-9 md:h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${currentPage === pageNum ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-bg-glass hover:theme-text-primary'}`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || noPages}
                onClick={() => setCurrentPage((p: number) => p + 1)}
                className="w-9 h-9 md:w-8 md:h-8 rounded-md flex items-center justify-center theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
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
        <OfficerBeneficiaryInspector
          t={t}
          beneficiary={selectedBeneficiary}
          detailRef={detailRef}
          statusValue={detailStatus}
          onStatusValueChange={setDetailStatus}
          onSaveStatus={() => updateBeneficiaryStatus(selectedBeneficiary.id, detailStatus)}
          verificationValue={detailVerification}
          onVerificationValueChange={setDetailVerification}
          onSaveVerification={() => updateBeneficiaryVerification(selectedBeneficiary.id, detailVerification)}
          onClose={() => { setSelectedBeneficiary(null); setDetailStatus(''); setDetailVerification(''); }}
          onEdit={() => editBeneficiary(selectedBeneficiary)}
        />
      )}
    </div>
  );
};

export default BeneficiariesPage;
