"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Download, RefreshCw, TrendingUp, BarChart, BarChart3, Zap, ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import AnalyticsChart from '@/components/AnalyticsChart';
import { itemVariants } from './animations';

interface AnalyticsPreviewProps {
    metrics: {
        peakValue: number;
        average: number;
        growthRate: number;
    };
    loading: boolean;
    applications?: any[];
}

export default function AnalyticsPreview({ metrics, loading, applications = [] }: AnalyticsPreviewProps) {
    const { t } = useLocale();

    // Chart filters state
    const [chartRange, setChartRange] = useState<number>(30);
    const [showApplications, setShowApplications] = useState(true);
    const [showApproved, setShowApproved] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [smoothing, setSmoothing] = useState(false);
    const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('line');

    // Generate data from real applications
    type DataPoint = { x: number; y: number };
    type DataSet = { id: string; label: string; color?: string; points: DataPoint[] };

    const dataSets = useMemo<DataSet[]>(() => {
        const generateFromApplications = (days: number): { apps: DataPoint[], approved: DataPoint[], pending: DataPoint[] } => {
            const now = Date.now();
            const dayMs = 24 * 60 * 60 * 1000;

            // Initialize buckets for each day
            const buckets: { [key: number]: { total: number, approved: number, pending: number } } = {};
            for (let i = 0; i < days; i++) {
                const dayStart = now - (days - 1 - i) * dayMs;
                buckets[dayStart] = { total: 0, approved: 0, pending: 0 };
            }

            // Count applications by day
            applications.forEach(app => {
                const appDate = app.applicationDate?.toDate ? app.applicationDate.toDate().getTime() : 0;
                if (!appDate) return;

                // Find which bucket this belongs to
                const dayKeys = Object.keys(buckets).map(Number).sort((a, b) => a - b);
                for (let i = 0; i < dayKeys.length; i++) {
                    const bucketStart = dayKeys[i];
                    const bucketEnd = i < dayKeys.length - 1 ? dayKeys[i + 1] : now + dayMs;

                    if (appDate >= bucketStart && appDate < bucketEnd) {
                        buckets[bucketStart].total++;
                        if (app.status === 'approved' || app.status === 'completed' || app.status === 'disbursed') {
                            buckets[bucketStart].approved++;
                        } else if (app.status === 'pending' || app.status === 'review' || app.status === 'processing') {
                            buckets[bucketStart].pending++;
                        }
                        break;
                    }
                }
            });

            // Convert to data points
            const apps: DataPoint[] = [];
            const approved: DataPoint[] = [];
            const pending: DataPoint[] = [];

            Object.keys(buckets).sort((a, b) => Number(a) - Number(b)).forEach(key => {
                const x = Number(key);
                apps.push({ x, y: buckets[x].total });
                approved.push({ x, y: buckets[x].approved });
                pending.push({ x, y: buckets[x].pending });
            });

            return { apps, approved, pending };
        };

        const smooth = (arr: DataPoint[]) => {
            const window = 3;
            return arr.map((p, i) => {
                const start = Math.max(0, i - window + 1);
                const end = i;
                const avg = Math.round(arr.slice(start, end + 1).reduce((s, v) => s + v.y, 0) / (end - start + 1));
                return { x: p.x, y: avg };
            });
        };

        const { apps, approved, pending } = generateFromApplications(chartRange);

        const sets: DataSet[] = [];
        if (showApplications) sets.push({ id: 'applications', label: t('dashboard.chartLabels.applications'), points: smoothing ? smooth(apps) : apps });
        if (showApproved) sets.push({ id: 'approved', label: t('dashboard.chartLabels.approved'), color: undefined, points: smoothing ? smooth(approved) : approved });
        if (showPending) sets.push({ id: 'pending', label: t('dashboard.chartLabels.pending'), color: undefined, points: smoothing ? smooth(pending) : pending });
        return sets;
    }, [chartRange, showApplications, showApproved, showPending, smoothing, t, applications]);

    // CSV export
    const exportCSV = useCallback(() => {
        if (!dataSets || dataSets.length === 0) return;
        const header = ['date', ...dataSets.map(ds => ds.label)];
        const rows: string[][] = [];
        const len = dataSets[0].points.length;
        for (let i = 0; i < len; i++) {
            const row: string[] = [];
            const ts = new Date(dataSets[0].points[i].x).toISOString();
            row.push(ts);
            for (const ds of dataSets) {
                row.push(String(ds.points[i]?.y ?? ''));
            }
            rows.push(row);
        }

        const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [dataSets]);

    return (
        <motion.div
            variants={itemVariants}
            className="relative theme-bg-card theme-border-glass border-2 rounded-3xl p-4 sm:p-6 backdrop-blur-xl overflow-hidden group"
        >
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />
            </div>

            {/* Header Section with Live Indicator */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <motion.div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                    >
                        <Activity className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold theme-text-primary">{t('dashboard.analytics.performanceAnalytics')}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <motion.div
                                className="w-2 h-2 bg-green-500 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-xs theme-text-muted">{t('dashboard.analytics.liveDataStream')}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportCSV}
                        className="px-3 py-2 rounded-xl theme-bg-glass theme-border-glass border flex items-center gap-2 text-sm font-medium theme-text-primary hover:bg-white/5 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('dashboard.analytics.export')}</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('dashboard.analytics.refresh')}</span>
                    </motion.button>
                </div>
            </div>

            {/* Modern Filter Chips */}
            <div className="relative z-10 mb-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                    {/* Time Range Chips */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider hidden sm:inline">Period:</span>
                        {[
                            { value: 7, label: '7D' },
                            { value: 30, label: '30D' },
                            { value: 90, label: '90D' }
                        ].map((range) => (
                            <motion.button
                                key={range.value}
                                onClick={() => setChartRange(range.value)}
                                className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${chartRange === range.value
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'theme-bg-glass theme-border-glass border theme-text-muted hover:border-blue-500/50'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {range.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Chart Type Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider hidden sm:inline">{t('dashboard.common.view')}</span>
                        {[
                            { value: 'line', icon: TrendingUp, label: t('dashboard.chartLabels.line') },
                            { value: 'area', icon: BarChart, label: t('dashboard.chartLabels.area') },
                            { value: 'bar', icon: BarChart3, label: t('dashboard.chartLabels.bar') }
                        ].map((type) => (
                            <motion.button
                                key={type.value}
                                onClick={() => setChartType(type.value as 'line' | 'area' | 'bar' | 'stacked')}
                                className={`p-2 rounded-xl transition-all ${chartType === type.value
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'theme-bg-glass theme-border-glass border theme-text-muted hover:border-blue-500/50'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title={type.label}
                            >
                                <type.icon className="w-4 h-4" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Dataset Toggle Chips */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "ds-app", label: t('dashboard.chartLabels.applications'), value: showApplications, setter: setShowApplications, color: "from-blue-500 to-cyan-500" },
                        { id: "ds-approved", label: t('dashboard.chartLabels.approved'), value: showApproved, setter: setShowApproved, color: "from-green-500 to-emerald-500" },
                        { id: "ds-pending", label: t('dashboard.chartLabels.pending'), value: showPending, setter: setShowPending, color: "from-amber-500 to-orange-500" }
                    ].map(ds => (
                        <motion.button
                            key={ds.id}
                            onClick={() => ds.setter(v => !v)}
                            className={`px-3 sm:px-4 py-2 rounded-full font-medium text-xs flex items-center gap-2 transition-all border-2 ${ds.value
                                ? `bg-gradient-to-r ${ds.color} text-white border-transparent shadow-lg`
                                : 'theme-bg-glass theme-border-glass theme-text-muted hover:border-blue-500/30'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className={`w-2 h-2 rounded-full ${ds.value ? 'bg-white' : 'bg-gray-400'}`}
                                animate={ds.value ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            {ds.label}
                        </motion.button>
                    ))}

                    {/* Smoothing Toggle */}
                    <motion.button
                        onClick={() => setSmoothing(v => !v)}
                        className={`px-3 sm:px-4 py-2 rounded-full font-medium text-xs flex items-center gap-2 transition-all border-2 ${smoothing
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg'
                            : 'theme-bg-glass theme-border-glass theme-text-muted hover:border-purple-500/30'
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Zap className={`w-3 h-3 ${smoothing ? 'text-white' : 'text-gray-400'}`} />
                        {t('extracted.smoothing')}
                    </motion.button>
                </div>
            </div>

            {/* Chart Area with Enhanced Styling */}
            <div className="relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {[
                        { label: t('dashboard.analytics.peakValue'), value: metrics.peakValue.toLocaleString(), color: 'from-blue-500 to-cyan-500', icon: TrendingUp },
                        { label: t('dashboard.analytics.average'), value: `₹${metrics.average.toLocaleString()}`, color: 'from-purple-500 to-pink-500', icon: Activity },
                        { label: t('dashboard.analytics.growthRate'), value: `${metrics.growthRate >= 0 ? '+' : ''}${metrics.growthRate}%`, color: 'from-green-500 to-emerald-500', icon: ArrowUpRight }
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="theme-bg-glass rounded-2xl p-3 sm:p-4 border theme-border-glass"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm theme-text-muted">{stat.label}</p>
                                    <p className="text-lg sm:text-xl font-bold theme-text-primary">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Chart */}
                <div className="relative rounded-2xl theme-bg-glass p-0 sm:p-4 border theme-border-glass h-[300px] sm:h-[400px]">
                    <AnalyticsChart dataSets={dataSets} chartType={chartType} />
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </motion.div>
    );
}
