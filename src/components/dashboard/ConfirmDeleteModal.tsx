import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface ConfirmDeleteModalProps {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  theme: string;
  t: (key: string, options?: any) => string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  message,
  onCancel,
  onConfirm,
  theme,
  t,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onCancel}
        />
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="relative w-full max-w-md p-6 rounded-xl theme-border-glass border shadow-lg theme-bg-card"
        >
          <h3 className="text-lg font-semibold theme-text-primary mb-3">
            {t("applications.confirmDeleteTitle")}
          </h3>
          <p className="text-sm theme-text-muted mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white ${
                theme === "light" ? "bg-red-600" : "bg-red-500"
              }`}
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmDeleteModal;
