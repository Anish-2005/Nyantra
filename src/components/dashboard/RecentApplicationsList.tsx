"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, Calendar, DollarSign, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

interface Application {
    id: string;
    name: string;
    district: string;
    status: string;
    amount: number;
    date: string;
    type: string;
    avatar: string;
}

interface RecentApplicationsListProps {
    applications: Application[];
    loading: boolean;
}

export default function RecentApplicationsList({ applications, loading }: RecentApplicationsListProps) {
    const { t } = useLocale();
    const router = useRouter();

    const formatCurrency = (n?: number | null) => {
        if (n == null || Number.isNaN(n)) return '₹0';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-500';
            case 'pending': return 'bg-amber-500';
            case 'rejected': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold theme-text-primary" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t('dashboard.liveTracking.liveApplicationTracking')}</h3>
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <motion.button
                    onClick={() => router.push('/dashboard/applications')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl theme-bg-glass theme-text-primary text-sm w-full sm:w-auto justify-center sm:justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>{t('dashboard.common.viewAllTracking')}</span>
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    // Loading skeleton for recent applications
                    Array.from({ length: 4 }).map((_, idx) => (
                        <motion.div
                            key={idx}
                            className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl theme-bg-glass border border-transparent animate-pulse gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 pl-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-32"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="hidden sm:flex sm:flex-col sm:items-end text-right">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    applications.map((app, idx) => (
                        <motion.div
                            key={app.id}
                            className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl theme-bg-glass group hover:theme-border-glass border border-transparent transition-all gap-3 overflow-hidden cursor-pointer"
                            whileHover={{ x: 4, backgroundColor: 'var(--glass-bg)' }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => router.push(`/dashboard/applications?id=${app.id}`)}
                        >
                            {/* Color-coded status strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${getStatusColor(app.status)}`} />

                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 pl-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl accent-gradient flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md">
                                    {app.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base font-semibold theme-text-primary truncate group-hover:text-blue-500 transition-colors">
                                        {app.name}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs theme-text-muted mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {app.id}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {app.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-3 sm:pl-0 border-t sm:border-t-0 p-2 sm:p-0 mt-2 sm:mt-0 theme-border-glass sm:border-transparent">
                                <div className="flex items-center gap-1 font-bold theme-text-primary text-sm sm:text-base">
                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                    {formatCurrency(app.amount)}
                                </div>
                                <div className="flex items-center gap-1 text-xs theme-text-muted">
                                    <Calendar className="w-3 h-3" />
                                    {app.date}
                                </div>
                            </div>

                            <ChevronRight className="w-5 h-5 theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block" />
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
