"use client";
import React from 'react';

export interface StatCell {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  dot?: string;
  sub?: React.ReactNode;
}

/**
 * Hairline-divided stat band with icon chips, tabular numerals and an
 * animated accent underline on hover of each cell.
 * cols: cells per row on desktop (collapses to 2 on mobile).
 */
export default function StatBand({
  cells,
  cols = 4,
}: {
  cells: StatCell[];
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <div className={`grid grid-cols-2 ${colClass} gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden`}>
      {cells.map(({ label, value, icon: Icon, dot, sub }) => (
        <div key={label} className="theme-bg-card p-3.5 relative overflow-hidden group">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            {Icon && (
              <span className="w-6 h-6 rounded-md theme-bg-glass grid place-items-center shrink-0">
                <Icon className="w-3 h-3" />
              </span>
            )}
            <span className="truncate">{label}</span>
            {dot !== undefined && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-auto ${dot || 'accent-gradient'}`} aria-hidden="true" />
            )}
          </div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums">{value}</p>
          {sub !== undefined && (
            <div className="text-[11px] mt-0.5">{sub}</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
