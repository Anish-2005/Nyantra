import { motion, AnimatePresence } from 'framer-motion';

interface VerifyProgressBarProps {
  verifying: boolean;
  progress: number;
  t: (key: string) => string;
  className?: string;
}

export const VerifyProgressBar = ({ verifying, progress, t, className = '' }: VerifyProgressBarProps) => {
  return (
    <AnimatePresence>
      {verifying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`space-y-2 ${className}`}
        >
          <div className="w-full bg-gray-200 rounded-full h-2 theme-bg-glass">
            <motion.div
              className="h-2 rounded-full accent-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs theme-text-muted text-center">
            {progress < 100 ? t('extracted.verifying_your_identity') : t('extracted.verification_complete')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};