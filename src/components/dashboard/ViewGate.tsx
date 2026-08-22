'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardView, DashboardView } from '@/context/DashboardViewContext';

interface ViewGateProps {
  allow: DashboardView;
  children: React.ReactNode;
}

export default function ViewGate({ allow, children }: ViewGateProps) {
  const { view } = useDashboardView();
  const router = useRouter();

  useEffect(() => {
    if (view !== allow) router.replace('/dashboard');
  }, [view, allow, router]);

  if (view !== allow) return null;
  return <>{children}</>;
}
