"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, CheckCircle, Clock, Wallet, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

interface Report {
    id?: string;
    name: string;
    type: string;
    status: string;
    size: string;
    date: string;
    icon?: any;
    progress?: number;
    color?: string;
}

interface ReportsPreviewProps {
    reports: Report[];
    loading: boolean;
}

export default function ReportsPreview({ reports, loading }: ReportsPreviewProps) {
    const { t } = useLocale();
    const router = useRouter();

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return t('dashboard.status.completed');
            case 'processing': return t('dashboard.status.processing');
            default: return status;
        }
    };

    const defaultReports = [
        { name: t('dashboard.reports.monthlyDbtDisbursement'), type: t('dashboard.reports.financial'), status: 'completed', size: '4.2 MB', date: '2024-03-18', icon: Wallet, progress: 100, color: 'from-green-500 to-emerald-500' },
        { name: t('dashboard.reports.beneficiaryVerification'), type: t('dashboard.reports.operational'), status: 'completed', size: '2.8 MB', date: '2024-03-17', icon: CheckCircle, progress: 100, color: 'from-blue-500 to-cyan-500' },
        { name: t('dashboard.reports.applicationAnalytics'), type: t('dashboard.reports.statistical'), status: 'processing', size: '3.5 MB', date: '2024-03-16', icon: BarChart3, progress: 65, color: 'from-amber-500 to-orange-500' }
    ];

    const displayReports = reports.length > 0 ? reports : defaultReports;

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border-2 rounded-3xl p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
        >
            {/* Background Pattern - Waves */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="wave-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="rgba(59, 130, 246, 0.8)" fill="none" strokeWidth="2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#wave-pattern)" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <FileText className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold theme-text-primary">{t('dashboard.reports.generatedReports')}</h3>
                            <p className="text-sm theme-text-muted">{t('dashboard.reports.latestSystemReports')}</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={() => router.push('/dashboard/reports')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>{t('dashboard.common.viewFull')}</span>
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

                <div className="space-y-4">
                    {displayReports.map((report: any, idx: number) => {
                        const IconComp = report.icon || FileText;
                        const color = report.color || 'from-gray-500 to-gray-600';
                        const status = report.status || 'completed';

                        return (
                            <motion.div
                                key={(report.id || report.name) + idx}
                                className="relative p-5 rounded-2xl theme-bg-glass border-2 theme-border-glass group/report overflow-hidden shadow-xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, type: "spring" }}
                                whileHover={{ scale: 1.03, x: 8 }}
                            >
                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id={`report-bg-${idx}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <rect x="10" y="10" width="20" height="20" rx="2" fill="currentColor" opacity="0.3" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill={`url(#report-bg-${idx})`} />
                                    </svg>
                                </div>

                                {/* Status Accent Bar */}
                                <motion.div
                                    className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${color}`}
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                                />

                                <div className="relative flex items-center gap-5">
                                    {/* Icon with Animation */}
                                    <div className="relative">
                                        <motion.div
                                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                                            whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <IconComp className="w-7 h-7 text-white" />
                                        </motion.div>
                                        {/* Status Indicator */}
                                        <motion.div
                                            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 theme-bg-card flex items-center justify-center shadow-lg ${status === 'completed' ? 'bg-green-500 border-green-300' : 'bg-blue-500 border-blue-300'
                                                }`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                                        >
                                            {status === 'completed' ?
                                                <CheckCircle className="w-3 h-3 text-white" /> :
                                                <Clock className="w-3 h-3 text-white" />
                                            }
                                        </motion.div>
                                    </div>

                                    {/* Report Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <motion.p
                                                    className="font-bold theme-text-primary text-base mb-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                                >
                                                    {report.name}
                                                </motion.p>
                                                <div className="flex items-center gap-3 text-xs theme-text-muted">
                                                    <span className={`px-2.5 py-1 rounded-full font-semibold ${report.type === t('dashboard.reports.financial') || report.type === 'Financial' ? 'bg-green-500/10 text-green-500' :
                                                            report.type === t('dashboard.reports.operational') || report.type === 'Operational' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-purple-500/10 text-purple-500'
                                                        }`}>
                                                        {report.type}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        {report.size}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {report.date}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <motion.span
                                                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${report.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 + idx * 0.1 }}
                                            >
                                                {report.status === 'completed' ?
                                                    <CheckCircle className="w-3 h-3" /> :
                                                    <Clock className="w-3 h-3" />
                                                }
                                                {getStatusText(report.status)}
                                            </motion.span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs theme-text-muted">
                                                <span>{t('dashboard.common.generationProgress') || 'Generation Progress'}</span>
                                                <span className="font-semibold">{report.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r ${report.color}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${report.progress}%` }}
                                                    transition={{ delay: 0.5 + idx * 0.1, duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shine Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/report:opacity-10"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6 }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Decorative orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </motion.div>
    );
}
