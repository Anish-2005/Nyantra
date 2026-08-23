"use client";
import React from 'react';
import type { OfficerApplication, TranslateFn } from '../helpers';
import OfficerApplicationCard from './OfficerApplicationCard';

/**
 * Officer applications "cards" view: responsive grid of canonical
 * list-cards (see OfficerApplicationCard).
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
  );
}
