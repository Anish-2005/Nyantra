import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, LayoutGrid, Rows3 } from "lucide-react";

interface FiltersSearchProps {
  theme: string;
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
}

const selectClass =
  "w-full h-9 px-2.5 rounded-md theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1.5">{label}</label>
    {children}
  </div>
);

const FiltersSearch: React.FC<FiltersSearchProps> = ({
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
}) => (
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
          className="w-full h-9 pl-8 pr-3 rounded-md theme-bg-glass theme-border-glass border theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
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
              className={`h-9 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors ${
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
          className={`h-9 px-3 rounded-md border inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t theme-border-glass">
            <Field label={t("applications.filterLabels.status")}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                <option value="all">{t("applications.filterLabels.allStatuses")}</option>
                <option value="pending">{t("applications.stats.pending")}</option>
                <option value="in-review">{t("applications.stats.inReview")}</option>
                <option value="approved">{t("applications.stats.approved")}</option>
                <option value="rejected">{t("applications.stats.rejected")}</option>
                <option value="documents-required">{t("applications.stats.docsRequired")}</option>
              </select>
            </Field>
            <Field label={t("applications.filterLabels.actType")}>
              <select value={actTypeFilter} onChange={(e) => setActTypeFilter(e.target.value)} className={selectClass}>
                <option value="all">{t("applications.filterLabels.allActs")}</option>
                <option value="PCR Act">{t("extracted.pcr_act")}</option>
                <option value="PoA Act">{t("extracted.poa_act")}</option>
              </select>
            </Field>
            <Field label={t("applications.filterLabels.priority")}>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectClass}>
                <option value="all">{t("applications.filterLabels.allPriorities")}</option>
                <option value="high">{t("extracted.high")}</option>
                <option value="medium">{t("extracted.medium")}</option>
                <option value="low">{t("extracted.low")}</option>
              </select>
            </Field>
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
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default FiltersSearch;
