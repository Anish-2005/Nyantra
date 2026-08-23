"use client";
import React from 'react';

export interface FilterPillItem {
  key: string;
  label: string;
  count?: number;
}

/**
 * Horizontal filter pill row with live counts. Scrolls sideways on narrow
 * screens instead of wrapping, so it stays one row on mobile.
 */
export default function FilterPills({
  items,
  value,
  onChange,
  hideEmpty = false,
}: {
  items: FilterPillItem[];
  value: string;
  onChange: (key: string) => void;
  hideEmpty?: boolean;
}) {
  const visible = hideEmpty
    ? items.filter(s => s.count === undefined || s.key === items[0]?.key || (s.count ?? 0) > 0)
    : items;

  return (
    <div className="-mx-1 px-1 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 w-max max-w-full">
        {visible.map(({ key, label, count }) => {
          const active = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={`h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'accent-gradient text-white shadow-sm'
                  : 'border theme-border-glass theme-bg-glass theme-text-muted hover:theme-text-primary'
              }`}
            >
              {label}
              {count !== undefined && (
                <span className={`tabular-nums ${active ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
