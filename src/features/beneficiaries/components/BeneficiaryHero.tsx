"use client";
import React, { createElement } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash, MapPin, Calendar } from 'lucide-react';
import type { Beneficiary } from '../helpers';
import type { TranslateFnLike } from '../helpers';
import {
  humanize,
  formatDate,
  getStatusColor,
  getVerificationColor,
  getStatusIcon,
  getVerificationIcon,
} from '../helpers';

/**
 * ID-card style hero for the single beneficiary profile:
 * gradient initials avatar, category chip, status/verification pills,
 * location + registration meta and action buttons.
 */
export default function BeneficiaryHero({
  profile,
  onEdit,
  onDelete,
  t,
}: {
  profile: Beneficiary;
  onEdit: (b: Beneficiary) => void;
  onDelete: (id: string) => void;
  t: TranslateFnLike;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden relative"
    >
      <div className="absolute inset-x-0 top-0 h-1 accent-gradient" aria-hidden="true" />
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-14 h-14 rounded-xl accent-gradient text-white text-lg font-bold grid place-items-center uppercase shrink-0 shadow-md">
          {(profile.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
              {profile.name || '\u2014'}
            </h2>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
              {profile.category}
            </span>
          </div>
          <p className="text-xs theme-text-muted font-mono mt-0.5">{profile.id}</p>

          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {profile.status && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(profile.status)}`}>
                {createElement(getStatusIcon(profile.status), { className: 'w-3 h-3' })}
                {humanize(profile.status)}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getVerificationColor(profile.verificationStatus)}`}>
              {createElement(getVerificationIcon(profile.verificationStatus), { className: 'w-3 h-3' })}
              {humanize(profile.verificationStatus)}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap text-xs theme-text-muted">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{profile.district}, {profile.state}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formatDate(profile.registrationDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto sm:flex-col lg:flex-row">
          {profile.scStCertificate && (
            <a
              href={profile.scStCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-md border theme-border-glass grid place-items-center theme-text-muted hover:text-green-500 hover:theme-bg-glass transition-colors"
              title={t('extracted.view_certificate')}
            >
              <Eye className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onEdit(profile)}
            className="h-9 px-3.5 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 inline-flex items-center justify-center gap-1.5 transition-opacity"
          >
            <Edit className="w-3.5 h-3.5" />
            {t('extracted.edit')}
          </button>
          <button
            onClick={() => onDelete(profile.id)}
            className="w-9 h-9 rounded-md border theme-border-glass grid place-items-center theme-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title={t('extracted.delete')}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
