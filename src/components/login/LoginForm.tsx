import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, UserCheck } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isRegister: boolean;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
  className?: string;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isRegister,
  error,
  isLoading,
  onSubmit,
  t,
  className = ''
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`} noValidate>
      <div>
        <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
          {t('extracted.email_address')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/60 focus:border-accent-primary transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
          {t('extracted.password')}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/60 focus:border-accent-primary transition-all"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md theme-text-muted hover:theme-text-primary transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 mt-1 rounded-xl accent-gradient text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
        whileTap={!isLoading ? { scale: 0.99 } : {}}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        ) : (
          <>
            {isRegister ? (
              <>
                <UserCheck className="w-5 h-5" />
                {t('login.create_account_action')}
              </>
            ) : (
              <>
                {t('login.sign_in_action')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-300 text-sm"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="break-words">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
