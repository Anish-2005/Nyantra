import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

const Stats = () => {
  const [stats, setStats] = useState({
    beneficiaries: 0,
    disbursed: 0,
    avgTime: 0,
    satisfaction: 0
  });

  const { t } = useLocale();

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      const duration = 2500;
      const startTimestamp = performance.now();

      const performAnimation = (currentTime: number) => {
        const elapsed = currentTime - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setStats({
          beneficiaries: Math.floor(45000 * easeOut),
          disbursed: Math.floor(250 * easeOut),
          avgTime: Math.floor(72 * easeOut),
          satisfaction: Math.floor(94 * easeOut)
        });

        if (progress < 1) {
          requestAnimationFrame(performAnimation);
        }
      };

      requestAnimationFrame(performAnimation);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
      }
    }, { threshold: 0.5 });

    const statsElement = document.getElementById('stats-section');
    if (statsElement) observer.observe(statsElement);

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <section
      id="stats-section"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 blur-[100px] rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--accent-primary, rgba(59,130,246,0.1)), transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 blur-[100px] rounded-full animate-pulse delay-300" style={{ background: 'linear-gradient(135deg, var(--accent-secondary, rgba(245,158,11,0.08)), transparent)' }} />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary">
          {t('stats.impactTitle')}
        </h2>
        <p className="mt-2 text-sm sm:text-base theme-text-muted">
          {t('stats.impactSubtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {[
          {
            label: t('stats.beneficiaries'),
            value: stats.beneficiaries.toLocaleString(),
            suffix: '+',
            icon: Users,
            colorLight: 'from-blue-500 to-cyan-400',
            colorDark: 'from-blue-400 to-indigo-500',
          },
          {
            label: t('stats.disbursed'),
            value: stats.disbursed,
            suffix: 'Cr+',
            icon: TrendingUp,
            colorLight: 'from-green-500 to-emerald-400',
            colorDark: 'from-emerald-400 to-teal-500',
          },
          {
            label: t('stats.avgTime'),
            value: stats.avgTime,
            suffix: 'hrs',
            icon: Clock,
            colorLight: 'from-amber-500 to-orange-400',
            colorDark: 'from-amber-400 to-yellow-500',
          },
          {
            label: t('stats.satisfaction'),
            value: stats.satisfaction,
            suffix: '%',
            icon: Star,
            colorLight: 'from-purple-500 to-pink-500',
            colorDark: 'from-fuchsia-400 to-pink-500',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="relative group"
          >
            <div
              className="theme-bg-card theme-border-card backdrop-blur-2xl rounded-2xl p-6 transition-all duration-300 hover:theme-border-glass hover:shadow-lg hover:shadow-[var(--accent-color)/40]"
              style={{
                ['--accent-color' as any]:
                  stat.colorLight.includes('blue')
                    ? '#3b82f6'
                    : stat.colorLight.includes('amber')
                      ? '#f59e0b'
                      : stat.colorLight.includes('green')
                        ? '#10b981'
                        : '#8b5cf6',
              }}
            >
              {/* Icon */}
              <div
                className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md transition-transform
          bg-gradient-to-br ${stat.colorLight} dark:${stat.colorDark}
        `}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </div>

              {/* Value */}
              <div className="text-4xl font-extrabold tracking-tight theme-text-primary">
                {stat.value}
                <span className="text-2xl font-semibold text-accent-gradient ml-1">
                  {stat.suffix}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium theme-text-muted">
                {stat.label}
              </p>
            </div>

            {/* Hover Glow */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${stat.colorLight} dark:${stat.colorDark} opacity-0 group-hover:opacity-20 blur-2xl rounded-2xl transition duration-500 -z-10`}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Stats;