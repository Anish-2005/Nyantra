'use client';
import ViewGate from '@/components/dashboard/ViewGate';
import OfficerAnalyticsPage from '@/features/analytics/OfficerAnalyticsPage';

export default function Page() {
  return (
    <ViewGate allow="officer">
      <OfficerAnalyticsPage />
    </ViewGate>
  );
}
