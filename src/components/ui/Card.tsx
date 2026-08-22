import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

/** Glass card surface — the standard container across the app. */
export function Card({ padding = 'none', className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`theme-bg-card theme-border-glass border rounded-xl backdrop-blur-xl ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
