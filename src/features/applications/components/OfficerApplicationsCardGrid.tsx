"use client";
import React, { createElement } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash, MapPin, FileText, DollarSign } from 'lucide-react';
import type { OfficerApplication, TranslateFn } from '../helpers';
import {
  formatOfficerCurrency,
  getOfficerTranslatedStatus,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
} from '../helpers';

/**
 * Officer applications "cards" view: responsive card grid with avatar,
 * case summary, status pill and row actions.
 */
export default function OfficerApplicationsCardGrid({
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {applications.map((app, idx: number) => {
        const StatusIcon = getStatusIcon(app.status);
        return (
          <motion.div
            key={app.id}
            id={`app-row-${app.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.02 }}
            whileHover={{ y: -2 }}
            className={`theme-bg-glass theme-border-glass border rounded-lg p-4 cursor-pointer transition-shadow min-w-0 ${highlightId === app.id ? 'ring-2 ring-blue-500/50' : 'hover:shadow-sm'}`}
            onClick={() => onView(app)}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full accent-gradient flex items-center justify-center text-white font-bold shrink-0">
                  {app.applicantName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="font-medium theme-text-primary truncate">
                    {app.applicantName}
                  </p>
                  <p className="text-xs theme-text-muted truncate">{app.id}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border shrink-0 ${getPriorityColor(
                  app.priority
                )}`}
              >
                {app.priority}
              </span>
            </div>
            <div className="space-y-2 mb-3 min-w-0">
              <div className="flex items-center gap-2 text-sm theme-text-secondary min-w-0">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {app.district}, {app.state}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm theme-text-secondary min-w-0">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{app.actType}</span>
              </div>
              {(app.incidentDate || app.firReport || app.caseNumber) && (
                <div className="text-sm theme-text-secondary min-w-0">
                  <div className="font-medium mb-1">{t('applications.caseDetails')}:</div>
                  {app.incidentDate && <div className="truncate">{t('extracted.incident_date')}: {new Date(app.incidentDate).toLocaleDateString()}</div>}
                  {app.firReport && <div className="truncate">{t('applications.firReport')}: {app.firReport}</div>}
                  {app.caseNumber && <div className="truncate">{t('applications.caseNumber')}: {app.caseNumber}</div>}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm theme-text-secondary">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span className="font-semibold truncate">
                  {formatOfficerCurrency(app.amount)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t theme-border-glass">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  app.status
                )}`}
              >
                {createElement(StatusIcon, { className: 'w-3 h-3' })}
                {getOfficerTranslatedStatus(t, app.status)}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="p-2 sm:p-1.5 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(app);
                  }}
                >
                  <Eye className="w-4 h-4 theme-text-muted hover:text-blue-500" />
                </button>
                <button
                  className="p-2 sm:p-1.5 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(app);
                  }}
                >
                  <Edit className="w-4 h-4 theme-text-muted hover:text-blue-500" />
                </button>
                <button
                  className="p-2 sm:p-1.5 rounded-lg theme-bg-glass hover:theme-bg-card transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(app.id);
                  }}
                  aria-label={`Delete ${app.id}`}
                >
                  <Trash className="w-4 h-4 theme-text-muted hover:text-red-500" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
