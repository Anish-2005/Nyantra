'use client';
import { useDashboardView } from '@/context/DashboardViewContext';
import OfficerDisbursementsPage from '@/features/disbursements/OfficerDisbursementsPage';
import UserDisbursementsPage from '@/features/disbursements/UserDisbursementsPage';

export default function Page() {
  const { view } = useDashboardView();
  return view === 'officer' ? <OfficerDisbursementsPage /> : <UserDisbursementsPage />;
}
