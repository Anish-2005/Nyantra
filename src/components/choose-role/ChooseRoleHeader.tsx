import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

interface ChooseRoleHeaderProps {
  t: (key: string) => string;
  centered?: boolean;
  className?: string;
}

export const ChooseRoleHeader = ({ t, centered = false, className = '' }: ChooseRoleHeaderProps) => {
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col items-center gap-3 mb-2 ${centered ? 'text-center' : ''} ${className}`}>
      <motion.div
        className="w-14 h-14 rounded-2xl theme-bg-glass border theme-border-glass flex items-center justify-center overflow-hidden"
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
      <div>
        <motion.h2
          className="text-xl sm:text-2xl font-bold tracking-tight theme-text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {t('extracted.choose_your_role')}
        </motion.h2>
        <motion.p
          className="text-sm theme-text-muted mt-1 max-w-xs mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          {t('extracted.select_how_youaposll_use_the_platform')}
        </motion.p>
      </div>
    </div>
  );
};
