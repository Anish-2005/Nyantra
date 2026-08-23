"use client";
import React from 'react';

/**
 * Centered empty state: gradient icon chip, title, muted hint and an
 * optional CTA button (with optional leading icon).
 */
export default function EmptyState({
  icon: Icon,
  title,
  hint,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: React.ReactNode;
  actionLabel?: string;
  actionIcon?: React.ComponentType<{ className?: string }>;
  onAction?: () => void;
}) {
  return (
    <div className="theme-bg-card theme-border-glass border rounded-xl px-6 py-16 text-center">
      <div className="mx-auto w-16 h-16 rounded-2xl accent-gradient text-white grid place-items-center mb-4 shadow-lg">
        <Icon className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight theme-text-primary">{title}</h2>
      {hint && <p className="text-sm theme-text-muted mt-1 max-w-md mx-auto">{hint}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 h-10 px-4 rounded-md accent-gradient text-white text-sm font-semibold hover:opacity-90 inline-flex items-center gap-2 transition-opacity"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
