'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';

const ScrollToTopButton = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.button
          className="fixed bottom-5 right-5 w-10 h-10 rounded-full theme-bg-card theme-border-glass border backdrop-blur-md flex items-center justify-center theme-text-secondary hover:theme-text-primary hover:border-accent-primary/50 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] transition-colors z-[100]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t('extracted.scroll_to_top')}
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
