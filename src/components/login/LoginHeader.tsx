import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

interface LoginHeaderProps {
  isRegister: boolean;
  t: (key: string) => string;
  className?: string;
}

export const LoginHeader = ({ isRegister, t, className = '' }: LoginHeaderProps) => {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <motion.div
        className="w-12 h-12 rounded-xl overflow-hidden bg-transparent"
        whileHover={{ scale: 1.05, rotate: 5 }}
      >
        <Image
          src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'}
          alt={t('extracted.nyantra')}
          width={48}
          height={48}
          className="object-contain"
        />
      </motion.div>
      <div>
        <motion.h2
          className="text-xl font-bold theme-text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isRegister ? t('extracted.create_account') : t('extracted.welcome_back')}
        </motion.h2>
        <motion.p
          className="text-sm theme-text-muted"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isRegister ? 'Sign up to access the dashboard' : 'Sign in to continue to your dashboard'}
        </motion.p>
      </div>
    </div>
  );
};