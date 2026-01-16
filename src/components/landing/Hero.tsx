import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, ChevronRight, BadgeCheck, Clock, Wallet, Activity, CheckCircle, Shield, Zap } from 'lucide-react';

const Hero = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLocale();

  // Navigation helper: navigate according to authenticated user's role
  const navigateByRole = async () => {
    // wait briefly for auth loading to settle (max ~3s)
    const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const start = Date.now();
    while (loading && Date.now() - start < 3000) {
      // poll every 100ms while auth initializes
      // eslint-disable-next-line no-await-in-loop
      await waitFor(100);
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const role = profile?.role;
    if (role === 'officer') return router.push('/dashboard');
    if (role === 'user') return router.push('/user-dashboard');

    // logged in but no role selected yet
    return router.push('/choose-role');
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
    <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left space-y-6 sm:space-y-10"
          >
            <motion.div variants={itemVariants}>
              <motion.span
                className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-4 sm:mb-6 shadow-lg backdrop-blur-lg"
                animate={{
                  boxShadow: theme === 'dark'
                    ? ['0 0 0 0 rgba(20, 184, 166, 0.4)', '0 0 0 12px rgba(20, 184, 166, 0)', '0 0 0 0 rgba(20, 184, 166, 0)']
                    : ['0 0 0 0 rgba(244, 63, 94, 0.4)', '0 0 0 12px rgba(244, 63, 94, 0)', '0 0 0 0 rgba(244, 63, 94, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Rocket className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-accent-gradient" />
                {t('hero.badge')}
              </motion.span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-7xl font-bold theme-text-primary overflow-visible leading-tight"
              style={{ lineHeight: '1.1' }}
            >
              {t('hero.titleLine1')}{' '}
              <span className="py-1 sm:py-2 text-accent-gradient block md:inline">
                {t('hero.titleLine2').split('\n')[0]}
              </span>
              <br className="hidden md:block" />
              <span className="block mt-1 sm:mt-2 md:mt-0">
                {t('hero.titleLine2').split('\n')[1] || ''}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl theme-text-secondary leading-relaxed max-w-2xl"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
            >
              <motion.button
                onClick={() => navigateByRole()}
                aria-label={t('extracted.apply_now_continue')}
                className="px-6 sm:px-10 py-4 sm:py-5 accent-gradient rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white flex items-center justify-center space-x-2 sm:space-x-3 shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{t('hero.applyNow')}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              <motion.button
                className="px-6 sm:px-10 py-4 sm:py-5 theme-bg-glass theme-border-glass border-2 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 sm:space-x-3 theme-text-primary hover:shadow-2xl transition-all group"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{t('hero.watchDemo')}</span>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-6 sm:pt-8"
            >
              <div className="flex -space-x-3 sm:-space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full accent-gradient border-2 sm:border-4 theme-bg-card flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-xl"
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {i}K+
                  </motion.div>
                ))}
              </div>
              <div>
                <p className="text-xs sm:text-sm theme-text-muted font-medium">{t('extracted.trusted_by')} </p>
                <p className="text-lg sm:text-2xl font-bold text-accent-gradient">{t('extracted.45000_beneficiaries')} </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative theme-bg-card backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 theme-border-card shadow-3xl border-2">
              {/* Dashboard Header */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-transparent theme-border-glass border-2">
                      <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantara_logo')} width={40} height={40} className="object-contain" />
                    </div>
                    <div>
                      <p className="font-bold theme-text-primary text-base sm:text-lg">{t('extracted.application_status')} </p>
                      <p className="text-xs sm:text-sm theme-text-muted">{t('extracted.realtime_tracking')} </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium text-green-400">Live</span>
                  </div>
                </div>

                {/* Status Cards Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: t('extracted.verified'), value: '100%', icon: BadgeCheck, color: 'from-green-500 to-emerald-500', status: 'success' },
                    { label: t('extracted.processing'), value: '2 hrs', icon: Clock, color: 'from-blue-500 to-cyan-500', status: 'active' },
                    { label: t('extracted.amount'), value: '₹40K', icon: Wallet, color: 'from-amber-500 to-orange-500', status: 'pending' },
                    { label: t('extracted.status'), value: t('extracted.active'), icon: Activity, color: 'from-purple-500 to-pink-500', status: 'active' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className={`bg-gradient-to-br ${item.color} p-3 sm:p-5 rounded-xl sm:rounded-2xl text-white shadow-xl relative overflow-hidden group`}
                      whileHover={{ scale: 1.05, y: -3 }}
                      animate={{
                        boxShadow: theme === 'dark'
                          ? ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                          : ['0 0 20px rgba(30, 64, 175, 0.2)', '0 0 30px rgba(30, 64, 175, 0.3)', '0 0 20px rgba(30, 64, 175, 0.2)']
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <item.icon className="w-5 h-5 sm:w-7 sm:h-7 mb-2 sm:mb-3 text-white drop-shadow-lg" />
                      <p className="text-xl sm:text-3xl font-bold text-white mb-1">{item.value}</p>
                      <p className="text-xs sm:text-sm text-white/90">{item.label}</p>
                      <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        item.status === 'success' ? 'bg-green-300' :
                        item.status === 'active' ? 'bg-blue-300' : 'bg-amber-300'
                      }`} />
                    </motion.div>
                  ))}
                </div>

                {/* Activity Feed */}
                <div className="theme-bg-glass rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 theme-border-glass border">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-semibold theme-text-secondary">{t('extracted.recent_activities')} </p>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs theme-text-muted">Live updates</span>
                    </div>
                  </div>
                  {[
                    { text: t('extracted.application_submitted'), time: t('extracted.two_mins_ago'), status: 'success', icon: CheckCircle },
                    { text: t('extracted.document_verified'), time: t('extracted.one_hour_ago'), status: 'success', icon: CheckCircle },
                    { text: t('extracted.approval_pending'), time: t('extracted.three_hours_ago'), status: 'pending', icon: Clock }
                  ].map((activity, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between text-xs sm:text-sm p-2 sm:p-3 rounded-lg sm:rounded-xl theme-bg-card theme-border-card border"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                          activity.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          <activity.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <span className="theme-text-primary font-medium text-xs sm:text-sm">{activity.text}</span>
                      </div>
                      <span className="theme-text-muted text-xs">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Icons */}
              <motion.div
                className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 accent-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 accent-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* Notification Badge */}
              <motion.div
                className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-xs font-bold">3</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 theme-border-glass rounded-full flex justify-center pt-1.5 sm:pt-2">
          <motion.div
            className="w-0.5 h-1.5 sm:w-1 sm:h-2 rounded-full accent-gradient"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;