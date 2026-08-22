import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';
import {
  Rocket,
  ArrowRight,
  ChevronDown,
  BadgeCheck,
  Clock,
  Wallet,
  Activity,
  CheckCircle,
  Shield,
  Zap,
} from 'lucide-react';
import { EASE } from './primitives';

const rise = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const Hero = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLocale();

  const loadingRef = React.useRef(loading);
  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const [isNavigating, setIsNavigating] = React.useState(false);

  const navigateByRole = async () => {
    setIsNavigating(true);

    const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const start = Date.now();

    while (loadingRef.current && Date.now() - start < 3000) {
      await waitFor(100);
    }

    if (!user) {
      router.push('/login');
      setIsNavigating(false);
      return;
    }

    const role = profile?.role;
    if (role === 'officer') router.push('/dashboard');
    else if (role === 'user') router.push('/user-dashboard');
    else router.push('/choose-role');
  };

  const statusTiles = [
    { label: t('extracted.verified'), value: '100%', icon: BadgeCheck, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
    { label: t('extracted.processing'), value: '2 hrs', icon: Clock, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-400' },
    { label: t('extracted.amount'), value: '₹40K', icon: Wallet, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-400' },
    { label: t('extracted.status'), value: t('extracted.active'), icon: Activity, tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', dot: 'bg-purple-400' },
  ];

  const activities = [
    { text: t('extracted.application_submitted'), time: t('extracted.two_mins_ago'), icon: CheckCircle, tone: 'bg-emerald-500/10 text-emerald-500' },
    { text: t('extracted.document_verified'), time: t('extracted.one_hour_ago'), icon: CheckCircle, tone: 'bg-emerald-500/10 text-emerald-500' },
    { text: t('extracted.approval_pending'), time: t('extracted.three_hours_ago'), icon: Clock, tone: 'bg-amber-500/10 text-amber-500' },
  ];

  return (
    <section className="relative pt-28 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold theme-bg-glass theme-border-glass border theme-text-secondary">
                <Rocket className="w-3.5 h-3.5 text-accent-gradient" />
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.6, ease: EASE, delay: 0.06 }}
              className="mt-5 text-3xl sm:text-4xl md:text-5xl xl:text-[3.4rem] font-bold tracking-tight theme-text-primary leading-[1.1]"
            >
              {t('hero.titleLine1')}{' '}
              <span className="text-accent-gradient">{t('hero.titleLine2').split('\n')[0]}</span>
              <br className="hidden md:block" />
              <span className="block mt-1 md:mt-0">{t('hero.titleLine2').split('\n')[1] || ''}</span>
            </motion.h1>

            <motion.p
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
              className="mt-4 text-base sm:text-lg theme-text-secondary leading-relaxed max-w-xl"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
              className="mt-7 flex flex-col sm:flex-row gap-2.5"
            >
              <button
                onClick={() => navigateByRole()}
                disabled={isNavigating}
                aria-label={t('extracted.apply_now_continue')}
                className={`group inline-flex items-center justify-center gap-2 px-5 py-2.5 accent-gradient rounded-lg font-semibold text-sm text-white shadow-md shadow-black/10 transition-all hover:shadow-lg hover:-translate-y-px active:translate-y-0 ${isNavigating ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isNavigating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>{t('hero.applyNow')}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 theme-bg-glass theme-border-glass border rounded-lg font-semibold text-sm theme-text-primary transition-all hover:shadow-md hover:-translate-y-px active:translate-y-0">
                <span>{t('hero.watchDemo')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </motion.div>

            <motion.div
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full accent-gradient ring-2 ring-[var(--card-bg,#fff)] flex items-center justify-center text-[9px] font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    {i}K+
                  </div>
                ))}
              </div>
              <div className="border-l theme-border-glass pl-4">
                <p className="text-[10px] theme-text-muted font-medium uppercase tracking-wide">{t('extracted.trusted_by')}</p>
                <p className="text-sm font-bold text-accent-gradient leading-snug">{t('extracted.45000_beneficiaries')}</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
            className="relative mt-2 lg:mt-0"
          >
            <div className="relative theme-bg-card backdrop-blur-2xl rounded-2xl p-4 sm:p-5 theme-border-card border shadow-[0_20px_60px_-24px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg overflow-hidden theme-border-glass border bg-transparent">
                    <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantara_logo')} width={36} height={36} className="object-contain" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary text-xs sm:text-sm leading-tight">{t('extracted.application_status')}</p>
                    <p className="text-[11px] theme-text-muted">{t('extracted.realtime_tracking')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5 theme-bg-glass border theme-border-glass">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-medium text-emerald-500">Live</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {statusTiles.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.45 + i * 0.07 }}
                    className="relative theme-bg-glass theme-border-glass border rounded-lg p-3 transition-colors hover:border-accent-primary/40"
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${item.tone}`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="mt-2.5 text-base font-bold tracking-tight theme-text-primary leading-none">{item.value}</p>
                    <p className="text-[11px] theme-text-muted mt-1">{item.label}</p>
                    <span className={`absolute top-2.5 right-2.5 w-1 h-1 rounded-full ${item.dot}`} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.75 }}
                className="mt-3 rounded-lg theme-bg-glass theme-border-glass border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-secondary">{t('extracted.recent_activities')}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] theme-text-muted">Live updates</span>
                  </div>
                </div>
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between gap-2.5 rounded-md theme-bg-card theme-border-card border px-2.5 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 shrink-0 rounded flex items-center justify-center ${activity.tone}`}>
                        <activity.icon className="w-3 h-3" />
                      </span>
                      <span className="truncate text-[11px] sm:text-xs font-medium theme-text-primary">{activity.text}</span>
                    </div>
                    <span className="shrink-0 text-[10px] theme-text-muted">{activity.time}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="absolute -top-3 -right-2.5 sm:-right-4 w-9 h-9 accent-gradient rounded-lg flex items-center justify-center shadow-md"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Shield className="w-4 h-4 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-3 -left-2.5 sm:-left-4 w-9 h-9 accent-gradient rounded-lg flex items-center justify-center shadow-md"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.div>

              <motion.div
                className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-[var(--page-bg,#fff)]"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-[9px] font-bold">3</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden md:block"
        onClick={() => {
          const featuresSection = document.getElementById('features');
          if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll to features"
      >
        <span className="w-5 h-8 rounded-full border-2 theme-border-glass flex justify-center pt-1.5 hover:border-accent-primary transition-colors">
          <span className="w-0.5 h-1.5 rounded-full accent-gradient" />
        </span>
      </motion.button>
    </section>
  );
};

export default Hero;
