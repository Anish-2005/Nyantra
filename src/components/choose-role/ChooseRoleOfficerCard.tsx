import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface ChooseRoleOfficerCardProps {
  onClick: () => void;
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleOfficerCard = ({ onClick, t, className = '' }: ChooseRoleOfficerCardProps) => {
  return (
    <motion.button
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring' as const, stiffness: 100, delay: 0.18 }
        }
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group w-full text-left p-5 rounded-2xl accent-gradient text-white cursor-pointer transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 flex flex-col ${className}`}
      onClick={onClick}
    >
      <span className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-white" />
      </span>
      <span className="mt-4">
        <span className="block font-semibold">{t('extracted.iaposm_an_officer')}</span>
        <span className="block text-sm text-white/80 mt-1 leading-relaxed">
          {t('extracted.manage_and_oversee_platform_operations')}
        </span>
      </span>
      <span className="mt-4 pt-3 border-t border-white/25 flex items-center justify-between text-xs text-white/80">
        <span>{t('extracted.for_administrators_managing_the_platform')}</span>
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
};
