'use client';

import { motion } from 'framer-motion';
import {
  Download, Edit, Fingerprint, MapPin, Phone, PlayCircle, RotateCcw, User, X,
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { formatCurrency, formatDateGB, getStatusColor, getStatusIcon, lightSurface, translateStatus } from './shared';

interface Props {
  record: DisbursementRaw;
  onClose: () => void;
  onEdit: (record: DisbursementRaw) => void;
}

export function DisbursementDetailsPanel({ record, onClose, onEdit }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();
  const StatusIcon = getStatusIcon(record.status);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 theme-bg-card theme-border-glass border rounded-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold theme-text-primary">{record.id}</h2>
            <p className="theme-text-muted">
              {t('extracted.disbursement_details') || 'वितरण विवरण'} • {record.actType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(record)}
              className="p-2 rounded-lg theme-bg-glass hover:bg-blue-500/20"
            >
              <Edit className="w-5 h-5 theme-text-primary" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/20"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Beneficiary Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.beneficiary_information')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <User className="w-5 h-5 theme-text-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs theme-text-muted">{t('extracted.beneficiary_name')}</p>
                  <p className="font-medium theme-text-primary break-words">{record.beneficiaryName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <Fingerprint className="w-5 h-5 theme-text-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs theme-text-muted">{t('extracted.aadhaar_number')}</p>
                  <p className="font-medium theme-text-primary break-all">{record.aadhaarNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <Phone className="w-5 h-5 theme-text-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs theme-text-muted">{t('extracted.phone_number')}</p>
                  <p className="font-medium theme-text-primary break-all">{record.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <MapPin className="w-5 h-5 theme-text-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs theme-text-muted">{t('extracted.location')}</p>
                  <p className="font-medium theme-text-primary break-words">
                    {record.district}, {record.state}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.transaction_details_1')}</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <p className="text-xs theme-text-muted mb-1">{t('extracted.transaction_id')}</p>
                <p className="font-medium theme-text-primary font-mono break-all">{record.transactionId}</p>
              </div>
              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <p className="text-xs theme-text-muted mb-1">{t('extracted.utr_number')}</p>
                <p className="font-medium theme-text-primary font-mono break-all">
                  {record.utrNumber || 'उपलब्ध नहीं'}
                </p>
              </div>
              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <p className="text-xs theme-text-muted mb-1">{t('extracted.payment_method')}</p>
                <p className="font-medium theme-text-primary">{record.paymentMethod}</p>
              </div>
              <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
                <p className="text-xs theme-text-muted mb-1">{t('extracted.relief_amount')}</p>
                <p className="font-semibold text-lg theme-text-primary">{formatCurrency(record.reliefAmount)}</p>
              </div>
            </div>
          </div>

          {/* Status and Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text-primary">
              {t('extracted.timeline_1')} & {t('extracted.disbursement_status')}
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                <p className="text-sm theme-text-muted mb-2">{t('extracted.disbursement_status')}</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(theme, record.status)}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {translateStatus(t, record.status)}
                </span>
                {record.failureReason && (
                  <p className="text-sm theme-text-muted mt-2">
                    <strong>{t('extracted.failure_reason')}</strong> {record.failureReason}
                  </p>
                )}
                {(record.retryCount ?? 0) > 0 && (
                  <p className="text-sm theme-text-muted mt-1">
                    <strong>{t('extracted.retry_attempts')}</strong> {record.retryCount}
                  </p>
                )}
              </div>
              <div className="p-4 rounded-lg theme-bg-glass border theme-border-glass">
                <p className="text-sm theme-text-muted mb-2">{t('timeline_1')}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="theme-text-primary">{t('extracted.initiated')}</span>
                    <span className="theme-text-muted">{formatDateGB(record.initiatedDate as string | null)}</span>
                  </div>
                  {record.completedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-primary">{t('extracted.completed')}</span>
                      <span className="theme-text-muted">{formatDateGB(record.completedDate as string | null)}</span>
                    </div>
                  )}
                  {record.disbursementDate && (
                    <div className="flex justify-between text-sm">
                      <span className="theme-text-primary">{t('extracted.disbursed')}</span>
                      <span className="theme-text-muted">{formatDateGB(record.disbursementDate as string | null)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t theme-border-glass">
          {record.status === 'failed' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(34, 197, 94, 0.2)',
                color: theme === 'light' ? '#15803d' : '#86efac',
                border:
                  theme === 'light'
                    ? '1px solid rgba(22, 163, 74, 0.3)'
                    : '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <RotateCcw className="w-5 h-5" />
              {t('extracted.retry_disbursement')}
            </motion.button>
          )}
          {record.status === 'pending' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.2)',
                color: theme === 'light' ? '#1d4ed8' : '#93c5fd',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <PlayCircle className="w-5 h-5" />
              {t('extracted.initiate_payment')}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border font-semibold flex items-center justify-center gap-2 theme-text-primary"
            style={lightSurface(theme)}
          >
            <Download className="w-5 h-5" />
            {t('extracted.download_receipt')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.2)',
              color: theme === 'light' ? '#dc2626' : '#fca5a5',
              border:
                theme === 'light'
                  ? '1px solid rgba(220, 38, 38, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <X className="w-5 h-5" />
            {t('extracted.cancel_disbursement')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
