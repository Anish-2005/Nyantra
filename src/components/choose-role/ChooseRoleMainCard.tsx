import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { ChooseRoleHeader } from './ChooseRoleHeader';
import { ChooseRoleUserCard } from './ChooseRoleUserCard';
import { ChooseRoleOfficerCard } from './ChooseRoleOfficerCard';

interface ChooseRoleMainCardProps {
  onPickUser: () => void;
  onPickOfficer: () => void;
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleMainCard = ({ onPickUser, onPickOfficer, t, className = '' }: ChooseRoleMainCardProps) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 24, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring' as const, stiffness: 100 }
        }
      }}
      className={`theme-bg-card theme-border-card border rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 accent-gradient" aria-hidden />
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full accent-gradient opacity-[0.07] blur-2xl pointer-events-none" aria-hidden />

      <div className="relative z-10">
        <ChooseRoleHeader t={t} centered />

        {/* Role Selection */}
        <div className="grid sm:grid-cols-2 gap-4 mt-7">
          <ChooseRoleUserCard onClick={onPickUser} t={t} />
          <ChooseRoleOfficerCard onClick={onPickOfficer} t={t} />
        </div>

        {/* Security Note */}
        <p className="mt-7 pt-5 border-t theme-border-glass text-xs theme-text-muted text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          {t('extracted.your_role_can_be_updated_later_by_platform_administrators')}
        </p>
      </div>
    </motion.div>
  );
};
