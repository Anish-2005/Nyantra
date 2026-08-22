'use client';
import dynamic from 'next/dynamic';
import { useDashboardView } from '@/context/DashboardViewContext';
import UserOverviewPage from '@/features/overview/UserOverviewPage';

const OfficerOverviewPage = dynamic(() => import('@/components/DashboardComponent'), { ssr: false });

export default function Page() {
  const { view } = useDashboardView();
  return view === 'officer' ? <OfficerOverviewPage /> : <UserOverviewPage />;
}
