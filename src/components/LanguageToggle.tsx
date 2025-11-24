"use client";
import React from 'react';
import { useLocale } from '../context/LocaleContext';
import { useTheme } from '../context/ThemeContext';

export default function LanguageToggle({ className, compact = false, vertical = false }: { className?: string; compact?: boolean; vertical?: boolean }) {
  const { locale, setLocale } = useLocale();
  const { theme } = useTheme();

  const base = compact ? 'text-xs px-2 py-2' : 'px-3 py-1';
  
  // In vertical mode (collapsed sidebar), show single toggle button
  if (vertical) {
    return (
      <button
        type="button"
        onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
        className={`${base} w-10 h-10 rounded-lg border font-medium transition-all flex items-center justify-center ${theme === 'light' ? 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200' : 'theme-bg-glass theme-border-glass theme-text-primary hover:theme-bg-hover'} ${className || ''}`}
        aria-label="Toggle language"
      >
        {locale === 'en' ? 'EN' : 'हिं'}
      </button>
    );
  }

  return (
    <div className={className} role="radiogroup" aria-label="Language selector">
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={`${base} rounded-l-lg border font-medium transition-all ${locale === 'en' ? 'accent-gradient text-white shadow-sm' : theme === 'light' ? 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200' : 'theme-bg-glass theme-border-glass text-gray-300 hover:theme-bg-hover'}`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === 'hi'}
        onClick={() => setLocale('hi')}
        className={`${base} rounded-r-lg border border-l-0 font-medium transition-all ${locale === 'hi' ? 'accent-gradient text-white shadow-sm' : theme === 'light' ? 'bg-gray-100 text-gray-800 border-r-gray-300 border-t-gray-300 border-b-gray-300 hover:bg-gray-200' : 'theme-bg-glass theme-border-glass text-gray-300 hover:theme-bg-hover'}`}
      >
        हिंदी
      </button>
    </div>
  );
}
