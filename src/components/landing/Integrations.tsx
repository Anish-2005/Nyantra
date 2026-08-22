'use client';

import Image from 'next/image';
import { Database, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';
import { Section, SectionHeader, Stagger, StaggerItem, GlassCard, Reveal } from './primitives';

interface Integration {
  name: string;
  desc: string;
  logo: string;
  link: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'PFMS',
    desc: 'भुगतान और DBT',
    logo: 'https://www.gconnect.in/gc22/wp-content/uploads/2023/03/PFMS.png',
    link: 'https://pfms.nic.in/',
  },
  {
    name: 'Aadhaar',
    desc: 'पहचान सत्यापन',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Aadhaar_Logo.jpg',
    link: 'https://uidai.gov.in/',
  },
  {
    name: 'CCTNS',
    desc: 'पुलिस रिकॉर्ड',
    logo: 'https://static.mygov.in/static/s3fs-public/mygov_144074499810881641.jpg',
    link: 'https://ncrb.gov.in/',
  },
  {
    name: 'eCourts',
    desc: 'मामला प्राप्ति',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2E9X9SHoKmNE6d4ud4Efc7iX2o4m7V73DsQ&s',
    link: 'https://ecourts.gov.in/',
  },
  {
    name: 'DigiLocker',
    desc: 'दस्तावेज़ भंडारण',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXdc7MqagTAT_T2SEYZpsFVBOqsXEm7YGXng&s',
    link: 'https://digilocker.gov.in/',
  },
  {
    name: 'SMS Gateways',
    desc: 'सूचनाएं',
    logo: 'https://png.pngtree.com/png-vector/20231115/ourmid/pngtree-sms-icon-sign-png-image_10603188.png',
    link: '#',
  },
];

const Integrations: React.FC = () => {
  const { t } = useLocale();

  return (
    <Section id="integrations" divided className="py-16 sm:py-20">
      <SectionHeader
        eyebrow={t('integrations.badge')}
        eyebrowIcon={Database}
        title={t('integrations.title')}
        lede={t('integrations.description')}
      />

      <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {INTEGRATIONS.map((integration) => (
          <StaggerItem key={integration.name.toLowerCase().replace(/\s+/g, '')}>
            <GlassCard className="group relative h-full min-h-[168px] p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/40 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.25)]">
              <div className="w-12 h-12 rounded-lg bg-white border theme-border-glass p-1.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Image src={integration.logo} alt={`${integration.name} logo`} width={44} height={44} className="object-contain max-w-full max-h-full" />
              </div>

              <p className="mt-2.5 font-semibold text-xs theme-text-primary leading-tight">{integration.name}</p>
              <p className="mt-0.5 text-[11px] theme-text-muted line-clamp-2">{integration.desc}</p>

              <a
                href={integration.link}
                aria-label={`Learn more about ${integration.name}`}
                className="mt-auto pt-2.5 inline-flex items-center gap-1 text-[10px] font-medium theme-text-secondary hover:text-accent-gradient transition-colors"
              >
                {t('integrations.learnMore')}
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </GlassCard>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-10 text-center" amount={0.4}>
        <p className="text-sm theme-text-secondary">{t('integrations.ctaDescription')}</p>
        <a
          href="#"
          aria-label={t('integrations.ctaButton')}
          className="group mt-4 inline-flex items-center gap-2 px-5 py-2.5 accent-gradient rounded-lg text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-px active:translate-y-0"
        >
          {t('integrations.ctaButton')}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </Section>
  );
};

export default Integrations;
