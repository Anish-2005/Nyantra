import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Download, RefreshCw } from 'lucide-react';

interface AnalyticsHeaderProps {
  t: (key: string) => string;
  onExport: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ t, onExport }) => {
  return (
    <div className="relative z-10 flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
        >
          <Activity className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold theme-text-primary">{t('dashboard.analytics.performanceAnalytics')}</h3>
          <div className="flex items-center gap-2 mt-1">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs theme-text-muted">{t('dashboard.analytics.liveDataStream')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExport}
          className="px-3 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 text-sm font-medium theme-text-primary"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{t('dashboard.analytics.export')}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2 text-sm font-medium shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">{t('dashboard.analytics.refresh')}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;