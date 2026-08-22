"use client";
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocale } from '../context/LocaleContext';

export default function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={t('extracted.toggle_theme')}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md theme-text-secondary transition-colors hover:theme-bg-glass hover:theme-text-primary ${className || ''}`}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={t('extracted.toggle_theme')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md theme-text-secondary transition-colors hover:theme-bg-glass hover:theme-text-primary ${className || ''}`}
    >
      {theme === 'dark' ? <Sun className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <Moon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
    </button>
  );
}
