"use client";
import React, { createContext, useContext, useLayoutEffect, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use a stable initial theme to avoid SSR/client hydration mismatches.
  // We'll default to 'dark' for the initial render (both server & first client render),
  // then detect stored preference or system preference on mount and update.
  const [theme, setThemeState] = useState<Theme>('dark');

  // On mount, synchronously read stored preference or system preference and update theme
  // before the browser paints to avoid hydration mismatches.
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem('nyantara-theme');
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored as Theme);
        document.documentElement.setAttribute('data-theme', stored as Theme);
        return;
      }
    } catch {
      /* ignore localStorage errors */
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    setThemeState(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  // Persist theme when it changes (non-blocking)
  useEffect(() => {
    try { localStorage.setItem('nyantara-theme', theme); } catch { /* ignore */ }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
