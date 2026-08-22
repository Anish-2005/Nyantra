'use client';
import { useDashboardView } from '@/context/DashboardViewContext';
import OfficerGrievancePage from '@/features/grievance/OfficerGrievancePage';
import UserGrievancePage from '@/features/grievance/UserGrievancePage';

export default function Page() {
  const { view } = useDashboardView();
  return view === 'officer' ? <OfficerGrievancePage /> : <UserGrievancePage />;
}
