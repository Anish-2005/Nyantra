"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Shield } from 'lucide-react';

export interface RailCheck {
  icon: React.ComponentType<{ className?: string }>;
  ok: boolean;
  label: string;
  detail: string;
}

/**
 * Sticky verification rail: completion counter, progress bar and a vertical
 * checklist of profile completeness items.
 */
export default function VerificationRail({
  title,
  completionLabel,
  checks,
}: {
  title: string;
  completionLabel: string;
  checks: RailCheck[];
}) {
  const completed = checks.filter(c => c.ok).length;
  const allDone = checks.length > 0 && completed === checks.length;
  const percent = checks.length > 0 ? (completed / checks.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden lg:sticky lg:top-20"
    >
      <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold theme-text-primary">{title}</h3>
        <Shield className={`w-4 h-4 flex-shrink-0 ${allDone ? 'text-emerald-500' : 'theme-text-muted'}`} />
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="tabular-nums theme-text-primary leading-none">
            <span className="text-3xl font-semibold tracking-tight">{completed}</span>
            <span className="text-base theme-text-muted">/{checks.length}</span>
          </p>
          <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{completionLabel}</span>
        </div>
        <div
          className="mt-2.5 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={checks.length}
        >
          <div
            className="h-full rounded-full accent-gradient transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-5 relative">
          <div className="absolute left-[15px] top-3 bottom-3 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />
          <div className="space-y-4 relative">
            {checks.map(({ icon: Icon, ok, label, detail }) => (
              <div key={label} className="flex items-start gap-3 relative">
                <span
                  className={`relative z-10 w-8 h-8 rounded-full grid place-items-center shrink-0 transition-colors ${
                    ok ? 'bg-emerald-500 text-white shadow-sm' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold theme-text-primary truncate leading-tight">{label}</p>
                  <p className="text-[11px] theme-text-muted truncate leading-tight mt-0.5">{detail}</p>
                </div>
                {!ok && <AlertCircle className="w-3.5 h-3.5 text-amber-500 ml-auto shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
