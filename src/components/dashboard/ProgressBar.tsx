"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  scaleProgress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ scaleProgress }) => {
  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 transform origin-left z-50`}
      style={{ scaleX: scaleProgress, background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))` }}
    />
  );
};

export default ProgressBar;