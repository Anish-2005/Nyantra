import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronRight, UserCheck, Upload, CheckSquare, CheckCircle, Wallet } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';

const Process = () => {
  const { theme } = useTheme();
  const { t } = useLocale();

  const icons = [UserCheck, Upload, CheckSquare, CheckCircle, Wallet, Activity];
  const colors = [
    { dark: "bg-blue-500", light: "bg-blue-400" },
    { dark: "bg-indigo-500", light: "bg-indigo-400" },
    { dark: "bg-purple-500", light: "bg-purple-400" },
    { dark: "bg-green-500", light: "bg-green-400" },
    { dark: "bg-amber-500", light: "bg-amber-400" },
    { dark: "bg-pink-500", light: "bg-pink-400" }
  ];

  const processSteps = JSON.parse(t('process.steps')).map((step: any, i: number) => ({
    ...step,
    icon: icons[i],
    darkColor: colors[i].dark,
    lightColor: colors[i].light
  }));

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section
      id="process"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Subtle Background Gradient */}
      <div
        className="absolute inset-0 opacity-60 blur-3xl"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15), transparent 60%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.15), transparent 60%)'
              : 'radial-gradient(circle at 20% 20%, rgba(191,219,254,0.4), transparent 60%), radial-gradient(circle at 80% 80%, rgba(233,213,255,0.4), transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <motion.span
            className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary backdrop-blur-md shadow-sm mb-5"
            whileHover={{ scale: 1.05 }}
          >
            <Activity className="inline w-4 h-4 mr-2 text-accent-gradient" />
            {t('process.badge')}
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 theme-text-primary">
            {t('process.title')}{' '}
            <span className="text-accent-gradient">{t('process.titleHighlight')}</span>
          </h2>
          <p className="text-lg md:text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
            {t('process.description')}
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated Gradient Line */}
          <div
            className={`hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] opacity-40`}
            style={{
              background:
                'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary))',
              backgroundSize: '300% 300%',
              animation: 'moveGradient 6s ease-in-out infinite',
            }}
          />

          {/* Step Cards */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
          >
            {processSteps.map((step: any, i: number) => (
              <motion.div key={i} variants={itemVariants} className="relative">
                <motion.div
                  className="theme-bg-card rounded-2xl p-8 theme-border-card backdrop-blur-xl transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Glow overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    }}
                  />

                  {/* Step Header */}
                  <div className="flex items-start space-x-5 mb-6">
                    <motion.div
                      className={`${theme === 'dark' ? step.darkColor : step.lightColor
                        } w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <div>
                      <div className="text-4xl font-bold theme-text-muted mb-1">
                        {step.step}
                      </div>
                      <div className="h-[3px] w-10 bg-accent-gradient rounded-full"></div>
                    </div>
                  </div>

                  {/* Step Title + Desc */}
                  <h3 className="text-xl font-semibold mb-3 theme-text-primary">
                    {step.title}
                  </h3>
                  <p className="theme-text-secondary leading-relaxed text-base">
                    {step.description}
                  </p>
                </motion.div>

                {/* Step Connector */}
                {i < processSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-8 h-8 accent-gradient rounded-full flex items-center justify-center shadow-lg">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Process;