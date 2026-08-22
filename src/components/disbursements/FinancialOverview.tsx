'use client';

import { motion } from 'framer-motion';
import { DollarSign, Heart, Scale } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { computeActBreakdown } from '@/utils/disbursementSelectors';
import { formatCurrency } from './shared';

export function FinancialOverview({
  stats,
  items,
}: {
  stats: { disbursedAmount: number; totalAmount: number; pendingAmount: number };
  items: readonly DisbursementRaw[];
}) {
  const { t } = useLocale();
  const breakdown = computeActBreakdown(items);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <motion.div
        whileHover={{ y: -2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm theme-text-muted">{t('extracted.total_disbursed')} </p>
            <p className="text-2xl font-bold theme-text-primary">{formatCurrency(stats.disbursedAmount)}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
            style={{ width: `${(stats.disbursedAmount / stats.totalAmount) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs theme-text-muted mt-2">
          <span>{t('extracted.total')}: {formatCurrency(stats.totalAmount)}</span>
          <span>{t('extracted.pending')}: {formatCurrency(stats.pendingAmount)}</span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm theme-text-muted">{t('extracted.pcr_act_disbursements')} </p>
            <p className="text-2xl font-bold theme-text-primary">{breakdown.pcrCount}</p>
          </div>
        </div>
        <p className="text-sm theme-text-secondary">
          {formatCurrency(breakdown.pcrDisbursed)} {t('extracted.disbursed')}
        </p>
      </motion.div>

      <motion.div
        whileHover={{ y: -2 }}
        className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm theme-text-muted">{t('extracted.poa_act_disbursements')} </p>
            <p className="text-2xl font-bold theme-text-primary">{breakdown.poaCount}</p>
          </div>
        </div>
        <p className="text-sm theme-text-secondary">
          {formatCurrency(breakdown.poaDisbursed)} {t('extracted.disbursed')}
        </p>
      </motion.div>
    </motion.div>
  );
}
