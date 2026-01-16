import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

interface ChooseRoleHeaderProps {
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleHeader = ({ t, className = '' }: ChooseRoleHeaderProps) => {
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
          {t('extracted.choose_your_role')}
        </motion.h2>
        <motion.p
          className="text-sm theme-text-muted"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t('extracted.select_how_youaposll_use_the_platform')}
        </motion.p>
      </div>
    </div>
  );
};