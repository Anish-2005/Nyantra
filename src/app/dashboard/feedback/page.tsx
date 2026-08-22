'use client';
import ViewGate from '@/components/dashboard/ViewGate';
import UserFeedbackPage from '@/features/feedback/UserFeedbackPage';

export default function Page() {
  return (
    <ViewGate allow="user">
      <UserFeedbackPage />
    </ViewGate>
  );
}
