"use client";
import { TrendingDown, TrendingUp } from 'lucide-react';

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export type ViewMode = 'grid' | 'list' | 'compact';
export type ChartKind = 'bar' | 'line' | 'area' | 'pie';
export type ExportFormat = 'pdf' | 'csv' | 'excel';
export type DistrictSortKey = 'applications' | 'disbursements' | 'successRate' | 'district';

/** Aggregated row in the state-wise performance panel. */
export interface StateRow {
  state: string;
  applications: number;
  disbursements: number;
  amount: number;
  successRate: number;
}

/** Aggregated row in the top-performing-districts table. */
export interface DistrictRow {
  district: string;
  state: string;
  applications: number;
  disbursements: number;
  successRate: number;
}

/** Aggregate statistics for a single act (PCR / PoA). */
export interface ActStats {
  applications: number;
  disbursements: number;
  amount: number;
  successRate: number;
}

/** Calendar-month trend buckets (index 0 = January). */
export interface MonthlyTrends {
  labels: string[];
  applications: number[];
  disbursements: number[];
  amounts: number[];
}

/** Full aggregation result consumed across the analytics page. */
export interface AnalyticsData {
  overview: {
    totalApplications: number;
    totalBeneficiaries: number;
    totalDisbursements: number;
    totalAmount: number;
    successRate: number;
    pendingApplications: number;
    rejectedApplications: number;
  };
  monthlyTrends: MonthlyTrends;
  stateWiseData: StateRow[];
  actWiseBreakdown: { pcr: ActStats; poa: ActStats };
  categoryWiseData: Record<string, number>;
  topDistricts: DistrictRow[];
}

/** KPI tile descriptor; labelKey is resolved by the caller through its translator. */
export interface PerformanceIndicator {
  labelKey: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

// ---- Shared style constants ----

export const SELECT_CLS =
  "h-9 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-sm focus:outline-none focus:border-[var(--accent-primary)]";

export const BTN_GHOST =
  "flex-1 h-8 rounded-md border theme-border-glass theme-bg-glass theme-text-secondary text-xs font-medium hover:theme-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";

export const BTN_PRIMARY =
  "flex-1 h-8 rounded-md accent-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";

// ---- Chart color palettes ----

/** Per-series palette for the monthly trends chart, keyed by theme. */
export const CHART_SERIES_COLORS = {
  dark: {
    applications: 'rgba(59, 130, 246, 1)',
    disbursements: 'rgba(16, 185, 129, 1)'
  },
  light: {
    applications: 'rgba(37, 99, 235, 1)',
    disbursements: 'rgba(5, 150, 105, 1)'
  }
} as const;

/** Fallback English month labels used when localized labels are unavailable. */
export const MONTH_LABELS_FALLBACK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/** Fixed act-type filter options. */
export const ACT_TYPE_OPTIONS = ['PCR Act', 'PoA Act'];

/**
 * Module-scope icon maps for dynamic icon selection (react-hooks/static-components):
 * render via createElement(getTrendIcon(trend), { className }).
 */
export const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown
} as const;

/** Threshold tones for the success-rate pill, checked highest first. */
const SUCCESS_RATE_TONES = [
  { min: 80, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { min: 60, className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
] as const;

// ---- Formatters ----

export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `INR ${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `INR ${(amount / 100000).toFixed(1)}L`;
  } else {
    return `INR ${(amount / 1000).toFixed(1)}K`;
  }
};

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('en-IN').format(num);

export const getTrendColor = (trend: string): string =>
  trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

export const getTrendIcon = (trend: string) =>
  TREND_ICONS[trend as keyof typeof TREND_ICONS] || TrendingDown;

export const getSuccessRatePillClass = (rate: number): string => {
  for (const tone of SUCCESS_RATE_TONES) {
    if (rate >= tone.min) return tone.className;
  }
  return 'bg-red-500/10 text-red-600 dark:text-red-400';
};

// ---- Date coercion ----

/** Firestore timestamp-or-string -> Date (application-style values). */
export const toAppDate = (value: any): Date =>
  value?.toDate ? value.toDate() : new Date(value || new Date());

/** String-or-undefined -> Date, defaulting to now (initiatedDate-style values). */
export const toDisbDate = (value: any): Date => new Date(value || new Date());

// ---- Aggregation helpers ----

/** Resolve the inclusive date window for a named (or custom) time range. */
export const getDateRange = (
  range: string,
  customStartDate = '',
  customEndDate = ''
): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const startDate = new Date();

  switch (range) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'custom':
      if (customStartDate && customEndDate) {
        return {
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate)
        };
      }
      // If no custom dates set, default to last year
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setFullYear(now.getFullYear() - 1); // Default to year
  }

  return { startDate, endDate: now };
};

/** Aggregate applications/disbursements per state. */
export const buildStateWiseData = (apps: any[], disbs: any[]): StateRow[] =>
  apps.reduce((acc: StateRow[], app) => {
    const state = app.state || 'Unknown';
    const existing = acc.find(s => s.state === state);
    const stateDisbs = disbs.filter(d => d.state === state);
    const completed = stateDisbs.filter(d => d.status === 'completed');
    const amount = completed.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);

    if (existing) {
      existing.applications += 1;
      existing.disbursements += completed.length;
      existing.amount += amount;
      existing.successRate = stateDisbs.length > 0 ? (completed.length / stateDisbs.length) * 100 : 0;
    } else {
      acc.push({
        state,
        applications: 1,
        disbursements: completed.length,
        amount,
        successRate: stateDisbs.length > 0 ? (completed.length / stateDisbs.length) * 100 : 0
      });
    }
    return acc;
  }, []);

/** Aggregate applications/completed disbursements per district, ranked by volume. */
export const buildTopDistricts = (apps: any[], disbs: any[], limit = 5): DistrictRow[] =>
  apps.reduce((acc: DistrictRow[], app) => {
    const district = app.district || 'Unknown';
    const state = app.state || 'Unknown';
    const existing = acc.find(d => d.district === district && d.state === state);
    const districtDisbs = disbs.filter(d => d.district === district && d.state === state);
    const completed = districtDisbs.filter(d => d.status === 'completed');

    if (existing) {
      existing.applications += 1;
      existing.disbursements += completed.length;
    } else {
      acc.push({
        district,
        state,
        applications: 1,
        disbursements: completed.length,
        successRate: districtDisbs.length > 0 ? (completed.length / districtDisbs.length) * 100 : 0
      });
    }
    return acc;
  }, []).sort((a, b) => b.applications - a.applications).slice(0, limit);

/** Bucket applications/disbursements/amounts into the twelve calendar months. */
export const buildMonthlyTrends = (apps: any[], disbs: any[], labels: string[]): MonthlyTrends => {
  const trends: MonthlyTrends = {
    labels,
    applications: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    disbursements: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    amounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  const now = new Date();
  apps.forEach(app => {
    const date = toAppDate(app.applicationDate);
    const month = date.getMonth();
    if (trends.applications[month] !== undefined) {
      trends.applications[month]++;
    }
  });

  disbs.forEach(d => {
    const date = toDisbDate(d.initiatedDate);
    const month = date.getMonth();
    if (trends.disbursements[month] !== undefined) {
      trends.disbursements[month]++;
      if (d.status === 'completed' && d.disbursedAmount) {
        trends.amounts[month] += d.disbursedAmount;
      }
    }
  });

  return trends;
};

/** Compare PCR vs PoA act performance across applications and disbursements. */
export const buildActWiseBreakdown = (apps: any[], disbs: any[]): { pcr: ActStats; poa: ActStats } => {
  const summarize = (actType: string): ActStats => {
    const actApps = apps.filter(app => app.actType === actType);
    const actDisbs = disbs.filter(d => d.actType === actType);
    const completed = actDisbs.filter(d => d.status === 'completed');
    return {
      applications: actApps.length,
      disbursements: actDisbs.length,
      amount: completed.reduce((sum, d) => sum + (d.disbursedAmount || 0), 0),
      successRate: actDisbs.length > 0 ? (completed.length / actDisbs.length) * 100 : 0
    };
  };

  return {
    pcr: summarize('PCR Act'),
    poa: summarize('PoA Act')
  };
};

/** Sort district rows by the given key/order (stable copy, input untouched). */
export const sortDistricts = (
  districts: DistrictRow[],
  sortBy: DistrictSortKey,
  sortOrder: 'asc' | 'desc'
): DistrictRow[] =>
  [...districts].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'applications':
        aValue = a.applications;
        bValue = b.applications;
        break;
      case 'disbursements':
        aValue = a.disbursements;
        bValue = b.disbursements;
        break;
      case 'successRate':
        aValue = a.successRate;
        bValue = b.successRate;
        break;
      case 'district':
        aValue = a.district;
        bValue = b.district;
        break;
      default:
        aValue = a.applications;
        bValue = b.applications;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
