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
    <div className={`mb-8 ${className}`}>
      <motion.div
        className="lg:hidden w-14 h-14 rounded-2xl theme-bg-glass border theme-border-glass flex items-center justify-center overflow-hidden mb-5"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Image
          src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'}
          alt={t('extracted.nyantra')}
          width={56}
          height={56}
          className="object-contain"
        />
      </motion.div>

      <motion.h1
        className="text-2xl font-bold tracking-tight theme-text-primary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {isRegister ? t('login.register_subtitle') : t('login.welcome_back_title')}
      </motion.h1>
      <motion.p
        className="text-sm theme-text-muted mt-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        {isRegister ? t('extracted.smart_dbt_platform') : t('login.sign_in_subtitle')}
      </motion.p>
    </div>
  );
};
