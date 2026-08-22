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
  hidden: { opacity: 0, y: 24 },
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
    { label: t('extracted.verified'), value: '100%', icon: BadgeCheck, tone: 'bg-emerald-500/10 text-emerald-500', dot: 'bg-emerald-400' },
    { label: t('extracted.processing'), value: '2 hrs', icon: Clock, tone: 'bg-blue-500/10 text-blue-500', dot: 'bg-blue-400' },
    { label: t('extracted.amount'), value: '₹40K', icon: Wallet, tone: 'bg-amber-500/10 text-amber-500', dot: 'bg-amber-400' },
    { label: t('extracted.status'), value: t('extracted.active'), icon: Activity, tone: 'bg-purple-500/10 text-purple-500', dot: 'bg-purple-400' },
  ];

  const activities = [
    { text: t('extracted.application_submitted'), time: t('extracted.two_mins_ago'), icon: CheckCircle, tone: 'bg-emerald-500/10 text-emerald-500' },
    { text: t('extracted.document_verified'), time: t('extracted.one_hour_ago'), icon: CheckCircle, tone: 'bg-emerald-500/10 text-emerald-500' },
    { text: t('extracted.approval_pending'), time: t('extracted.three_hours_ago'), icon: Clock, tone: 'bg-amber-500/10 text-amber-500' },
  ];

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold theme-bg-glass theme-border-glass border theme-text-secondary">
                <Rocket className="w-4 h-4 text-accent-gradient" />
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
              className="mt-6 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight theme-text-primary leading-[1.08]"
            >
              {t('hero.titleLine1')}{' '}
              <span className="text-accent-gradient">{t('hero.titleLine2').split('\n')[0]}</span>
              <br className="hidden md:block" />
              <span className="block mt-1 md:mt-0">{t('hero.titleLine2').split('\n')[1] || ''}</span>
            </motion.h1>

            <motion.p
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
              className="mt-6 text-lg sm:text-xl theme-text-secondary leading-relaxed max-w-xl"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.7, ease: EASE, delay: 0.24 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => navigateByRole()}
                disabled={isNavigating}
                aria-label={t('extracted.apply_now_continue')}
                className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 accent-gradient rounded-xl font-semibold text-base text-white shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${isNavigating ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isNavigating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>{t('hero.applyNow')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 theme-bg-glass theme-border-glass border rounded-xl font-semibold text-base theme-text-primary transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                <span>{t('hero.watchDemo')}</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
            </motion.div>

            <motion.div
              initial={rise.hidden}
              animate={rise.visible}
              transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
              className="mt-10 flex items-center gap-5"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full accent-gradient ring-2 ring-[var(--card-bg,#fff)] flex items-center justify-center text-[11px] font-bold text-white shadow-md transition-transform hover:-translate-y-1"
                  >
                    {i}K+
                  </div>
                ))}
              </div>
              <div className="border-l theme-border-glass pl-5">
                <p className="text-xs theme-text-muted font-medium uppercase tracking-wide">{t('extracted.trusted_by')}</p>
                <p className="text-base sm:text-lg font-bold text-accent-gradient leading-snug">{t('extracted.45000_beneficiaries')}</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            className="relative mt-4 lg:mt-0"
          >
            <div className="relative theme-bg-card backdrop-blur-2xl rounded-3xl p-5 sm:p-7 theme-border-card border shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden theme-border-glass border bg-transparent">
                    <Image src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} alt={t('extracted.nyantara_logo')} width={44} height={44} className="object-contain" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary text-sm sm:text-base leading-tight">{t('extracted.application_status')}</p>
                    <p className="text-xs theme-text-muted">{t('extracted.realtime_tracking')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full px-2.5 py-1 theme-bg-glass border theme-border-glass">
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-medium text-emerald-500">Live</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {statusTiles.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.55 + i * 0.08 }}
                    className="relative theme-bg-glass theme-border-glass border rounded-xl p-4 transition-colors hover:border-accent-primary/40"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.tone}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <p className="mt-3 text-xl font-bold tracking-tight theme-text-primary">{item.value}</p>
                    <p className="text-xs theme-text-muted mt-0.5">{item.label}</p>
                    <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.9 }}
                className="mt-4 rounded-xl theme-bg-glass theme-border-glass border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide theme-text-secondary">{t('extracted.recent_activities')}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] theme-text-muted">Live updates</span>
                  </div>
                </div>
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-lg theme-bg-card theme-border-card border px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center ${activity.tone}`}>
                        <activity.icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate text-xs sm:text-sm font-medium theme-text-primary">{activity.text}</span>
                    </div>
                    <span className="shrink-0 text-[11px] theme-text-muted">{activity.time}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-3 sm:-right-5 w-11 h-11 accent-gradient rounded-xl flex items-center justify-center shadow-lg"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Shield className="w-5 h-5 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-3 sm:-left-5 w-11 h-11 accent-gradient rounded-xl flex items-center justify-center shadow-lg"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>

              <motion.div
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-[var(--page-bg,#fff)]"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-[11px] font-bold">3</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:block"
        onClick={() => {
          const featuresSection = document.getElementById('features');
          if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll to features"
      >
        <span className="flex flex-col items-center gap-1.5">
          <span className="w-6 h-10 rounded-full border-2 theme-border-glass flex justify-center pt-2 hover:border-accent-primary transition-colors">
            <span className="w-1 h-2 rounded-full accent-gradient" />
          </span>
        </span>
      </motion.button>
    </section>
  );
};

export default Hero;
