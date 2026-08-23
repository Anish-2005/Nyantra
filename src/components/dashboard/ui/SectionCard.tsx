"use client";
import React from 'react';

/**
 * Standard content card: rounded card with an optional header bar
 * (title + count + right-aligned actions) and a body slot.
 */
export default function SectionCard({
  title,
  count,
  actions,
  children,
  bodyClassName = 'p-2.5',
}: {
  title?: React.ReactNode;
  count?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary shrink-0 min-w-0 truncate">
            {title}
            {count !== undefined && (
              <span className="theme-text-muted font-normal"> ({count})</span>
            )}
          </h3>
          {actions && <div className="flex items-center gap-2 min-w-0 flex-wrap justify-end">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
