import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ChooseRoleStatusBadgeProps {
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleStatusBadge = ({ t, className = '' }: ChooseRoleStatusBadgeProps) => {
  const { theme } = useTheme();

  return (
    <motion.div
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-6 ${className}`}
      animate={{
        boxShadow: theme === 'dark'
          ? ['0 0 0 0 rgba(59, 130, 246, 0.4)', '0 0 0 8px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
          : ['0 0 0 0 rgba(30, 64, 175, 0.4)', '0 0 0 8px rgba(30, 64, 175, 0)', '0 0 0 0 rgba(30, 64, 175, 0)']
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Rocket className="inline w-3 h-3 mr-2 text-accent-gradient" />
      {t('extracted.smart_dbt_platform')}
    </motion.div>
  );
};