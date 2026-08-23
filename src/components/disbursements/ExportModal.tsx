'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementRaw } from '@/models/Disbursement';

interface Props {
  open: boolean;
  allCount: number;
  filteredCount: number;
  emailAddress: string;
  setEmailAddress: (v: string) => void;
  sendingEmail: boolean;
  onClose: () => void;
  onExportCsvAll: () => void;
  onExportPdfAll: () => void;
  onExportCsvFiltered: () => void;
  onExportPdfFiltered: () => void;
  onSendEmail: (items: 'all' | 'filtered', format: 'csv' | 'pdf') => void;
}

export function ExportModal({
  open,
  allCount,
  filteredCount,
  emailAddress,
  setEmailAddress,
  sendingEmail,
  onClose,
  onExportCsvAll,
  onExportPdfAll,
  onExportCsvFiltered,
  onExportPdfFiltered,
  onSendEmail,
}: Props) {
  const { t } = useLocale();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-md mx-4 p-6 rounded-xl theme-border-glass border shadow-lg theme-modal-solid"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold theme-text-primary">
                  {t('extracted.exportTitle') || 'Export Disbursements'}
                </h3>
                <p className="text-xs theme-text-muted mt-0.5">
                  {t('extracted.exportSubtitle') || 'Choose export format for disbursements data'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close export modal"
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Export All Section */}
              <div className="p-4 rounded-lg border theme-border-glass">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium theme-text-primary">{t('extracted.exportAllTitle') || 'All Disbursements'}</h4>
                    <p className="text-sm theme-text-muted">{allCount} {t('extracted.records')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onExportCsvAll()}
                    className="flex-1 h-9 px-3 rounded-md border theme-border-glass text-xs font-semibold theme-bg-glass theme-text-primary hover:theme-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('extracted.exportCsv') || 'Export CSV'}
                  </button>
                  <button
                    onClick={() => onExportPdfAll()}
                    className="flex-1 h-9 px-3 rounded-md text-xs font-semibold accent-gradient text-white hover:opacity-90 transition-shadow"
                  >
                    {t('extracted.exportPdf') || 'Export PDF'}
                  </button>
                </div>
              </div>

              {/* Export Filtered Section */}
              <div className="p-4 rounded-lg border theme-border-glass">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium theme-text-primary">{t('extracted.exportFilteredTitle') || 'Filtered Results'}</h4>
                    <p className="text-sm theme-text-muted">{filteredCount} {t('extracted.records')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={filteredCount === 0}
                    onClick={() => onExportCsvFiltered()}
                    className="flex-1 h-9 px-3 rounded-md border theme-border-glass text-xs font-semibold theme-bg-glass theme-text-primary hover:theme-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('extracted.exportCsv') || 'Export CSV'}
                  </button>
                  <button
                    disabled={filteredCount === 0}
                    onClick={() => onExportPdfFiltered()}
                    className="flex-1 h-9 px-3 rounded-md text-xs font-semibold accent-gradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                  >
                    {t('extracted.exportPdf') || 'Export PDF'}
                  </button>
                </div>
              </div>

              {/* Email Export Section */}
              <div className="p-4 rounded-lg border theme-border-glass">
                <div className="mb-3">
                  <h4 className="font-medium theme-text-primary mb-2">{t('extracted.emailExport') || 'Email Export'}</h4>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder={t('extracted.enterEmailAddress') || 'Enter email address'}
                    className="w-full h-9 px-2.5 rounded-md theme-bg-input theme-border-glass border theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <button
                      disabled={!emailAddress.trim() || sendingEmail}
                      onClick={() => onSendEmail('all', 'csv')}
                      className="flex-1 h-9 px-3 rounded-md border theme-border-glass text-xs font-semibold theme-bg-glass theme-text-primary hover:theme-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendCsv') || 'Send CSV'}
                    </button>
                    <button
                      disabled={!emailAddress.trim() || sendingEmail}
                      onClick={() => onSendEmail('all', 'pdf')}
                      className="flex-1 h-9 px-3 rounded-md text-xs font-semibold accent-gradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendPdf') || 'Send PDF'}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={!emailAddress.trim() || filteredCount === 0 || sendingEmail}
                      onClick={() => onSendEmail('filtered', 'csv')}
                      className="flex-1 h-9 px-3 rounded-md border theme-border-glass text-xs font-semibold theme-bg-glass theme-text-primary hover:theme-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendFilteredCsv') || 'Send Filtered CSV'}
                    </button>
                    <button
                      disabled={!emailAddress.trim() || filteredCount === 0 || sendingEmail}
                      onClick={() => onSendEmail('filtered', 'pdf')}
                      className="flex-1 h-9 px-3 rounded-md text-xs font-semibold accent-gradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendFilteredPdf') || 'Send Filtered PDF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

