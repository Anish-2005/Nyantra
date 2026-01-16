import React from 'react';
import { motion } from 'framer-motion';

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LiveTrackingStatsProps {
  loading: boolean;
  liveTrackingStats: Metric[];
}

const LiveTrackingStats: React.FC<LiveTrackingStatsProps> = ({ loading, liveTrackingStats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {loading ? (
        // Loading skeleton for live tracking stats
        Array.from({ length: 4 }).map((_, idx) => (
          <motion.div
            key={idx}
            className="relative p-3 sm:p-4 rounded-xl sm:rounded-2xl theme-bg-glass border theme-border-glass animate-pulse"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-300"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </motion.div>
        ))
      ) : (
        liveTrackingStats.map((metric, idx) => (
          <motion.div
            key={metric.label}
            className="relative p-3 sm:p-4 rounded-xl sm:rounded-2xl theme-bg-glass border theme-border-glass group/metric overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, type: "spring" }}
            whileHover={{ scale: 1.05, y: -3 }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className={`w-full h-full bg-gradient-to-br ${metric.color} rounded-2xl`}
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="relative z-10">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                <metric.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-xs theme-text-muted font-medium mb-1">{metric.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-base sm:text-lg font-bold theme-text-primary">{metric.value}</p>
                <span className={`text-xs font-semibold ${metric.trend === 'up' ? 'text-green-500' : 'text-amber-500'}`}>
                  {metric.change}
                </span>
              </div>
            </div>

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/metric:opacity-10"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))
      )}
    </div>
  );
};

export default LiveTrackingStats;