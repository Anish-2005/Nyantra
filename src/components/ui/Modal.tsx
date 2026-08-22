'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  maxWidthClass?: string;
  children: ReactNode;
}

/** Overlay modal matching the legacy ExportModal pattern (scale/fade + solid panel). */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-md',
  children,
}: ModalProps) {
  const { theme } = useTheme();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${maxWidthClass} mx-4 p-6 rounded-xl theme-border-glass border shadow-lg theme-modal-solid`}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between mb-6">
                <div>
                  {title && <h3 className="text-xl font-semibold theme-text-primary">{title}</h3>}
                  {subtitle && <p className="text-sm theme-text-muted mt-1">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-5 h-5 theme-text-primary" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
