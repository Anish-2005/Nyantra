"use client";
import React, { createElement } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash } from 'lucide-react';
import type { OfficerApplication, TranslateFn } from '../helpers';
import {
  formatOfficerCurrency,
  getOfficerTranslatedStatus,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  getTranslatedPriority,
} from '../helpers';

/**
 * Officer applications "table" view: scrollable data table on ≥sm screens
 * with a compact summary-card list fallback on mobile.
 */
export default function OfficerApplicationsTable({
  applications,
  highlightId,
  t,
  onView,
  onDelete,
}: {
  applications: OfficerApplication[];
  highlightId: string | null;
  t: TranslateFn;
  onView: (app: OfficerApplication) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="border-b theme-border-glass">
            <tr className="whitespace-nowrap">
              <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.application_id")}</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.applicant")}</th>
              <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted min-w-[120px]">{t("applications.beneficiaryId")}</th>
              <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.district")}</th>
              <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.act_type")}</th>
              <th className="hidden md:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("applications.caseDetails")}</th>
              <th className="hidden md:table-cell py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.amount")}</th>
              <th className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.status")}</th>
              <th className="hidden sm:table-cell py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.priority")}</th>
              <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">{t("extracted.actions")}</th>
            </tr>
          </thead>

          <tbody className="divide-y theme-border-glass text-sm">
            {applications.map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <motion.tr
                  key={app.id}
                  id={`app-row-${app.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`transition-colors ${highlightId === app.id ? 'bg-blue-500/10' : 'hover:theme-bg-hover'}`}
                >
                  <td className="py-2.5 px-3 font-medium theme-text-primary truncate text-xs max-w-[140px]">{app.id}</td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full accent-gradient flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                        {app.applicantName.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium theme-text-primary truncate leading-tight">{app.applicantName}</span>
                        <span className="text-xs theme-text-muted truncate leading-tight">{app.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="hidden sm:table-cell py-2.5 px-3 text-xs theme-text-secondary tabular-nums min-w-[120px] max-w-[160px] truncate">
                    {app.beneficiaryId || "-"}
                  </td>

                  <td className="hidden sm:table-cell py-2.5 px-3 max-w-[140px]">
                    <span className="text-sm theme-text-primary truncate block">{app.district}</span>
                    <span className="text-xs theme-text-muted truncate block">{app.state}</span>
                  </td>

                  <td className="hidden md:table-cell py-2.5 px-3">
                    <span className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium theme-bg-glass theme-text-secondary truncate max-w-[160px]">
                      {app.actType}
                    </span>
                  </td>

                  <td className="hidden md:table-cell py-2.5 px-3 text-xs theme-text-secondary">
                    <div className="space-y-0.5">
                      {app.incidentDate && <div>{new Date(app.incidentDate).toLocaleDateString()}</div>}
                      {app.firReport && <div>FIR {app.firReport}</div>}
                      {app.caseNumber && <div>{app.caseNumber}</div>}
                    </div>
                  </td>

                  <td className="hidden md:table-cell py-2.5 px-3 text-sm font-semibold theme-text-primary truncate text-right tabular-nums">
                    {formatOfficerCurrency(app.amount)}
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {createElement(StatusIcon, { className: 'w-3 h-3' })}
                      {getOfficerTranslatedStatus(t, app.status)}
                    </span>
                  </td>

                  <td className="hidden sm:table-cell py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(
                        app.priority
                      )}`}
                    >
                      {getTranslatedPriority(t, app.priority)}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex justify-end gap-0.5">
                      <button
                        title="View"
                        className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-blue-500 transition-colors"
                        onClick={() => onView(app)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit"
                        className="p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-blue-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(app);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        className="p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(app.id);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden grid grid-cols-1 gap-3 p-3">
        {applications.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-bg-glass theme-border-glass border rounded-lg p-3"
          >
            <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
              <p className="text-sm font-medium theme-text-primary truncate min-w-0">{app.applicantName}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border shrink-0 ${getPriorityColor(app.priority)}`}>
                {app.priority}
              </span>
            </div>
            <div className="space-y-1 text-sm theme-text-secondary min-w-0">
              <p className="truncate"><strong>ID:</strong> {app.id}</p>
              <p className="truncate"><strong>{t("applications.beneficiaryId")}:</strong> {app.beneficiaryId || "-"}</p>
              <p className="truncate"><strong>{t("extracted.district_1")}</strong> {app.district}, {app.state}</p>
              <p className="truncate"><strong>{t("extracted.act_type_1")}</strong> {app.actType}</p>
              {app.incidentDate && <p><strong>{t("extracted.incident_date")}:</strong> {new Date(app.incidentDate).toLocaleDateString()}</p>}
              {app.firReport && <p className="truncate"><strong>{t("applications.firReport")}:</strong> {app.firReport}</p>}
              {app.caseNumber && <p className="truncate"><strong>{t("applications.caseNumber")}:</strong> {app.caseNumber}</p>}
              <p><strong>{t("extracted.amount_1")}</strong> {formatOfficerCurrency(app.amount)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
