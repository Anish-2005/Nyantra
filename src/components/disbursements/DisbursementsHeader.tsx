'use client';

import { motion } from 'framer-motion';
import { Download, Plus } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { lightSurface } from './shared';

interface Props {
  filteredCount: number;
  onExport: () => void;
  onNew: () => void;
}

export function DisbursementsHeader({ filteredCount, onExport, onNew }: Props) {
  const { t } = useLocale();
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl theme-bg-card theme-border-glass border backdrop-blur-xl overflow-hidden"
    >
      {/* Decorative gradient background (static) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl opacity-40" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium theme-text-secondary">
            {t('extracted.live_tracking')} • {filteredCount} {t('extracted.active_disbursements')}
          </span>
        </div>
        <h1 className="text-3xl font-bold theme-text-primary mb-2">
          {t('extracted.disbursement')}{' '}
          <span className="text-accent-gradient inline-block leading-normal">
            {t('extracted.monitoring_center')}
          </span>
        </h1>
        <p className="theme-text-secondary max-w-2xl">{t('extracted.realtime_disbursement_tracking_description')}</p>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExport}
          className="px-4 py-2 rounded-xl theme-border-glass border flex items-center gap-2 theme-bg-glass theme-text-primary shadow-lg"
          style={lightSurface(theme)}
        >
          <Download className="w-4 h-4" />
          <span>{t('extracted.export_data')}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl accent-gradient text-white flex items-center gap-2 shadow-lg"
          onClick={onNew}
        >
          <Plus className="w-4 h-4" />
          <span>{t('extracted.new_disbursement')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
