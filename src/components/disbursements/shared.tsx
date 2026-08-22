'use client';

/**
 * Shared presentation helpers for disbursement components (exact ports).
 */
import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Clock, PlayCircle, X, XCircle } from 'lucide-react';
import type { TFn } from '@/hooks/useDisbursements';

export function getStatusColor(theme: string, status?: string | null): string {
  const s = status ?? '';
  if (theme === 'dark') {
    switch (s) {
      case 'completed': return 'text-green-300 bg-green-900/30';
      case 'pending': return 'text-amber-300 bg-amber-900/30';
      case 'in-progress': return 'text-blue-300 bg-blue-900/30';
      case 'failed': return 'text-red-300 bg-red-900/30';
      case 'cancelled': return 'text-gray-300 bg-gray-800';
      default: return 'text-gray-300 bg-gray-800';
    }
  }
  switch (s) {
    case 'completed': return 'text-green-700 bg-green-100';
    case 'pending': return 'text-amber-700 bg-amber-100';
    case 'in-progress': return 'text-blue-700 bg-blue-100';
    case 'failed': return 'text-red-700 bg-red-100';
    case 'cancelled': return 'text-gray-700 bg-gray-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

export function getPriorityColor(theme: string, priority?: string | null): string {
  const p = priority ?? '';
  if (theme === 'dark') {
    switch (p) {
      case 'high': return 'text-red-300 bg-red-900/30';
      case 'medium': return 'text-amber-300 bg-amber-900/30';
      case 'low': return 'text-green-300 bg-green-900/30';
      default: return 'text-gray-300 bg-gray-800';
    }
  }
  switch (p) {
    case 'high': return 'text-red-700 bg-red-100';
    case 'medium': return 'text-amber-700 bg-amber-100';
    case 'low': return 'text-green-700 bg-green-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

export function getStatusIcon(status?: string | null): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    pending: Clock,
    'in-progress': PlayCircle,
    completed: CheckCircle,
    failed: XCircle,
    cancelled: X,
  };
  return icons[status ?? ''] || Clock;
}

export function translateStatus(t: TFn, status?: string | null): string {
  if (!status) return '';
  const key = status.split(/[-_]/).map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join('');
  const lookedUp = t(`dashboard.status.${key}`);
  // If translation missing, t returns the key string — fall back to uppercase humanized status
  if (lookedUp && lookedUp !== `dashboard.status.${key}`) return lookedUp;
  return status.replace(/[-_]/g, ' ').toUpperCase();
}

export function formatCurrency(amount?: number | null): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

/** Deterministic date formatting to avoid SSR/client hydration mismatches. */
export function formatDateGB(s?: string | null): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch {
    return s;
  }
}

/** Light-theme solid surface used across list rows/buttons (legacy inline style). */
export const lightSurface = (theme: string) =>
  theme === 'light' ? { background: 'rgba(255, 255, 255, 0.95)' } : undefined;
