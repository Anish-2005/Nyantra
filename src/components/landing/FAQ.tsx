"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HelpCircle, Plus, Minus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mb-4 rounded-2xl border transition-all duration-300 overflow-hidden ${open ? 'theme-bg-card theme-border-glass shadow-lg' : 'theme-bg-glass/50 theme-border-glass hover:theme-bg-glass'}`}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls={`faq-content-${index}`}
        className="w-full flex items-center justify-between p-6 focus:outline-none group-hover:text-accent-primary transition-colors text-left"
      >
        <span className="font-bold theme-text-primary text-lg pr-8">{question}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${open ? 'accent-gradient text-white' : 'theme-bg-glass theme-border-glass border theme-text-muted'}`}>
            <Plus className="w-5 h-5" />
          </div>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`faq-content-${index}`}
            key={`faq-content-${index}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-base leading-relaxed theme-text-secondary">
              {answer}
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

      <div className="max-w-3xl mx-auto overflow-visible px-4">
        {(JSON.parse(t('faq.items')) as Array<{ question: string; answer: string }>).map((item: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 + 0.2 }}>
            <FAQItem question={item.question} answer={item.answer} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;