'use client';
import { useDashboardView } from '@/context/DashboardViewContext';
import OfficerApplicationsPage from '@/features/applications/OfficerApplicationsPage';
import UserApplicationsPage from '@/features/applications/UserApplicationsPage';

export default function Page() {
  const { view } = useDashboardView();
  return view === 'officer' ? <OfficerApplicationsPage /> : <UserApplicationsPage />;
}
