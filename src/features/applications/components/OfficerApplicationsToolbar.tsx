"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, LayoutGrid, Rows3 } from 'lucide-react';
import { FilterPills, type FilterPillItem } from '@/components/dashboard/ui';

/**
 * Officer applications toolbar: search, view-mode toggle and filter panel.
 * Status/priority/act filters use the kit FilterPills (≤6 options each);
 * sort controls remain selects.
 */
const selectClass =
  "w-full h-10 sm:h-9 px-2.5 rounded-md theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5">{label}</label>
    {children}
  </div>
);

export default function OfficerApplicationsToolbar({
  t,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  statusFilter,
  setStatusFilter,
  actTypeFilter,
  setActTypeFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  stats,
}: {
  t: (key: string, options?: any) => string;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  viewMode: 'table' | 'cards';
  setViewMode: (v: 'table' | 'cards') => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  actTypeFilter: string;
  setActTypeFilter: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  sortOrder: 'desc' | 'asc';
  setSortOrder: (v: 'desc' | 'asc') => void;
  stats: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
    documentsRequired: number;
  };
}) {
  const statusItems: FilterPillItem[] = [
    { key: 'all', label: t('applications.filterLabels.allStatuses'), count: stats.total },
    { key: 'pending', label: t('applications.stats.pending'), count: stats.pending },
    { key: 'in-review', label: t('applications.stats.inReview'), count: stats.inReview },
    { key: 'approved', label: t('applications.stats.approved'), count: stats.approved },
    { key: 'rejected', label: t('applications.stats.rejected'), count: stats.rejected },
    { key: 'documents-required', label: t('applications.stats.docsRequired') || t('applications.stats.documentsrequired'), count: stats.documentsRequired }
  ];

  const priorityItems: FilterPillItem[] = [
    { key: 'all', label: t('applications.filterLabels.allPriorities') },
    { key: 'high', label: t('extracted.high') },
    { key: 'medium', label: t('extracted.medium') },
    { key: 'low', label: t('extracted.low') }
  ];

  const actItems: FilterPillItem[] = [
    { key: 'all', label: t('applications.filterLabels.allActs') },
    { key: 'PCR Act', label: t('extracted.pcr_act') },
    { key: 'PoA Act', label: t('extracted.poa_act') }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="theme-bg-card theme-border-glass border rounded-xl p-2.5"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
          <input
            type="text"
            placeholder={t("applications.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 sm:h-9 pl-8 pr-3 rounded-md theme-bg-glass theme-border-glass border theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5" role="group" aria-label="View mode">
            {([
              { mode: "table", icon: Rows3, label: t("applications.viewMode.table") },
              { mode: "cards", icon: LayoutGrid, label: t("applications.viewMode.cards") },
            ] as const).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                aria-pressed={viewMode === mode}
                className={`h-10 sm:h-9 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === mode
                    ? "theme-bg-glass text-accent-gradient"
                    : "theme-text-muted hover:theme-text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className={`h-10 sm:h-9 px-3 rounded-md border inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              showFilters
                ? "theme-bg-glass border-transparent text-accent-gradient"
                : "theme-border-glass theme-text-secondary hover:theme-bg-glass hover:theme-text-primary"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t("applications.filters")}</span>
            {(statusFilter !== "all" ||
              actTypeFilter !== "all" ||
              priorityFilter !== "all" ||
              sortBy !== "status" ||
              sortOrder !== "asc") && (
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mt-3 pt-3 border-t theme-border-glass">
              <Field label={t("applications.filterLabels.status")}>
                <FilterPills items={statusItems} value={statusFilter} onChange={setStatusFilter} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t("applications.filterLabels.priority")}>
                  <FilterPills items={priorityItems} value={priorityFilter} onChange={setPriorityFilter} />
                </Field>
                <Field label={t("applications.filterLabels.actType")}>
                  <FilterPills items={actItems} value={actTypeFilter} onChange={setActTypeFilter} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t("applications.sortBy") || "Sort By"}>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                    <option value="applicationDate">{t("applications.sortOptions.applicationDate") || "Application Date"}</option>
                    <option value="amount">{t("applications.sortOptions.amount") || "Amount"}</option>
                    <option value="status">{t("applications.sortOptions.status") || "Status"}</option>
                    <option value="priority">{t("applications.sortOptions.priority") || "Priority"}</option>
                  </select>
                </Field>
                <Field label={t("applications.sortOrder") || "Sort Order"}>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className={selectClass}>
                    <option value="desc">
                      {sortBy === 'amount' ? (t("applications.sortOrderOptions.highToLow") || 'High to Low') :
                       sortBy === 'status' ? (t("applications.sortOrderOptions.approvedToPending") || 'Approved to Pending') :
                       sortBy === 'priority' ? (t("applications.sortOrderOptions.highToLow") || 'High to Low') : (t("applications.sortOrderOptions.newestFirst") || 'Newest First')}
                    </option>
                    <option value="asc">
                      {sortBy === 'amount' ? (t("applications.sortOrderOptions.lowToHigh") || 'Low to High') :
                       sortBy === 'status' ? (t("applications.sortOrderOptions.pendingToApproved") || 'Pending to Approved') :
                       sortBy === 'priority' ? (t("applications.sortOrderOptions.lowToHigh") || 'Low to High') : (t("applications.sortOrderOptions.oldestFirst") || 'Oldest First')}
                    </option>
                  </select>
                </Field>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
