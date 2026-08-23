'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

interface Props {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalFiltered: number;
  itemsPerPage: number;
  isMobile: boolean;
}

export function PaginationBar({
  currentPage,
  setCurrentPage,
  totalPages,
  totalFiltered,
  itemsPerPage,
  isMobile,
}: Props) {
  const { t } = useLocale();

  if (totalPages <= 0) return null;

  const navBtn =
    'w-8 h-8 inline-flex items-center justify-center rounded-md theme-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:theme-bg-glass hover:theme-text-primary transition-colors';

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t theme-border-glass">
      <p className="text-xs theme-text-muted tabular-nums">
        {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')}{' '}
        {Math.min(currentPage * itemsPerPage, totalFiltered)} {t('extracted.of')} {totalFiltered}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p: number) => p - 1)}
          className={navBtn}
          aria-label={t('extracted.prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {isMobile ? (
          <span className="px-1.5 text-xs font-semibold theme-text-primary tabular-nums">
            {currentPage} / {totalPages}
          </span>
        ) : (
          Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + Math.max(1, currentPage - 2);
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                  currentPage === pageNum
                    ? 'theme-bg-glass text-accent-gradient'
                    : 'theme-text-muted hover:theme-bg-glass hover:theme-text-primary'
                }`}
              >
                {pageNum}
              </button>
            );
          })
        )}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p: number) => p + 1)}
          className={navBtn}
          aria-label={t('extracted.next')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
