'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  label: string;
  value: string | number;
  /** Tailwind gradient stops, e.g. 'from-blue-500 to-cyan-500'. */
  gradient: string;
  icon: LucideIcon;
  /** Colour of the status dot, e.g. 'bg-green-500'. */
  dotColor: string;
  /** Denominator for the bottom progress bar (defaults to value itself). */
  total?: number;
  index?: number;
}

/**
 * Stat tile with animated progress bar + hover glow — the standard KPI card.
 * Open/Closed: visual variants come from props; internals never change per page.
 */
export function StatCard({
  label,
  value,
  gradient,
  icon: Icon,
  dotColor,
  total,
  index = 0,
}: StatCardProps) {
  const denominator = total ?? (typeof value === 'number' ? value : 1);
  const pct =
    typeof value === 'number' && denominator > 0 ? (value / denominator) * 100 : 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl overflow-hidden group"
    >
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${dotColor}`} />

      <div className="relative mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white relative z-10" />
        </div>
      </div>

      <p className="text-2xl font-bold theme-text-primary mb-1">{value}</p>
      <p className="text-sm theme-text-muted mb-2">{label}</p>

      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: index * 0.1 }}
        />
      </div>

      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />
    </motion.div>
  );
}
