import { motion } from 'framer-motion';
import { FileCheck, Lock, UserCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface VerifyStepsProps {
  t: (key: string) => string;
  className?: string;
}

export const VerifySteps = ({ t, className = '' }: VerifyStepsProps) => {
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
    <motion.div variants={itemVariants} className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
        <FileCheck className={`w-5 h-5 ${theme === 'light' ? 'text-blue-600' : 'text-accent-gradient'}`} />
        <div className="text-left">
          <p className="text-sm font-medium theme-text-primary">{t('extracted.document_verification')} </p>
          <p className="text-xs theme-text-muted">{t('extracted.secure_identity_confirmation')} </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
        <Lock className={`w-5 h-5 ${theme === 'light' ? 'text-purple-600' : 'text-accent-gradient'}`} />
        <div className="text-left">
          <p className="text-sm font-medium theme-text-primary">{t('extracted.encrypted_process')} </p>
          <p className="text-xs theme-text-muted">{t('extracted.your_data_is_protected')} </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
        <UserCheck className={`w-5 h-5 ${theme === 'light' ? 'text-green-600' : 'text-accent-gradient'}`} />
        <div className="text-left">
          <p className="text-sm font-medium theme-text-primary">{t('extracted.instant_access')} </p>
          <p className="text-xs theme-text-muted">{t('extracted.quick_verification_process')} </p>
        </div>
      </div>
    </motion.div>
  );
};