"use client";

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export type Feedback = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  rating: number; // 1-5 stars
  status: 'open' | 'in-review' | 'resolved';
  createdAt: any;
  updatedAt: any;
};

export const INPUT_CLASS = "w-full h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm placeholder:theme-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

/** Feedback status → pill color classes */
export const getStatusPillClass = (status: string) => {
  switch (status) {
    case 'open': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'in-review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};
