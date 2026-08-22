'use client';
import { useDashboardView } from '@/context/DashboardViewContext';
import OfficerBeneficiariesPage from '@/features/beneficiaries/OfficerBeneficiariesPage';
import UserBeneficiariesPage from '@/features/beneficiaries/UserBeneficiariesPage';

export default function Page() {
  const { view } = useDashboardView();
  return view === 'officer' ? <OfficerBeneficiariesPage /> : <UserBeneficiariesPage />;
}
