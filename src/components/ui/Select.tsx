'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options?: SelectOption[];
  children?: React.ReactNode;
}

/** Themed select. Pass `options` for simple cases or `children` for custom groups. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', options, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`w-full px-3 py-2 rounded-lg theme-input-solid theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {options
        ? options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        : children}
    </select>
  );
});
