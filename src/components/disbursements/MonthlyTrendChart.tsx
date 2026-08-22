'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementRaw } from '@/models/Disbursement';
import { computeMonthlyTrend } from '@/utils/disbursementSelectors';

export function MonthlyTrendChart({ items }: { items: readonly DisbursementRaw[] }) {
  const { t } = useLocale();

  const trend = useMemo(() => {
    let monthLabels: string[] = [];
    try {
      monthLabels = JSON.parse(t('extracted.months_short'));
    } catch {
      monthLabels = [];
    }
    return computeMonthlyTrend(items, monthLabels, 6);
  }, [items, t]);

  const maxAdded = Math.max(...trend.map((p) => p.added), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="theme-bg-card theme-border-glass border rounded-xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold theme-text-primary">{t('extracted.disbursement_trend')} </h3>
          <p className="text-sm theme-text-muted">{t('extracted.monthly_disbursement_performance')} </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs theme-text-muted">{t('extracted.added')} </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs theme-text-muted">{t('extracted.completed')} </span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between h-32">
        {trend.map((point) => (
          <div key={point.label + point.added} className="flex flex-col items-center flex-1">
            <div className="flex items-end justify-center w-full h-20 gap-1 mb-2">
              <div
                className="w-1/2 bg-blue-500 rounded-t transition-all duration-500"
                style={{ height: `${(point.added / maxAdded) * 80}%` }}
              ></div>
              <div
                className="w-1/2 bg-green-500 rounded-t transition-all duration-500"
                style={{ height: `${(point.completed / maxAdded) * 80}%` }}
              ></div>
            </div>
            <span className="text-xs theme-text-muted">{point.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
