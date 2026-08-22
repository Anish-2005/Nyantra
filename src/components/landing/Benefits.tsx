'use client';

import { Clock, Target, Shield, Globe, Smartphone, Eye } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';
import { Section, SectionHeader, Stagger, StaggerItem, GlassCard, IconChip } from './primitives';

interface BenefitItem {
  title: string;
  desc: string;
}

const BENEFIT_ICONS = [Clock, Target, Shield, Globe, Smartphone, Eye];
const BENEFIT_TONES = ['blue', 'amber', 'green', 'indigo', 'purple', 'pink'] as const;

const Benefits: React.FC = () => {
  const { t } = useLocale();

  const benefits = (JSON.parse(t('benefits.items')) as BenefitItem[]).map((item, i) => ({
    ...item,
    icon: BENEFIT_ICONS[i],
    tone: BENEFIT_TONES[i],
  }));

  return (
    <Section id="benefits" divided className="py-24 sm:py-28">
      <SectionHeader
        eyebrow={t('benefits.badge')}
        eyebrowIcon={Target}
        title={t('benefits.title')}
        highlight={t('benefits.titleHighlight')}
        lede={t('benefits.description')}
      />

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map((benefit: (BenefitItem & { icon: typeof Clock; tone: (typeof BENEFIT_TONES)[number] }), i) => (
          <StaggerItem key={i}>
            <GlassCard className="group relative h-full p-6 flex flex-col items-start transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-primary/40 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
              <IconChip icon={benefit.icon} tone={benefit.tone} shape="pill" />
              <h3 className="mt-4 text-base font-semibold tracking-tight theme-text-primary transition-colors group-hover:text-accent-gradient">
                {benefit.title}
              </h3>
              <p className="mt-1.5 text-sm theme-text-muted leading-relaxed">{benefit.desc}</p>

              <span className="absolute bottom-0 left-6 right-6 h-[2px] bg-accent-gradient scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-full" />
            </GlassCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
};

export default Benefits;
