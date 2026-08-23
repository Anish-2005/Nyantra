"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingState from '@/components/LoadingState';
import { PageHeader, StatBand } from '@/components/dashboard/ui';
import type { Disbursement, DisbursementAlert } from './helpers';
import { formatCurrency, sendDisbursementNotificationEmail } from './helpers';
import DisbursementAlerts from './components/DisbursementAlerts';
import DisbursementCard from './components/DisbursementCard';
import DisbursementInspector from './components/DisbursementInspector';

export default function DisbursementsPage() {
  const { user } = useAuth();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [userBeneficiary, setUserBeneficiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>('all');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const { t } = useLocale();
  const detailRef = useRef<HTMLDivElement>(null);

  // Alert system for new disbursements/installments
  const [newDisbursementAlerts, setNewDisbursementAlerts] = useState<DisbursementAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<string | null>(null);
  const [emailedAlerts, setEmailedAlerts] = useState<Set<string>>(new Set());
  const [emailedEvents, setEmailedEvents] = useState<Set<string>>(new Set()); // Track specific disbursement events

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

      // Check for new disbursements or installment updates
      if (lastViewedTimestamp) {
        const newAlerts: DisbursementAlert[] = [];
        userDisbursements.forEach(disbursement => {
          const disbursementDate = new Date(disbursement.initiatedDate);
          const lastViewed = new Date(lastViewedTimestamp);

          // New disbursement alert
          if (disbursementDate > lastViewed && !dismissedAlerts.has(`new-${disbursement.id}`)) {
            newAlerts.push({
              id: `new-${disbursement.id}`,
              type: 'new_disbursement',
              disbursement: disbursement,
              message: `New disbursement of ${formatCurrency(disbursement.reliefAmount)} has been initiated`,
              timestamp: disbursement.initiatedDate
            });
          }

          // Installment completion alert for progressive payments
          if (disbursement.isProgressivePayment && disbursement.completedInstallments && disbursement.completedInstallments > 0) {
            const lastCompletedInstallment = disbursement.completedInstallments;
            const alertId = `installment-${disbursement.id}-${lastCompletedInstallment}`;

            if (!dismissedAlerts.has(alertId)) {
              const installmentAmount = disbursement.installmentAmounts?.[lastCompletedInstallment - 1] ||
                                      (disbursement.reliefAmount * (disbursement.installmentPercentages?.[lastCompletedInstallment - 1] || 25) / 100);

              newAlerts.push({
                id: alertId,
                type: 'installment_completed',
                disbursement: disbursement,
                message: `Installment ${lastCompletedInstallment} of ${formatCurrency(installmentAmount)} has been disbursed`,
                timestamp: new Date().toISOString()
              });
            }
          }

          // Status change alerts
          if (disbursement.status === 'completed' && !dismissedAlerts.has(`completed-${disbursement.id}`)) {
            newAlerts.push({
              id: `completed-${disbursement.id}`,
              type: 'status_completed',
              disbursement: disbursement,
              message: `Your disbursement of ${formatCurrency(disbursement.disbursedAmount || disbursement.reliefAmount)} has been completed`,
              timestamp: disbursement.completedDate || new Date().toISOString()
            });
          }
        });

        if (newAlerts.length > 0) {
          setNewDisbursementAlerts(prev => {
            // Combine new alerts with existing ones, deduplicating by ID
            const allAlerts = [...newAlerts, ...prev];
            const uniqueAlerts = allAlerts.filter((alert, index, self) =>
              index === self.findIndex(a => a.id === alert.id)
            );
            // Store alerts in localStorage for sidebar notification
            if (user?.uid) {
              const alertsKey = `disbursement_alerts_${user.uid}`;
              localStorage.setItem(alertsKey, JSON.stringify(uniqueAlerts));
            }
            return uniqueAlerts;
          });

          // Send email notifications for new alerts (with slight delay to avoid spam)
          newAlerts.forEach((alert, index) => {
            const beneficiaryEmail = userBeneficiary?.email;
            if (beneficiaryEmail && beneficiaryEmail.trim() && !emailedAlerts.has(alert.id)) {
              console.log(`📧 Scheduling email notification for alert: ${alert.type} to ${beneficiaryEmail}`);
              setTimeout(() => {
                sendDisbursementNotificationEmail(alert, beneficiaryEmail);
                setEmailedAlerts(prev => {
                  const updated = new Set([...prev, alert.id]);
                  // Save to localStorage
                  if (user?.uid) {
                    localStorage.setItem(`disbursements_emailed_${user.uid}`, JSON.stringify([...updated]));
                  }
                  return updated;
                });
              }, index * 1000); // 1 second delay between emails
            } else if (emailedAlerts.has(alert.id)) {
              console.log(`📧 Email already sent for alert: ${alert.id}, skipping`);
            } else {
              console.log(`⚠️ No email found for beneficiary, skipping notification for alert: ${alert.type}`);
            }
          });
        }
      }

      setDisbursements(userDisbursements);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userBeneficiary]);

  // Load last viewed timestamp on component mount
  useEffect(() => {
    if (user) {
      const savedTimestamp = localStorage.getItem(`disbursements_last_viewed_${user.uid}`);
      if (savedTimestamp) {
        setLastViewedTimestamp(savedTimestamp);
      }

      // Load emailed alerts
      const savedEmailedAlerts = localStorage.getItem(`disbursements_emailed_${user.uid}`);
      if (savedEmailedAlerts) {
        try {
          const emailed = JSON.parse(savedEmailedAlerts);
          setEmailedAlerts(new Set(emailed));
        } catch (error) {
          console.error('Error loading emailed alerts:', error);
        }
      }

      // Load emailed events
      const savedEmailedEvents = localStorage.getItem(`disbursements_emailed_events_${user.uid}`);
      if (savedEmailedEvents) {
        try {
          const events = JSON.parse(savedEmailedEvents);
          setEmailedEvents(new Set(events));
        } catch (error) {
          console.error('Error loading emailed events:', error);
        }
      }
    }
  }, [user]);

  // Save last viewed timestamp when component unmounts or user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        localStorage.setItem(`disbursements_last_viewed_${user.uid}`, new Date().toISOString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (user) {
        localStorage.setItem(`disbursements_last_viewed_${user.uid}`, new Date().toISOString());
      }
    };
  }, [user]);

  // Mark page as viewed when user interacts
  const markPageAsViewed = () => {
    if (user) {
      const now = new Date().toISOString();
      setLastViewedTimestamp(now);
      localStorage.setItem(`disbursements_last_viewed_${user.uid}`, now);
      // Clear alerts from localStorage when viewed
      const alertsKey = `disbursement_alerts_${user.uid}`;
      localStorage.setItem(alertsKey, JSON.stringify([]));
    }
  };

  // Function to dismiss alerts
  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    setNewDisbursementAlerts(prev => {
      const updatedAlerts = prev.filter(alert => alert.id !== alertId);
      // Update localStorage
      if (user?.uid) {
        const alertsKey = `disbursement_alerts_${user.uid}`;
        localStorage.setItem(alertsKey, JSON.stringify(updatedAlerts));
      }
      return updatedAlerts;
    });
  };

  // Function to dismiss all alerts
  const dismissAllAlerts = () => {
    const allAlertIds = newDisbursementAlerts.map(alert => alert.id);
    setDismissedAlerts(prev => new Set([...prev, ...allAlertIds]));
    setNewDisbursementAlerts([]);
    // Update localStorage
    if (user?.uid) {
      const alertsKey = `disbursement_alerts_${user.uid}`;
      localStorage.setItem(alertsKey, JSON.stringify([]));
    }
  };

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

  // Scroll detail inspector into view when a disbursement is selected
  useEffect(() => {
    if (selectedDisbursement && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDisbursement?.id]);

  if (!user) {
    return (
      <div className="p-5 flex items-center justify-center">
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

  const selectCls =
    'h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors';

  return (
    <div className="space-y-4 max-w-[1400px]" onClick={markPageAsViewed}>
      {/* Header Section */}
      <PageHeader
        title={t('extracted.my_disbursements')}
        highlight={t('extracted.dashboard')}
        subtitle={t('extracted.track_your_payment_disbursements')}
      >
        {newDisbursementAlerts.length > 0 && (
          <span className="mt-1 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums">
            {newDisbursementAlerts.length}
          </span>
        )}
      </PageHeader>

      {/* Disbursement Alerts */}
      <DisbursementAlerts
        alerts={newDisbursementAlerts}
        onDismiss={dismissAlert}
        onDismissAll={dismissAllAlerts}
        t={t}
      />

      {/* Financial Summary */}
      <StatBand
        cells={[
          {
            label: t('extracted.total_approved'),
            value: formatCurrency(total),
            sub: <span className="theme-text-muted">{t('extracted.across_disbursements')} {filteredDisbursements.length}</span>,
          },
          {
            label: t('extracted.completed'),
            value: formatCurrency(completedAmount),
            sub: <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{overallCompletionPercentage}% received</span>,
          },
          {
            label: t('extracted.pending'),
            value: formatCurrency(pendingAmount),
            sub: <span className="font-medium text-red-600 dark:text-red-400 tabular-nums">{100 - overallCompletionPercentage}% remaining</span>,
          },
          {
            label: t('extracted.successful_disbursements'),
            value: filteredDisbursements.filter(d => d.status === 'completed').length,
            sub: <span className="theme-text-muted">{t('extracted.of')} {filteredDisbursements.length}</span>,
          },
        ]}
      />

      {/* Progressive Payments Summary */}
      {progressiveDisbursements.length > 0 && (
        <StatBand
          cols={3}
          cells={[
            {
              label: t('disbursements.progressive_total'),
              value: formatCurrency(totalProgressiveAmount),
              sub: <span className="theme-text-muted">{progressiveDisbursements.length} {t('extracted.disbursements_found')}</span>,
            },
            {
              label: t('disbursements.installments_released'),
              value: formatCurrency(completedProgressiveAmount),
              sub: (
                <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {totalProgressiveAmount > 0
                    ? Math.round((completedProgressiveAmount / totalProgressiveAmount) * 100)
                    : 0}% released
                </span>
              ),
            },
            {
              label: t('disbursements.installments_remaining'),
              value: formatCurrency(pendingProgressiveAmount),
              sub: (
                <span className="font-medium text-red-600 dark:text-red-400 tabular-nums">
                  {totalProgressiveAmount > 0
                    ? Math.round((pendingProgressiveAmount / totalProgressiveAmount) * 100)
                    : 0}% remaining
                </span>
              ),
            },
          ]}
        />
      )}

      {/* Disbursement History */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b theme-border-glass">
          <div className="min-w-0 mr-auto">
            <h2 className="text-sm font-semibold theme-text-primary truncate">
              {t('extracted.disbursement_history')}{' '}
              <span className="theme-text-muted font-normal">({filteredDisbursements.length})</span>
            </h2>
            <p className="text-xs theme-text-muted mt-0.5 truncate">
              {t('extracted.review_recent_payments')}
            </p>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'all' | 'week' | 'month' | 'quarter')}
            className={selectCls}
          >
            <option value="all">{t('extracted.all_time')}</option>
            <option value="week">{t('extracted.last_7_days')}</option>
            <option value="month">{t('extracted.last_30_days')}</option>
            <option value="quarter">{t('extracted.last_90_days')}</option>
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled')}
            className={selectCls}
          >
            <option value="all">{t('extracted.all')}</option>
            <option value="pending">{t('extracted.pending')}</option>
            <option value="processing">{t('extracted.processing')}</option>
            <option value="completed">{t('extracted.completed')}</option>
            <option value="failed">{t('extracted.failed')}</option>
            <option value="cancelled">{t('extracted.cancelled')}</option>
          </select>
        </div>

        {/* Disbursements List */}
        <div className="p-2.5 space-y-2 max-h-[70vh] overflow-y-auto">
          <AnimatePresence>
            {filteredDisbursements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 theme-bg-glass rounded-lg border theme-border-glass"
              >
                <div className="mx-auto w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center mb-4">
                  <Banknote className="w-8 h-8 theme-text-muted" />
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
                <DisbursementCard
                  key={disbursement.id}
                  disbursement={disbursement}
                  isSelected={selectedDisbursement?.id === disbursement.id}
                  onSelect={setSelectedDisbursement}
                  index={index}
                  t={t}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Disbursement Inspector */}
      {selectedDisbursement && (
        <DisbursementInspector
          disbursement={selectedDisbursement}
          beneficiary={userBeneficiary}
          onClose={() => setSelectedDisbursement(null)}
          innerRef={detailRef}
          t={t}
        />
      )}
    </div>
  );
}
