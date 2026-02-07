import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';

interface ChooseRoleOfficerCardProps {
  onClick: () => void;
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleOfficerCard = ({ onClick, t, className = '' }: ChooseRoleOfficerCardProps) => {
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
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-4 rounded-xl accent-gradient text-white cursor-pointer transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold">{t('extracted.iaposm_an_officer')} </h3>
          <p className="text-sm text-white/80 mt-1">
            {t('extracted.manage_and_oversee_platform_operations')}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-white" />
      </div>
    </motion.button>
  );
};