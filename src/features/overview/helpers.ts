"use client";

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export interface Submission {
  id: string;
  applicantName?: string;
  anonymous?: boolean;
  firNumber?: string;
  amountRequested?: number;
  status?: string;
  applicationDate?: any;
}

export interface OverviewStats {
  totalApplications: number;
  pendingCount: number;
  inReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  docsRequiredCount: number;
  totalAmountRequested: number;
}

export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'in-review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'documents-required': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disbursed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export const STATUS_DOTS: Record<string, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-blue-500',
  'in-review': 'bg-blue-500',
  'documents-required': 'bg-purple-500',
  approved: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  disbursed: 'bg-emerald-500',
  rejected: 'bg-red-500',
};
