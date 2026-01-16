import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiveTrackingStats from './LiveTrackingStats';

interface LiveApplicationTrackingProps {
  t: (key: string) => string;
  loading: boolean;
  liveTrackingStats: any;
  recentActivity: any[];
}

const LiveApplicationTracking: React.FC<LiveApplicationTrackingProps> = ({
  t,
  loading,
  liveTrackingStats,
  recentActivity
}) => {
  const router = useRouter();

  return (
    <div className="relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
          >
            <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            <motion.div
              className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-blue-400"
              animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-cyan-400"
              animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1, repeatDelay: 0.5 }}
            />
          </motion.div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold theme-text-primary">{t('dashboard.liveTracking.liveApplicationTracking')}</h3>
            <p className="text-sm theme-text-muted">{t('dashboard.liveTracking.trackRealTime')}</p>
          </div>
        </div>
        <motion.button
          onClick={() => router.push('/dashboard/applications')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{t('dashboard.common.viewAllTracking')}</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Live Tracking Stats */}
      <LiveTrackingStats loading={loading} liveTrackingStats={liveTrackingStats} />
      {/* Live Activity Feed */}
      <div className="mt-4 sm:mt-6">
        <h4 className="text-sm font-semibold theme-text-primary mb-3 flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {t('dashboard.recentActivity.liveUpdates')}
        </h4>
        <div className="space-y-2">
          {loading ? (
            // Loading skeleton for recent activity
            Array.from({ length: 4 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl theme-bg-glass border theme-border-glass animate-pulse"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-300"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded w-32 mb-1"></div>
                  <div className="h-2 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </motion.div>
            ))
          ) : (
            recentActivity.map((activity, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl theme-bg-glass border theme-border-glass"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'application' ? 'bg-blue-500' :
                  activity.type === 'grievance' ? 'bg-amber-500' : 'bg-green-500'
                }`}>
                  {activity.type === 'application' ? <FileText className="w-4 h-4 text-white" /> :
                   activity.type === 'grievance' ? <AlertCircle className="w-4 h-4 text-white" /> :
                   <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold theme-text-primary">{activity.action}</p>
                  <p className="text-xs theme-text-muted">by {activity.user}</p>
                </div>
                <span className="text-xs theme-text-muted whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveApplicationTracking;