"use client";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ConfirmDeleteModalProps {
  open: boolean;
  message: string;
  title?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  theme?: string;
  t?: (key: string, options?: any) => string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  message,
  title,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-[60]"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-[70] theme-drawer backdrop-blur-2xl border-l theme-border-glass flex flex-col shadow-2xl"
            role="alertdialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
                  {title || "Confirm Delete"}
                </h2>
              </div>
              <button
                onClick={onCancel}
                aria-label="Close"
                className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-4 py-4">
              <p className="text-sm theme-text-secondary leading-relaxed">{message}</p>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t theme-border-glass flex items-center gap-2 shrink-0">
              <button
                onClick={onCancel}
                className="flex-1 h-9 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-9 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmDeleteModal;
