"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Rocket, Award, Clock } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

export default function PerformanceMetrics() {
    const { t } = useLocale();

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="perf-wave" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
                            <path d="M0 25 Q 25 15, 50 25 T 100 25" stroke="rgba(59, 130, 246, 0.8)" fill="none" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#perf-wave)" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        {t('dashboard.performance.performance')}
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: t('dashboard.performance.today'), value: '156', change: '+12%', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
                        { label: t('dashboard.performance.thisWeek'), value: '892', change: '+8%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                        { label: t('dashboard.performance.success'), value: '87.5%', change: '+3%', icon: Award, color: 'from-purple-500 to-pink-500' },
                        { label: t('dashboard.performance.pending'), value: '45', change: '-5%', icon: Clock, color: 'from-amber-500 to-orange-500' }
                    ].map((metric, idx) => (
                        <motion.div
                            key={metric.label}
                            className="p-3 rounded-xl theme-bg-glass border theme-border-glass"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-2`}>
                                <metric.icon className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs theme-text-muted mb-1">{metric.label}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-bold theme-text-primary">{metric.value}</p>
                                <span className={`text-xs font-semibold ${metric.change.startsWith('+') ? 'text-green-500' : 'text-amber-500'}`}>
                                    {metric.change}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Decorative orb */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </motion.div>
    );
}
