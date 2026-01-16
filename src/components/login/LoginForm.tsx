import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, UserCheck, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isRegister: boolean;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
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
  onGoogleSignIn,
  className = ''
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      <motion.div variants={itemVariants}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-4 py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-accent-primary transition-all"
          disabled={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 pr-10 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-accent-primary transition-all"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-text-primary transition-colors"
          disabled={isLoading}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </motion.div>

      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl accent-gradient text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        variants={itemVariants}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {isRegister ? (
              <>
                <UserCheck className="w-5 h-5" />
                Create account
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                Sign in
              </>
            )}
          </>
        )}
      </motion.button>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};