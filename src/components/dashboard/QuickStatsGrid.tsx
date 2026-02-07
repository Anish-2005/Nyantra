"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';
import { containerVariants, itemVariants } from './animations';
import { TrendingUp, ArrowDownRight, Minus } from 'lucide-react';

interface Stat {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: any;
    color: string;
}

interface QuickStatsGridProps {
    stats: Stat[];
    loading: boolean;
}

export default function QuickStatsGrid({ stats, loading }: QuickStatsGridProps) {
    const { t } = useLocale();

    return (
        <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
            {loading ? (
                // Loading skeleton for quick stats
                Array.from({ length: 4 }).map((_, idx) => (
                    <motion.div
                        key={idx}
                        className="p-4 sm:p-6 rounded-3xl theme-bg-card border theme-border-glass shadow-lg relative overflow-hidden backdrop-blur-xl animate-pulse h-32"
                    />
                ))
            ) : (
                stats.map((stat, idx) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="p-4 sm:p-6 rounded-3xl theme-bg-card border theme-border-glass shadow-lg relative overflow-hidden backdrop-blur-xl group cursor-pointer transition-all duration-300 hover:shadow-2xl"
                    >
                        {/* Animated Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-transform duration-300">
                            <stat.icon className="w-16 h-16 sm:w-24 sm:h-24 text-white -rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110 duration-300`}>
                                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${stat.trend === 'up' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                                        stat.trend === 'down' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                                            'text-gray-500 bg-gray-500/10 border-gray-500/20'
                                    }`}>
                                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                        stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> :
                                            <Minus className="w-3 h-3" />}
                                    <span>{stat.change}</span>
                                </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black theme-text-primary mb-1 tracking-tight group-hover:translate-x-1 transition-transform">{stat.value}</h3>
                            <p className="text-sm font-medium theme-text-muted">{stat.title}</p>
                        </div>

                        {/* New Decorative Elements */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity" style={{ color: stat.color.split(' ')[1].replace('to-', '') }} />

                        {/* Corner Accents */}
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-bl-full transition-all duration-500`} />
                    </motion.div>
                )))}
        </motion.div>
    );
}
