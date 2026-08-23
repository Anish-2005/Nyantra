"use client";
import type { ReactNode } from 'react';
import AnalyticsChart from '@/components/AnalyticsChart';
import type { ActStats, ChartKind, TranslateFn } from '../helpers';
import { formatNumber } from '../helpers';

const Item = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 tabular-nums truncate">{children}</dd>
  </div>
);

/** Monthly trends chart panel and PCR/PoA act-wise breakdown bars in the view-mode grid. */
const AnalyticsChartsSection = ({
  gridClassName,
  chartDataSets,
  chartType,
  actBlocks,
  totalApplications,
  t,
}: {
  gridClassName: string;
  chartDataSets: { id: string; label: string; color?: string; points: { x: string; y: number }[] }[];
  chartType: ChartKind;
  actBlocks: { key: 'pcr' | 'poa'; label: string; data: ActStats }[];
  totalApplications: number;
  t: TranslateFn;
}) => {
  return (
    <div className={gridClassName}>
      {/* Monthly Trends Chart */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.monthly_trends')}</h3>
            <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.applications_vs_disbursements')}</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] theme-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t('extracted.applications')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] theme-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('extracted.disbursements')}
            </span>
          </div>
        </div>
        <div className="p-4 min-w-0 overflow-hidden">
          <div className="h-64 sm:h-80 w-full min-w-0">
            <AnalyticsChart
              dataSets={chartDataSets}
              chartType={chartType === 'pie' ? 'bar' : chartType as any}
              xScaleType="category"
            />
          </div>
        </div>
      </section>

      {/* Act-wise Breakdown */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.actwise_performance')}</h3>
            <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.pcr_act_vs_poa_act')}</p>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {actBlocks.map(({ key, label, data }) => (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold theme-text-primary truncate">{label}</h4>
                <span className="text-lg font-semibold tracking-tight theme-text-primary tabular-nums">
                  {totalApplications > 0 ? Math.round((data.applications / totalApplications) * 100) : 0}%
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                <Item label={t('extracted.applications_lowercase')}>{formatNumber(data.applications)}</Item>
                <Item label={t('extracted.disbursed')}>{formatNumber(data.disbursements)}</Item>
                <Item label={t('extracted.success_lowercase')}>{data.successRate.toFixed(1)}%</Item>
              </dl>
              <div className="h-1.5 rounded-full theme-bg-glass mt-3 overflow-hidden">
                <div className="h-full rounded-full accent-gradient" style={{ width: `${Math.min(100, data.successRate)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsChartsSection;
