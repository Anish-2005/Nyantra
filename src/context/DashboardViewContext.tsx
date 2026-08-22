'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export type DashboardView = 'officer' | 'user';

const STORAGE_KEY = 'nyantra.dashboardView';

interface DashboardViewContextValue {
  view: DashboardView;
  setView: (view: DashboardView) => void;
  canSwitch: boolean;
}

const DashboardViewContext = createContext<DashboardViewContextValue | undefined>(undefined);

const readStoredView = (): DashboardView | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'officer' || stored === 'user' ? stored : null;
  } catch {
    return null;
  }
};

export function DashboardViewProvider({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const [view, setViewState] = useState<DashboardView>('officer');

  const role = loading ? undefined : profile?.role;

  useEffect(() => {
    const stored = readStoredView();
    if (stored) {
      setViewState((current) => (current === stored ? current : stored));
    }
  }, []);

  useEffect(() => {
    if (role === 'user' && view !== 'user') {
      setViewState('user');
      try {
        window.localStorage.setItem(STORAGE_KEY, 'user');
      } catch {}
    }
  }, [role, view]);

  useEffect(() => {
    if (loading || role === undefined) return;
    const stored = readStoredView();
    if (!stored && role) {
      const resolved: DashboardView = role === 'officer' ? 'officer' : 'user';
      setViewState(resolved);
      try {
        window.localStorage.setItem(STORAGE_KEY, resolved);
      } catch {}
    }
  }, [loading, role]);

  const setView = useCallback(
    (next: DashboardView) => {
      if (role === 'user' && next !== 'user') return;
      setViewState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {}
    },
    [role]
  );

  const value = useMemo<DashboardViewContextValue>(
    () => ({ view, setView, canSwitch: role === 'officer' }),
    [view, setView, role]
  );

  return <DashboardViewContext.Provider value={value}>{children}</DashboardViewContext.Provider>;
}

export function useDashboardView(): DashboardViewContextValue {
  const ctx = useContext(DashboardViewContext);
  if (!ctx) throw new Error('useDashboardView must be used within DashboardViewProvider');
  return ctx;
}
