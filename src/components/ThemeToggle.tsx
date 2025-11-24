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
        className={`px-3 py-2 rounded-lg border transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200' : 'theme-bg-glass theme-border-glass hover:theme-bg-hover'} ${className || ''}`}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    );
  }
  
  return (
    <button onClick={toggleTheme} aria-label={t('extracted.toggle_theme')} className={className}>
      {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />}
    </button>
  );
}
