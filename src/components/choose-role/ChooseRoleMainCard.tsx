import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { ChooseRoleHeader } from './ChooseRoleHeader';
import { ChooseRoleStatusBadge } from './ChooseRoleStatusBadge';
import { ChooseRoleUserCard } from './ChooseRoleUserCard';
import { ChooseRoleOfficerCard } from './ChooseRoleOfficerCard';
import { ChooseRoleDescriptions } from './ChooseRoleDescriptions';

interface ChooseRoleMainCardProps {
  onPickUser: () => void;
  onPickOfficer: () => void;
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleMainCard = ({ onPickUser, onPickOfficer, t, className = '' }: ChooseRoleMainCardProps) => {
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
        <ChooseRoleHeader t={t} />
        <ChooseRoleStatusBadge t={t} />

        {/* Role Selection */}
        <div className="space-y-4">
          <ChooseRoleUserCard onClick={onPickUser} t={t} />
          <ChooseRoleOfficerCard onClick={onPickOfficer} t={t} />
        </div>

        <ChooseRoleDescriptions t={t} />

        {/* Security Note */}
        <motion.p
          className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <Shield className="w-3 h-3" />
          {t('extracted.your_role_can_be_updated_later_by_platform_administrators')}
        </motion.p>
      </div>
    </motion.div>
  );
};