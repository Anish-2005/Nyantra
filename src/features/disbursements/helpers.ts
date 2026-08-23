"use client";
import { CheckCircle, Clock, PlayCircle, X, XCircle } from 'lucide-react';

// Disbursement data type
export interface Disbursement {
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

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

// New-update alert pushed when a disbursement/installment/status changes
export interface DisbursementAlert {
  id: string;
  type: 'new_disbursement' | 'installment_completed' | 'status_completed';
  disbursement: Disbursement;
  message: string;
  timestamp: string;
}

export const PILL_BASE =
  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getStatusColor = (status: string) => {
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

const STATUS_ICONS = {
  'pending': Clock,
  'processing': PlayCircle,
  'completed': CheckCircle,
  'failed': XCircle,
  'cancelled': X
} as const;

export const getStatusIcon = (status: string) =>
  STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;

const STATUS_TEXT_KEYS: Record<string, string> = {
  'pending': 'extracted.pending',
  'processing': 'extracted.processing',
  'completed': 'extracted.completed',
  'failed': 'extracted.failed',
  'cancelled': 'extracted.cancelled'
};

export const getTranslatedStatus = (t: TranslateFn, status: string) => {
  const key = STATUS_TEXT_KEYS[status];
  return key ? t(key) : status;
};

export async function sendDisbursementNotificationEmail(alert: DisbursementAlert, beneficiaryEmail: string) {
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
