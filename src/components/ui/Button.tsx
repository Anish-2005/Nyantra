'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'accent-gradient text-white shadow-lg hover:shadow-xl transition-shadow',
  outline:
    'theme-border-glass border theme-bg-glass theme-text-primary shadow-lg hover:shadow-md transition-shadow',
  ghost: 'theme-text-primary hover:theme-bg-hover transition-colors',
  danger:
    'text-red-600 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 rounded-xl',
  lg: 'px-5 py-3 rounded-xl',
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

/** Shared motion button — matches the legacy header-button feel by default. */
export function Button({
  variant = 'outline',
  size = 'md',
  iconLeft,
  iconRight,
  children,
  className = '',
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={whileHover}
      whileTap={whileTap}
      className={`flex items-center justify-center gap-2 font-medium ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </motion.button>
  );
}
