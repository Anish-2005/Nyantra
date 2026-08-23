"use client";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { BTN_GHOST, BTN_PRIMARY, SELECT_CLS } from '../helpers';

const Spinner = ({ invert }: { invert?: boolean }) => (
  <span className={`w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${invert ? 'border-white' : 'border-current'}`} />
);

interface AnalyticsExportDrawerProps {
  onClose: () => void;
  allCount: number;
  filteredCount: number;
  emailAddress: string;
  setEmailAddress: (value: string) => void;
  sendingEmail: boolean;
  onCsv: () => void;
  onPdf: () => void;
  onSendEmail: (format: 'csv' | 'pdf') => void | Promise<void>;
}

/** Slide-in export drawer with all/filtered CSV+PDF groups and an email-delivery form. */
const AnalyticsExportDrawer = ({
  onClose,
  allCount,
  filteredCount,
  emailAddress,
  setEmailAddress,
  sendingEmail,
  onCsv,
  onPdf,
  onSendEmail,
}: AnalyticsExportDrawerProps) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!mounted) return null;

  const groups = [
    {
      title: t('extracted.exportAll') || 'All Analytics',
      description: t('extracted.exportAllDescription') || '',
      count: allCount,
    },
    {
      title: t('extracted.exportFiltered') || 'Filtered',
      description: t('extracted.exportFilteredDescription') || '',
      count: filteredCount,
    },
  ];

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-y-0 right-0 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
              {t('extracted.export') || 'Export'}
            </h2>
            <p className="text-[11px] theme-text-muted truncate">
              {t('extracted.exportDescription') || 'Export analytics data as CSV or PDF report.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {groups.map((group, gi) => (
            <section key={gi} className={gi === 1 ? 'pt-4 border-t theme-border-glass' : ''}>
              <div className="flex items-baseline justify-between mb-2 gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary truncate">{group.title}</h3>
                <span className="text-[11px] tabular-nums theme-text-muted shrink-0">{group.count}</span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={group.count === 0}
                  onClick={() => { onCsv(); onClose(); }}
                  className={BTN_GHOST}
                >
                  CSV
                </button>
                <button
                  disabled={group.count === 0}
                  onClick={() => { onPdf(); onClose(); }}
                  className={BTN_PRIMARY}
                >
                  PDF
                </button>
              </div>
              {group.description && (
                <p className="text-[11px] theme-text-muted mt-2 leading-relaxed">{group.description}</p>
              )}
            </section>
          ))}

          <section className="pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2">
              {t('extracted.emailExport') || 'Email Export'}
            </h3>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder={t('extracted.enterEmailAddress') || 'Enter email address'}
              className={`w-full min-w-0 ${SELECT_CLS}`}
            />
            <div className="flex gap-2 mt-2">
              <button
                disabled={!emailAddress.trim() || sendingEmail}
                onClick={() => onSendEmail('csv')}
                className={BTN_GHOST}
              >
                {sendingEmail ? <Spinner /> : null}
                {t('extracted.sendCsv') || 'Send CSV'}
              </button>
              <button
                disabled={!emailAddress.trim() || sendingEmail}
                onClick={() => onSendEmail('pdf')}
                className={BTN_PRIMARY}
              >
                {sendingEmail ? <Spinner invert /> : null}
                {t('extracted.sendPdf') || 'Send PDF'}
              </button>
            </div>
          </section>
        </div>

        <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
          >
            {t('extracted.cancel') || 'Cancel'}
          </button>
          <button
            onClick={() => { onPdf(); onClose(); }}
            className="flex-1 h-9 accent-gradient text-white rounded-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            {t('extracted.export_pdf') || 'PDF'}
          </button>
        </div>
      </motion.aside>
    </>,
    document.body
  );
};

export default AnalyticsExportDrawer;
