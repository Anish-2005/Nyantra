import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { Landmark, LineChart, ShieldCheck } from 'lucide-react';
import { LoginHeader } from './LoginHeader';
import { LoginForm } from './LoginForm';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LoginFooter } from './LoginFooter';

interface LoginCardProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isRegister: boolean;
  setIsRegister: (isRegister: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  t: (key: string) => string;
  className?: string;
}

export const LoginCard = ({
  email,
  setEmail,
  password,
  setPassword,
  isRegister,
  setIsRegister,
  error,
  isLoading,
  onSubmit,
  onGoogleSignIn,
  t,
  className = ''
}: LoginCardProps) => {
  const { theme } = useTheme();

  const features = [
    { icon: ShieldCheck, title: t('login.feature_secure_title'), desc: t('login.feature_secure_desc') },
    { icon: LineChart, title: t('login.feature_track_title'), desc: t('login.feature_track_desc') },
    { icon: Landmark, title: t('login.feature_dbt_title'), desc: t('login.feature_dbt_desc') },
  ];

  const stats = [
    { value: t('login.stat_1_value'), label: t('login.stat_1_label') },
    { value: t('login.stat_2_value'), label: t('login.stat_2_label') },
    { value: t('login.stat_3_value'), label: t('login.stat_3_label') },
  ];

  const tabs = [
    { active: !isRegister, label: t('login.sign_in_tab'), onClick: () => setIsRegister(false) },
    { active: isRegister, label: t('login.register_tab'), onClick: () => setIsRegister(true) },
  ];

  return (
    <div className={`theme-bg-card theme-border-card border rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-[1.05fr_1fr] ${className}`}>
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden accent-gradient">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full bg-white/5 blur-xl" aria-hidden />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <Image
                src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'}
                alt={t('extracted.nyantra')}
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <span className="text-white font-semibold tracking-tight">{t('extracted.nyantra')}</span>
          </div>

          <h2 className="mt-10 text-4xl font-bold leading-tight text-white tracking-tight">
            {t('login.headline_1')}
            <br />
            <span className="text-white/90">{t('login.headline_highlight')}</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80 max-w-sm">
            {t('login.description')}
          </p>
        </motion.div>

        <div className="relative z-10 mt-8 space-y-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              <span className="w-9 h-9 shrink-0 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <f.icon className="w-4.5 h-4.5 text-white" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">{f.title}</span>
                <span className="block text-xs text-white/75 leading-relaxed">{f.desc}</span>
              </span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 mt-8 border-t border-white/25">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-xl font-bold text-white tabular-nums">{s.value}</p>
              <p className="text-[11px] text-white/75 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col justify-center p-6 sm:p-10">
        <div className="absolute inset-0 accent-gradient opacity-[0.04] pointer-events-none" aria-hidden />

        <div className="relative z-10">
          <LoginHeader isRegister={isRegister} t={t} />

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl theme-bg-glass border theme-border-glass mb-6" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={tab.active}
                onClick={tab.onClick}
                disabled={isLoading}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab.active ? 'accent-gradient text-white shadow-md' : 'theme-text-muted hover:theme-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isRegister={isRegister}
            error={error}
            isLoading={isLoading}
            onSubmit={onSubmit}
            t={t}
          />

          <div className="my-5 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 theme-bg-glass" />
            <span className="text-[11px] uppercase tracking-wider theme-text-muted">or</span>
            <span className="h-px flex-1 theme-bg-glass" />
          </div>

          <GoogleSignInButton onClick={onGoogleSignIn} isLoading={isLoading} t={t} />

          <LoginFooter
            isRegister={isRegister}
            onToggleMode={() => setIsRegister(!isRegister)}
            isLoading={isLoading}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};
