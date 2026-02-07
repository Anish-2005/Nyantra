"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, FileText, BarChart3, Settings } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { itemVariants } from './animations';

export default function QuickActions() {
    const { t } = useLocale();

    return (
        <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-glass border-2 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.5) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.5) 75%, rgba(59, 130, 246, 0.5)), linear-gradient(45deg, rgba(59, 130, 246, 0.5) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.5) 75%, rgba(59, 130, 246, 0.5))',
                    backgroundSize: '15px 15px',
                    backgroundPosition: '0 0, 7.5px 7.5px'
                }} />
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2" style={{ overflow: 'visible', lineHeight: '1.4' }}>
                    <Zap className="w-5 h-5 text-amber-500" />
                    {t('dashboard.sections.quickActions')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { labelKey: 'dashboard.quickActionLabels.newApp', icon: Plus, color: 'from-blue-500 to-cyan-500' },
                        { labelKey: 'dashboard.quickActionLabels.reports', icon: FileText, color: 'from-green-500 to-emerald-500' },
                        { labelKey: 'dashboard.quickActionLabels.analytics', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
                        { labelKey: 'dashboard.quickActionLabels.settings', icon: Settings, color: 'from-amber-500 to-orange-500' }
                    ].map((action, index) => (
                        <motion.button
                            key={action.labelKey}
                            className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white flex flex-col items-center justify-center space-y-2 shadow-lg relative overflow-hidden`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-white"
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 2, opacity: 0.1 }}
                                transition={{ duration: 0.3 }}
                            />
                            <action.icon className="w-6 h-6" />
                            <span className="text-xs font-semibold text-center" style={{ overflow: 'visible', lineHeight: '1.4' }}>{t(action.labelKey)}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Decorative orb */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </motion.div>
    );
}
