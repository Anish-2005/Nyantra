'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle, Calendar, CreditCard, Download, Eye, MapPin, MoreVertical,
  Receipt, RotateCcw, Scale, Trash2,
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { formatCurrency, formatDateGB, getPriorityColor, getStatusColor, getStatusIcon } from './shared';

interface Props {
  items: readonly DisbursementRaw[];
  onView: (record: DisbursementRaw) => void;
  onDelete: (record: DisbursementRaw) => void;
}

/** Mobile "table" layout (cards), exact port of the legacy branch. */
export function MobileDisbursementsList({ items, onView, onDelete }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="p-3 space-y-3">
      {items.map((disbursement, idx) => {
        const StatusIcon = getStatusIcon(disbursement.status);

        return (
          <motion.div
            key={disbursement.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            whileTap={{ scale: 0.995 }}
            className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
            onClick={() => onView(disbursement)}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                  {(disbursement.beneficiaryName ?? '')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold theme-text-primary truncate">
                    {disbursement.beneficiaryName}
                  </p>
                  <p className="text-xs theme-text-muted truncate">{disbursement.id}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(theme, disbursement.priority ?? '')}`}
              >
                {(disbursement.priority ?? '-').toString().toUpperCase()}
              </span>
            </div>

            {/* Amount Display - Prominent */}
            <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs theme-text-muted mb-0.5">
                    {t('extracted.relief_amount')}{' '}
                  </p>
                  <p className="text-lg font-bold theme-text-primary">
                    {formatCurrency(disbursement.reliefAmount)}
                  </p>
                </div>
                {disbursement.status === 'completed' && (
                  <div className="text-right">
                    <p className="text-xs theme-text-muted mb-0.5">
                      {t('extracted.net_amount')}{' '}
                    </p>
                    <p className="text-sm font-semibold text-green-400">
                      {formatCurrency(disbursement.netAmount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="theme-text-muted flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  {t('transaction_id')}
                </span>
                <span className="theme-text-primary font-mono text-[10px]">
                  {disbursement.transactionId}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="theme-text-muted flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  {t('act_type')}
                </span>
                <span className="theme-text-primary font-medium">{disbursement.actType}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="theme-text-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {t('location')}
                </span>
                <span className="theme-text-primary font-medium">{disbursement.district}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="theme-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('initiated_date')}
                </span>
                <span className="theme-text-primary font-medium font-mono text-[10px]">
                  {formatDateGB(disbursement.initiatedDate as string | null)}
                </span>
              </div>

              {disbursement.utrNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="theme-text-muted flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    {t('utr_number')}
                  </span>
                  <span className="theme-text-primary font-mono text-[10px]">
                    {disbursement.utrNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge with Retry Info */}
            <div className="mb-3 pb-3 border-b theme-border-glass">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(theme, disbursement.status)}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="capitalize">{(disbursement.status ?? '').replace('-', ' ')}</span>
              </span>
              {(disbursement.retryCount ?? 0) > 0 && (
                <p className="text-xs theme-text-muted mt-2 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  {t('extracted.retries')}: {disbursement.retryCount}
                </p>
              )}
              {disbursement.failureReason && (
                <p className="text-xs text-red-400 mt-2 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{disbursement.failureReason}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(disbursement);
                }}
                className="px-2 py-2 rounded-lg accent-gradient text-white text-xs font-medium flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
                title={t('extracted.view')}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('extracted.view')} </span>
              </button>
              {disbursement.status === 'failed' ? (
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 active:scale-95 transition-all"
                  style={{
                    backgroundColor:
                      theme === 'light' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(34, 197, 94, 0.2)',
                    color: theme === 'light' ? '#15803d' : '#86efac',
                    border:
                      theme === 'light'
                        ? '1px solid rgba(22, 163, 74, 0.3)'
                        : '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                  title={t('extracted.retry')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('extracted.retry')} </span>
                </button>
              ) : (
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-500/10 active:scale-95 transition-all theme-text-primary"
                  style={theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
                  title={t('extracted.receipt')}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('extracted.receipt')} </span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(disbursement);
                }}
                className="px-2 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1 hover:bg-red-500/10 active:scale-95 transition-all theme-text-primary"
                style={theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
                title={t('extracted.delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('extracted.delete')} </span>
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-2 rounded-lg theme-bg-card theme-border-glass border text-xs font-medium flex items-center justify-center gap-1 hover:bg-gray-500/10 active:scale-95 transition-all theme-text-primary"
                style={theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
                title={t('extracted.more')}
              >
                <MoreVertical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('extracted.more')} </span>
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
