"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Shield, Globe, Smartphone, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';

const Benefits: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLocale();

  const benefitIcons = [Clock, Target, Shield, Globe, Smartphone, Eye];
  const benefitColors = [
    { dark: "text-blue-500", light: "text-blue-600" },
    { dark: "text-amber-500", light: "text-amber-600" },
    { dark: "text-green-500", light: "text-green-600" },
    { dark: "text-indigo-500", light: "text-indigo-600" },
    { dark: "text-purple-500", light: "text-purple-600" },
    { dark: "text-pink-500", light: "text-pink-600" }
  ];

  const benefits = JSON.parse(t('benefits.items')).map((item: any, i: number) => ({
    ...item,
    icon: benefitIcons[i],
    darkColor: benefitColors[i].dark,
    lightColor: benefitColors[i].light
  }));

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
    <section
      id="benefits"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-500"
    >
      {/* Background Layer */}
      <div
        className={`
      absolute inset-0 transition-colors duration-700
      ${theme === 'dark'
            ? 'bg-gradient-to-b from-[#0A0F28] via-[#0A1432]/80 to-black'
            : 'bg-gradient-to-b from-[#F9FBFF] via-[#F4F7FA] to-white'}
    `}
      />

      {/* Ambient Glow */}
      <div
        className={`
      absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] blur-3xl pointer-events-none
      ${theme === 'dark'
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.15),transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_at_center,rgba(255,200,100,0.15),transparent_70%)]'}
    `}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <motion.span
            className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4 backdrop-blur-md shadow-sm"
            whileHover={{ scale: 1.08 }}
          >
            <Target className="inline w-4 h-4 mr-2 text-accent-gradient" />
            {t('benefits.badge')}
          </motion.span>

          <h2 className="mt-4 text-4xl md:text-5xl font-bold mb-4 tracking-tight theme-text-primary overflow-visible px-4">
            {t('benefits.title')} <span className="py-4 text-accent-gradient whitespace-nowrap">{t('benefits.titleHighlight')}</span>
          </h2>

          <p className="text-lg md:text-xl theme-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t('benefits.description')}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {benefits.map((benefit: any, i: number) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{
                y: -8,
                rotate: 1,
                transition: { type: 'spring', stiffness: 200 },
              }}
              className="group relative"
            >
              {/* Benefit Card */}
              <div
                className={`
    rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center h-full
    backdrop-blur-xl border transition-all duration-300 shadow-sm hover:shadow-xl active:scale-[0.98]
    ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:border-accent-secondary/40 hover:bg-white/10'
                    : 'bg-white/60 border-gray-200 hover:border-amber-300/60 hover:bg-white/90'}
  `}
              >
                {/* Icon */}
                <div
                  className={`
      relative w-16 h-16 mb-5 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110
      ${theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-300'
                      : 'bg-gradient-to-br from-amber-400 to-orange-500'}
    `}
                >
                  <benefit.icon
                    className="w-8 h-8 text-white drop-shadow-md"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold theme-text-primary group-hover:text-accent-gradient transition-colors duration-300">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-sm theme-text-muted mt-2 leading-snug max-w-[85%] mx-auto">
                  {benefit.desc}
                </p>

                {/* Accent underline */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent-gradient group-hover:w-1/2 transition-all duration-500 rounded-full"></span>
              </div>

            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;