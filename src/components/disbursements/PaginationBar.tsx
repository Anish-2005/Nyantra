'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { lightSurface } from './shared';

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
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t theme-border-glass theme-bg-glass">
      <p className="text-sm theme-text-muted">
        {t('extracted.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('extracted.to')}{' '}
        {Math.min(currentPage * itemsPerPage, totalFiltered)} {t('extracted.of')} {totalFiltered}
      </p>
      <div className="flex items-center gap-2">
        {isMobile ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p: number) => p - 1)}
              className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
              style={lightSurface(theme)}
            >
              {t('extracted.prev')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p: number) => p + 1)}
              className="px-4 py-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
              style={lightSurface(theme)}
            >
              {t('extracted.next')}
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p: number) => p - 1)}
              className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
              style={lightSurface(theme)}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 rounded-lg ${
                  currentPage === i + 1
                    ? 'accent-gradient text-white'
                    : 'theme-bg-card theme-border-glass border theme-text-primary'
                }`}
                style={currentPage !== i + 1 && theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined}
              >
                {i + 1}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p: number) => p + 1)}
              className="p-2 rounded-lg theme-bg-card theme-border-glass border disabled:opacity-50 theme-text-primary"
              style={lightSurface(theme)}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
