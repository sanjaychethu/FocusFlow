import { Suspense } from 'react';
import AppLayout from '@/components/layout/app-layout';
import Dashboard from '@/components/dashboard/dashboard';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

export default function Home() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </AppLayout>
  );
}