import React from "react";
import { motion } from "framer-motion";

interface GradientOrbsProps {
  theme: "light" | "dark";
}

const GradientOrbs: React.FC<GradientOrbsProps> = ({ theme }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
    <motion.div
      className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-5' : 'opacity-8'}`}
      animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-4' : 'opacity-6'}`}
      animate={{ x: [0, -25, 0], y: [0, 15, 0], scale: [1, 0.9, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-3' : 'opacity-5'}`}
      animate={{ x: [0, -15, 0], y: [0, 25, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default GradientOrbs;
