import { Suspense } from 'react';
import AppLayout from '@/components/layout/app-layout';
import CalendarView from '@/components/calendar/calendar-view';
import { CalendarSkeleton } from '@/components/calendar/calendar-skeleton';

export default function CalendarPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView />
      </Suspense>
    </AppLayout>
  );
}