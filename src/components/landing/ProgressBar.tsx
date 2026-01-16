import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1.5 transform origin-left z-50 shadow-sm`}
      style={{
        scaleX: scaleProgress,
        background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`,
        boxShadow: '0 0 20px var(--accent-primary)'
      }}
    />
  );
};

export default ProgressBar;