'use client';
import { useDashboardView } from '@/context/DashboardViewContext';
import OfficerReportsPage from '@/features/reports/OfficerReportsPage';
import UserReportsPage from '@/features/reports/UserReportsPage';

export default function Page() {
  const { view } = useDashboardView();
  return view === 'officer' ? <OfficerReportsPage /> : <UserReportsPage />;
}
