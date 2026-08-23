"use client";
import React from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export default function LanguageToggle({ className, vertical = false }: { className?: string; compact?: boolean; vertical?: boolean }) {
  const { locale, setLocale } = useLocale();
  const next = locale === 'en' ? 'hi' : 'en';

  if (vertical) {
    return (
      <button
        type="button"
        onClick={() => setLocale(next)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-semibold theme-text-secondary transition-colors hover:theme-bg-glass hover:theme-text-primary ${className || ''}`}
        aria-label="Toggle language"
        title={locale === 'en' ? 'Switch to Hindi' : 'अंग्रेज़ी में बदलें'}
      >
        {locale === 'en' ? 'EN' : 'हिं'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold theme-text-secondary transition-colors hover:theme-bg-glass hover:theme-text-primary ${className || ''}`}
      role="button"
      aria-label="Toggle language"
      aria-pressed={locale === 'hi'}
      title={locale === 'en' ? 'Switch to Hindi' : 'अंग्रेज़ी में बदलें'}
    >
      <Languages className="w-3.5 h-3.5 shrink-0" />
      {locale === 'en' ? 'EN' : 'हिंदी'}
    </button>
  );
}
