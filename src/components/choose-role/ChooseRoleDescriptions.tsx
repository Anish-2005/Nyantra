import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';

interface ChooseRoleDescriptionsProps {
  t: (key: string) => string;
  className?: string;
}

export const ChooseRoleDescriptions = ({ t, className = '' }: ChooseRoleDescriptionsProps) => {
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
      className={`mt-6 grid grid-cols-2 gap-4 text-xs ${className}`}
      variants={itemVariants}
    >
      <div className="text-center theme-text-muted">
        <User className="w-4 h-4 mx-auto mb-1" />
        <p>{t('extracted.for_beneficiaries_receiving_services_and_benefits')}</p>
      </div>
      <div className="text-center theme-text-muted">
        <Users className="w-4 h-4 mx-auto mb-1" />
        <p>{t('extracted.for_administrators_managing_the_platform')}</p>
      </div>
    </motion.div>
  );
};