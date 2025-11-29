"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Clock, CheckCircle, XCircle, PlayCircle, X } from 'lucide-react';

interface Disbursement {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  district: string;
  state: string;
  transactionId: string;
  utrNumber: string;
  paymentMethod: string;
  reliefAmount: number;
  transactionFee: number;
  netAmount: number;
  disbursedAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  initiatedDate: string;
  completedDate?: string;
  actType: string;
  retryCount: number;
  failureReason?: string;
  initiatedBy: string;
  verifiedBy?: string;
  applicationId: string;
  ownerId: string;
  // User editable fields
  userPhone?: string;
  userEmail?: string;
  userBankAccount?: string;
  userIFSC?: string;
  userAddress?: string;
  // Officer only fields (read-only for users)
  officerNotes?: string;
  internalReference?: string;
  verificationLevel?: string;
  priority?: string;
}

export default function DisbursementsPage() {
  const { user } = useAuth();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [userBeneficiary, setUserBeneficiary] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>('all');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [editingDisbursement, setEditingDisbursement] = useState<Disbursement | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const { t } = useLocale();

  // Fetch user's beneficiary first
  useEffect(() => {
    if (!user) {
      setUserBeneficiary(null);
      return;
    }

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
    });

    return () => unsubscribeBeneficiary();
  }, [user]);

  // Fetch disbursements based on beneficiary ID
  useEffect(() => {
    if (!userBeneficiary?.id) {
      setDisbursements([]);
      return;
    }

    const q = query(
      collection(db, 'disbursements'),
      where('beneficiaryId', '==', userBeneficiary.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userDisbursements: Disbursement[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userDisbursements.push({
          id: doc.id,
          beneficiaryId: data.beneficiaryId || '',
          beneficiaryName: data.beneficiaryName || '',
          district: data.district || '',
          state: data.state || '',
          transactionId: data.transactionId || '',
          utrNumber: data.utrNumber || '',
          paymentMethod: data.paymentMethod || '',
          reliefAmount: data.reliefAmount || 0,
          transactionFee: data.transactionFee || 0,
          netAmount: data.netAmount || 0,
          disbursedAmount: data.disbursedAmount || 0,
          status: data.status || 'pending',
          initiatedDate: data.initiatedDate || '',
          completedDate: data.completedDate,
          actType: data.actType || '',
          retryCount: data.retryCount || 0,
          failureReason: data.failureReason,
          initiatedBy: data.initiatedBy || '',
          verifiedBy: data.verifiedBy,
          applicationId: data.applicationId || '',
          ownerId: data.ownerId || '',
          userPhone: data.userPhone || '',
          userEmail: data.userEmail || '',
          userBankAccount: data.userBankAccount || '',
          userIFSC: data.userIFSC || '',
          userAddress: data.userAddress || '',
          officerNotes: data.officerNotes || '',
          internalReference: data.internalReference || '',
          verificationLevel: data.verificationLevel || '',
          priority: data.priority || 'medium'
        });
      });
      setDisbursements(userDisbursements);
    });

    return () => unsubscribe();
  }, [userBeneficiary]);

  // Filter disbursements
  const filteredDisbursements = disbursements.filter(disbursement => {
    if (filter !== 'all' && disbursement.status !== filter) return false;

    const disbursementDate = new Date(disbursement.initiatedDate);
    const now = new Date();

    switch (timeRange) {
      case 'week':
        return disbursementDate > new Date(now.getTime() - 7 * 86400000);
      case 'month':
        return disbursementDate > new Date(now.getTime() - 30 * 86400000);
      case 'quarter':
        return disbursementDate > new Date(now.getTime() - 90 * 86400000);
      default:
        return true;
    }
  });

  // Statistics
  const total = filteredDisbursements.reduce((sum, d) => sum + d.reliefAmount, 0);
  const completedAmount = filteredDisbursements
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.disbursedAmount, 0);
  const pendingAmount = filteredDisbursements
    .filter(d => d.status === 'pending' || d.status === 'processing')
    .reduce((sum, d) => sum + d.reliefAmount, 0);

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-200 text-white border border-amber-200 font-semibold shadow-sm dark:bg-amber-500/30 dark:text-amber-700 dark:border-amber-500/40";

    case "processing":
      return "bg-blue-200 text-white border border-blue-200 font-semibold shadow-sm dark:bg-blue-500/30 dark:text-blue-700 dark:border-blue-500/40";

    case "completed":
      return "bg-green-200 text-white border border-green-200 font-semibold shadow-sm dark:bg-green-500/30 dark:text-green-700 dark:border-green-500/40";

    case "failed":
      return "bg-red-200 text-white border border-red-200 font-semibold shadow-sm dark:bg-red-500/30 dark:text-red-700 dark:border-red-500/40";

    case "cancelled":
      return "bg-gray-200 text-white border border-gray-200 font-semibold shadow-sm dark:bg-gray-500/30 dark:text-gray-700 dark:border-gray-500/40";

    default:
      return "bg-gray-200 text-white border border-gray-200 font-semibold shadow-sm dark:bg-gray-500/30 dark:text-gray-700 dark:border-gray-500/40";
  }
};


  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('extracted.pending');
      case 'processing': return t('extracted.processing');
      case 'completed': return t('extracted.completed');
      case 'failed': return t('extracted.failed');
      case 'cancelled': return t('extracted.cancelled');
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': Clock,
      'processing': PlayCircle,
      'completed': CheckCircle,
      'failed': XCircle,
      'cancelled': X
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Update user details
  const handleUpdateUserDetails = async (field: string, value: string) => {
    if (!editingDisbursement) return;

    try {
      const disbursementRef = doc(db, 'disbursements', editingDisbursement.id);
      await updateDoc(disbursementRef, {
        [field]: value,
        lastUpdated: new Date().toISOString()
      });

      // Update local state
      setDisbursements(prev => prev.map(d =>
        d.id === editingDisbursement.id
          ? { ...d, [field]: value }
          : d
      ));

      setSelectedDisbursement(prev =>
        prev?.id === editingDisbursement.id
          ? { ...prev, [field]: value }
          : prev
      );

      setEditingDisbursement(prev =>
        prev ? { ...prev, [field]: value } : null
      );

    } catch (error) {
      console.error('Error updating disbursement:', error);
      alert(t('extracted.update_failed') || 'Failed to update details');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('extracted.login_required')}</h3>
          <p className="text-sm theme-text-muted mt-2">{t('extracted.login_to_view_disbursements')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 theme-bg-primary">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">
            {t('extracted.my_disbursements')}
          </h1>
          <p className="theme-text-muted mt-2 text-sm md:text-base">
            {t('extracted.track_your_payment_disbursements')}
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sidebar (on top for mobile) */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="font-semibold theme-text-primary">
                  {t('extracted.financial_summary')}
                </h3>
                <span className="text-xs theme-text-muted">
                  {filteredDisbursements.length} {t('extracted.disbursements_found')}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl theme-bg-glass border theme-border-glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm theme-text-muted">
                      {t('extracted.total_approved')}
                    </span>
                    <svg
                      className="w-5 h-5 theme-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="font-bold text-2xl theme-text-primary">
                    {formatCurrency(total)}
                  </div>
                  <div className="text-xs theme-text-muted mt-1">
                    {t('extracted.across_disbursements')} {filteredDisbursements.length}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass text-center">
                    <div className="text-green-600 dark:text-green-400 text-lg font-bold">
                      {formatCurrency(completedAmount)}
                    </div>
                    <div className="text-xs theme-text-muted">
                      {t('extracted.completed')}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass text-center">
                    <div className="text-amber-600 dark:text-amber-400 text-lg font-bold">
                      {formatCurrency(pendingAmount)}
                    </div>
                    <div className="text-xs theme-text-muted">
                      {t('extracted.pending')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                  <div className="text-xs theme-text-muted mb-1">
                    {t('extracted.successful_disbursements')}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold theme-text-primary">
                      {filteredDisbursements.filter(d => d.status === 'completed').length}
                    </div>
                    <div className="text-xs theme-text-muted">
                      {t('extracted.of')} {filteredDisbursements.length}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selected Disbursement Details */}
            <AnimatePresence>
              {selectedDisbursement && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text-primary">
                      {t('extracted.disbursement_details')}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingDisbursement(selectedDisbursement)}
                        className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                        title={t('extracted.edit_details')}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedDisbursement(null)}
                        className="p-1 rounded-lg theme-text-muted hover:theme-bg-glass transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div>
                      <div className="text-sm theme-text-muted mb-1">
                        {t('extracted.beneficiary_name')}
                      </div>
                      <div className="font-medium theme-text-primary">
                        {selectedDisbursement.beneficiaryName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.amount')}
                        </div>
                        <div className="font-bold text-lg theme-text-primary">
                          {formatCurrency(selectedDisbursement.reliefAmount)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.status')}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedDisbursement.status
                          )}`}
                        >
                          {getStatusText(selectedDisbursement.status)}
                        </span>
                      </div>
                    </div>

                    {/* User Editable Fields */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold theme-text-primary">
                        {t('extracted.your_contact_details')}
                      </h5>

                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.phone_number')}
                        </div>
                        {editingDisbursement?.id === selectedDisbursement.id ? (
                          <input
                            type="tel"
                            value={editingDisbursement.userPhone || ''}
                            onChange={e =>
                              setEditingDisbursement({
                                ...editingDisbursement,
                                userPhone: e.target.value,
                              })
                            }
                            onBlur={() =>
                              handleUpdateUserDetails(
                                'userPhone',
                                editingDisbursement.userPhone || ''
                              )
                            }
                            className="w-full px-3 py-1 rounded border theme-border-glass theme-bg-glass theme-text-primary text-sm"
                          />
                        ) : (
                          <div className="font-medium theme-text-primary">
                            {selectedDisbursement.userPhone ||
                              t('extracted.not_provided')}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.email')}
                        </div>
                        {editingDisbursement?.id === selectedDisbursement.id ? (
                          <input
                            type="email"
                            value={editingDisbursement.userEmail || ''}
                            onChange={e =>
                              setEditingDisbursement({
                                ...editingDisbursement,
                                userEmail: e.target.value,
                              })
                            }
                            onBlur={() =>
                              handleUpdateUserDetails(
                                'userEmail',
                                editingDisbursement.userEmail || ''
                              )
                            }
                            className="w-full px-3 py-1 rounded border theme-border-glass theme-bg-glass theme-text-primary text-sm"
                          />
                        ) : (
                          <div className="font-medium theme-text-primary">
                            {selectedDisbursement.userEmail ||
                              t('extracted.not_provided')}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.bank_account')}
                        </div>
                        {editingDisbursement?.id === selectedDisbursement.id ? (
                          <input
                            type="text"
                            value={editingDisbursement.userBankAccount || ''}
                            onChange={e =>
                              setEditingDisbursement({
                                ...editingDisbursement,
                                userBankAccount: e.target.value,
                              })
                            }
                            onBlur={() =>
                              handleUpdateUserDetails(
                                'userBankAccount',
                                editingDisbursement.userBankAccount || ''
                              )
                            }
                            className="w-full px-3 py-1 rounded border theme-border-glass theme-bg-glass theme-text-primary text-sm"
                          />
                        ) : (
                          <div className="font-medium theme-text-primary">
                            {selectedDisbursement.userBankAccount ||
                              t('extracted.not_provided')}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.ifsc_code')}
                        </div>
                        {editingDisbursement?.id === selectedDisbursement.id ? (
                          <input
                            type="text"
                            value={editingDisbursement.userIFSC || ''}
                            onChange={e =>
                              setEditingDisbursement({
                                ...editingDisbursement,
                                userIFSC: e.target.value,
                              })
                            }
                            onBlur={() =>
                              handleUpdateUserDetails(
                                'userIFSC',
                                editingDisbursement.userIFSC || ''
                              )
                            }
                            className="w-full px-3 py-1 rounded border theme-border-glass theme-bg-glass theme-text-primary text-sm"
                          />
                        ) : (
                          <div className="font-medium theme-text-primary">
                            {selectedDisbursement.userIFSC ||
                              t('extracted.not_provided')}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.address')}
                        </div>
                        {editingDisbursement?.id === selectedDisbursement.id ? (
                          <textarea
                            value={editingDisbursement.userAddress || ''}
                            onChange={e =>
                              setEditingDisbursement({
                                ...editingDisbursement,
                                userAddress: e.target.value,
                              })
                            }
                            onBlur={() =>
                              handleUpdateUserDetails(
                                'userAddress',
                                editingDisbursement.userAddress || ''
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-1 rounded border theme-border-glass theme-bg-glass theme-text-primary text-sm resize-none"
                          />
                        ) : (
                          <div className="font-medium theme-text-primary text-sm">
                            {selectedDisbursement.userAddress ||
                              t('extracted.not_provided')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Officer Only Fields (Read-only) */}
                    {selectedDisbursement.officerNotes && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.officer_notes')}
                        </div>
                        <div className="font-medium theme-text-primary text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                          {selectedDisbursement.officerNotes}
                        </div>
                      </div>
                    )}

                    {selectedDisbursement.internalReference && (
                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.internal_reference')}
                        </div>
                        <div className="font-medium theme-text-primary text-sm">
                          {selectedDisbursement.internalReference}
                        </div>
                      </div>
                    )}

                    {/* Transaction Details */}
                    <div className="pt-2 border-t theme-border-glass space-y-2">
                      <div>
                        <div className="text-sm theme-text-muted mb-1">
                          {t('extracted.initiated_date')}
                        </div>
                        <div className="theme-text-primary text-sm">
                          {formatDate(selectedDisbursement.initiatedDate)}
                        </div>
                      </div>

                      {selectedDisbursement.completedDate && (
                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.completed_date')}
                          </div>
                          <div className="theme-text-primary text-sm">
                            {formatDate(selectedDisbursement.completedDate)}
                          </div>
                        </div>
                      )}

                      {selectedDisbursement.transactionId && (
                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.transaction_id')}
                          </div>
                          <div
                            className="font-mono text-xs theme-text-primary theme-bg-glass border theme-border-glass p-2 rounded break-all"
                          >
                            {selectedDisbursement.transactionId}
                          </div>

                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Mode Actions */}
                  {editingDisbursement?.id === selectedDisbursement.id && (
                    <div className="flex gap-2 mt-4 pt-4 border-t theme-border-glass">
                      <button
                        onClick={() => setEditingDisbursement(null)}
                        className="flex-1 px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm"
                      >
                        {t('extracted.cancel')}
                      </button>
                      <button
                        onClick={() => {
                          if (
                            editingDisbursement.userPhone !==
                            selectedDisbursement.userPhone
                          ) {
                            handleUpdateUserDetails(
                              'userPhone',
                              editingDisbursement.userPhone || ''
                            );
                          }
                          if (
                            editingDisbursement.userEmail !==
                            selectedDisbursement.userEmail
                          ) {
                            handleUpdateUserDetails(
                              'userEmail',
                              editingDisbursement.userEmail || ''
                            );
                          }
                          if (
                            editingDisbursement.userBankAccount !==
                            selectedDisbursement.userBankAccount
                          ) {
                            handleUpdateUserDetails(
                              'userBankAccount',
                              editingDisbursement.userBankAccount || ''
                            );
                          }
                          if (
                            editingDisbursement.userIFSC !==
                            selectedDisbursement.userIFSC
                          ) {
                            handleUpdateUserDetails(
                              'userIFSC',
                              editingDisbursement.userIFSC || ''
                            );
                          }
                          if (
                            editingDisbursement.userAddress !==
                            selectedDisbursement.userAddress
                          ) {
                            handleUpdateUserDetails(
                              'userAddress',
                              editingDisbursement.userAddress || ''
                            );
                          }
                          setEditingDisbursement(null);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg accent-gradient text-white text-sm"
                      >
                        {t('extracted.save_changes')}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content (list) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="theme-bg-card theme-border-glass border rounded-2xl p-4 md:p-6 shadow-sm">
              {/* Header with Filters */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold theme-text-primary">
                    {t('extracted.disbursement_history')}
                  </h2>
                  <p className="theme-text-muted mt-1 text-sm">
                    {t('extracted.review_recent_payments')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Time Range Dropdown */}
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as 'all' | 'week' | 'month' | 'quarter')}
                    className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
                  >
                    <option value="all">{t('extracted.all_time')}</option>
                    <option value="week">{t('extracted.last_7_days')}</option>
                    <option value="month">{t('extracted.last_30_days')}</option>
                    <option value="quarter">{t('extracted.last_90_days')}</option>
                  </select>

                  {/* Status Filter Dropdown */}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled')}
                    className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
                  >
                    <option value="all">{t('extracted.all')}</option>
                    <option value="pending">{t('extracted.pending')}</option>
                    <option value="processing">{t('extracted.processing')}</option>
                    <option value="completed">{t('extracted.completed')}</option>
                    <option value="failed">{t('extracted.failed')}</option>
                    <option value="cancelled">{t('extracted.cancelled')}</option>
                  </select>
                </div>
              </div>

              {/* Disbursements List */}
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
               <AnimatePresence>
  {filteredDisbursements.length === 0 ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 theme-bg-glass rounded-xl border theme-border-glass"
    >
      <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 theme-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      </div>
      <p className="theme-text-muted mb-2">
        {t('extracted.no_disbursements_found')}
      </p>
      <p className="text-sm theme-text-muted">
        {disbursements.length === 0
          ? t('extracted.no_disbursement_history_available')
          : t('extracted.no_disbursements_match_filters')}
      </p>
    </motion.div>
  ) : (
    filteredDisbursements.map((disbursement, index) => (
      <motion.div
        key={disbursement.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => setSelectedDisbursement(disbursement)}
        className={`p-4 rounded-xl border theme-border-glass cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg ${
          selectedDisbursement?.id === disbursement.id
            ? 'accent-gradient text-white shadow-md ring-2 ring-white/20'
            : 'theme-bg-glass hover:theme-border-primary'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {disbursement.beneficiaryName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3
                  className={`font-semibold text-lg ${
                    selectedDisbursement?.id === disbursement.id
                      ? 'text-white'
                      : 'theme-text-primary'
                  }`}
                >
                  {disbursement.beneficiaryName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      disbursement.status
                    )}`}
                  >
                    {(() => {
                      const Icon = getStatusIcon(disbursement.status);
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                    {getStatusText(disbursement.status)}
                  </span>
                  {disbursement.status === 'processing' && (
                    <div className="w-16 h-1 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                      <div
                        className="h-full bg-blue-500 rounded-full animate-pulse"
                        style={{ width: '60%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm ${
                selectedDisbursement?.id === disbursement.id
                  ? 'text-white/90'
                  : 'theme-text-muted'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">
                  {disbursement.district}, {disbursement.state}
                </span>
              </span>

              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="truncate">{disbursement.actType}</span>
              </span>

              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(disbursement.initiatedDate)}</span>
              </span>
            </div>
          </div>

          <div
            className={`text-right ${
              selectedDisbursement?.id === disbursement.id
                ? 'text-white'
                : 'theme-text-primary'
            }`}
          >
            <div className="font-bold text-xl mb-1">
              {formatCurrency(disbursement.reliefAmount)}
            </div>
            {disbursement.status === 'completed' && (
              <div
                className={`text-sm font-medium ${
                  selectedDisbursement?.id === disbursement.id
                    ? 'text-white/80'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                ✓ {t('extracted.disbursed')}{' '}
                {formatCurrency(disbursement.disbursedAmount)}
              </div>
            )}
            {disbursement.status === 'failed' && disbursement.failureReason && (
              <div
                className={`text-xs mt-1 ${
                  selectedDisbursement?.id === disbursement.id
                    ? 'text-white/70'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {disbursement.failureReason}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    ))
  )}
</AnimatePresence>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}