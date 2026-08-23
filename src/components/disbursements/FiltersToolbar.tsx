'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type { DisbursementFilters } from '@/utils/disbursementSelectors';

interface Props {
  filters: DisbursementFilters;
  setFilter: <K extends keyof DisbursementFilters>(key: K, value: DisbursementFilters[K]) => void;
  filtersActive: boolean;
  viewMode: 'table' | 'cards';
  setViewMode: (m: 'table' | 'cards') => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
}

const inputCls =
  'h-9 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export function FiltersToolbar({
  filters,
  setFilter,
  filtersActive,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
}: Props) {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="theme-bg-card theme-border-glass border rounded-xl p-3"
    >
      <div className="flex flex-col lg:flex-row gap-2.5">
        {/* Search */}
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={t('extracted.search_by_beneficiary_transaction_id_or_district')}
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            className={`w-full pl-9 pr-3 ${inputCls}`}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center theme-bg-glass rounded-md p-0.5 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'theme-bg-card text-accent-gradient shadow-sm' : 'theme-text-muted hover:theme-text-primary'
            }`}
          >
            {t('extracted.table')}
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${
              viewMode === 'cards' ? 'theme-bg-card text-accent-gradient shadow-sm' : 'theme-text-muted hover:theme-text-primary'
            }`}
          >
            {t('extracted.cards')}
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-9 px-3 rounded-md border inline-flex items-center gap-1.5 text-xs font-semibold transition-colors shrink-0 ${
            showFilters
              ? 'border-[var(--accent-primary)] text-accent-gradient'
              : 'theme-border-glass theme-text-secondary hover:theme-bg-glass hover:theme-text-primary'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t('extracted.filters')}</span>
          {filtersActive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
        </button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t theme-border-glass">
              <Field label={t('extracted.status')}>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setFilter('statusFilter', e.target.value)}
                  className={`w-full px-2.5 ${inputCls}`}
                >
                  <option value="all">{t('extracted.all_statuses')}</option>
                  <option value="completed">{t('extracted.completed')}</option>
                  <option value="pending">{t('extracted.pending')}</option>
                  <option value="in-progress">{t('extracted.in_progress')}</option>
                  <option value="failed">{t('extracted.failed')}</option>
                  <option value="cancelled">{t('extracted.cancelled')}</option>
                </select>
              </Field>
              <Field label={t('extracted.act_type')}>
                <select
                  value={filters.actTypeFilter}
                  onChange={(e) => setFilter('actTypeFilter', e.target.value)}
                  className={`w-full px-2.5 ${inputCls}`}
                >
                  <option value="all">{t('extracted.all_acts')}</option>
                  <option value="PCR Act">{t('extracted.pcr_act')}</option>
                  <option value="PoA Act">{t('extracted.poa_act')}</option>
                </select>
              </Field>
              <Field label={t('extracted.time_period')}>
                <select
                  value={filters.dateFilter}
                  onChange={(e) => setFilter('dateFilter', e.target.value)}
                  className={`w-full px-2.5 ${inputCls}`}
                >
                  <option value="all">{t('extracted.all_time')}</option>
                  <option value="today">{t('extracted.today')}</option>
                  <option value="week">{t('extracted.this_week')}</option>
                  <option value="month">{t('extracted.this_month')}</option>
                </select>
              </Field>
              <Field label={t('extracted.priority')}>
                <select
                  value={filters.priorityFilter}
                  onChange={(e) => setFilter('priorityFilter', e.target.value)}
                  className={`w-full px-2.5 ${inputCls}`}
                >
                  <option value="all">{t('extracted.all_priorities')}</option>
                  <option value="high">{t('extracted.high')}</option>
                  <option value="medium">{t('extracted.medium')}</option>
                  <option value="low">{t('extracted.low')}</option>
                </select>
              </Field>
            </div>

            {/* Sorting Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t theme-border-glass">
              <Field label={t('extracted_grouped.hero.sortBy') || 'Sort By'}>
                <div className="relative">
                  <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilter('sortBy', e.target.value)}
                    className={`w-full pl-8 pr-2.5 ${inputCls}`}
                  >
                    <option value="initiatedDate">{t('extracted_grouped.hero.sortOptions.initiatedDate') || 'Initiated Date'}</option>
                    <option value="reliefAmount">{t('extracted_grouped.hero.sortOptions.reliefAmount') || 'Amount'}</option>
                    <option value="status">{t('extracted_grouped.hero.sortOptions.status') || 'Status'}</option>
                  </select>
                </div>
              </Field>
              <Field label={t('extracted_grouped.hero.sortOrder') || 'Sort Order'}>
                <div className="relative">
                  <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                    className={`w-full pl-8 pr-2.5 ${inputCls}`}
                  >
                    <option value="desc">
                      {filters.sortBy === 'reliefAmount'
                        ? t('extracted.sortOrderOptions.highToLow') || 'High to Low'
                        : filters.sortBy === 'status'
                          ? t('extracted.sortOrderOptions.completedToPending') || 'Completed to Pending'
                          : t('extracted_grouped.hero.sortOrderOptions.newestFirst') || 'Newest First'}
                    </option>
                    <option value="asc">
                      {filters.sortBy === 'reliefAmount'
                        ? t('extracted.sortOrderOptions.lowToHigh') || 'Low to High'
                        : filters.sortBy === 'status'
                          ? t('extracted.sortOrderOptions.pendingToCompleted') || 'Pending to Completed'
                          : t('extracted_grouped.hero.sortOrderOptions.oldestFirst') || 'Oldest First'}
                    </option>
                  </select>
                </div>
              </Field>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
