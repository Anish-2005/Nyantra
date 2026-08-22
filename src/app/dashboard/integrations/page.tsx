'use client';
import ViewGate from '@/components/dashboard/ViewGate';
import OfficerIntegrationsPage from '@/features/integrations/OfficerIntegrationsPage';

export default function Page() {
  return (
    <ViewGate allow="officer">
      <OfficerIntegrationsPage />
    </ViewGate>
  );
}
