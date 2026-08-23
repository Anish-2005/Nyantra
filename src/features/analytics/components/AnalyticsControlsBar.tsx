"use client";
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Download, Filter } from 'lucide-react';
import type {
  ChartKind,
  DistrictSortKey,
  ExportFormat,
  StateRow,
  TranslateFn,
  ViewMode,
} from '../helpers';
import { ACT_TYPE_OPTIONS, SELECT_CLS } from '../helpers';

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
  <button
    onClick={onClick}
    className={`h-7 px-2 rounded-md text-xs font-medium transition-colors ${active
      ? 'accent-gradient text-white'
      : 'border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary'
      }`}
  >
    {children}
  </button>
);

/** View/chart-type selects, filters toggle with advanced filter panel, and quick export controls. */
const AnalyticsControlsBar = ({
  viewMode,
  onViewModeChange,
  chartType,
  onChartTypeChange,
  showFilters,
  onToggleFilters,
  selectedStates,
  onToggleStateFilter,
  selectedActs,
  onToggleActFilter,
  stateOptions,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  exportFormat,
  onExportFormatChange,
  onOpenExport,
  t,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  chartType: ChartKind;
  onChartTypeChange: (type: ChartKind) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedStates: string[];
  onToggleStateFilter: (state: string) => void;
  selectedActs: string[];
  onToggleActFilter: (act: string) => void;
  stateOptions: StateRow[];
  sortBy: DistrictSortKey;
  onSortByChange: (key: DistrictSortKey) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  onOpenExport: () => void;
  t: TranslateFn;
}) => {
  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.view_mode')}</span>
        <div className="relative">
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
            className={`${SELECT_CLS} pr-8 appearance-none`}
          >
            <option value="grid">{t('extracted.grid')}</option>
            <option value="list">{t('extracted.list')}</option>
            <option value="compact">{t('extracted.compact')}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{t('extracted.chart_type')}</span>
        <div className="relative">
          <select
            value={chartType}
            onChange={(e) => onChartTypeChange(e.target.value as ChartKind)}
            className={`${SELECT_CLS} pr-8 appearance-none`}
          >
            <option value="bar">{t('extracted.bar')}</option>
            <option value="line">{t('extracted.line')}</option>
            <option value="area">{t('extracted.area')}</option>
            <option value="pie">{t('extracted.pie')}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
        <button
          onClick={onToggleFilters}
          className={`h-9 px-2.5 rounded-md inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${showFilters
            ? 'accent-gradient text-white'
            : 'border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary'
            }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {t('extracted.filters')}
        </button>

        <button
          onClick={onOpenExport}
          className="h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
          title={t('extracted.export')}
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <select
          value={exportFormat}
          onChange={(e) => onExportFormatChange(e.target.value as ExportFormat)}
          className={`${SELECT_CLS} min-w-[110px]`}
        >
          <option value="pdf">{t('extracted.export_pdf')}</option>
          <option value="csv">{t('extracted.export_csv')}</option>
          <option value="excel">{t('extracted.export_excel')}</option>
        </select>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="pt-3 mt-1 border-t theme-border-glass grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5 block">{t('extracted.filter_by_state')}</label>
                <div className="flex flex-wrap gap-1">
                  {stateOptions.slice(0, 5).map((state) => (
                    <Chip
                      key={state.state}
                      active={selectedStates.includes(state.state)}
                      onClick={() => onToggleStateFilter(state.state)}
                    >
                      {state.state}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5 block">{t('extracted.filter_by_act')}</label>
                <div className="flex gap-1">
                  {ACT_TYPE_OPTIONS.map((act) => (
                    <Chip
                      key={act}
                      active={selectedActs.includes(act)}
                      onClick={() => onToggleActFilter(act)}
                    >
                      {act}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5 block">{t('extracted.sort_by')}</label>
                <div className="flex gap-1">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value as DistrictSortKey)}
                    className="h-7 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    <option value="applications">{t('extracted.applications')}</option>
                    <option value="disbursements">{t('extracted.disbursements')}</option>
                    <option value="successRate">{t('extracted.success_rate')}</option>
                  </select>
                  <button
                    onClick={onToggleSortOrder}
                    className="h-7 px-2 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs font-medium hover:theme-text-primary transition-colors"
                    aria-label="Toggle sort order"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsControlsBar;
