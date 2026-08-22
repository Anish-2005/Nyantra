'use client';

import React from 'react';
import { Shield, Zap, Database, Lock, TrendingUp, Users, Sparkles, CheckCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { Section, SectionHeader, Stagger, StaggerItem, GlassCard, IconChip } from './primitives';

interface FeatureItem {
  icon: typeof Shield;
  tone: 'blue' | 'amber' | 'indigo' | 'purple' | 'green' | 'pink';
  title: string;
  description: string;
  points: string[];
}

const Features = () => {
  const { t } = useLocale();

  const features: FeatureItem[] = [
    {
      icon: Shield,
      tone: 'blue',
      title: t('features.secureVerification.title'),
      description: t('features.secureVerification.description'),
      points: JSON.parse(t('features.secureVerification.features')) as string[],
    },
    {
      icon: Zap,
      tone: 'amber',
      title: t('features.realTimeTracking.title'),
      description: t('features.realTimeTracking.description'),
      points: JSON.parse(t('features.realTimeTracking.features')) as string[],
    },
    {
      icon: Database,
      tone: 'indigo',
      title: t('features.unifiedDatabase.title'),
      description: t('features.unifiedDatabase.description'),
      points: JSON.parse(t('features.unifiedDatabase.features')) as string[],
    },
    {
      icon: Lock,
      tone: 'purple',
      title: t('features.privacyProtection.title'),
      description: t('features.privacyProtection.description'),
      points: JSON.parse(t('features.privacyProtection.features')) as string[],
    },
    {
      icon: TrendingUp,
      tone: 'green',
      title: t('features.analyticsDashboard.title'),
      description: t('features.analyticsDashboard.description'),
      points: JSON.parse(t('features.analyticsDashboard.features')) as string[],
    },
    {
      icon: Users,
      tone: 'pink',
      title: t('features.multiStakeholder.title'),
      description: t('features.multiStakeholder.description'),
      points: JSON.parse(t('features.multiStakeholder.features')) as string[],
    },
  ];

  return (
    <Section id="features" className="py-24 sm:py-28">
      <SectionHeader
        eyebrow={t('features.title')}
        eyebrowIcon={Sparkles}
        title={t('features.subtitle')}
        lede={t('features.description')}
      />

      <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {features.map((feature, i) => (
          <StaggerItem key={i}>
            <GlassCard className="group h-full p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-primary/40 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)]">
              <IconChip icon={feature.icon} tone={feature.tone} />
              <h3 className="mt-5 text-lg font-semibold tracking-tight theme-text-primary transition-colors group-hover:text-accent-gradient">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm theme-text-secondary leading-relaxed">{feature.description}</p>
              <ul className="mt-5 pt-5 border-t theme-border-glass space-y-2.5">
                {feature.points.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm theme-text-primary">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
};

export default Features;
