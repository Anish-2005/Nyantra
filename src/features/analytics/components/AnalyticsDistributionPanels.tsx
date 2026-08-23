"use client";
import type { StateRow, TranslateFn } from '../helpers';
import { formatNumber } from '../helpers';

/** Ranked state-wise performance list and beneficiary category distribution bars. */
const AnalyticsDistributionPanels = ({
  gridClassName,
  stateWiseData,
  categoryWiseData,
  totalBeneficiaries,
  t,
}: {
  gridClassName: string;
  stateWiseData: StateRow[];
  categoryWiseData: Record<string, number>;
  totalBeneficiaries: number;
  t: TranslateFn;
}) => {
  return (
    <div className={gridClassName}>
      {/* State-wise Performance */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.statewise_performance_1')}</h3>
            <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.top_performing_states')}</p>
          </div>
        </div>
        <div className="p-4">
          {stateWiseData.map((state, index) => (
            <div key={state.state} className="py-2.5 border-b theme-border-glass last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 shrink-0 text-[11px] font-semibold tabular-nums theme-text-muted">{index + 1}</span>
                  <span className="text-[13px] theme-text-primary truncate">{state.state}</span>
                </div>
                <div className="text-right min-w-0">
                  <span className="text-[13px] font-semibold tabular-nums theme-text-primary">{state.disbursements}</span>
                  <span className="text-[11px] theme-text-muted ml-2">
                    {state.applications} {t('extracted.applications_lowercase')} · {state.successRate.toFixed(2)}% {t('extracted.success_lowercase')}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full theme-bg-glass mt-1.5 overflow-hidden">
                <div className="h-full rounded-full accent-gradient" style={{ width: `${Math.min(100, state.successRate)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category-wise Distribution */}
      <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b theme-border-glass flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.categorywise_distribution_1')}</h3>
            <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.beneficiary_categories')}</p>
          </div>
        </div>
        <div className="p-4">
          {Object.entries(categoryWiseData).map(([category, count]) => {
            const percentage = totalBeneficiaries > 0 ? ((count as number) / totalBeneficiaries) * 100 : 0;
            return (
              <div key={category} className="py-2.5 border-b theme-border-glass last:border-0">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <span className="text-[13px] font-medium theme-text-primary truncate">{category}</span>
                  <span className="text-[13px] font-semibold tabular-nums theme-text-primary shrink-0">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full theme-bg-glass mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full accent-gradient" style={{ width: `${percentage}%` }} />
                </div>
                <div className="flex justify-between text-[11px] theme-text-muted mt-1 gap-2 min-w-0">
                  <span>{formatNumber(count as number)} {t('extracted.beneficiaries_lowercase')}</span>
                  <span>{category} Category</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDistributionPanels;
