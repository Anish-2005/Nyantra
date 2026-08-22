'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { Section, SectionHeader, Stagger, StaggerItem, IconChip } from './primitives';

const Stats = () => {
  const [stats, setStats] = useState({
    beneficiaries: 0,
    disbursed: 0,
    avgTime: 0,
    satisfaction: 0,
  });

  const { t } = useLocale();

  useEffect(() => {
    const animateStats = () => {
      const duration = 2200;
      const startTimestamp = performance.now();

      const performAnimation = (currentTime: number) => {
        const elapsed = currentTime - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setStats({
          beneficiaries: Math.floor(45000 * easeOut),
          disbursed: Math.floor(250 * easeOut),
          avgTime: Math.floor(72 * easeOut),
          satisfaction: Math.floor(94 * easeOut),
        });

        if (progress < 1) {
          requestAnimationFrame(performAnimation);
        }
      };

      requestAnimationFrame(performAnimation);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateStats();
        }
      },
      { threshold: 0.5 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) observer.observe(statsElement);

    return () => observer.disconnect();
  }, []);

  const statItems = [
    { label: t('stats.beneficiaries'), value: stats.beneficiaries.toLocaleString(), suffix: '+', icon: Users, tone: 'blue' as const },
    { label: t('stats.disbursed'), value: String(stats.disbursed), suffix: 'Cr+', icon: TrendingUp, tone: 'green' as const },
    { label: t('stats.avgTime'), value: String(stats.avgTime), suffix: 'hrs', icon: Clock, tone: 'amber' as const },
    { label: t('stats.satisfaction'), value: String(stats.satisfaction), suffix: '%', icon: Star, tone: 'purple' as const },
  ];

  return (
    <Section id="stats-section" divided className="py-14 sm:py-16">
      <SectionHeader
        eyebrow={t('stats.impactTitle')}
        title={t('stats.impactSubtitle')}
      />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
        {statItems.map((stat, i) => (
          <StaggerItem key={i} className={`${i > 0 ? 'lg:border-l theme-border-glass lg:pl-8' : ''}`}>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <IconChip icon={stat.icon} tone={stat.tone} size="sm" />
              <div className="mt-3.5 text-3xl xl:text-[2rem] font-bold tracking-tight theme-text-primary leading-none">
                {stat.value}
                <span className="text-lg font-semibold text-accent-gradient ml-0.5">{stat.suffix}</span>
              </div>
              <p className="mt-2 text-xs font-medium theme-text-muted">{stat.label}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
};

export default Stats;
