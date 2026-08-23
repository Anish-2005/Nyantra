import { ShieldCheck } from 'lucide-react';

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
      <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
        <span className="theme-text-muted">{isRegister ? t('login.toggle_to_sign_in') : t('login.toggle_to_register')}</span>
        <button
          onClick={onToggleMode}
          className="font-semibold text-accent-gradient hover:opacity-80 transition-opacity"
          disabled={isLoading}
        >
          {isRegister ? t('login.sign_in_tab') : t('login.register_tab')}
        </button>
      </div>

      {!isRegister && (
        <p className="mt-2 text-center">
          <a href="#" className="text-xs theme-text-muted hover:text-accent-gradient transition-colors">
            {t('extracted.forgot_password')}
          </a>
        </p>
      )}

      <p className="mt-6 pt-5 border-t theme-border-glass text-xs theme-text-muted text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        {t('extracted.your_data_is_securely_encrypted_and_protected')}
      </p>
    </div>
  );
};
