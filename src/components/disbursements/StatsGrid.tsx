'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Banknote, CheckCircle2, Clock, Loader, ShieldOff, X } from 'lucide-react';
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
  icon: LucideIcon;
  iconClass: string;
  dotClass: string;
}

const DEFS: StatDef[] = [
  { labelKey: 'extracted.total', value: 0, icon: Banknote, iconClass: 'text-cyan-500', dotClass: 'bg-cyan-500' },
  { labelKey: 'extracted.completed', value: 0, icon: CheckCircle2, iconClass: 'text-emerald-500', dotClass: 'bg-emerald-500' },
  { labelKey: 'extracted.pending', value: 0, icon: Clock, iconClass: 'text-amber-500', dotClass: 'bg-amber-500' },
  { labelKey: 'extracted.in_progress', value: 0, icon: Loader, iconClass: 'text-violet-500', dotClass: 'bg-violet-500' },
  { labelKey: 'extracted.failed', value: 0, icon: ShieldOff, iconClass: 'text-red-500', dotClass: 'bg-red-500' },
  { labelKey: 'extracted.cancelled', value: 0, icon: X, iconClass: 'text-slate-400', dotClass: 'bg-slate-400' },
];

export function StatsGrid({ stats }: { stats: Stats }) {
  const { t } = useLocale();
  const defs: StatDef[] = DEFS.map((d, i) => ({
    ...d,
    value: [stats.total, stats.completed, stats.pending, stats.inProgress, stats.failed, stats.cancelled][i],
  }));
  const max = Math.max(stats.total, 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05 }}
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden"
    >
      {defs.map(({ labelKey, value, icon: Icon, iconClass }) => (
        <div key={labelKey} className="theme-bg-card p-4 relative overflow-hidden group">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            <Icon className={`w-3.5 h-3.5 shrink-0 ${iconClass}`} />
            <span className="truncate">{t(labelKey)}</span>
          </div>
          <p className="text-2xl font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums">
            {value}
          </p>
          <p className="text-[11px] theme-text-muted mt-0.5 tabular-nums">
            {stats.total > 0 ? Math.round((value / max) * 100) : 0}%
          </p>
          <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>
      ))}
    </motion.div>
  );
}
