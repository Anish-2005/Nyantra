"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import type { TranslateFnLike } from '../helpers';
import { OFFICER_INPUT_CLS } from '../helpers';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">{children}</label>
);

/**
 * Search + table/cards view switcher with expandable filter panel and active filter chips.
 */
export default function OfficerBeneficiaryFilters({
  t,
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  verificationFilter,
  onVerificationFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
}: {
  t: TranslateFnLike;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (m: 'table' | 'cards') => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  verificationFilter: string;
  onVerificationFilterChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (v: 'asc' | 'desc') => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl">
      {/* Header row: search + view mode + filter toggle */}
      <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="relative w-full sm:max-w-sm min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={t('extracted.search_by_name_aadhaar_id_or_district')}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full h-9 pl-8 pr-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center rounded-md border theme-border-glass p-0.5">
            <button
              onClick={() => onViewModeChange('table')}
              className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${viewMode === 'table' ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-text-primary'}`}
            >
              {t('extracted.table')}
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              className={`h-7 px-2.5 rounded text-xs font-medium transition-colors ${viewMode === 'cards' ? 'theme-bg-glass text-accent-gradient' : 'theme-text-muted hover:theme-text-primary'}`}
            >
              {t('extracted.cards')}
            </button>
          </div>
          <button
            onClick={onToggleFilters}
            className={`h-9 px-3 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${showFilters ? 'accent-gradient text-white' : 'theme-text-secondary hover:theme-bg-glass hover:theme-text-primary'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t('extracted.filters')}</span>
            {hasActiveFilters && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
          </button>
        </div>
      </div>

      {/* Expandable filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label>{t('extracted.status')}</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className={OFFICER_INPUT_CLS}
                >
                  <option value="all">{t('extracted.all_statuses')}</option>
                  <option value="verified">{t('extracted.verified')}</option>
                  <option value="pending-verification">{t('extracted.pending_verification')}</option>
                  <option value="rejected">{t('extracted.rejected')}</option>
                  <option value="documents-required">{t('extracted.documents_required')}</option>
                </select>
              </div>
              <div>
                <Label>{t('extracted.category_1')}</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                  className={OFFICER_INPUT_CLS}
                >
                  <option value="all">{t('extracted.all_categories')}</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                </select>
              </div>
              <div>
                <Label>{t('extracted.verification')}</Label>
                <select
                  value={verificationFilter}
                  onChange={(e) => onVerificationFilterChange(e.target.value)}
                  className={OFFICER_INPUT_CLS}
                >
                  <option value="all">{t('extracted.all_verification')}</option>
                  <option value="verified">{t('extracted.verified')}</option>
                  <option value="pending">{t('extracted.pending')}</option>
                  <option value="rejected">{t('extracted.rejected')}</option>
                  <option value="documents-required">{t('extracted.documents_required')}</option>
                </select>
              </div>
              <div>
                <Label>{t("beneficiary.sortBy") || "Sort By"}</Label>
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  className={OFFICER_INPUT_CLS}
                >
                  <option value="registrationDate">{t("beneficiary.sortOptions.registrationDate") || "Registration Date"}</option>
                  <option value="status">{t("beneficiary.sortOptions.status") || "Status"}</option>
                  <option value="verification">{t("beneficiary.sortOptions.verification") || "Verification"}</option>
                </select>
              </div>
            </div>

            <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label>{t("beneficiary.sortOrder") || "Sort Order"}</Label>
                <select
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
                  className={OFFICER_INPUT_CLS}
                >
                  <option value="desc">
                    {sortBy === 'status' ? (t("beneficiary.sortOrderOptions.verifiedToPending") || 'Verified to Pending') :
                      sortBy === 'verification' ? (t("beneficiary.sortOrderOptions.verifiedToPending") || 'Verified to Pending') : (t("beneficiary.sortOrderOptions.newestFirst") || 'Newest First')}
                  </option>
                  <option value="asc">
                    {sortBy === 'status' ? (t("beneficiary.sortOrderOptions.pendingToVerified") || 'Pending to Verified') :
                      sortBy === 'verification' ? (t("beneficiary.sortOrderOptions.pendingToVerified") || 'Pending to Verified') : (t("beneficiary.sortOrderOptions.oldestFirst") || 'Oldest First')}
                  </option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                    Status: {statusFilter.replace('-', ' ')}
                    <button onClick={() => onStatusFilterChange('all')} className="rounded-full p-0.5 hover:theme-text-primary transition-colors" aria-label="Clear status filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                    Category: {categoryFilter}
                    <button onClick={() => onCategoryFilterChange('all')} className="rounded-full p-0.5 hover:theme-text-primary transition-colors" aria-label="Clear category filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {verificationFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                    Verification: {verificationFilter.replace('-', ' ')}
                    <button onClick={() => onVerificationFilterChange('all')} className="rounded-full p-0.5 hover:theme-text-primary transition-colors" aria-label="Clear verification filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(sortBy !== 'registrationDate' || sortOrder !== 'desc') && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md theme-bg-glass theme-text-secondary text-xs font-medium">
                    Sort: {sortBy === 'status' ? 'Status' : sortBy === 'verificationStatus' || sortBy === 'verification' ? 'Verification' : 'Registration Date'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                    <button
                      onClick={() => {
                        onSortByChange('registrationDate');
                        onSortOrderChange('desc');
                      }}
                      className="rounded-full p-0.5 hover:theme-text-primary transition-colors"
                      aria-label="Reset sorting"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={onResetFilters}
                  className="px-2 py-1 rounded-md theme-bg-glass theme-text-muted text-xs font-medium hover:theme-text-primary transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
