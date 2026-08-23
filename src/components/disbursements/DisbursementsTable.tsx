'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Eye, MoreVertical, RotateCcw, Trash2 } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { formatCurrency, formatDateGB, getStatusColor, getStatusIcon, lightSurface } from './shared';

interface Props {
  items: readonly DisbursementRaw[];
  onView: (record: DisbursementRaw) => void;
  onDelete: (record: DisbursementRaw) => void;
  renderInstallmentCell: (record: DisbursementRaw) => ReactNode;
}

export function DisbursementsTable({ items, onView, onDelete, renderInstallmentCell }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="theme-bg-glass border-b theme-border-glass">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.disbursement_id')}{' '}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.beneficiary')}{' '}
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.transaction_id')}{' '}
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.act_type')}{' '}
            </th>
            <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.amount')}{' '}
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              Installments
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.status')}{' '}
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.initiated_date')}{' '}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold theme-text-primary">
              {t('extracted.actions')}{' '}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((disbursement, idx) => {
            const StatusIcon = getStatusIcon(disbursement.status);
            return (
              <motion.tr
                key={disbursement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b theme-border-glass hover:theme-bg-glass transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium theme-text-primary">{disbursement.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-bold">
                      {(disbursement.beneficiaryName ?? '')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium theme-text-primary">{disbursement.beneficiaryName}</p>
                      <p className="text-xs theme-text-muted">{disbursement.district}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary font-mono">
                  {disbursement.transactionId}
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium theme-bg-glass theme-text-primary border theme-border-glass"
                    style={{
                      background:
                        theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : undefined,
                    }}
                  >
                    {disbursement.actType}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold theme-text-primary">
                      {formatCurrency(disbursement.disbursedAmount || 0)}
                      {disbursement.isProgressivePayment && (
                        <span className="text-xs theme-text-muted ml-1">
                          / {formatCurrency(disbursement.reliefAmount)}
                        </span>
                      )}
                    </p>
                    {disbursement.isProgressivePayment && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs theme-text-muted mb-1">
                          <span>Progress</span>
                          <span>{disbursement.disbursementProgress?.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                    {!disbursement.isProgressivePayment && disbursement.status === 'completed' && (
                      <p className="text-xs theme-text-muted">Net: {formatCurrency(disbursement.netAmount)}</p>
                    )}
                  </div>
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  {disbursement.actType?.toLowerCase().includes('poa') ? (
                    <div className="flex flex-col gap-2">{renderInstallmentCell(disbursement)}</div>
                  ) : (
                    <span className="text-xs theme-text-muted">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(theme, disbursement.status)}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {(disbursement.status ?? '').replace('-', ' ')}
                  </span>
                  {(disbursement.retryCount ?? 0) > 0 && (
                    <p className="text-xs theme-text-muted mt-1">
                      {t('extracted.retries')}: {disbursement.retryCount}
                    </p>
                  )}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm theme-text-primary">
                  {formatDateGB(disbursement.initiatedDate as string | null)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onView(disbursement)}
                      className="p-1.5 rounded-lg theme-bg-glass hover:accent-gradient hover:text-white transition-colors theme-text-primary"
                      style={lightSurface(theme)}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    {disbursement.status === 'failed' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg theme-bg-glass hover:bg-green-500/20 hover:text-green-400 transition-colors theme-text-primary"
                        style={lightSurface(theme)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(disbursement);
                      }}
                      className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
                      style={lightSurface(theme)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 rounded-lg theme-bg-glass hover:bg-red-500/20 hover:text-red-400 transition-colors theme-text-primary"
                      style={lightSurface(theme)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

