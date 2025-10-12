"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

type Locale = 'en' | 'hi';

type Translations = Record<string, unknown>;

const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  hi,
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('hi');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyantra_locale');
      if (stored === 'en' || stored === 'hi') {
        setLocaleState(stored);
        return;
      }

      const navLang = navigator.language?.toLowerCase() || '';
      if (navLang.startsWith('hi')) setLocaleState('hi');
      else setLocaleState('en');
    } catch {
      // ignore
    }
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('nyantra_locale', l);
    } catch {}
  }, []);

  const t = React.useCallback((key: string, vars?: Record<string, string | number>) => {
    const pieces = key.split('.');
    let node: unknown = TRANSLATIONS[locale];
    for (const p of pieces) {
      if (node && typeof node === 'object' && (p in (node as Record<string, unknown>))) {
        node = (node as Record<string, unknown>)[p];
      } else {
        // fallback: return key as-is
        return key;
      }
    }
    let out = typeof node === 'string' ? (node as string) : JSON.stringify(node);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
      }
    }
    return out;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};

export default LocaleContext;
