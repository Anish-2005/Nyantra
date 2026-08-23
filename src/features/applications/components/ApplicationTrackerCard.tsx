"use client";
import React, { createElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Edit, Trash, ChevronDown } from 'lucide-react';
import type { Application, TranslateFn } from '../helpers';
import {
  stageIndex,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusIcon,
  getTranslatedStatus,
  getTranslatedPriority,
} from '../helpers';

// PoA Act offence → expected compensation lookup
export const POA_OFFENCES = {
  "1. Offences leading to Death / Murder": {
    "Murder of SC/ST person": 825000,
    "Death due to injury inflicted during atrocity": 825000,
    "Death after rape / gang rape": 825000
  },
  "2. Rape and Sexual Offences": {
    "Rape": 500000,
    "Gang rape": 825000,
    "Attempt to rape": 100000,
    "Parading naked / semi-naked": 200000,
    "Sexual harassment / use of criminal force": 100000
  },
  "3. Grievous Hurt / Injury": {
    "Grievous hurt": 125000,
    "Permanent disability": 500000,
    "Partial disability": 250000,
    "Acid attack \u2013 deformity / disability": 825000,
    "Acid attack \u2013 injury without deformity": 500000
  },
  "4. Offences Against Women & Dignity": {
    "Outraging modesty of SC/ST woman": 100000,
    "Sexual exploitation / trafficking": 200000,
    "Forced to work naked / semi-naked": 200000
  },
  "5. Property Damage / Arson": {
    "Burning of house / arson": "225000-425000",
    "Destruction of household / property": "100000-200000",
    "Destruction of crops": 100000,
    "Destruction of cattle / livestock": 60000
  },
  "6. Land & Economic Offences": {
    "Wrongful dispossession from land": 200000,
    "Destruction of standing crops": 100000,
    "Economic boycott": 100000,
    "Social boycott": 100000,
    "Bonded labour / forced labour": 100000
  },
  "7. Caste Atrocity / Humiliation Offences": {
    "Intentional insult, intimidation, caste abuse": 100000,
    "Preventing entry into public place": 100000,
    "Preventing access to public well/tank/roads": 100000,
    "Compelling to eat inedible / obnoxious substances": 100000
  },
  "8. Kidnapping / Abduction": {
    "Kidnapping SC/ST person": "100000-200000",
    "Abduction with intent to outrage modesty": 200000
  },
  "9. Mental Torture / Harassment": {
    "Harassing, humiliating, intimidating": 100000,
    "Public humiliation": "100000-200000"
  },
  "10. Other Serious Offences": {
    "Preventing from voting": 100000,
    "Poll violence against SC/ST": 200000,
    "False, malicious, vexatious legal cases": 100000
  }
};

const expectedCompensation = (category?: string, offence?: string) => {
  if (!category || !offence) return null;
  const cat = POA_OFFENCES[category as keyof typeof POA_OFFENCES];
  const value = cat && offence in cat ? (cat[offence as keyof typeof cat] as string | number) : null;
  if (value == null) return '\u20b90';
  if (typeof value === 'string' && value.includes('-')) return `\u20b9${value.replace('-', ' - \u20b9')}`;
  return `\u20b9${(value as number).toLocaleString('en-IN')}`;
};

/** Detail field for the expanded tracker body */
const Field = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="min-w-0">
    <div className="text-[11px] uppercase tracking-wider theme-text-muted mb-0.5">{label}</div>
    <div className={`text-sm font-medium theme-text-primary truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
  </div>
);

/**
 * Expandable tracker card for a single relief application:
 * collapsed summary with mini journey strip + full stepper and detail
 * sections when expanded.
 */
export default function ApplicationTrackerCard({
  application,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  application: Application;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (a: Application) => void;
  onDelete: (id: string) => void;
  t: TranslateFn;
}) {
  const rejected = application.status === 'rejected';
  const currentStage = stageIndex(application.status);
  const StatusIcon = getStatusIcon(application.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`theme-bg-card border rounded-xl overflow-hidden transition-colors ${
        expanded ? 'border-[var(--accent-primary)]' : 'theme-border-glass hover:theme-bg-hover'
      }`}
    >
      {/* Card header — always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`w-full text-left p-4 cursor-pointer focus:outline-none ${expanded ? 'theme-bg-glass' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg accent-gradient text-white grid place-items-center shrink-0 shadow-sm">
            <FileText className="w-[18px] h-[18px]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className="text-sm font-semibold theme-text-primary truncate leading-tight">
                {application.applicantName || '\u2014'}
              </h4>
              <span className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusColor(application.status)}`}>
                {createElement(StatusIcon, { className: 'w-3 h-3' })}
                {getTranslatedStatus(t, application.status)}
              </span>
            </div>
            <p className="text-xs theme-text-muted truncate mt-0.5">
              <span className="font-mono">{application.id}</span>
              {' \u00b7 '}
              {formatDate(application.applicationDate)}
              {application.actType ? ` \u00b7 ${application.actType}` : ''}
            </p>
          </div>

          <div className="hidden md:block text-right shrink-0">
            <p className="text-sm font-semibold tabular-nums theme-text-primary leading-tight">
              {formatCurrency(application.amount)}
            </p>
            <p className="text-[11px] theme-text-muted mt-0.5">{application.district}</p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(application)}
              className="p-2 sm:p-1.5 rounded-md theme-text-muted hover:theme-bg-glass hover:text-blue-500 transition-colors"
              title={t('extracted.edit_application')}
              aria-label={t('extracted.edit_application')}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="p-2 sm:p-1.5 rounded-md theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title={t('extracted.delete_application')}
              aria-label={t('extracted.delete_application')}
            >
              <Trash className="w-4 h-4" />
            </button>
            <ChevronDown
              className={`w-4 h-4 theme-text-muted transition-transform duration-200 ml-1 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Compact journey strip + mobile status pill */}
        <div className="flex items-center mt-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => {
            const reached = !rejected && i <= Math.min(currentStage, 3);
            const isCurrent = !rejected && i === Math.min(currentStage, 3);
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div className={`flex-1 h-px mx-1 ${reached ? 'bg-emerald-500/60' : 'bg-black/10 dark:bg-white/10'}`} />
                )}
                <span
                  className={`block w-1.5 h-1.5 rounded-full transition-colors ${
                    reached ? 'bg-emerald-500' : 'bg-black/15 dark:bg-white/20'
                  } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                />
              </React.Fragment>
            );
          })}
        </div>
        <span className={`sm:hidden mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(application.status)}`}>
          {createElement(StatusIcon, { className: 'w-3 h-3' })}
          {getTranslatedStatus(t, application.status)}
        </span>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t theme-border-glass space-y-4">
              {/* Full journey */}
              <div className="flex items-start pt-4 pb-1" aria-label={t('extracted.status')}>
                {[
                  t('extracted.submitted'),
                  t('applications.inReview'),
                  t('extracted.approved'),
                  t('extracted.disbursed'),
                ].map((label, i) => {
                  const reached = !rejected && i <= currentStage;
                  const isCurrent = !rejected && i === currentStage;
                  return (
                    <React.Fragment key={label}>
                      {i > 0 && (
                        <div className={`flex-1 h-px mt-[7px] mx-1.5 ${reached ? 'bg-emerald-500/60' : 'bg-black/10 dark:bg-white/10'}`} />
                      )}
                      <div className="flex flex-col items-center gap-1 shrink-0 min-w-0">
                        <span
                          className={`block w-2 h-2 rounded-full transition-colors ${reached ? 'bg-emerald-500' : 'bg-black/15 dark:bg-white/20'} ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                        />
                        <span
                          className={`text-[9px] uppercase tracking-wide whitespace-nowrap ${isCurrent ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'theme-text-muted'}`}
                        >
                          {label}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Applicant snapshot */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                <Field label={t('extracted.applicant')} value={application.applicantName || '\u2014'} />
                <Field label={t('extracted.aadhaar_number')} value={application.aadhaar || '\u2014'} mono />
                <Field label={t('extracted.phone_number')} value={application.phone || '\u2014'} mono />
                <Field label={t('extracted.location')} value={`${application.district}, ${application.state}`} />
                <Field label={t('extracted.act_type')} value={application.actType || '\u2014'} />
                <Field label={t('extracted.amount')} value={formatCurrency(application.amount)} />
                <Field label={t('extracted.priority')} value={getTranslatedPriority(t, application.priority)} />
                <Field label={t('extracted.beneficiary_id')} value={application.beneficiaryId || '\u2014'} mono />
              </dl>

              {/* PoA Offence Information */}
              {application.actType === 'PoA Act' && (application.offenceCategory || application.offenceType) && (
                <div className="pt-3 border-t theme-border-glass">
                  <div className="text-sm font-medium theme-text-primary mb-2.5">{t('applications.poa_act_offence_details')}</div>
                  <div className="space-y-1.5">
                    {application.offenceCategory && (
                      <div className="flex justify-between gap-3">
                        <span className="text-sm theme-text-muted">{t('applications.offence_category')}</span>
                        <span className="text-sm font-medium theme-text-primary text-right">{application.offenceCategory}</span>
                      </div>
                    )}
                    {application.offenceType && (
                      <div className="flex justify-between gap-3">
                        <span className="text-sm theme-text-muted">{t('applications.specific_offence')}</span>
                        <span className="text-sm font-medium theme-text-primary text-right">{application.offenceType}</span>
                      </div>
                    )}
                    {application.offenceCategory && application.offenceType && (
                      <div className="flex justify-between gap-3">
                        <span className="text-sm theme-text-muted">{t('applications.expected_compensation')}</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400 text-right">
                          {expectedCompensation(application.offenceCategory, application.offenceType)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Case Details */}
              {(application.incidentDate || application.firReport || application.medicalReport || application.policeStation || application.caseNumber) && (
                <div className="pt-3 border-t theme-border-glass">
                  <div className="text-sm font-medium theme-text-primary mb-2.5">{t('applications.caseDetails')}</div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    {application.incidentDate && (
                      <Field label={t('extracted.incident_date')} value={new Date(application.incidentDate).toLocaleDateString()} />
                    )}
                    {application.firReport && <Field label={t('applications.firReport')} value={application.firReport} />}
                    {application.medicalReport && <Field label={t('applications.medicalReport')} value={application.medicalReport} />}
                    {application.policeStation && <Field label={t('applications.policeStation')} value={application.policeStation} />}
                    {application.caseNumber && <Field label={t('applications.caseNumber')} value={application.caseNumber} mono />}
                  </dl>
                </div>
              )}

              <p className="text-xs theme-text-muted pt-1">
                {t('extracted.submitted')}: {formatDate(application.applicationDate)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
