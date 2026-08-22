import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  hint?: string;
  className?: string;
}

/** Standard "nothing here" panel. */
export function EmptyState({ icon, message, hint, className = '' }: EmptyStateProps) {
  return (
    <div className={`p-6 text-center theme-text-muted ${className}`}>
      {icon && <div className="flex justify-center mb-3">{icon}</div>}
      <p>{message}</p>
      {hint && <p className="text-sm mt-1 opacity-80">{hint}</p>}
    </div>
  );
}
