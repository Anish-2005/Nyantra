'use client';

import { motion } from 'framer-motion';
import { Calendar, CreditCard, DollarSign, Eye, RotateCcw, Scale, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { formatCurrency, formatDateGB, getPriorityColor, getStatusColor, getStatusIcon } from './shared';

interface Props {
  items: readonly DisbursementRaw[];
  onView: (record: DisbursementRaw) => void;
  onDelete: (record: DisbursementRaw) => void;
  renderInstallmentControls: (record: DisbursementRaw) => ReactNode;
}

/** CARDS VIEW — grid of disbursement cards. */
export function DisbursementsCardGrid({ items, onView, onDelete, renderInstallmentControls }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {items.map((disbursement, idx) => {
        const StatusIcon = getStatusIcon(disbursement.status);
        return (
          <motion.div
            key={disbursement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="theme-bg-glass theme-border-glass border rounded-xl p-4 cursor-pointer"
            onClick={() => onView(disbursement)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white font-bold">
                  {(disbursement.beneficiaryName ?? '')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-medium theme-text-primary">{disbursement.beneficiaryName}</p>
                  <p className="text-xs theme-text-muted">{disbursement.id}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(theme, disbursement.priority)}`}
              >
                {disbursement.priority}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm theme-text-secondary">
                <CreditCard className="w-4 h-4" />
                <span className="font-mono">{disbursement.transactionId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm theme-text-secondary">
                <Scale className="w-4 h-4" />
                <span>{disbursement.actType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm theme-text-secondary">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">
                  {disbursement.isProgressivePayment
                    ? `${formatCurrency(disbursement.disbursedAmount || 0)} / ${formatCurrency(disbursement.reliefAmount)}`
                    : formatCurrency(disbursement.reliefAmount)}
                </span>
              </div>
              {disbursement.isProgressivePayment && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs theme-text-muted mb-1">
                    <span>Progress</span>
                    <span>{disbursement.disbursementProgress?.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${disbursement.disbursementProgress || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs theme-text-muted mt-1">
                    {disbursement.completedInstallments || 0} of {disbursement.totalInstallments || 3} installments
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm theme-text-secondary">
                <Calendar className="w-4 h-4" />
                <span>{formatDateGB(disbursement.initiatedDate as string | null)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t theme-border-glass">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(theme, disbursement.status)}`}
              >
                <StatusIcon className="w-3 h-3" />
                {(disbursement.status ?? '').replace('-', ' ')}
              </span>
              {disbursement.actType?.toLowerCase().includes('poa') && (
                <div className="flex flex-col gap-1">{renderInstallmentControls(disbursement)}</div>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(disbursement);
                  }}
                  className="p-1.5 rounded-lg hover:theme-bg-card theme-text-primary"
                  style={{
                    background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined,
                    border:
                      theme === 'light'
                        ? '1px solid rgba(226, 232, 240, 0.8)'
                        : 'none',
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
                {disbursement.status === 'failed' && (
                  <button
                    className="p-1.5 rounded-lg hover:theme-bg-card theme-text-primary"
                    style={{
                      background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined,
                      border:
                        theme === 'light'
                          ? '1px solid rgba(226, 232, 240, 0.8)'
                          : 'none',
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(disbursement);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
                  style={{
                    background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined,
                    border:
                      theme === 'light'
                        ? '1px solid rgba(226, 232, 240, 0.8)'
                        : 'none',
                  }}
                  title={t('extracted.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
