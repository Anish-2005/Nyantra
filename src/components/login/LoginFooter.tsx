import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';

interface LoginFooterProps {
  isRegister: boolean;
  onToggleMode: () => void;
  isLoading: boolean;
  className?: string;
}

export const LoginFooter = ({ isRegister, onToggleMode, isLoading, className = '' }: LoginFooterProps) => {
  return (
    <div className={className}>
      <motion.div
        className="mt-6 flex items-center justify-between text-sm"
      >
        <button
          onClick={onToggleMode}
          className="text-accent-gradient font-medium flex items-center gap-1 hover:gap-2 transition-all"
          disabled={isLoading}
        >
          {isRegister ? 'Have an account? Sign in' : 'Don\'t have an account? Sign up'}
          <ArrowRight className="w-4 h-4" />
        </button>
        {!isRegister && (
          <a href="#" className="theme-text-muted hover:text-accent-gradient transition-colors">
            Forgot password?
          </a>
        )}
      </motion.div>

      <motion.p
        className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
      >
        <Shield className="w-3 h-3" />
        Your data is securely encrypted and protected
      </motion.p>
    </div>
  );
};