"use client";
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className={className}>
      {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />}
    </button>
  );
}
