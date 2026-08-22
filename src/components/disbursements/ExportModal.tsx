'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold theme-text-primary flex items-center gap-3">
                  <Download className="w-5 h-5 text-accent-gradient" />
                  {t('extracted.exportTitle') || 'Export Disbursements'}
                </h3>
                <p className="text-sm theme-text-muted mt-1">
                  {t('extracted.exportSubtitle') || 'Choose export format for disbursements data'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close export modal"
                className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors"
              >
                <X className="w-5 h-5 theme-text-primary" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Export All Section */}
              <div className="p-4 rounded-lg border theme-border-glass">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium theme-text-primary">{t('extracted.exportAllTitle') || 'All Disbursements'}</h4>
                    <p className="text-sm theme-text-muted">{allCount} records</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onExportCsvAll()}
                    className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('extracted.exportCsv') || 'Export CSV'}
                  </button>
                  <button
                    onClick={() => onExportPdfAll()}
                    className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md transition-shadow"
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
                    <p className="text-sm theme-text-muted">{filteredCount} records</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={filteredCount === 0}
                    onClick={() => onExportCsvFiltered()}
                    className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('extracted.exportCsv') || 'Export CSV'}
                  </button>
                  <button
                    disabled={filteredCount === 0}
                    onClick={() => onExportPdfFiltered()}
                    className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
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
                    className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <button
                      disabled={!emailAddress.trim() || sendingEmail}
                      onClick={() => onSendEmail('all', 'csv')}
                      className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendCsv') || 'Send CSV'}
                    </button>
                    <button
                      disabled={!emailAddress.trim() || sendingEmail}
                      onClick={() => onSendEmail('all', 'pdf')}
                      className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendPdf') || 'Send PDF'}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={!emailAddress.trim() || filteredCount === 0 || sendingEmail}
                      onClick={() => onSendEmail('filtered', 'csv')}
                      className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                      {t('extracted.sendFilteredCsv') || 'Send Filtered CSV'}
                    </button>
                    <button
                      disabled={!emailAddress.trim() || filteredCount === 0 || sendingEmail}
                      onClick={() => onSendEmail('filtered', 'pdf')}
                      className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
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
