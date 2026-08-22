export interface SkeletonProps {
  className?: string;
}

/** Pulse placeholder block. */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-gray-300/40 dark:bg-gray-600/40 ${className}`} />;
}
