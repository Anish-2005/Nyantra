'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

/**
 * The two drifting accent-gradient orbs used behind dashboard shells.
 * Rendered fixed, pointer-events-none, z-0.
 */
export function GradientOrbs() {
  const { theme } = useTheme();
  const opacity = theme === 'dark' ? 'opacity-15' : 'opacity-20';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <motion.div
        className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${opacity}`}
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${opacity}`}
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
