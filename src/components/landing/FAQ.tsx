'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';
import { Section, SectionHeader, GlassCard } from './primitives';

interface FaqEntry {
  question: string;
  answer: string;
}

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls={`faq-content-${index}`}
        className="w-full flex items-center justify-between gap-5 px-5 py-4 text-left transition-colors hover:text-accent-primary"
      >
        <span className={`font-medium text-sm sm:text-[15px] transition-colors ${open ? 'text-accent-gradient' : 'theme-text-primary'}`}>
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
            open ? 'accent-gradient text-white border-transparent' : 'theme-bg-glass theme-border-glass theme-text-muted'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-content-${index}`}
            key={`faq-content-${index}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed theme-text-secondary">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ: React.FC = () => {
  const { t } = useLocale();

  return (
    <Section id="faq" divided className="py-16 sm:py-20">
      <SectionHeader
        eyebrow={t('faq.badge')}
        eyebrowIcon={HelpCircle}
        title={t('faq.title')}
        highlight={t('faq.titleHighlight')}
        highlightBreak
        lede={t('faq.description')}
      />

      <GlassCard className="max-w-2xl mx-auto overflow-hidden divide-y theme-border-glass">
        {(JSON.parse(t('faq.items')) as FaqEntry[]).map((item, i) => (
          <FAQItem key={i} question={item.question} answer={item.answer} index={i} />
        ))}
      </GlassCard>
    </Section>
  );
};

export default FAQ;
