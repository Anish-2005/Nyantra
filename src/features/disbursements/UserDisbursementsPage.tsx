"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingState from '@/components/LoadingState';
import { Banknote, CheckCircle, Clock, PlayCircle, X, XCircle } from 'lucide-react';

const PILL_BASE =
  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide';

const Item = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`min-w-0 ${className || ''}`}>
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 break-words">{children}</dd>
  </div>
);

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
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [userBeneficiary, setUserBeneficiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>('all');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const { t } = useLocale();
  const detailRef = useRef<HTMLDivElement>(null);

  // Alert system for new disbursements/installments
  const [newDisbursementAlerts, setNewDisbursementAlerts] = useState<any[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<string | null>(null);
  const [emailedAlerts, setEmailedAlerts] = useState<Set<string>>(new Set());
  const [emailedEvents, setEmailedEvents] = useState<Set<string>>(new Set()); // Track specific disbursement events

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  async function sendDisbursementNotificationEmail(alert: any, beneficiaryEmail: string) {
    if (!beneficiaryEmail) return;

    try {
      const subject = alert.type === 'new_disbursement'
        ? 'New Disbursement Initiated - Nyantra'
        : alert.type === 'installment_completed'
        ? 'Installment Payment Received - Nyantra'
        : 'Payment Completed - Nyantra';

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: beneficiaryEmail,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Nyantra</h1>
                <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Direct Benefit Transfer System</p>
              </div>

              <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                <h2 style="color: #1e40af; margin-top: 0;">
                  ${alert.type === 'new_disbursement' ? 'New Disbursement Initiated' :
                    alert.type === 'installment_completed' ? 'Installment Payment Received' :
                    'Payment Completed'}
                </h2>

                <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                  ${alert.message}
                </p>

                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                  <h3 style="margin-top: 0; color: #1e40af;">Disbursement Details:</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li style="padding: 5px 0;"><strong>Transaction ID:</strong> ${alert.disbursement.transactionId}</li>
                    <li style="padding: 5px 0;"><strong>Amount:</strong> ₹${alert.disbursement.reliefAmount?.toLocaleString('en-IN')}</li>
                    <li style="padding: 5px 0;"><strong>Status:</strong> ${alert.disbursement.status}</li>
                    <li style="padding: 5px 0;"><strong>Date:</strong> ${new Date(alert.timestamp).toLocaleDateString('en-IN')}</li>
                    ${alert.disbursement.actType ? `<li style="padding: 5px 0;"><strong>Act Type:</strong> ${alert.disbursement.actType}</li>` : ''}
                  </ul>
                </div>

                ${alert.type === 'installment_completed' ? `
                  <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <p style="margin: 0; color: #065f46; font-weight: 500;">
                      ✅ Installment ${alert.disbursement.completedInstallments} of ${alert.disbursement.totalInstallments} has been successfully disbursed to your account.
                    </p>
                  </div>
                ` : ''}

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://nyantra.vercel.app'}/dashboard/disbursements"
                     style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                    View Details
                  </a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p>This is an automated notification from the Nyantra Direct Benefit Transfer System.</p>
                <p>If you have any questions, please contact your assigned officer or use the grievance system.</p>
                <p style="margin-top: 10px;">
                  <a href="${window.location.origin}/dashboard/grievance" style="color: #3b82f6; text-decoration: none;">Submit a Grievance</a> |
                  <a href="${window.location.origin}/dashboard" style="color: #3b82f6; text-decoration: none;">Dashboard</a>
                </p>
              </div>
            </div>
          `
        }),
      });

      if (!response.ok) {
        console.error('Failed to send disbursement notification email');
      } else {
        console.log('Disbursement notification email sent successfully');
      }
    } catch (error) {
      console.error('Error sending disbursement notification email:', error);
    }
  }

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
        const newAlerts: any[] = [];
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'failed':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
            {t('extracted.my_disbursements')} <span className="text-accent-gradient">{t('extracted.dashboard')}</span>
          </h1>
          <p className="text-xs theme-text-muted mt-0.5 truncate">
            {t('extracted.track_your_payment_disbursements')}
          </p>
        </div>
        {newDisbursementAlerts.length > 0 && (
          <span className="mt-1 shrink-0 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums">
            {newDisbursementAlerts.length}
          </span>
        )}
      </div>

      {/* Disbursement Alerts */}
      <AnimatePresence>
        {newDisbursementAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('disbursements.new_updates')}
              </h3>
              <button
                onClick={dismissAllAlerts}
                className="h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
              >
                {t('disbursements.dismiss_all')}
              </button>
            </div>

            {newDisbursementAlerts.slice(0, 3).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-start justify-between gap-3 p-3.5 rounded-lg border theme-border-glass theme-bg-card transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        alert.type === 'new_disbursement'
                          ? 'bg-blue-500'
                          : alert.type === 'installment_completed'
                          ? 'bg-emerald-500'
                          : 'bg-purple-500'
                      }`}
                    />
                    <span className="text-[13px] font-medium theme-text-primary">
                      {alert.type === 'new_disbursement' && t('disbursements.alert_new')}
                      {alert.type === 'installment_completed' && t('disbursements.alert_installment')}
                      {alert.type === 'status_completed' && t('disbursements.alert_completed')}
                    </span>
                  </div>
                  <p className="text-xs theme-text-secondary">{alert.message}</p>
                  <p className="text-[11px] theme-text-muted tabular-nums mt-0.5">
                    {formatDate(alert.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            {newDisbursementAlerts.length > 3 && (
              <p className="text-xs theme-text-muted text-center">
                +{newDisbursementAlerts.length - 3} {t('disbursements.more_updates')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
        <div className="theme-bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
            {t('extracted.total_approved')}
          </p>
          <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
            {formatCurrency(total)}
          </p>
          <p className="text-[11px] theme-text-muted mt-0.5">
            {t('extracted.across_disbursements')} {filteredDisbursements.length}
          </p>
        </div>

        <div className="theme-bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
            {t('extracted.completed')}
          </p>
          <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
            {formatCurrency(completedAmount)}
          </p>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {overallCompletionPercentage}% received
          </p>
        </div>

        <div className="theme-bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
            {t('extracted.pending')}
          </p>
          <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
            {formatCurrency(pendingAmount)}
          </p>
          <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
            {100 - overallCompletionPercentage}% remaining
          </p>
        </div>

        <div className="theme-bg-card p-3.5">
          <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
            {t('extracted.successful_disbursements')}
          </p>
          <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
            {filteredDisbursements.filter(d => d.status === 'completed').length}
          </p>
          <p className="text-[11px] theme-text-muted mt-0.5">
            {t('extracted.of')} {filteredDisbursements.length}
          </p>
        </div>
      </div>

      {/* Progressive Payments Summary */}
      {progressiveDisbursements.length > 0 && (
        <div className="grid grid-cols-3 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
              {t('disbursements.progressive_total')}
            </p>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
              {formatCurrency(totalProgressiveAmount)}
            </p>
            <p className="text-[11px] theme-text-muted mt-0.5">
              {progressiveDisbursements.length} {t('extracted.disbursements_found')}
            </p>
          </div>

          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
              {t('disbursements.installments_released')}
            </p>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
              {formatCurrency(completedProgressiveAmount)}
            </p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
              {totalProgressiveAmount > 0
                ? Math.round((completedProgressiveAmount / totalProgressiveAmount) * 100)
                : 0}% released
            </p>
          </div>

          <div className="theme-bg-card p-3.5">
            <p className="text-[11px] uppercase tracking-wider theme-text-muted truncate">
              {t('disbursements.installments_remaining')}
            </p>
            <p className="text-xl font-semibold tabular-nums theme-text-primary mt-1">
              {formatCurrency(pendingProgressiveAmount)}
            </p>
            <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
              {totalProgressiveAmount > 0
                ? Math.round((pendingProgressiveAmount / totalProgressiveAmount) * 100)
                : 0}% remaining
            </p>
          </div>
        </div>
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
              filteredDisbursements.map((disbursement, index) => {
                const StatusIcon = getStatusIcon(disbursement.status);
                const isSelected = selectedDisbursement?.id === disbursement.id;
                return (
                  <motion.div
                    key={disbursement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.15) }}
                    onClick={() => setSelectedDisbursement(disbursement)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[var(--accent-primary)] theme-bg-glass'
                        : 'theme-border-glass hover:theme-bg-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="w-8 h-8 rounded-md theme-bg-glass flex items-center justify-center theme-text-primary text-[11px] font-semibold shrink-0">
                            {disbursement.beneficiaryName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate theme-text-primary leading-tight">
                              {disbursement.beneficiaryName}
                            </h3>
                            <p className="text-xs theme-text-muted truncate leading-tight mt-0.5">
                              {disbursement.id}{disbursement.transactionId ? ` • ${disbursement.transactionId}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2.5">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.location')}</p>
                            <p className="font-medium text-sm theme-text-primary truncate">{disbursement.district}, {disbursement.state}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.act_type')}</p>
                            <p className="font-medium text-sm theme-text-primary truncate">{disbursement.actType}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.payment_method')}</p>
                            <p className="font-medium text-sm theme-text-primary truncate">{disbursement.paymentMethod || '—'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider theme-text-muted">{t('extracted.initiated_date')}</p>
                            <p className="font-medium text-sm theme-text-primary tabular-nums truncate">{formatDate(disbursement.initiatedDate)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`${PILL_BASE} ${getStatusColor(disbursement.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {getStatusText(disbursement.status)}
                          </span>
                          {disbursement.isProgressivePayment && (
                            <span className={`${PILL_BASE} theme-bg-glass theme-text-secondary shrink-0`}>
                              {disbursement.completedInstallments || 0}/{disbursement.totalInstallments || 3}{' '}
                              {t('disbursements.installments_word')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums theme-text-primary">
                          {formatCurrency(disbursement.disbursedAmount || 0)}
                        </p>
                        {disbursement.isProgressivePayment && disbursement.disbursementProgress !== undefined && (
                          <p className="text-[11px] theme-text-muted tabular-nums mt-0.5">
                            / {formatCurrency(disbursement.reliefAmount)}
                          </p>
                        )}
                        {disbursement.isProgressivePayment && (
                          <div className="mt-1.5 w-28 sm:w-32 ml-auto">
                            <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                                style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                              />
                            </div>
                            <p className="text-[11px] theme-text-accent tabular-nums mt-1">
                              {(disbursement.disbursementProgress ?? 0).toFixed(2)}
                              {t('disbursements.pct_disbursed')}
                            </p>
                          </div>
                        )}
                        {disbursement.status === 'completed' && !disbursement.isProgressivePayment && (
                          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                            ✓ {t('extracted.disbursed')} {formatCurrency(disbursement.disbursedAmount)}
                          </p>
                        )}                        {disbursement.status === 'failed' && disbursement.failureReason && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 max-w-[180px] ml-auto">
                            {disbursement.failureReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Disbursement Inspector */}
      {selectedDisbursement && (
        <div
          ref={detailRef}
          className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden scroll-mt-20"
          aria-live="polite"
        >
          {/* Header Bar */}
          <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
            <div className="min-w-0 flex items-center gap-2.5">
              <h2 className="font-mono text-sm font-semibold theme-text-primary truncate">
                {selectedDisbursement.id}
              </h2>
              <span className={`${PILL_BASE} shrink-0 ${getStatusColor(selectedDisbursement.status)}`}>
                {getStatusText(selectedDisbursement.status)}
              </span>
            </div>
            <button
              onClick={() => setSelectedDisbursement(null)}
              className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
              aria-label={t('extracted.close_sidebar') || 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-3.5 space-y-4">
            {/* Payment Overview */}
            <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <Item label={t('extracted.amount')}>
                {selectedDisbursement.isProgressivePayment
                  ? formatCurrency(selectedDisbursement.disbursedAmount || 0)
                  : formatCurrency(selectedDisbursement.netAmount)}
                {selectedDisbursement.isProgressivePayment && selectedDisbursement.reliefAmount > 0 && (
                  <span className="text-[11px] theme-text-muted font-normal"> / {formatCurrency(selectedDisbursement.reliefAmount)}</span>
                )}
              </Item>
              <Item label={t('extracted.relief_amount')}>{formatCurrency(selectedDisbursement.reliefAmount)}</Item>
              <Item label={t('extracted.net_amount')}>{formatCurrency(selectedDisbursement.netAmount)}</Item>
              <Item label={t('extracted.transaction_fee')}>{formatCurrency(selectedDisbursement.transactionFee)}</Item>
              <Item label={t('extracted.payment_method')}>{selectedDisbursement.paymentMethod || '—'}</Item>
              <Item label={t('extracted.act_type')}>{selectedDisbursement.actType}</Item>
              <Item label={t('extracted.initiated_date')}>
                <span className="tabular-nums">{formatDate(selectedDisbursement.initiatedDate)}</span>
              </Item>
              {selectedDisbursement.completedDate && (
                <Item label={t('extracted.completed_date')}>
                  <span className="tabular-nums">{formatDate(selectedDisbursement.completedDate)}</span>
                </Item>
              )}
              {selectedDisbursement.applicationId && (
                <Item label={t('extracted.application_id') || 'Application'}>
                  <span className="font-mono">{selectedDisbursement.applicationId}</span>
                </Item>
              )}
            </dl>

            {/* Progressive Payment Schedule */}
            {selectedDisbursement.isProgressivePayment && (
              <div className="pt-3 border-t theme-border-glass">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                    Installment Schedule ·{' '}
                    {(selectedDisbursement.disbursementProgress ?? 0).toFixed(2)}%
                  </p>
                  <span className="text-xs theme-text-muted tabular-nums shrink-0">
                    {selectedDisbursement.completedInstallments || 0} / {selectedDisbursement.totalInstallments || 3}{' '}
                    {t('extracted.completed')}
                  </span>
                </div>

                <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                    style={{ width: `${selectedDisbursement.disbursementProgress || 0}%` }}
                  />
                </div>

                {(() => {
                  const count =
                    selectedDisbursement.installmentAmounts?.length ||
                    selectedDisbursement.installmentPercentages?.length ||
                    selectedDisbursement.totalInstallments || 0;
                  const done = selectedDisbursement.completedInstallments || 0;
                  if (count <= 0) return null;
                  return (
                    <div className="space-y-1">
                      {Array.from({ length: count }, (_, i) => {
                        const isDone = i < done;
                        const amount =
                          selectedDisbursement.installmentAmounts?.[i] ??
                          Math.round(
                            (selectedDisbursement.reliefAmount * (selectedDisbursement.installmentPercentages?.[i] ?? 0)) / 100
                          );
                        const pct = selectedDisbursement.installmentPercentages?.[i];
                        return (
                          <div key={i} className="flex items-center gap-2.5 py-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isDone ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                            <span className="text-[13px] theme-text-primary flex-1 min-w-0 truncate">
                              {t('disbursements.installment_word')} {i + 1}
                            </span>
                            {pct !== undefined && (
                              <span className="text-[11px] theme-text-muted tabular-nums">{pct}%</span>
                            )}
                            <span
                              className={`text-[11px] font-medium tabular-nums shrink-0 ${
                                isDone ? 'text-emerald-600 dark:text-emerald-400' : 'theme-text-muted'
                              }`}
                            >
                              {formatCurrency(amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {selectedDisbursement.nextInstallmentAmount && selectedDisbursement.nextInstallmentPercentage && (
                  <p className="text-[11px] theme-text-muted tabular-nums mt-2.5">
                    {t('extracted.next_installment')}: {formatCurrency(selectedDisbursement.nextInstallmentAmount)} ({selectedDisbursement.nextInstallmentPercentage}%)
                  </p>
                )}
              </div>
            )}

            {/* Beneficiary Information */}
            <div className="pt-3 border-t theme-border-glass">
              <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
                {t('extracted.beneficiary_information')}
              </p>
              <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                <Item label={t('extracted.phone_number')}>
                  {userBeneficiary?.phone || t('extracted.not_provided')}
                </Item>
                <Item label={t('extracted.email')}>
                  {userBeneficiary?.email || t('extracted.not_provided')}
                </Item>
                <Item label={t('extracted.bank_account')}>
                  <span className="font-mono">{userBeneficiary?.bankAccount || t('extracted.not_provided')}</span>
                </Item>
                <Item label={t('extracted.ifsc_code')}>
                  <span className="font-mono">{userBeneficiary?.ifsc || t('extracted.not_provided')}</span>
                </Item>
                <Item
                  label={t('extracted.address')}
                  className="col-span-2 md:col-span-4 lg:col-span-6"
                >
                  {userBeneficiary?.address || t('extracted.not_provided')}
                </Item>
              </dl>
            </div>

            {/* Transaction Identifiers */}
            {(selectedDisbursement.transactionId || selectedDisbursement.utrNumber) && (
              <div className="pt-3 border-t theme-border-glass">
                <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5">
                  {t('extracted.transaction_details') || 'Transaction Details'}
                </p>
                <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                  {selectedDisbursement.transactionId && (
                    <Item label={t('extracted.transaction_id')} className="col-span-2 md:col-span-2 lg:col-span-3">
                      <span className="font-mono break-all">{selectedDisbursement.transactionId}</span>
                    </Item>
                  )}
                  {selectedDisbursement.utrNumber && (
                    <Item label={t('extracted.utr_number')} className="col-span-2 md:col-span-2 lg:col-span-3">
                      <span className="font-mono break-all">{selectedDisbursement.utrNumber}</span>
                    </Item>
                  )}
                </dl>
              </div>
            )}

            {/* Officer Notes / Internal Reference (read-only) */}
            {(selectedDisbursement.officerNotes || selectedDisbursement.internalReference) && (
              <div className="pt-3 border-t theme-border-glass">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {selectedDisbursement.officerNotes && (
                    <Item label={t('extracted.officer_notes')}>
                      <span className="font-normal leading-relaxed">{selectedDisbursement.officerNotes}</span>
                    </Item>
                  )}
                  {selectedDisbursement.internalReference && (
                    <Item label={t('extracted.internal_reference')}>
                      <span className="font-mono">{selectedDisbursement.internalReference}</span>
                    </Item>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
