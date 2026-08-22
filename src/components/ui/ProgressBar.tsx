export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  height?: 'sm' | 'md' | 'lg';
  gradient?: string;
  trackClassName?: string;
  className?: string;
}

const HEIGHTS = { sm: 'h-1', md: 'h-2', lg: 'h-3' } as const;

/** Determinate progress bar with the legacy blue→purple fill. */
export function ProgressBar({
  value,
  height = 'md',
  gradient = 'bg-gradient-to-r from-blue-500 to-purple-500',
  trackClassName = 'bg-gray-200 dark:bg-gray-700',
  className = '',
}: ProgressBarProps) {
  return (
    <div className={`w-full ${HEIGHTS[height]} ${trackClassName} rounded-full overflow-hidden ${className}`}>
      <div
        className={`${gradient} ${HEIGHTS[height]} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
