import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Plus } from 'lucide-react';

interface RealTimeMonitoringHeaderProps {
  t: (key: string) => string;
  currentTime: string;
}

const RealTimeMonitoringHeader: React.FC<RealTimeMonitoringHeaderProps> = ({ t, currentTime }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden"
    >
      {/* Mobile-optimized background orb */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl sm:blur-3xl -z-10" />

      {/* Mobile-first layout */}
      <div className="flex flex-col gap-4 lg:gap-6">
        {/* Status indicator and time - mobile centered */}
        <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
          <motion.div
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs sm:text-sm font-medium theme-text-secondary text-center lg:text-left">
            {t('extracted.live_monitoring')} • {t('extracted.last_updated')}: {currentTime}
          </span>
        </div>

        {/* Main content - centered on mobile */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text-primary mb-3 leading-tight">
            <span className="text-accent-gradient">{t('extracted.realtime_monitoring_dashboard')}</span>
          </h1>
          <p className="theme-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
            {t('extracted.comprehensive_oversight_description')}
          </p>
        </div>

        {/* Action buttons - mobile stacked, desktop side by side */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
          <motion.button
            className="px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base flex-1 sm:flex-initial"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">{t('extracted.auto_refresh')} {t('extracted.on')}</span>
          </motion.button>
          <motion.button
            className="px-4 sm:px-6 py-3 sm:py-3.5 accent-gradient rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base flex-1 sm:flex-initial"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">{t('extracted.new_application')}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default RealTimeMonitoringHeader;