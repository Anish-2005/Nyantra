"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { DisbursementAlert, TranslateFn } from '../helpers';
import { formatDate } from '../helpers';

/** Animated "new updates" alert stack with per-alert dismiss and dismiss-all controls. */
export default function DisbursementAlerts({
  alerts,
  onDismiss,
  onDismissAll,
  t,
}: {
  alerts: DisbursementAlert[];
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
  t: TranslateFn;
}) {
  return (
    <AnimatePresence>
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('disbursements.new_updates')}
            </h3>
            <button
              onClick={onDismissAll}
              className="h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
            >
              {t('disbursements.dismiss_all')}
            </button>
          </div>

          {alerts.slice(0, 3).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="flex items-start justify-between gap-3 p-3.5 rounded-lg border theme-border-glass theme-bg-card transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      alert.type === 'new_disbursement'
                        ? 'bg-blue-500'
                        : alert.type === 'installment_completed'
                        ? 'bg-emerald-500'
                        : 'bg-purple-500'
                    }`}
                  />
                  <span className="text-[13px] font-medium theme-text-primary">
                    {alert.type === 'new_disbursement' && t('disbursements.alert_new')}
                    {alert.type === 'installment_completed' && t('disbursements.alert_installment')}
                    {alert.type === 'status_completed' && t('disbursements.alert_completed')}
                  </span>
                </div>
                <p className="text-xs theme-text-secondary">{alert.message}</p>
                <p className="text-[11px] theme-text-muted tabular-nums mt-0.5">
                  {formatDate(alert.timestamp)}
                </p>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}

          {alerts.length > 3 && (
            <p className="text-xs theme-text-muted text-center">
              +{alerts.length - 3} {t('disbursements.more_updates')}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
