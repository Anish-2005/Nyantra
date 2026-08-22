'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

export type PillTone =
  | 'completed' | 'pending' | 'in-progress' | 'failed' | 'cancelled'
  | 'high' | 'medium' | 'low' | 'neutral';

/** Exact tone maps ported from the legacy pages (theme-aware). */
const DARK_TONES: Record<PillTone, string> = {
  completed: 'text-green-300 bg-green-900/30',
  pending: 'text-amber-300 bg-amber-900/30',
  'in-progress': 'text-blue-300 bg-blue-900/30',
  failed: 'text-red-300 bg-red-900/30',
  cancelled: 'text-gray-300 bg-gray-800',
  high: 'text-red-300 bg-red-900/30',
  medium: 'text-amber-300 bg-amber-900/30',
  low: 'text-green-300 bg-green-900/30',
  neutral: 'text-gray-300 bg-gray-800',
};

const LIGHT_TONES: Record<PillTone, string> = {
  completed: 'text-green-700 bg-green-100',
  pending: 'text-amber-700 bg-amber-100',
  'in-progress': 'text-blue-700 bg-blue-100',
  failed: 'text-red-700 bg-red-100',
  cancelled: 'text-gray-700 bg-gray-100',
  high: 'text-red-700 bg-red-100',
  medium: 'text-amber-700 bg-amber-100',
  low: 'text-green-700 bg-green-100',
  neutral: 'text-gray-700 bg-gray-100',
};

/** Pure tone→classes resolver (usable outside React when theme is known). */
export function pillToneClasses(tone: PillTone, theme: 'dark' | 'light'): string {
  return theme === 'dark' ? DARK_TONES[tone] : LIGHT_TONES[tone];
}

export interface StatusPillProps {
  tone: PillTone;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Rounded status/priority badge. `tone` selects the exact legacy colour pair;
 * pass an icon node to reproduce the status-icon variants.
 */
export function StatusPill({ tone, icon, children, size = 'md', className = '' }: StatusPillProps) {
  const { theme } = useTheme();
  return (
    <span
      className={`inline-flex items-center rounded-full text-xs font-medium border ${
        size === 'sm' ? 'px-2 py-0.5 gap-1' : 'px-2.5 py-1 gap-1.5'
      } ${pillToneClasses(tone, theme)} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
