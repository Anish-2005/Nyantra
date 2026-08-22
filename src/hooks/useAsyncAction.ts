'use client';

import { useCallback, useState } from 'react';

export interface AsyncActionState {
  loading: boolean;
  error: Error | null;
}

/**
 * Wraps an async operation with loading/error state.
 * The action never throws — callers decide how to surface errors.
 */
export function useAsyncAction<A extends unknown[]>(
  fn: (...args: A) => Promise<void>,
): AsyncActionState & { run: (...args: A) => Promise<void> } {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async (...args: A) => {
      setLoading(true);
      setError(null);
      try {
        await fn(...args);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  return { loading, error, run };
}
