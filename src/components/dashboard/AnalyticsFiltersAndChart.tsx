import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart, BarChart3, Zap, Activity, ArrowUpRight } from 'lucide-react';
import AnalyticsChart from '@/components/AnalyticsChart';

interface AnalyticsFiltersAndChartProps {
  t: (key: string) => string;
  chartRange: number;
  setChartRange: (value: number) => void;
  chartType: 'line' | 'area' | 'bar' | 'stacked';
  setChartType: (value: 'line' | 'area' | 'bar' | 'stacked') => void;
  showApplications: boolean;
  setShowApplications: (value: boolean | ((prev: boolean) => boolean)) => void;
  showApproved: boolean;
  setShowApproved: (value: boolean | ((prev: boolean) => boolean)) => void;
  showPending: boolean;
  setShowPending: (value: boolean | ((prev: boolean) => boolean)) => void;
  smoothing: boolean;
  setSmoothing: (value: boolean | ((prev: boolean) => boolean)) => void;
  analyticsMetrics: any;
  dataSets: any;
}

const AnalyticsFiltersAndChart: React.FC<AnalyticsFiltersAndChartProps> = ({
  t,
  chartRange,
  setChartRange,
  chartType,
  setChartType,
  showApplications,
  setShowApplications,
  showApproved,
  setShowApproved,
  showPending,
  setShowPending,
  smoothing,
  setSmoothing,
  analyticsMetrics,
  dataSets
}) => {
  return (
    <>
      {/* Modern Filter Chips */}
      <div className="relative z-10 mb-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          {/* Time Range Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Period:</span>
            {[
              { value: 7, label: '7D' },
              { value: 30, label: '30D' },
              { value: 90, label: '90D' }
            ].map((range) => (
              <motion.button
                key={range.value}
                onClick={() => setChartRange(range.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  chartRange === range.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'theme-bg-glass theme-border-glass border theme-text-muted hover:border-blue-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {range.label}
              </motion.button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">{t('dashboard.common.view')}</span>
            {[
              { value: 'line', icon: TrendingUp, label: t('dashboard.chartLabels.line') },
              { value: 'area', icon: BarChart, label: t('dashboard.chartLabels.area') },
              { value: 'bar', icon: BarChart3, label: t('dashboard.chartLabels.bar') }
            ].map((type) => (
              <motion.button
                key={type.value}
                onClick={() => setChartType(type.value as 'line' | 'area' | 'bar' | 'stacked')}
                className={`p-2 rounded-xl transition-all ${
                  chartType === type.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'theme-bg-glass theme-border-glass border theme-text-muted hover:border-blue-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={type.label}
              >
                <type.icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dataset Toggle Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ds-app", label: t('dashboard.chartLabels.applications'), value: showApplications, setter: setShowApplications, color: "from-blue-500 to-cyan-500" },
            { id: "ds-approved", label: t('dashboard.chartLabels.approved'), value: showApproved, setter: setShowApproved, color: "from-green-500 to-emerald-500" },
            { id: "ds-pending", label: t('dashboard.chartLabels.pending'), value: showPending, setter: setShowPending, color: "from-amber-500 to-orange-500" }
          ].map(ds => (
            <motion.button
              key={ds.id}
              onClick={() => ds.setter(v => !v)}
              className={`px-4 py-2 rounded-full font-medium text-xs flex items-center gap-2 transition-all border-2 ${
                ds.value
                  ? `bg-gradient-to-r ${ds.color} text-white border-transparent shadow-lg`
                  : 'theme-bg-glass theme-border-glass theme-text-muted hover:border-blue-500/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${ds.value ? 'bg-white' : 'bg-gray-400'}`}
                animate={ds.value ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {ds.label}
            </motion.button>
          ))}

          {/* Smoothing Toggle */}
          <motion.button
            onClick={() => setSmoothing(v => !v)}
            className={`px-4 py-2 rounded-full font-medium text-xs flex items-center gap-2 transition-all border-2 ${
              smoothing
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg'
                : 'theme-bg-glass theme-border-glass theme-text-muted hover:border-purple-500/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className={`w-3 h-3 ${smoothing ? 'text-white' : 'text-gray-400'}`} />
            {t('extracted.smoothing')}
          </motion.button>
        </div>
      </div>

      {/* Chart Area with Enhanced Styling */}
      <div className="relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: t('dashboard.analytics.peakValue'), value: analyticsMetrics.peakValue.toLocaleString(), color: 'from-blue-500 to-cyan-500', icon: TrendingUp },
            { label: t('dashboard.analytics.average'), value: analyticsMetrics.average.toLocaleString(), color: 'from-purple-500 to-pink-500', icon: Activity },
            { label: t('dashboard.analytics.growthRate'), value: `${analyticsMetrics.growthRate >= 0 ? '+' : ''}${analyticsMetrics.growthRate}%`, color: 'from-green-500 to-emerald-500', icon: ArrowUpRight }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="theme-bg-glass rounded-2xl p-3 sm:p-4 border theme-border-glass"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm theme-text-muted">{stat.label}</p>
                  <p className="text-lg sm:text-xl font-bold theme-text-primary">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="relative rounded-2xl theme-bg-glass p-4 border theme-border-glass">
          <AnalyticsChart dataSets={dataSets} chartType={chartType} />
        </div>
      </div>
    </>
  );
};

export default AnalyticsFiltersAndChart;