"use client";
import React, { createElement } from 'react';
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
import OfficerApplicationCard from './OfficerApplicationCard';

const th =
  "py-2.5 px-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap";
const iconBtn =
  "p-2 sm:p-1.5 rounded-md theme-text-muted hover:theme-bg-glass transition-colors";

/**
 * Officer applications "table" view: scrollable data table on ≥md screens
 * with the canonical list-card fallback below md.
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
      {/* Data table — md+ only */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="border-b theme-border-glass">
            <tr className="whitespace-nowrap">
              <th className={th}>{t("extracted.application_id")}</th>
              <th className={th}>{t("extracted.applicant")}</th>
              <th className={`${th} min-w-[120px]`}>{t("applications.beneficiaryId")}</th>
              <th className={th}>{t("extracted.district")}</th>
              <th className={`${th} hidden lg:table-cell`}>{t("extracted.act_type")}</th>
              <th className={`${th} hidden lg:table-cell`}>{t("applications.caseDetails")}</th>
              <th className={`${th} text-right hidden lg:table-cell`}>{t("extracted.amount")}</th>
              <th className={th}>{t("extracted.status")}</th>
              <th className={th}>{t("extracted.priority")}</th>
              <th className={`${th} text-right`}>{t("extracted.actions")}</th>
            </tr>
          </thead>

          <tbody className="divide-y theme-border-glass text-sm">
            {applications.map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <tr
                  key={app.id}
                  id={`app-row-${app.id}`}
                  className={`transition-colors duration-150 ${highlightId === app.id ? 'bg-blue-500/10' : 'hover:theme-bg-hover'}`}
                >
                  <td className="py-2.5 px-3 font-mono theme-text-secondary truncate text-xs max-w-[140px]">{app.id}</td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md theme-bg-glass grid place-items-center shrink-0">
                        {createElement(StatusIcon, { className: 'w-4 h-4 theme-text-secondary' })}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold theme-text-primary truncate leading-tight text-sm">{app.applicantName}</span>
                        <span className="text-xs theme-text-muted truncate leading-tight">{app.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-xs theme-text-secondary tabular-nums min-w-[120px] max-w-[160px] truncate">
                    {app.beneficiaryId || "-"}
                  </td>

                  <td className="py-2.5 px-3 max-w-[140px]">
                    <span className="text-sm font-medium theme-text-primary truncate block">{app.district}</span>
                    <span className="text-xs theme-text-muted truncate block">{app.state}</span>
                  </td>

                  <td className="hidden lg:table-cell py-2.5 px-3">
                    <span className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium theme-bg-glass theme-text-secondary truncate max-w-[160px]">
                      {app.actType}
                    </span>
                  </td>

                  <td className="hidden lg:table-cell py-2.5 px-3 text-xs theme-text-secondary">
                    <div className="space-y-0.5">
                      {app.incidentDate && <div>{new Date(app.incidentDate).toLocaleDateString()}</div>}
                      {app.firReport && <div>FIR {app.firReport}</div>}
                      {app.caseNumber && <div>{app.caseNumber}</div>}
                    </div>
                  </td>

                  <td className="hidden lg:table-cell py-2.5 px-3 text-sm font-semibold theme-text-primary truncate text-right tabular-nums">
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

                  <td className="py-2.5 px-3">
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
                        title={t('extracted.view')}
                        aria-label={t('extracted.view')}
                        className={iconBtn}
                        onClick={() => onView(app)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title={t('extracted.edit')}
                        aria-label={t('extracted.edit')}
                        className={iconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(app);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title={t('extracted.delete')}
                        aria-label={t('extracted.delete')}
                        className={`${iconBtn} hover:bg-red-500/10 hover:text-red-500`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(app.id);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view — below md */}
      <div className="md:hidden grid grid-cols-1 gap-3 p-3">
        {applications.map((app) => (
          <OfficerApplicationCard
            key={app.id}
            application={app}
            highlighted={highlightId === app.id}
            t={t}
            onView={onView}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
