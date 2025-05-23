import { Suspense } from 'react';
import AppLayout from '@/components/layout/app-layout';
import HabitTracker from '@/components/habits/habit-tracker';
import { HabitTrackerSkeleton } from '@/components/habits/habit-tracker-skeleton';

export default function HabitsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<HabitTrackerSkeleton />}>
        <HabitTracker />
      </Suspense>
    </AppLayout>
  );
}