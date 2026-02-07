"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';

interface WelcomeHeaderProps {
    user: any;
}

export default function WelcomeHeader({ user }: WelcomeHeaderProps) {
    const { t } = useLocale();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return t('dashboard.greetings.goodMorning');
        if (hour < 18) return t('dashboard.greetings.goodAfternoon');
        return t('dashboard.greetings.goodEvening');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
        >
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl sm:text-4xl font-bold text-accent-gradient">
                        {getGreeting()}, {user?.displayName?.split(' ')[0] || t('dashboard.common.user')}
                    </h2>
                    <motion.div
                        animate={{ rotate: [0, 20, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="text-3xl"
                    >
                        👋
                    </motion.div>
                </div>
                <p className="text-base theme-text-muted max-w-xl">
                    {t('dashboard.common.welcomeMessage')}
                </p>

                {/* Live Date/Time Badge */}
                <div className="flex items-center gap-4 mt-4 text-sm font-medium theme-text-muted">
                    <span className="px-3 py-1 rounded-full theme-bg-glass border theme-border-glass shadow-sm">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="px-3 py-1 rounded-full theme-bg-glass border theme-border-glass shadow-sm font-mono text-xs">
                        {currentTime.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl theme-bg-glass theme-border-glass border hover:bg-white/10 transition-colors relative group"
                >
                    <RefreshCw className="w-5 h-5 theme-text-primary group-hover:rotate-180 transition-transform duration-500" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {t('dashboard.common.refreshData')}
                    </span>
                </motion.button>

                <motion.button
                    onClick={() => router.push('/dashboard/applications')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl accent-gradient text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-shadow"
                >
                    <Plus className="w-5 h-5" />
                    <span>{t('dashboard.common.newApplication')}</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
