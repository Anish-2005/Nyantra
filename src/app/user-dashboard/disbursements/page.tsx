"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingState from '@/components/LoadingState';
import { Clock, CheckCircle, XCircle, PlayCircle, X, Filter } from 'lucide-react';

interface Disbursement {
  id: string;
  firestoreId?: string;
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
  // Progressive payment fields
  isProgressivePayment?: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  installmentAmounts?: number[];
  installmentPercentages?: number[];
  completedInstallments?: number;
  disbursementProgress?: number;
  nextInstallmentAmount?: number;
  nextInstallmentPercentage?: number;
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
  const { theme } = useTheme();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [userBeneficiary, setUserBeneficiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>('all');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
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
      setLoading(false);
    });

    return () => unsubscribeBeneficiary();
  }, [user]);

  // Fetch disbursements based on beneficiary ID
  useEffect(() => {
    if (!userBeneficiary?.id) {
      setDisbursements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'disbursements'),
      where('beneficiaryId', '==', userBeneficiary.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userDisbursements: Disbursement[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userDisbursements.push({
          id: data.id || doc.id,
          firestoreId: doc.id,
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
          isProgressivePayment: data.isProgressivePayment || false,
          currentInstallment: data.currentInstallment,
          totalInstallments: data.totalInstallments,
          installmentAmounts: data.installmentAmounts,
          installmentPercentages: data.installmentPercentages,
          completedInstallments: data.completedInstallments,
          disbursementProgress: data.disbursementProgress,
          nextInstallmentAmount: data.nextInstallmentAmount,
          nextInstallmentPercentage: data.nextInstallmentPercentage,
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
      setLoading(false);
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

  // Statistics - handle progressive payments
  const total = filteredDisbursements.reduce((sum, d) => sum + d.reliefAmount, 0);
  const completedAmount = filteredDisbursements
    .filter(d => d.status === 'completed' || (d.isProgressivePayment && d.disbursedAmount > 0))
    .reduce((sum, d) => sum + d.disbursedAmount, 0);
  const pendingAmount = filteredDisbursements
    .filter(d => d.status === 'pending' || d.status === 'processing')
    .reduce((sum, d) => sum + (d.isProgressivePayment ? Math.max(0, d.reliefAmount - (d.disbursedAmount || 0)) : d.netAmount), 0);

  // Calculate progressive payment progress
  const progressiveDisbursements = filteredDisbursements.filter(d => d.isProgressivePayment);
  const totalProgressiveAmount = progressiveDisbursements.reduce((sum, d) => sum + d.reliefAmount, 0);
  const completedProgressiveAmount = progressiveDisbursements
    .reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);
  const pendingProgressiveAmount = progressiveDisbursements
    .reduce((sum, d) => sum + Math.max(0, d.reliefAmount - (d.disbursedAmount || 0)), 0);

  const overallCompletionPercentage = total > 0 ? Math.round((completedAmount / total) * 100) : 0;

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

  if (loading) {
    return <LoadingState message={t('loading_disbursements')} />;
  }

  return (
    <div data-theme={theme} className="min-h-screen relative overflow-hidden">
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

      <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
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
                {t('extracted.disbursements')} • {t('extracted.tracking')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold theme-text-primary mb-2">
              {t('extracted.my_disbursements')}{' '}
              <span className="text-accent-gradient inline-block leading-normal ml-1 sm:ml-2">
                {t('extracted.dashboard')}
              </span>
            </h1>
            <p className="theme-text-secondary text-sm sm:text-base max-w-2xl mx-auto lg:mx-0">
              {t('extracted.track_your_payment_disbursements')}
            </p>
          </div>
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
                    <div className="text-xs theme-text-accent mt-1">
                      {overallCompletionPercentage}% received
                    </div>
                  </div>

                  <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass text-center">
                    <div className="text-amber-600 dark:text-amber-400 text-lg font-bold">
                      {formatCurrency(pendingAmount)}
                    </div>
                    <div className="text-xs theme-text-muted">
                      {t('extracted.pending')}
                    </div>
                    <div className="text-xs theme-text-accent mt-1">
                      {100 - overallCompletionPercentage}% remaining
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

                  <div className="space-y-4">
                    {/* Disbursement ID */}
                    <div>
                      <div className="text-sm theme-text-muted mb-1">
                        {t('extracted.disbursement_id')}
                      </div>
                      <div className="font-medium theme-text-primary font-mono text-sm">
                        {selectedDisbursement.id}
                      </div>
                    </div>

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
                          {selectedDisbursement.isProgressivePayment 
                            ? formatCurrency(selectedDisbursement.disbursedAmount || 0)
                            : formatCurrency(selectedDisbursement.netAmount)
                          }
                          {selectedDisbursement.isProgressivePayment && selectedDisbursement.disbursementProgress !== undefined && (
                            <div className="text-xs theme-text-muted mt-1">
                              / {formatCurrency(selectedDisbursement.reliefAmount)}
                            </div>
                          )}
                        </div>
                        {selectedDisbursement.isProgressivePayment && (
                          <div className="mt-3">
                            <div className="text-xs theme-text-accent mb-2">
                              Progress: {selectedDisbursement.disbursementProgress?.toFixed(2)}%
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${selectedDisbursement.disbursementProgress || 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs theme-text-muted mt-2">
                              {selectedDisbursement.completedInstallments || 0} of {selectedDisbursement.totalInstallments || 3} installments completed
                            </div>
                            {selectedDisbursement.nextInstallmentAmount && selectedDisbursement.nextInstallmentPercentage && (
                              <div className="text-xs theme-text-accent mt-1">
                                Next: {formatCurrency(selectedDisbursement.nextInstallmentAmount)} ({selectedDisbursement.nextInstallmentPercentage}%)
                              </div>
                            )}
                          </div>
                        )}
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

                    {/* Beneficiary Information */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold theme-text-primary">
                        {t('extracted.beneficiary_information')}
                      </h5>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.phone_number')}
                          </div>
                          <div className="font-medium theme-text-primary">
                            {userBeneficiary?.phone || t('extracted.not_provided')}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.email')}
                          </div>
                          <div className="font-medium theme-text-primary">
                            {userBeneficiary?.email || t('extracted.not_provided')}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.bank_account')}
                          </div>
                          <div className="font-medium theme-text-primary">
                            {userBeneficiary?.bankAccount || t('extracted.not_provided')}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.ifsc_code')}
                          </div>
                          <div className="font-medium theme-text-primary">
                            {userBeneficiary?.ifsc || t('extracted.not_provided')}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm theme-text-muted mb-1">
                            {t('extracted.address')}
                          </div>
                          <div className="font-medium theme-text-primary text-sm">
                            {userBeneficiary?.address || t('extracted.not_provided')}
                          </div>
                        </div>
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
              {formatCurrency(disbursement.disbursedAmount || 0)}
              {disbursement.isProgressivePayment && disbursement.disbursementProgress !== undefined && (
                <div className={`text-xs mt-1 ${selectedDisbursement?.id === disbursement.id ? 'text-white/70' : 'theme-text-muted'}`}>
                  / {formatCurrency(disbursement.reliefAmount)}
                </div>
              )}
            </div>
            {disbursement.isProgressivePayment && (
              <div className="mt-2">
                <div className={`text-xs mb-1 ${selectedDisbursement?.id === disbursement.id ? 'text-white/80' : 'theme-text-accent'}`}>
                  Progress: {disbursement.disbursementProgress?.toFixed(2)}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                  ></div>
                </div>
                <div className={`text-xs mt-1 ${selectedDisbursement?.id === disbursement.id ? 'text-white/70' : 'theme-text-muted'}`}>
                  {disbursement.completedInstallments || 0} of {disbursement.totalInstallments || 3} installments completed
                </div>
              </div>
            )}
            {disbursement.status === 'completed' && !disbursement.isProgressivePayment && (
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