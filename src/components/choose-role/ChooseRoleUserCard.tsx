import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake } from 'lucide-react';

interface ChooseRoleUserCardProps {
  onClick: () => void;
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleUserCard = ({ onClick, t, className = '' }: ChooseRoleUserCardProps) => {
  return (
    <motion.button
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring' as const, stiffness: 100, delay: 0.1 }
        }
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group w-full text-left p-5 rounded-2xl theme-bg-glass theme-border-glass border cursor-pointer transition-all hover:shadow-lg hover:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary flex flex-col ${className}`}
      onClick={onClick}
    >
      <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
        <HeartHandshake className="w-6 h-6 text-white" />
      </span>
      <span className="mt-4">
        <span className="block font-semibold theme-text-primary">{t('extracted.iaposm_a_user')}</span>
        <span className="block text-sm theme-text-muted mt-1 leading-relaxed">
          {t('extracted.access_benefits_and_services_as_a_beneficiary')}
        </span>
      </span>
      <span className="mt-4 pt-3 border-t theme-border-glass flex items-center justify-between text-xs theme-text-secondary">
        <span>{t('extracted.for_beneficiaries_receiving_services_and_benefits')}</span>
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
};
