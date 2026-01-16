import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { VerifyHeader } from './VerifyHeader';
import { VerifyStatusBadge } from './VerifyStatusBadge';
import { VerifySteps } from './VerifySteps';
import { VerifyProgressBar } from './VerifyProgressBar';
import { VerifyButton } from './VerifyButton';

interface VerifyCardProps {
  verifying: boolean;
  progress: number;
  onVerify: () => void;
  t: (key: string) => string;
  className?: string;
}

export const VerifyCard = ({ verifying, progress, onVerify, t, className = '' }: VerifyCardProps) => {
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
      className={`theme-bg-card theme-border-card border rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background Accent */}
      <div className="absolute inset-0 accent-gradient opacity-5 pointer-events-none z-0 rounded-xl" aria-hidden />

      <div className="relative z-10">
        <VerifyHeader t={t} />
        <VerifyStatusBadge t={t} />

        {/* Verification Content */}
        <div className="space-y-6">
          {/* Description */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="theme-text-muted mb-4">
              {t('extracted.to_continue_to_your_user_dashboard')}
            </p>
          </motion.div>

          <VerifySteps t={t} />
          <VerifyProgressBar verifying={verifying} progress={progress} t={t} />
          <VerifyButton onClick={onVerify} verifying={verifying} t={t} />
        </div>

        {/* Security Note */}
        <motion.p
          className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <Shield className="w-3 h-3" />
          {t('extracted.your_data_is_securely_encrypted')}
        </motion.p>
      </div>
    </motion.div>
  );
};