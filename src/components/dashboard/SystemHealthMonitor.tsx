"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

export default function SystemHealthMonitor() {
    const { t } = useLocale();

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                        <Activity className="w-5 h-5 text-green-500" />
                        {t('dashboard.systemHealth.systemHealth')}
                    </h3>
                    <motion.div
                        className="w-3 h-3 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>

                <div className="space-y-3">
                    {[
                        { label: t('dashboard.systemHealth.serverUptime'), value: '99.9%', status: 'excellent', color: 'text-green-500' },
                        { label: t('dashboard.systemHealth.apiResponse'), value: '45ms', status: 'good', color: 'text-green-500' },
                        { label: t('dashboard.systemHealth.databaseLoad'), value: '34%', status: 'normal', color: 'text-blue-500' },
                        { label: t('dashboard.systemHealth.activeUsers'), value: '1,247', status: 'high', color: 'text-purple-500' }
                    ].map((metric, idx) => (
                        <motion.div
                            key={metric.label}
                            className="flex items-center justify-between p-3 rounded-xl theme-bg-glass"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${metric.color.replace('text', 'bg')}`} />
                                <span className="text-sm theme-text-primary font-medium">{metric.label}</span>
                            </div>
                            <span className={`font-bold text-sm ${metric.color}`}>{metric.value}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Decorative orb */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </motion.div>
    );
}
