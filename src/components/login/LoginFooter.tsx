import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';

interface LoginFooterProps {
  isRegister: boolean;
  onToggleMode: () => void;
  isLoading: boolean;
  t: (key: string) => string;
  className?: string;
}

export const LoginFooter = ({ isRegister, onToggleMode, isLoading, t, className = '' }: LoginFooterProps) => {
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
          {t('extracted.isregister_have_an_account_sign_in_dont_have_an_account_sign')}
          <ArrowRight className="w-4 h-4" />
        </button>
        {!isRegister && (
          <a href="#" className="theme-text-muted hover:text-accent-gradient transition-colors">
            {t('extracted.forgot_password')}
          </a>
        )}
      </motion.div>

      <motion.p
        className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
      >
        <Shield className="w-3 h-3" />
        {t('extracted.your_data_is_securely_encrypted_and_protected')}
      </motion.p>
    </div>
  );
};