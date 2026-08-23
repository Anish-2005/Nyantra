'use client';

import { Download, Plus } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

interface Props {
  filteredCount: number;
  onExport: () => void;
  onNew: () => void;
}

export function DisbursementsHeader({ filteredCount, onExport, onNew }: Props) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
          {t('extracted.disbursement')}{' '}
          <span className="text-accent-gradient">{t('extracted.monitoring_center')}</span>
        </h1>
        <p className="text-xs theme-text-muted mt-0.5 truncate">
          {t('extracted.realtime_disbursement_tracking_description')}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-full theme-bg-glass border theme-border-glass text-[11px] font-medium theme-text-secondary tabular-nums">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          {filteredCount} {t('extracted.active_disbursements')}
        </span>
        <button
          onClick={onExport}
          className="h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('extracted.export_data')}</span>
        </button>
        <button
          onClick={onNew}
          className="h-9 px-3.5 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('extracted.new_disbursement')}</span>
        </button>
      </div>
    </div>
  );
}
