/**
 * Pure selectors for the disbursements feature.
 * Exact behavioural ports of the legacy page's useMemo logic — no side effects,
 * fully unit-testable.
 */
import { toDateSafe } from '@/lib/format';
import {
  STATUS_SORT_RANK,
  type DisbursementRaw,
} from '@/models/Disbursement';

export interface DisbursementFilters {
  searchQuery: string;
  statusFilter: string;
  actTypeFilter: string;
  dateFilter: string;
  priorityFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_DISBURSEMENT_FILTERS: DisbursementFilters = {
  searchQuery: '',
  statusFilter: 'all',
  actTypeFilter: 'all',
  dateFilter: 'all',
  priorityFilter: 'all',
  sortBy: 'initiatedDate',
  sortOrder: 'desc',
};

function matchesSearch(d: DisbursementRaw, query: string): boolean {
  const q = query.toLowerCase();
  return (
    String(d.beneficiaryName ?? '').toLowerCase().includes(q) ||
    String(d.id ?? '').toLowerCase().includes(q) ||
    String(d.district ?? '').toLowerCase().includes(q) ||
    String(d.transactionId ?? '').toLowerCase().includes(q)
  );
}

function matchesDateFilter(d: DisbursementRaw, dateFilter: string): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const disbursementDate = d.initiatedDate
    ? toDateSafe(d.initiatedDate as string | null)
    : null;
  if (!disbursementDate) return false;

  switch (dateFilter) {
    case 'today':
      return disbursementDate.toDateString() === today.toDateString();
    case 'week':
      return disbursementDate >= lastWeek;
    case 'month':
      return disbursementDate >= lastMonth;
    default:
      return true;
  }
}

type SortValue = number | string;

function sortValueFor(d: DisbursementRaw, sortBy: string): SortValue {
  if (sortBy === 'initiatedDate' || sortBy === 'applicationDate') {
    const parsed = toDateSafe((d as Record<string, unknown>)[sortBy] as string | null);
    return parsed ? parsed.getTime() : 0;
  }
  if (sortBy === 'reliefAmount' || sortBy === 'disbursedAmount') {
    return parseFloat(String((d as Record<string, unknown>)[sortBy] || 0)) || 0;
  }
  if (sortBy === 'status') {
    // Legacy lookup used raw status strings; unknown statuses rank last.
    return STATUS_SORT_RANK[(d.status ?? '')] ?? 99;
  }
  return String((d as Record<string, unknown>)[sortBy] ?? '');
}

export function filterAndSortDisbursements(
  items: readonly DisbursementRaw[],
  f: DisbursementFilters,
): DisbursementRaw[] {
  let filtered = [...items];

  if (f.searchQuery) filtered = filtered.filter((d) => matchesSearch(d, f.searchQuery));
  if (f.statusFilter !== 'all') filtered = filtered.filter((d) => d.status === f.statusFilter);
  if (f.actTypeFilter !== 'all') {
    const actKey = f.actTypeFilter.toLowerCase().split(' ')[0]; // 'pcr' or 'poa'
    filtered = filtered.filter((d) => (d.actType || '').toLowerCase().includes(actKey));
  }
  if (f.dateFilter !== 'all') filtered = filtered.filter((d) => matchesDateFilter(d, f.dateFilter));
  if (f.priorityFilter !== 'all') filtered = filtered.filter((d) => d.priority === f.priorityFilter);

  filtered.sort((a, b) => {
    const aVal = sortValueFor(a, f.sortBy);
    const bVal = sortValueFor(b, f.sortBy);
    if (aVal === bVal) return 0;
    if (f.sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  return filtered;
}

export interface Paginated<T> {
  paginated: T[];
  totalPages: number;
  total: number;
}

export function paginate<T>(items: readonly T[], currentPage: number, itemsPerPage: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  return {
    paginated: items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    totalPages,
    total,
  };
}

export interface DisbursementStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  failed: number;
  cancelled: number;
  successRate: number;
  disbursedAmount: number;
  totalAmount: number;
  pendingAmount: number;
}

export function computeStats(items: readonly DisbursementRaw[]): DisbursementStats {
  const isStatus = (d: DisbursementRaw, s: string) => (d.status || '').toLowerCase() === s;
  const total = items.length;
  const completed = items.filter((d) => isStatus(d, 'completed')).length;
  const pending = items.filter((d) => isStatus(d, 'pending')).length;
  const inProgress = items.filter((d) => isStatus(d, 'in_progress')).length;
  const failed = items.filter((d) => isStatus(d, 'failed')).length;
  const cancelled = items.filter((d) => isStatus(d, 'cancelled')).length;
  return {
    total,
    completed,
    pending,
    inProgress,
    failed,
    cancelled,
    successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    disbursedAmount: items.filter((d) => isStatus(d, 'completed')).reduce((sum, d) => sum + (d.disbursedAmount || 0), 0),
    totalAmount: items.reduce((sum, d) => sum + (d.reliefAmount || 0), 0),
    pendingAmount: items.filter((d) => isStatus(d, 'pending')).reduce((sum, d) => sum + (d.reliefAmount || 0), 0),
  };
}

export interface MonthlyTrendPoint {
  label: string;
  added: number;
  completed: number;
}

/** `monthLabels` are locale-aware short month names supplied by the caller. */
export function computeMonthlyTrend(
  items: readonly DisbursementRaw[],
  monthLabels: readonly string[],
  monthsCount = 6,
): MonthlyTrendPoint[] {
  const now = new Date();
  const buckets: MonthlyTrendPoint[] = [];
  const keys: Array<{ year: number; month: number }> = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: monthLabels[d.getMonth()] ?? '', added: 0, completed: 0 });
    keys.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  items.forEach((item) => {
    const s = item.initiatedDate || item.applicationDate || item.initiatedOn || null;
    const dt = toDateSafe(s as string | null);
    if (!dt) return;
    const idx = keys.findIndex((k) => k.year === dt.getFullYear() && k.month === dt.getMonth());
    if (idx >= 0) {
      buckets[idx].added += 1;
      if ((item.status || '').toLowerCase() === 'completed') buckets[idx].completed += 1;
    }
  });

  return buckets;
}

export interface ActBreakdown {
  pcrCount: number;
  poaCount: number;
  pcrDisbursed: number;
  poaDisbursed: number;
}

export function computeActBreakdown(items: readonly DisbursementRaw[]): ActBreakdown {
  const isPcr = (d: DisbursementRaw) => (d.actType || '').toLowerCase().includes('pcr');
  const isPoa = (d: DisbursementRaw) => (d.actType || '').toLowerCase().includes('poa');
  const completedDisbursed = (pred: (d: DisbursementRaw) => boolean) =>
    items
      .filter((d) => pred(d) && (d.status || '').toLowerCase() === 'completed')
      .reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);

  return {
    pcrCount: items.filter(isPcr).length,
    poaCount: items.filter(isPoa).length,
    pcrDisbursed: completedDisbursed(isPcr),
    poaDisbursed: completedDisbursed(isPoa),
  };
}
