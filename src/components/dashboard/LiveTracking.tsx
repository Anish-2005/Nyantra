"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, CheckCircle, Clock, AlertCircle, TrendingUp,
    FileText, MessageCircle, Wallet, Settings
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

interface ActivityItem {
    type: 'application' | 'grievance' | 'payment' | 'system';
    action: string;
    time: string;
    user: string;
    details?: string;
}

interface LiveTrackingProps {
    stats: any[];
    recentActivity: ActivityItem[];
    loading: boolean;
}

export default function LiveTracking({ stats, recentActivity, loading }: LiveTrackingProps) {
    const { t } = useLocale();

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'application': return FileText;
            case 'grievance': return MessageCircle;
            case 'payment': return Wallet;
            case 'system': return Settings;
            default: return Activity;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'application': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'grievance': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'payment': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'system': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Application Tracking */}
            <motion.div
                variants={itemVariants}
                className="lg:col-span-2 theme-bg-card theme-border-glass border-2 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-sm relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
                    <Activity className="w-32 h-32 -rotate-12" style={{ color: 'var(--accent-primary)' }} />
                </div>

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold theme-text-primary flex items-center gap-3">
                            <Activity className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" style={{ color: 'var(--accent-primary)' }} />
                            {t('dashboard.sections.liveApplicationTracking')}

                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Live
                            </span>
                        </h3>
                        <p className="theme-text-muted mt-1 max-w-md">{t('dashboard.common.realtimeSystemUpdates')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {stats.slice(0, 2).map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="p-4 rounded-2xl theme-bg-glass theme-border-glass border flex flex-col items-center justify-center text-center group/stat relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover/stat:opacity-5 transition-opacity duration-300`} />

                            <div className={`w-12 h-12 mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>

                            <h4 className="text-2xl font-bold theme-text-primary mb-1">{stat.value}</h4>
                            <p className="text-xs font-medium theme-text-muted uppercase tracking-wide">{stat.label}</p>

                            {/* Trend Indicator */}
                            <div className={`absolute top-2 right-2 flex items-center text-[10px] font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5 rotate-180" />}
                                {stat.change}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Live Activity Feed */}
            <motion.div
                variants={itemVariants}
                className="theme-bg-card theme-border-glass border-2 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-sm relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h3 className="text-xl font-bold theme-text-primary mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-purple-500" />
                        {t('dashboard.sections.recentInfo')}
                    </h3>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {recentActivity.map((activity, idx) => {
                                const Icon = getActivityIcon(activity.type);
                                const colorClass = getActivityColor(activity.type);

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
                                    >
                                        <div className={`mt-1 p-2 rounded-lg border ${colorClass} group-hover/item:scale-110 transition-transform duration-300 bg-opacity-10`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold theme-text-primary truncate">{activity.action}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs theme-text-muted">{activity.user}</p>
                                                <span className="text-[10px] font-medium theme-text-muted bg-white/5 px-2 py-0.5 rounded-full border theme-border-glass">
                                                    {activity.time}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
