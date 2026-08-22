'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon (absolutely positioned; add pl-10 via className). */
  leadingIcon?: ReactNode;
  wrapperClassName?: string;
}

/** Themed text input matching legacy form styling. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', leadingIcon, wrapperClassName = '', ...rest },
  ref,
) {
  if (!leadingIcon) {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg theme-input-solid theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...rest}
      />
    );
  }
  return (
    <div className={`relative ${wrapperClassName}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {leadingIcon}
      </span>
      <input
        ref={ref}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg theme-input-solid theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary ${className}`}
        {...rest}
      />
    </div>
  );
});
