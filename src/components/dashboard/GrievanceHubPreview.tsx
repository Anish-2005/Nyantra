"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

interface Grievance {
    id: string;
    subject: string;
    priority: string;
    status: string;
    assignedTo: string;
    date: string;
}

interface GrievanceHubPreviewProps {
    grievanceData: Grievance[];
    loading: boolean;
}

export default function GrievanceHubPreview({ grievanceData, loading }: GrievanceHubPreviewProps) {
    const { t } = useLocale();
    const router = useRouter();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300';
            case 'medium': return 'text-amber-500 bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300';
            case 'low': return 'text-blue-500 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
            default: return 'text-gray-500 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
        >
            {/* Alert Wave Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grievance-alert" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="2" fill="rgba(239, 68, 68, 0.6)" />
                            <path d="M15,30 L30,15 L45,30 L30,45 Z" stroke="rgba(239, 68, 68, 0.4)" fill="none" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grievance-alert)" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <MessageCircle className="w-5 h-5 text-white" />
                            {/* Alert Ripple Effect */}
                            <motion.div
                                className="absolute inset-0 rounded-xl bg-red-500"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-semibold theme-text-primary" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t('dashboard.sections.grievanceStatus')}</h3>
                            <p className="text-xs theme-text-muted">Active Issues</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={() => router.push('/dashboard/grievance')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>{t('dashboard.common.viewFull')}</span>
                        <ArrowRight className="w-3 h-3" />
                    </motion.button>
                </div>

                <div className="space-y-2.5">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <motion.div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl theme-bg-glass border theme-border-glass animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-300"></div>
                                    <div>
                                        <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="h-6 bg-gray-300 rounded w-16"></div>
                            </motion.div>
                        ))
                    ) : (
                        grievanceData.map((grievance, index) => {
                            const priorityConfig = {
                                high: {
                                    bg: 'from-red-500 to-rose-500',
                                    text: 'text-red-500',
                                    icon: AlertCircle,
                                    glow: 'shadow-red-500/30'
                                },
                                medium: {
                                    bg: 'from-amber-500 to-orange-500',
                                    text: 'text-amber-500',
                                    icon: Clock,
                                    glow: 'shadow-amber-500/30'
                                },
                                low: {
                                    bg: 'from-blue-500 to-cyan-500',
                                    text: 'text-blue-500',
                                    icon: CheckCircle,
                                    glow: 'shadow-blue-500/30'
                                }
                            };

                            const config = priorityConfig[grievance.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                            const PriorityIcon = config.icon;

                            return (
                                <motion.div
                                    key={grievance.id}
                                    className="relative p-3 rounded-xl theme-bg-glass border theme-border-glass group/item overflow-hidden cursor-pointer"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1, type: "spring" }}
                                    whileHover={{ scale: 1.03, x: 5 }}
                                    onClick={() => router.push('/dashboard/grievance')}
                                >
                                    {/* Priority Accent Bar */}
                                    <motion.div
                                        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.bg}`}
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                    />

                                    {/* Hover Glow Effect */}
                                    <motion.div
                                        className={`absolute inset-0 bg-gradient-to-r ${config.bg} opacity-0 group-hover/item:opacity-5`}
                                        transition={{ duration: 0.3 }}
                                    />

                                    <div className="relative pl-3">
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                {/* Priority Icon */}
                                                <motion.div
                                                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-lg ${config.glow} flex-shrink-0 mt-0.5`}
                                                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <PriorityIcon className="w-4 h-4 text-white" />
                                                </motion.div>

                                                {/* Subject */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold theme-text-primary text-sm leading-tight line-clamp-2">
                                                        {grievance.subject}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Priority Badge */}
                                            <motion.div
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPriorityColor(grievance.priority)} shadow-sm flex-shrink-0`}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.4 + index * 0.1 }}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                {grievance.priority}
                                            </motion.div>
                                        </div>

                                        {/* Info Row */}
                                        <div className="flex items-center justify-between text-xs theme-text-muted pl-10">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text', 'bg')}`} />
                                                <span className="font-medium">{grievance.assignedTo}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{grievance.date}</span>
                                            </div>
                                        </div>

                                        {/* Progress Indicator */}
                                        <div className="mt-2 pl-10">
                                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r ${config.bg}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: grievance.priority === 'high' ? '75%' : grievance.priority === 'medium' ? '50%' : '25%' }}
                                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shine Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/item:opacity-10"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Priority Summary */}
                <div className="mt-4 pt-3 border-t theme-border-glass">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="theme-text-muted font-medium">
                                    {grievanceData.filter(g => g.priority === 'high').length} High
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-amber-500" />
                                <span className="theme-text-muted font-medium">
                                    {grievanceData.filter(g => g.priority === 'medium').length} Medium
                                </span>
                            </div>
                        </div>
                        <motion.div
                            className="flex items-center gap-1 text-red-500 font-semibold"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>Active</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Enhanced Decorative Elements */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </motion.div>
    );
}
