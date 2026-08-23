"use client";
import React, { createElement } from 'react';
import { CheckCircle, Download, Activity, FilePlus, Calendar, BookOpen, ArrowUpRight } from 'lucide-react';
import type { TranslateFn } from '../helpers';
import {
  OFFICER_GHOST_BTN,
  getOfficerCategoryIcon,
  getOfficerCategoryLabel,
  type OfficerActivityItem,
} from '../helpers';

export type OfficerQuickActionId = 'generate' | 'schedule' | 'download_all' | 'view_templates';

interface OfficerStatSnapshot {
  total: number;
  completed: number;
  processing: number;
  scheduled: number;
  failed: number;
  totalDownloads: number;
  avgProcessingTime: number;
  successRate: number;
}

// Module-scope metric defs (react-hooks/static-components: render icons via createElement)
interface MetricDef {
  id: 'completion' | 'downloads' | 'health';
  labelKey: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  showPercent: boolean;
}

const METRIC_DEFS: MetricDef[] = [
  { id: 'completion', labelKey: 'extracted.completion_rate', color: 'bg-emerald-500', icon: CheckCircle, showPercent: true },
  { id: 'downloads', labelKey: 'extracted.download_engagement', color: 'bg-blue-500', icon: Download, showPercent: false },
  { id: 'health', labelKey: 'extracted.system_health', color: '', icon: Activity, showPercent: true }
];

// Module-scope quick-action defs (icons rendered via createElement)
const QUICK_ACTIONS: Array<{
  id: OfficerQuickActionId;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'generate', labelKey: 'extracted.generate_disbursement', icon: FilePlus },
  { id: 'schedule', labelKey: 'extracted.schedule_weekly', icon: Calendar },
  { id: 'download_all', labelKey: 'extracted.download_all', icon: Download },
  { id: 'view_templates', labelKey: 'extracted.view_templates', icon: BookOpen }
];

/**
 * Two-column analytics overview: performance metric bars, recent activity
 * feed, per-category counts and quick actions.
 */
export default function OfficerAnalyticsSection({
  t,
  stats,
  categoryStats,
  recentActivities,
  loading,
  onQuickAction,
}: {
  t: TranslateFn;
  stats: OfficerStatSnapshot;
  categoryStats: Record<string, number>;
  recentActivities: OfficerActivityItem[];
  loading: boolean;
  onQuickAction: (id: OfficerQuickActionId) => void;
}) {
  const metrics = METRIC_DEFS.map(def => ({
    ...def,
    value:
      def.id === 'completion'
        ? stats.successRate
        : def.id === 'downloads'
          ? stats.totalDownloads
          : Math.max(0, Math.min(100, 100 - (stats.failed * 10))),
    color: def.id === 'health' ? (stats.failed > 0 ? 'bg-red-500' : 'bg-emerald-500') : def.color,
    description:
      def.id === 'completion'
        ? t('extracted.reports_completed', { count: stats.completed, total: stats.total })
        : def.id === 'downloads'
          ? t('extracted.total_downloads', { count: stats.totalDownloads })
          : t('extracted.failed_reports', { count: stats.failed })
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Performance Chart */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.report_analytics')}</h3>
        </div>
        <div className="px-4 py-3.5 space-y-3">
          {metrics.map((metric) => (
            <div key={metric.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {createElement(metric.icon, { className: `w-3.5 h-3.5 shrink-0 ${metric.color.replace('bg-', 'text-')}` })}
                  <span className="text-xs theme-text-secondary truncate">{t(metric.labelKey)}</span>
                </div>
                <span className="text-sm font-semibold theme-text-primary tabular-nums shrink-0">
                  {metric.value}{metric.showPercent ? '%' : ''}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${metric.color} transition-all duration-1000`}
                  style={{ width: metric.showPercent ? `${metric.value}%` : `${Math.min((metric.value / 10000) * 100, 100)}%` }}
                />
              </div>
              <div className="text-[11px] theme-text-muted">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.recent_activity')}</h3>
        </div>
        <div className="px-4 py-2">
          {recentActivities.length > 0 ? (
            <div className="divide-y theme-border-glass">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    activity.status === 'success' ? 'bg-emerald-500' :
                    activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium theme-text-primary truncate">{activity.action}</p>
                    <p className="text-[11px] theme-text-muted truncate">{activity.user} • {activity.time}</p>
                  </div>
                  <ArrowUpRight className="w-3 h-3 theme-text-muted shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs theme-text-muted">{t('extracted.no_recent_activity')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Categories */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.report_categories_header')}</h3>
        </div>
        <div className="px-4 py-2">
          <div className="divide-y theme-border-glass">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {createElement(getOfficerCategoryIcon(category), { className: 'w-3.5 h-3.5 theme-text-muted shrink-0' })}
                  <span className="text-xs theme-text-primary truncate">{getOfficerCategoryLabel(t, category)}</span>
                </div>
                <span className="text-sm font-medium theme-text-primary tabular-nums shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="theme-bg-card theme-border-glass border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border-glass">
          <h3 className="text-sm font-semibold theme-text-primary">{t('extracted.quick_actions_1')}</h3>
        </div>
        <div className="px-4 py-3.5 space-y-2">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => onQuickAction(action.id)}
              disabled={loading}
              className={`${OFFICER_GHOST_BTN} w-full !justify-start disabled:opacity-40`}
            >
              {createElement(action.icon, { className: 'w-3.5 h-3.5 shrink-0' })}
              <span className="truncate">{t(action.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
