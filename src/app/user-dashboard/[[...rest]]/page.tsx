import { redirect } from 'next/navigation';

export default async function UserDashboardRedirect({
  params,
}: {
  params: Promise<{ rest?: string[] }>;
}) {
  const { rest } = await params;
  const target = rest && rest.length > 0 ? `/dashboard/${rest.join('/')}` : '/dashboard';
  redirect(target);
}
