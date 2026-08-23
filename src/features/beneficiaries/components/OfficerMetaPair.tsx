"use client";
import React from 'react';

/** Compact definition-list cell: muted uppercase label over a truncateable value. */
export default function OfficerMetaPair({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wider theme-text-muted truncate">{label}</dt>
      <dd className={`text-[13px] font-medium theme-text-primary mt-0.5 truncate ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
