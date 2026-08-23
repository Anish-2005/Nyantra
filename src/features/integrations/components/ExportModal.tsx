"use client";
/**
 * Modal for exporting integrations as CSV or PDF, for the full dataset or current filters.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GHOST_BTN, exportIntegrationsData, exportIntegrationsPDF, type Integration, type TranslateFn } from '../helpers';

export default function ExportModal({
  allItems,
  filteredItems,
  onClose,
  t,
}: {
  allItems: Integration[];
  filteredItems: Integration[];
  onClose: () => void;
  t: TranslateFn;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="relative w-full max-w-[min(32rem,calc(100vw-1.5rem))] rounded-xl theme-drawer backdrop-blur-2xl border theme-border-glass shadow-2xl p-4 space-y-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold theme-text-primary">
              {t('extracted.export_report') || 'Export Data'}
            </h3>
            <p className="text-xs theme-text-muted mt-0.5">{t('extracted.export') || 'Export integrations as CSV or a printable PDF report.'}</p>
          </div>
          <button onClick={onClose} aria-label="Close export modal" className="p-2 sm:p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export All */}
        <div className="rounded-lg border theme-border-glass p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.exportAll') || 'Export All'}</h4>
              <p className="text-xs theme-text-muted mt-0.5">{t('extracted.exportAllDescription') || 'Download the full integrations dataset in the chosen format.'}</p>
              <p className="text-xs theme-text-muted mt-2 tabular-nums">{allItems.length} {t('extracted.integrations')}</p>
            </div>
            <div className="flex flex-row sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
              <button onClick={() => { exportIntegrationsData(allItems); onClose(); }} className={`${GHOST_BTN} h-9 sm:h-8 px-3`}>CSV</button>
              <button onClick={() => { exportIntegrationsPDF(allItems); onClose(); }} className="h-9 sm:h-8 px-3 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity">PDF</button>
            </div>
          </div>
        </div>

        {/* Export Filtered */}
        <div className="rounded-lg border theme-border-glass p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold theme-text-primary">{t('extracted.exportFiltered') || 'Export Filtered'}</h4>
              <p className="text-xs theme-text-muted mt-0.5">{t('extracted.exportFilteredDescription') || 'Download only the results matching your current filters.'}</p>
              <p className="text-xs theme-text-muted mt-2 tabular-nums">{filteredItems.length} {t('extracted.integrations')}</p>
            </div>
            <div className="flex flex-row sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
              <button disabled={filteredItems.length === 0} onClick={() => { exportIntegrationsData(filteredItems); onClose(); }} className={`${GHOST_BTN} h-9 sm:h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed`}>CSV</button>
              <button disabled={filteredItems.length === 0} onClick={() => { exportIntegrationsPDF(filteredItems); onClose(); }} className="h-9 sm:h-8 px-3 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">PDF</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
