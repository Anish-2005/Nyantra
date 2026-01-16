import React from "react";
import { Shield, X, Edit } from "lucide-react";

interface ApplicationDetailProps {
  selectedApplication: any;
  setSelectedApplication: (app: any) => void;
  setShowNewApplicationForm: (show: boolean) => void;
  t: (key: string) => string;
  theme: string;
  expectedAmount: number;
  setExpectedAmount: (amt: number) => void;
  updateApplicationAmount: (id: string, amt: number) => void;
  detailStatus: string;
  setDetailStatus: (status: string) => void;
  updateApplicationStatus: (id: string, status: string) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amt: number) => string;
  POA_OFFENCES: any;
  setShowExportModal: (show: boolean) => void;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  selectedApplication,
  setSelectedApplication,
  setShowNewApplicationForm,
  t,
  theme,
  expectedAmount,
  setExpectedAmount,
  updateApplicationAmount,
  detailStatus,
  setDetailStatus,
  updateApplicationStatus,
  formatDate,
  formatCurrency,
  POA_OFFENCES,
  setShowExportModal,
}) => {
  if (!selectedApplication) return null;

  return (
    <div
      className="theme-bg-card theme-border-glass border rounded-2xl w-full mt-6 overflow-hidden"
      aria-live="polite"
    >
      <div className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b theme-border-glass">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">
            {selectedApplication.applicantName}
          </h2>
          <p className="theme-text-muted">
            {selectedApplication.id} • {selectedApplication.actType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedApplication(null)}
            className="p-2 rounded-lg theme-bg-glass hover:bg-red-500/10 theme-text-primary transition-colors"
            aria-label={t("extracted.close_sidebar") || "Close"}
          >
            <X className="w-5 h-5 theme-text-primary" />
          </button>
          <button
            onClick={() => setShowNewApplicationForm(true)}
            className="px-3 py-2 rounded-lg accent-gradient text-white"
          >
            <Edit className="w-4 h-4 inline-block mr-2" /> {t("applications.edit") || "Edit"}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold theme-text-primary mb-4">
            {t("applications.details") || "Application Details"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.applicant")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.applicantName}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.aadhaar_number")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.aadhaar}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.phone_number")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.phone}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.location")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.district}, {selectedApplication.state}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.act_type")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.actType}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.incident_date")}</p>
              <p className="font-medium theme-text-primary">{formatDate(selectedApplication.incidentDate)}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.application_date")}</p>
              <p className="font-medium theme-text-primary">{formatDate(selectedApplication.applicationDate)}</p>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.amount_1") || "Amount"}</p>
              <p className="font-semibold theme-text-primary">{formatCurrency(selectedApplication.amount)}</p>
            </div>
            {/* POA Offence Information */}
            {selectedApplication.actType === "PoA Act" && (selectedApplication.offenceCategory || selectedApplication.offenceType) && (
              <div className="md:col-span-2 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold theme-text-primary mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  {t("applications.poa_act_offence_details")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedApplication.offenceCategory && (
                    <div>
                      <p className="text-xs theme-text-muted mb-1">{t("applications.offence_category")}</p>
                      <p className="font-medium theme-text-primary">{selectedApplication.offenceCategory}</p>
                    </div>
                  )}
                  {selectedApplication.offenceType && (
                    <div>
                      <p className="text-xs theme-text-muted mb-1">{t("applications.specific_offence")}</p>
                      <p className="font-medium theme-text-primary">{selectedApplication.offenceType}</p>
                    </div>
                  )}
                </div>
                {/* Expected Amount Adjustment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium theme-text-primary">Expected Relief Amount</label>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{expectedAmount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs theme-text-muted">Adjustable by officer</div>
                    </div>
                  </div>
                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="10000"
                      value={expectedAmount}
                      onChange={(e) => setExpectedAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                    />
                    <div className="flex justify-between text-xs theme-text-muted">
                      <span>₹0</span>
                      <span>₹20,00,000</span>
                    </div>
                  </div>
                  {/* Text Input */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={expectedAmount}
                      onChange={(e) => setExpectedAmount(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
                      placeholder="Enter amount"
                    />
                    <button
                      onClick={() => {
                        if (selectedApplication) {
                          updateApplicationAmount(selectedApplication.id, expectedAmount);
                        }
                      }}
                      disabled={!selectedApplication || expectedAmount === selectedApplication.amount}
                      className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                        theme === "light" ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
                      } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      Update Amount
                    </button>
                  </div>
                  {/* Guideline Amount Display */}
                  {selectedApplication.offenceCategory && selectedApplication.offenceType && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">PoA Guideline Amount</span>
                      </div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">
                        {(() => {
                          const category = POA_OFFENCES[selectedApplication.offenceCategory as keyof typeof POA_OFFENCES];
                          const compensation = category && selectedApplication.offenceType in category
                            ? category[selectedApplication.offenceType as keyof typeof category] as string | number
                            : null;
                          if (compensation && typeof compensation === "string" && compensation.includes("-")) {
                            return `₹${compensation.replace("-", " - ₹")}`;
                          }
                          return compensation ? `₹${(compensation as number).toLocaleString("en-IN")}` : "₹0";
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.status")}</p>
              <div className="flex items-center gap-3">
                <select
                  value={detailStatus}
                  onChange={(e) => setDetailStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                >
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="documents-required">Documents Required</option>
                </select>
                <button
                  onClick={() => {
                    if (selectedApplication) {
                      updateApplicationStatus(selectedApplication.id, detailStatus);
                    }
                  }}
                  disabled={!selectedApplication || detailStatus === selectedApplication.status}
                  className={`px-3 py-2 rounded-lg text-white ${theme === "light" ? "bg-blue-600" : "bg-blue-500"}`}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.priority")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.priority}</p>
            </div>
            <div className="md:col-span-2 p-3 rounded-lg theme-bg-glass border theme-border-glass">
              <p className="text-xs theme-text-muted mb-1">{t("extracted.assigned_officer")}</p>
              <p className="font-medium theme-text-primary">{selectedApplication.assignedOfficer || "—"}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-lg border theme-border-glass theme-bg-glass theme-text-primary"
          >
            {t("extracted.export")}
          </button>
          <button
            onClick={() => setSelectedApplication(null)}
            className="px-4 py-2 rounded-lg theme-bg-glass theme-border-glass theme-text-primary"
          >
            {t("extracted.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
