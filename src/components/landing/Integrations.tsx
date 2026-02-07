"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Database, ChevronRight, ArrowRight } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';

const Integrations: React.FC = () => {
  const { t } = useLocale();

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <section id="integrations" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-visible">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/6 w-64 h-64 blur-[80px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent-primary, rgba(59,130,246,0.12)), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/6 w-64 h-64 blur-[80px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent-secondary, rgba(245,158,11,0.08)), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12 overflow-visible">
          <motion.span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-5" whileHover={{ scale: 1.05 }}>
            <Database className="inline w-4 h-4 mr-2 text-accent-gradient" />
            {t('integrations.badge')}
          </motion.span>

          <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary overflow-visible py-4" style={{ lineHeight: '1.4' }}>
            {t('integrations.title')}
          </h2>
          <p className="mt-2 text-sm sm:text-base theme-text-muted max-w-2xl mx-auto overflow-visible py-2">
            {t('integrations.description')}
          </p>
        </motion.div>

        {/* Integrations Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {[
            {
              name: 'PFMS',
              desc: 'भुगतान और DBT',
              logo: 'https://www.gconnect.in/gc22/wp-content/uploads/2023/03/PFMS.png', // Placeholder, replace with actual URL
              accent: 'from-amber-400 to-amber-500',
              link: 'https://pfms.nic.in/' // Add your custom link here
            },
            {
              name: 'Aadhaar',
              desc: 'पहचान सत्यापन',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Aadhaar_Logo.jpg',
              accent: 'from-blue-400 to-indigo-500',
              link: 'https://uidai.gov.in/' // Add your custom link here
            },
            {
              name: 'CCTNS',
              desc: 'पुलिस रिकॉर्ड',
              logo: 'https://static.mygov.in/static/s3fs-public/mygov_144074499810881641.jpg', // Placeholder
              accent: 'from-indigo-400 to-purple-500',
              link: 'https://ncrb.gov.in/' // Add your custom link here
            },
            {
              name: 'eCourts',
              desc: 'मामला प्राप्ति',
              logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2E9X9SHoKmNE6d4ud4Efc7iX2o4m7V73DsQ&s',
              accent: 'from-green-400 to-teal-500',
              link: 'https://ecourts.gov.in/' // Add your custom link here
            },
            {
              name: 'DigiLocker',
              desc: 'दस्तावेज़ भंडारण',
              logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXdc7MqagTAT_T2SEYZpsFVBOqsXEm7YGXng&s',
              accent: 'from-pink-400 to-rose-500',
              link: 'https://digilocker.gov.in/' // Add your custom link here
            },
            {
              name: 'SMS Gateways',
              desc: 'सूचनाएं',
              logo: 'https://png.pngtree.com/png-vector/20231115/ourmid/pngtree-sms-icon-sign-png-image_10603188.png', // Placeholder for SMS Gateways
              accent: 'from-yellow-400 to-amber-500',
              link: '#' // Add your custom link here
            }
          ].map((integration, idx) => (
            <motion.div
              key={integration.name.toLowerCase().replace(/\s+/g, '')}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="flex items-center justify-center p-2 w-full"
            >
              <div className="w-full h-full min-h-[220px] theme-bg-card theme-border-card border rounded-2xl p-6 flex flex-col items-center text-center justify-between hover:shadow-xl hover:border-accent-primary/30 transition-all duration-300 group">
                <div className="flex flex-col items-center space-y-4 w-full flex-grow">
                  <div className="w-20 h-20 relative p-3 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border theme-border-glass flex items-center justify-center">
                    <Image src={integration.logo} alt={`${integration.name} logo`} width={64} height={64} className="object-contain max-w-full max-h-full" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-lg theme-text-primary mb-1">{integration.name}</p>
                    <p className="text-sm theme-text-muted line-clamp-2">{integration.desc}</p>
                  </div>
                </div>
                <a href={integration.link} aria-label={`Learn more about ${integration.name}`} className="inline-flex items-center text-sm font-medium theme-text-secondary hover:text-accent-gradient transition-colors">
                  {t('integrations.learnMore')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center overflow-visible">
          <p className="theme-text-secondary mb-4 overflow-visible py-2">
            {t('integrations.ctaDescription')}
          </p>
          <motion.a href="#" className="inline-flex items-center px-6 py-3 accent-gradient rounded-xl font-semibold text-white shadow-lg" whileHover={{ scale: 1.05 }} aria-label={t('integrations.ctaButton')}>
            {t('integrations.ctaButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;