import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Database, Lock, TrendingUp, Users, Sparkles, CheckCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';

const Features = () => {
  const { theme } = useTheme();
  const { t } = useLocale();

  const features = [
    {
      icon: Shield,
      title: t('features.secureVerification.title'),
      description: t('features.secureVerification.description'),
      color: "from-blue-500 to-blue-600",
      darkColor: "from-blue-500 to-blue-600",
      lightColor: "from-blue-400 to-blue-500",
      features: JSON.parse(t('features.secureVerification.features')) as string[]
    },
    {
      icon: Zap,
      title: t('features.realTimeTracking.title'),
      description: t('features.realTimeTracking.description'),
      color: "from-amber-500 to-amber-600",
      darkColor: "from-amber-500 to-amber-600",
      lightColor: "from-amber-400 to-amber-500",
      features: JSON.parse(t('features.realTimeTracking.features')) as string[]
    },
    {
      icon: Database,
      title: t('features.unifiedDatabase.title'),
      description: t('features.unifiedDatabase.description'),
      color: "from-indigo-500 to-indigo-600",
      darkColor: "from-indigo-500 to-indigo-600",
      lightColor: "from-indigo-400 to-indigo-500",
      features: JSON.parse(t('features.unifiedDatabase.features')) as string[]
    },
    {
      icon: Lock,
      title: t('features.privacyProtection.title'),
      description: t('features.privacyProtection.description'),
      color: "from-purple-500 to-purple-600",
      darkColor: "from-purple-500 to-purple-600",
      lightColor: "from-purple-400 to-purple-500",
      features: JSON.parse(t('features.privacyProtection.features')) as string[]
    },
    {
      icon: TrendingUp,
      title: t('features.analyticsDashboard.title'),
      description: t('features.analyticsDashboard.description'),
      color: "from-green-500 to-green-600",
      darkColor: "from-green-500 to-green-600",
      lightColor: "from-green-400 to-green-500",
      features: JSON.parse(t('features.analyticsDashboard.features')) as string[]
    },
    {
      icon: Users,
      title: t('features.multiStakeholder.title'),
      description: t('features.multiStakeholder.description'),
      color: "from-pink-500 to-pink-600",
      darkColor: "from-pink-500 to-pink-600",
      lightColor: "from-pink-400 to-pink-500",
      features: JSON.parse(t('features.multiStakeholder.features')) as string[]
    }
  ];

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
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Soft glowing background accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 blur-[120px] rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--accent-primary, rgba(59,130,246,0.18)), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 blur-[120px] rounded-full animate-pulse delay-300" style={{ background: 'linear-gradient(135deg, var(--accent-secondary, rgba(245,158,11,0.14)), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <motion.span
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-5 shadow-sm backdrop-blur-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 250 }}
          >
            <Sparkles className="inline w-4 h-4 mr-2 text-accent-gradient" />
            {t('features.title')}
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 theme-text-primary tracking-tight">
            {t('features.subtitle')}
          </h2>
          <p className="text-lg md:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
            {t('features.description')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              className="group relative"
            >
              <div className="relative h-full theme-bg-card theme-border-card backdrop-blur-2xl rounded-2xl p-8 transition-all duration-300 hover:theme-border-glass shadow-[0_4px_20px_-6px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.25)]">

                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${theme === 'dark' ? feature.darkColor : feature.lightColor
                    } rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  {React.createElement(feature.icon as any, { className: 'w-8 h-8 text-white' })}
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-semibold mb-4 theme-text-primary group-hover:text-accent-gradient transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="theme-text-secondary mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bulleted Feature Points */}
                <div className="space-y-2">
                  {feature.features.map((item, j) => (
                    <motion.div
                      key={j}
                      className="flex items-center space-x-2 text-sm theme-text-primary"
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: j * 0.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hover glow accent */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark' ? feature.darkColor : feature.lightColor
                  } rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-25 transition-opacity`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;