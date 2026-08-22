'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Clock, DollarSign, PlayCircle, X, XCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  failed: number;
  cancelled: number;
}

interface StatDef {
  labelKey: string;
  value: number;
  color: string;
  icon: LucideIcon;
  statusColor: string;
}

export function StatsGrid({ stats }: { stats: Stats }) {
  const { t } = useLocale();
  const defs: StatDef[] = [
    { labelKey: 'extracted.total', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: DollarSign, statusColor: 'bg-cyan-500' },
    { labelKey: 'extracted.completed', value: stats.completed, color: 'from-green-500 to-emerald-500', icon: CheckCircle, statusColor: 'bg-green-500' },
    { labelKey: 'extracted.pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: Clock, statusColor: 'bg-amber-500' },
    { labelKey: 'extracted.in_progress', value: stats.inProgress, color: 'from-purple-500 to-pink-500', icon: PlayCircle, statusColor: 'bg-purple-500' },
    { labelKey: 'extracted.failed', value: stats.failed, color: 'from-red-500 to-rose-500', icon: XCircle, statusColor: 'bg-red-500' },
    { labelKey: 'extracted.cancelled', value: stats.cancelled, color: 'from-gray-500 to-slate-500', icon: X, statusColor: 'bg-gray-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
    >
      {defs.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -4 }}
          className="relative theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl overflow-hidden group"
        >
          {/* Status indicator dot (static) */}
          <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${stat.statusColor}`} />

          {/* Animated icon with ripple effect */}
          <div className="relative mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white relative z-10" />
            </div>
          </div>

          <p className="text-2xl font-bold theme-text-primary mb-1">{stat.value}</p>
          <p className="text-sm theme-text-muted mb-2">{t(stat.labelKey)}</p>

          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stat.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${typeof stat.value === 'number' ? (stat.value / stats.total) * 100 : 100}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
          </div>

          {/* Hover glow effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
