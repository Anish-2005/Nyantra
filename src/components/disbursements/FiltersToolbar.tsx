'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
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

const selectClass =
  'w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500';

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
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-xl"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
          <input
            type="text"
            placeholder={t('extracted.search_by_beneficiary_transaction_id_or_district')}
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1 sm:p-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded ${viewMode === 'table' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
          >
            {t('extracted.table')}
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded ${viewMode === 'cards' ? 'accent-gradient text-white' : 'theme-text-muted'}`}
          >
            {t('extracted.cards')}
          </button>
        </div>

        {/* Filter Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-lg theme-border-glass border flex items-center gap-2 ${showFilters ? 'accent-gradient text-white' : 'theme-bg-glass theme-text-primary'}`}
          style={!showFilters && theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
        >
          <Filter className="w-4 h-4" />
          <span>{t('extracted.filters')} </span>
          {filtersActive && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
        </motion.button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t theme-border-glass">
              <div>
                <label className="block text-sm theme-text-muted mb-2">{t('extracted.status')} </label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setFilter('statusFilter', e.target.value)}
                  className={selectClass}
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <option value="all">{t('extracted.all_statuses')} </option>
                  <option value="completed">{t('extracted.completed')} </option>
                  <option value="pending">{t('extracted.pending')} </option>
                  <option value="in-progress">{t('extracted.in_progress')} </option>
                  <option value="failed">{t('extracted.failed')} </option>
                  <option value="cancelled">{t('extracted.cancelled')} </option>
                </select>
              </div>
              <div>
                <label className="block text-sm theme-text-muted mb-2">{t('extracted.act_type')} </label>
                <select
                  value={filters.actTypeFilter}
                  onChange={(e) => setFilter('actTypeFilter', e.target.value)}
                  className={selectClass}
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <option value="all">{t('extracted.all_acts')} </option>
                  <option value="PCR Act">{t('extracted.pcr_act')} </option>
                  <option value="PoA Act">{t('extracted.poa_act')} </option>
                </select>
              </div>
              <div>
                <label className="block text-sm theme-text-muted mb-2">{t('extracted.time_period')} </label>
                <select
                  value={filters.dateFilter}
                  onChange={(e) => setFilter('dateFilter', e.target.value)}
                  className={selectClass}
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <option value="all">{t('extracted.all_time')} </option>
                  <option value="today">{t('extracted.today')} </option>
                  <option value="week">{t('extracted.this_week')} </option>
                  <option value="month">{t('extracted.this_month')} </option>
                </select>
              </div>
              <div>
                <label className="block text-sm theme-text-muted mb-2">{t('extracted.priority')} </label>
                <select
                  value={filters.priorityFilter}
                  onChange={(e) => setFilter('priorityFilter', e.target.value)}
                  className={selectClass}
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <option value="all">{t('extracted.all_priorities')} </option>
                  <option value="high">{t('extracted.high')} </option>
                  <option value="medium">{t('extracted.medium')} </option>
                  <option value="low">{t('extracted.low')}</option>
                </select>
              </div>
            </div>

            {/* Sorting Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t theme-border-glass">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <ArrowUpDown className="w-3 h-3 text-white" />
                  </div>
                  <label className="text-sm font-medium theme-text-primary">{t('extracted_grouped.hero.sortBy') || 'Sort By'}</label>
                </div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilter('sortBy', e.target.value)}
                  className={selectClass}
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
                >
                  <option value="initiatedDate">{t('extracted_grouped.hero.sortOptions.initiatedDate') || 'Initiated Date'}</option>
                  <option value="reliefAmount">{t('extracted_grouped.hero.sortOptions.reliefAmount') || 'Amount'}</option>
                  <option value="status">{t('extracted_grouped.hero.sortOptions.status') || 'Status'}</option>
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                    <ArrowUpDown className="w-3 h-3 text-white" />
                  </div>
                  <label className="text-sm font-medium theme-text-primary">{t('extracted_grouped.hero.sortOrder') || 'Sort Order'}</label>
                </div>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                  className={selectClass}
                  style={{ background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : undefined }}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
