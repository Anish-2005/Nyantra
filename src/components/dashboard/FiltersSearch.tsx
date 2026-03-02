import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter } from "lucide-react";

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

const FiltersSearch: React.FC<FiltersSearchProps> = ({
  theme,
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
    transition={{ delay: 0.2 }}
    className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm"
  >
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
        <input
          type="text"
          placeholder={t("applications.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 theme-bg-glass rounded-lg p-1">
        <button
          onClick={() => setViewMode("table")}
          className={`px-4 py-2 rounded ${
            viewMode === "table"
              ? "accent-gradient text-white"
              : "theme-text-muted hover:theme-text-primary"
          } transition-colors`}
        >
          {t("applications.viewMode.table")}
        </button>
        <button
          onClick={() => setViewMode("cards")}
          className={`px-4 py-2 rounded ${
            viewMode === "cards"
              ? "accent-gradient text-white"
              : "theme-text-muted hover:theme-text-primary"
          } transition-colors`}
        >
          {t("applications.viewMode.cards")}
        </button>
      </div>

      {/* Filter Toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowFilters(!showFilters)}
        className={`px-4 py-3 rounded-lg theme-border-glass border flex items-center gap-2 ${
          showFilters
            ? "accent-gradient text-white"
            : "theme-bg-glass theme-text-primary"
        } transition-colors`}
      >
        <Filter className="w-4 h-4" />
        <span>{t("applications.filters")}</span>
        {(statusFilter !== "all" ||
          actTypeFilter !== "all" ||
          priorityFilter !== "all" ||
          sortBy !== "status" ||
          sortOrder !== "asc") && (
          <span className="w-2 h-2 bg-red-500 rounded-full" />
        )}
      </motion.button>
    </div>

    {/* Expanded Filters */}
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t theme-border-glass">
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">
                {t("applications.filterLabels.status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="all">
                  {t("applications.filterLabels.allStatuses")}
                </option>
                <option value="pending">
                  {t("applications.stats.pending")}
                </option>
                <option value="in-review">
                  {t("applications.stats.inReview")}
                </option>
                <option value="approved">
                  {t("applications.stats.approved")}
                </option>
                <option value="rejected">
                  {t("applications.stats.rejected")}
                </option>
                <option value="documents-required">
                  {t("applications.stats.docsRequired")}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">
                {t("applications.filterLabels.actType")}
              </label>
              <select
                value={actTypeFilter}
                onChange={(e) => setActTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="all">
                  {t("applications.filterLabels.allActs")}
                </option>
                <option value="PCR Act">{t("extracted.pcr_act")}</option>
                <option value="PoA Act">{t("extracted.poa_act")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">
                {t("applications.filterLabels.priority")}
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="all">
                  {t("applications.filterLabels.allPriorities")}
                </option>
                <option value="high">{t("extracted.high")}</option>
                <option value="medium">{t("extracted.medium")}</option>
                <option value="low">{t("extracted.low")}</option>
              </select>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t theme-border-glass">
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">
                {t("applications.sortBy") || "Sort By"}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="applicationDate">{t("applications.sortOptions.applicationDate") || "Application Date"}</option>
                <option value="amount">{t("applications.sortOptions.amount") || "Amount"}</option>
                <option value="status">{t("applications.sortOptions.status") || "Status"}</option>
                <option value="priority">{t("applications.sortOptions.priority") || "Priority"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">
                {t("applications.sortOrder") || "Sort Order"}
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default FiltersSearch;
