"use client";
import { Download, Eye } from 'lucide-react';
import type { DistrictRow, DistrictSortKey, TranslateFn } from '../helpers';
import { getSuccessRatePillClass, SELECT_CLS } from '../helpers';

/** Sortable/paginated top-performing-districts table with per-row quick actions. */
const TopDistrictsTable = ({
  districts,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  sortBy,
  sortOrder,
  onSort,
  onExportPdf,
  t,
}: {
  districts: DistrictRow[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  sortBy: DistrictSortKey;
  sortOrder: 'asc' | 'desc';
  onSort: (key: DistrictSortKey) => void;
  onExportPdf: () => void;
  t: TranslateFn;
}) => {
  const totalPages = Math.ceil(districts.length / itemsPerPage);

  return (
    <section className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden min-w-0">
      <div className="px-4 py-3 border-b theme-border-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold theme-text-primary truncate">{t('extracted.top_performing_districts')}</h3>
          <p className="text-[11px] theme-text-muted mt-0.5 truncate">{t('extracted.districts_with_highest_disbursement_rates')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onExportPdf}
            className="h-9 px-2.5 rounded-md border theme-border-glass inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-bg-glass hover:theme-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('extracted.export')}</span>
          </button>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={`${SELECT_CLS} h-8 px-2 text-xs`}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b theme-border-glass">
            <tr>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.rank')}</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => onSort('district')}>
                {t('extracted.district')}{sortBy === 'district' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.state')}</th>
              <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => onSort('applications')}>
                {t('extracted.applications')}{sortBy === 'applications' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => onSort('disbursements')}>
                {t('extracted.disbursements')}{sortBy === 'disbursements' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th className="hidden lg:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted cursor-pointer select-none hover:theme-text-secondary transition-colors" onClick={() => onSort('successRate')}>
                {t('extracted.success_rate')}{sortBy === 'successRate' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t('extracted.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y theme-border-glass">
            {districts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((district, idx) => (
              <tr
                key={`${district.district}-${district.state}`}
                className="hover:theme-bg-hover transition-colors"
              >
                <td className="py-2.5 px-3 text-[13px] font-semibold tabular-nums theme-text-muted">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td className="py-2.5 px-3 text-[13px] font-medium theme-text-primary max-w-[160px] truncate">{district.district}</td>
                <td className="hidden sm:table-cell py-2.5 px-3 text-[13px] theme-text-secondary">{district.state}</td>
                <td className="hidden md:table-cell py-2.5 px-3 text-[13px] tabular-nums theme-text-secondary">{district.applications}</td>
                <td className="hidden md:table-cell py-2.5 px-3 text-[13px] tabular-nums theme-text-secondary">{district.disbursements}</td>
                <td className="hidden lg:table-cell py-2.5 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getSuccessRatePillClass(district.successRate)}`}>
                    {district.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex justify-end gap-1">
                    <button
                      className="p-1.5 rounded-md border theme-border-glass theme-text-muted hover:theme-text-primary hover:theme-bg-glass transition-colors"
                      title={t('extracted.view_details')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md border theme-border-glass theme-text-muted hover:theme-text-primary hover:theme-bg-glass transition-colors"
                      title={t('extracted.export_data')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t theme-border-glass flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs theme-text-muted">
            {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')} {Math.min(currentPage * itemsPerPage, districts.length)} {t('extracted.of')} {districts.length} {t('extracted.entries')}
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs font-medium hover:theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('extracted.previous')}
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`h-8 min-w-[2rem] px-2 rounded-md text-xs font-medium transition-colors ${currentPage === pageNum
                    ? 'accent-gradient text-white'
                    : 'border theme-border-glass theme-bg-input theme-text-secondary hover:theme-text-primary'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-secondary text-xs font-medium hover:theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('extracted.next')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TopDistrictsTable;
