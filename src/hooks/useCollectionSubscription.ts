'use client';

/**
 * Generic collection-subscription hook. Feature hooks compose this instead of
 * each page re-implementing onSnapshot lifecycle handling.
 */
import { useEffect, useState } from 'react';
import type { UnsubscribeFn } from '@/models/common';

export interface CollectionSubscription<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
}

export function useCollectionSubscription<T>(
  subscribe: (onData: (items: T[]) => void, onError: (e: Error) => void) => UnsubscribeFn,
): CollectionSubscription<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const unsub = subscribe(
      (next) => {
        if (!active) return;
        setItems(next);
        setLoading(false);
      },
      (err) => {
        console.error('[useCollectionSubscription]', err);
        if (!active) return;
        setError(err);
        setLoading(false);
      },
    );
    return () => {
      active = false;
      try {
        unsub();
      } catch {
        /* noop */
      }
    };
  }, [subscribe]);

  return { items, loading, error };
}
