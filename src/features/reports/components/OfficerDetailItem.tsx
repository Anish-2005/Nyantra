"use client";
import React from 'react';

/**
 * Definition-pair cell (uppercase label + truncated value) for officer report meta grids.
 */
export default function OfficerDetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
      <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{children}</dd>
    </div>
  );
}
