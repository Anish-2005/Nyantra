"use client";
import React from 'react';
import { useLocale } from '../context/LocaleContext';

export default function LanguageToggle({ className, compact = false, vertical = false }: { className?: string; compact?: boolean; vertical?: boolean }) {
  const { locale, setLocale } = useLocale();

  const base = compact ? 'text-sm px-2 py-1' : 'px-3 py-1';
  if (vertical) {
    return (
      <div className={className} role="radiogroup" aria-label="Language selector" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
          className={`${base} rounded-lg border theme-border-glass ${locale === 'en' ? 'accent-gradient text-white' : 'theme-bg-glass'}`}
        >
          EN
        </button>
        <button
          type="button"
          aria-pressed={locale === 'hi'}
          onClick={() => setLocale('hi')}
          className={`${base} rounded-lg border theme-border-glass ${locale === 'hi' ? 'accent-gradient text-white' : 'theme-bg-glass'}`}
        >
          हिंदी
        </button>
      </div>
    );
  }

  return (
    <div className={className} role="radiogroup" aria-label="Language selector">
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={`${base} rounded-l-lg border theme-border-glass ${locale === 'en' ? 'accent-gradient text-white' : 'theme-bg-glass'}`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === 'hi'}
        onClick={() => setLocale('hi')}
        className={`${base} rounded-r-lg border border-l-0 theme-border-glass ${locale === 'hi' ? 'accent-gradient text-white' : 'theme-bg-glass'}`}
      >
        हिंदी
      </button>
    </div>
  );
}
