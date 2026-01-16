import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import React from "react";

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
  sendApplicationsEmail: (apps: any[], format: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  theme,
  t,
  applications,
  filteredApplications,
  exportApplicationsData,
  exportApplicationsPDF,
  emailAddress,
  setEmailAddress,
  sendingEmail,
  sendApplicationsEmail,
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
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="relative w-full max-w-md mx-4 p-6 rounded-xl theme-border-glass border shadow-lg"
          style={{
            background:
              theme === "light"
                ? "rgba(255,255,255,0.98)"
                : "rgba(6,8,20,0.98)",
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold theme-text-primary flex items-center gap-3">
                <Download className="w-5 h-5 text-accent-gradient" />
                {t("applications.exportTitle") || "Export Applications"}
              </h3>
              <p className="text-sm theme-text-muted mt-1">
                {t("applications.exportSubtitle") || "Choose export format for applications data"}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close export modal"
              className="p-2 rounded-md theme-bg-glass hover:bg-red-500/10 transition-colors"
            >
              <X className="w-5 h-5 theme-text-primary" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Export All Section */}
            <div className="p-4 rounded-lg border theme-border-glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium theme-text-primary">{t("applications.exportAllTitle") || "All Applications"}</h4>
                  <p className="text-sm theme-text-muted">{applications.length} {t("applications.records", { count: applications.length })}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    exportApplicationsData(applications);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary transition-colors"
                >
                  {t("applications.exportCsv") || "Export CSV"}
                </button>
                <button
                  onClick={() => {
                    exportApplicationsPDF(applications);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md transition-shadow"
                >
                  {t("applications.exportPdf") || "Export PDF"}
                </button>
              </div>
            </div>

            {/* Export Filtered Section */}
            <div className="p-4 rounded-lg border theme-border-glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium theme-text-primary">{t("applications.exportFilteredTitle") || "Filtered Results"}</h4>
                  <p className="text-sm theme-text-muted">{filteredApplications.length} {t("applications.records", { count: filteredApplications.length })}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  disabled={filteredApplications.length === 0}
                  onClick={() => {
                    exportApplicationsData(filteredApplications);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("applications.exportCsv") || "Export CSV"}
                </button>
                <button
                  disabled={filteredApplications.length === 0}
                  onClick={() => {
                    exportApplicationsPDF(filteredApplications);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                >
                  {t("applications.exportPdf") || "Export PDF"}
                </button>
              </div>
            </div>

            {/* Email Export Section */}
            <div className="p-4 rounded-lg border theme-border-glass">
              <div className="mb-3">
                <h4 className="font-medium theme-text-primary mb-2">{t("applications.emailExport")}</h4>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder={t("applications.enterEmailAddress") || "Enter email address"}
                  className="w-full px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <button
                    disabled={!emailAddress.trim() || sendingEmail}
                    onClick={() => sendApplicationsEmail(applications, 'csv')}
                    className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                    {t("applications.sendCsv")}
                  </button>
                  <button
                    disabled={!emailAddress.trim() || sendingEmail}
                    onClick={() => sendApplicationsEmail(applications, 'pdf')}
                    className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {t("applications.sendPdf")}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={!emailAddress.trim() || filteredApplications.length === 0 || sendingEmail}
                    onClick={() => sendApplicationsEmail(filteredApplications, 'csv')}
                    className="flex-1 px-4 py-2 rounded-lg border theme-border-glass text-sm hover:shadow-sm theme-bg-glass theme-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                    {t("applications.sendFilteredCsv")}
                  </button>
                  <button
                    disabled={!emailAddress.trim() || filteredApplications.length === 0 || sendingEmail}
                    onClick={() => sendApplicationsEmail(filteredApplications, 'pdf')}
                    className="flex-1 px-4 py-2 rounded-lg text-sm accent-gradient text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {t("applications.sendFilteredPdf")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ExportModal;
