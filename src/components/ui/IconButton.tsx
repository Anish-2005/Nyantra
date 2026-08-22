'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Accessible label; also used as the visible tooltip via title. */
  label: string;
  children: ReactNode;
}

/** Square themed action button (p-2 rounded-lg glass) with tooltip. */
export function IconButton({
  label,
  children,
  className = '',
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <motion.button
      type={type}
      title={label}
      aria-label={label}
      whileHover={whileHover}
      whileTap={whileTap}
      className={`p-2 rounded-lg theme-bg-glass theme-border-glass border hover:theme-bg-hover transition-colors theme-text-primary ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
