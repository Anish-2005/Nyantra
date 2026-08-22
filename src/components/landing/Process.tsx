'use client';

import { Activity, UserCheck, Upload, CheckSquare, CheckCircle, Wallet } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';
import { Section, SectionHeader, Stagger, StaggerItem, GlassCard, IconChip } from './primitives';

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

const STEP_ICONS = [UserCheck, Upload, CheckSquare, CheckCircle, Wallet, Activity];
const STEP_TONES = ['blue', 'indigo', 'purple', 'green', 'amber', 'pink'] as const;

const Process = () => {
  const { t } = useLocale();

  const processSteps = (JSON.parse(t('process.steps')) as ProcessStep[]).map((step, i) => ({
    ...step,
    icon: STEP_ICONS[i],
    tone: STEP_TONES[i],
  }));

  return (
    <Section id="process" divided className="py-16 sm:py-20">
      <SectionHeader
        eyebrow={t('process.badge')}
        eyebrowIcon={Activity}
        title={t('process.title')}
        highlight={t('process.titleHighlight')}
        lede={t('process.description')}
      />

      <div className="relative">
        <div
          className="hidden lg:block absolute top-0 left-0 right-0 h-px opacity-30"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), var(--accent-primary), transparent)',
          }}
        />

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processSteps.map((step, i) => (
            <StaggerItem key={i}>
              <GlassCard className="group relative h-full p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/40 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.25)]">
                <span className="absolute -top-1.5 right-3 text-7xl font-bold leading-none theme-text-muted opacity-[0.07] select-none pointer-events-none">
                  {step.step}
                </span>

                <IconChip icon={step.icon} tone={step.tone} />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-gradient">{step.step}</p>
                <h3 className="mt-1 text-[15px] font-semibold tracking-tight theme-text-primary">{step.title}</h3>
                <p className="mt-1.5 text-sm theme-text-secondary leading-relaxed">{step.description}</p>

                <span className="absolute bottom-0 left-5 right-5 h-px bg-accent-gradient scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-full" />
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
};

export default Process;
