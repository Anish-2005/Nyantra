"use client";
import React from 'react';

/**
 * Standard page header: bold title with an accent-gradient highlighted word,
 * muted subtitle, and an optional right-aligned actions slot.
 */
export default function PageHeader({
  title,
  highlight,
  subtitle,
  children,
}: {
  title: string;
  highlight?: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight theme-text-primary truncate">
          {title}
          {highlight && (
            <>
              {' '}
              <span className="text-accent-gradient">{highlight}</span>
            </>
          )}
        </h1>
        {subtitle && <p className="text-xs theme-text-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0 flex-wrap">{children}</div>}
    </div>
  );
}
