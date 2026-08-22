"use client";
import React from 'react';
import { useLocale } from '../context/LocaleContext';

export default function LanguageToggle({ className, compact = false, vertical = false }: { className?: string; compact?: boolean; vertical?: boolean }) {
  const { locale, setLocale } = useLocale();

  if (vertical) {
    return (
      <button
        type="button"
        onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-semibold theme-text-secondary transition-colors hover:theme-bg-glass hover:theme-text-primary ${className || ''}`}
        aria-label="Toggle language"
      >
        {locale === 'en' ? 'EN' : 'हिं'}
      </button>
    );
  }

  const optionClass = (active: boolean) =>
    `inline-flex h-8 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors ${
      active
        ? 'theme-bg-glass text-accent-gradient'
        : 'theme-text-muted hover:theme-text-primary'
    }`;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className || ''}`} role="radiogroup" aria-label="Language selector">
      <button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')} className={optionClass(locale === 'en')}>
        EN
      </button>
      <button type="button" aria-pressed={locale === 'hi'} onClick={() => setLocale('hi')} className={`${optionClass(locale === 'hi')} px-2`}>
        हिंदी
      </button>
    </div>
  );
}
