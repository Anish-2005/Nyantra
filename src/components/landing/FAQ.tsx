"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="group">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls={`faq-${index}`}
        className="w-full flex items-center justify-between p-6 rounded-2xl theme-bg-glass theme-border-glass border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-primary hover:theme-bg-card group-hover:shadow-lg"
      >
        <div className="text-left">
          <p className="font-semibold theme-text-primary text-lg group-hover:text-accent-gradient transition-colors">{question}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <div className="w-8 h-8 accent-gradient rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`faq-content-${index}`}
            key={`faq-content-${index}`}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-6 rounded-2xl theme-bg-card theme-border-card border shadow-lg">
              <p className="text-base leading-relaxed theme-text-secondary">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ: React.FC = () => {
  const { t } = useLocale();

  return (
    <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-visible">
      <div className="max-w-4xl mx-auto text-center mb-12 overflow-visible">
        <motion.span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-5" whileHover={{ scale: 1.05 }}>
          <HelpCircle className="inline w-4 h-4 mr-2 text-accent-gradient" />
          {t('faq.badge')}
        </motion.span>

        <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary overflow-visible py-4" style={{ lineHeight: '1.4' }}>
          {t('faq.title')} <span className="block">{t('faq.titleHighlight')}</span>
        </h2>
        <p className="mt-2 text-sm sm:text-base theme-text-muted overflow-visible py-2">
          {t('faq.description')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto overflow-visible">
        {(JSON.parse(t('faq.items')) as Array<{ question: string; answer: string }>).map((item: any, i: number) => (
          <motion.div key={i} className="mb-4 rounded-2xl theme-bg-card theme-border-card p-4 overflow-visible" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <FAQItem question={item.question} answer={item.answer} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;