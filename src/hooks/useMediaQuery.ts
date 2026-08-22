'use client';

import { useEffect, useState } from 'react';

/** Reactive media-query hook with SSR-safe defaults. */
export function useMediaQuery(queryString: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(queryString);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches('matches' in e ? e.matches : mq.matches);
    };

    handler(mq);
    if ('addEventListener' in mq) {
      mq.addEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    } else {
      (mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void })
        .addListener?.(handler as (e: MediaQueryListEvent) => void);
    }

    return () => {
      if ('removeEventListener' in mq) {
        mq.removeEventListener('change', handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      } else {
        (mq as unknown as { removeListener?: (h: (e: MediaQueryListEvent) => void) => void })
          .removeListener?.(handler as (e: MediaQueryListEvent) => void);
      }
    };
  }, [queryString]);

  return matches;
}
