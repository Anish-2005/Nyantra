import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ChooseRoleUserCardProps {
  onClick: () => void;
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleUserCard = ({ onClick, t, className = '' }: ChooseRoleUserCardProps) => {
  const { theme } = useTheme();

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
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl theme-bg-glass theme-border-glass border cursor-pointer transition-all hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'light' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'theme-bg-card'}`}>
          <User className={`w-6 h-6 ${theme === 'light' ? 'text-white' : 'text-accent-gradient'}`} />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold theme-text-primary">{t('extracted.iaposm_a_user')} </h3>
          <p className="text-sm theme-text-muted mt-1">
            {t('extracted.access_benefits_and_services_as_a_beneficiary')}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 theme-text-muted" />
      </div>
    </motion.div>
  );
};