import { motion } from 'framer-motion';
import { FileCheck, ArrowRight } from 'lucide-react';

interface VerifyButtonProps {
  onClick: () => void;
  verifying: boolean;
  t: (key: string) => string;
  className?: string;
}

export const VerifyButton = ({ onClick, verifying, t, className = '' }: VerifyButtonProps) => {
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
      onClick={onClick}
      disabled={verifying}
      className={`w-full py-3 rounded-xl accent-gradient text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
      whileHover={!verifying ? { scale: 1.02, y: -2 } : {}}
      whileTap={!verifying ? { scale: 0.98 } : {}}
      variants={itemVariants}
    >
      {verifying ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {t('extracted.verifying')}
        </>
      ) : (
        <>
          <FileCheck className="w-5 h-5" />
          {t('extracted.connect_to_digilocker_mock')}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
};