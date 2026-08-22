"use client";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  t: (key: string, options?: any) => string;
  applications: any[];
  filteredApplications: any[];
  exportApplicationsData: (apps: any[]) => void;
  exportApplicationsPDF: (apps: any[]) => void;
  emailAddress: string;
  setEmailAddress: (email: string) => void;
  sendingEmail: boolean;
  sendApplicationsEmail: (apps: any[], format: 'csv' | 'pdf') => void | Promise<void>;
}

const btnGhost =
  "flex-1 h-8 rounded-md border theme-border-glass theme-bg-glass theme-text-secondary text-xs font-medium hover:theme-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";
const btnPrimary =
  "flex-1 h-8 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";

const Spinner = ({ invert }: { invert?: boolean }) => (
  <span className={`w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${invert ? 'border-white' : 'border-current'}`} />
);

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  t,
  applications,
  filteredApplications,
  exportApplicationsData,
  exportApplicationsPDF,
  emailAddress,
  setEmailAddress,
  sendingEmail,
  sendApplicationsEmail,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll + close on Escape while drawer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

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
            onClick={onClose}
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
            role="dialog"
            aria-modal="true"
          >
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Download className="w-4 h-4 theme-text-secondary shrink-0" />
            <h2 className="text-sm font-semibold tracking-tight theme-text-primary truncate">
              {t("applications.exportTitle") || "Export Applications"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Download */}
          <section>
            {[
              { title: t("applications.exportAllTitle") || "All Applications", count: applications.length, apps: applications },
              { title: t("applications.exportFilteredTitle") || "Filtered Results", count: filteredApplications.length, apps: filteredApplications },
            ].map((group, gi) => (
              <div key={gi} className={gi === 1 ? "mt-4 pt-4 border-t theme-border-glass" : ""}>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">{group.title}</h3>
                  <span className="text-[11px] tabular-nums theme-text-muted">
                    {group.count} {t("applications.records", { count: group.count })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={group.apps.length === 0}
                    onClick={() => { exportApplicationsData(group.apps); onClose(); }}
                    className={btnGhost}
                  >
                    CSV
                  </button>
                  <button
                    disabled={group.apps.length === 0}
                    onClick={() => { exportApplicationsPDF(group.apps); onClose(); }}
                    className={btnPrimary}
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Email */}
          <section className="mt-4 pt-4 border-t theme-border-glass">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2">
              {t("applications.emailExport")}
            </h3>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder={t("applications.enterEmailAddress") || "Enter email address"}
              className="w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <button
                disabled={!emailAddress.trim() || sendingEmail}
                onClick={() => sendApplicationsEmail(applications, 'csv')}
                className={btnGhost}
              >
                {sendingEmail && <Spinner />} {t("applications.sendCsv")}
              </button>
              <button
                disabled={!emailAddress.trim() || sendingEmail}
                onClick={() => sendApplicationsEmail(applications, 'pdf')}
                className={btnPrimary}
              >
                {sendingEmail && <Spinner invert />} {t("applications.sendPdf")}
              </button>
              <button
                disabled={!emailAddress.trim() || filteredApplications.length === 0 || sendingEmail}
                onClick={() => sendApplicationsEmail(filteredApplications, 'csv')}
                className={btnGhost}
              >
                {sendingEmail && <Spinner />} {t("applications.sendFilteredCsv")}
              </button>
              <button
                disabled={!emailAddress.trim() || filteredApplications.length === 0 || sendingEmail}
                onClick={() => sendApplicationsEmail(filteredApplications, 'pdf')}
                className={btnPrimary}
              >
                {sendingEmail && <Spinner invert />} {t("applications.sendFilteredPdf")}
              </button>
            </div>
          </section>
        </div>
      </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ExportModal;
