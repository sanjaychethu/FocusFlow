import { Suspense } from 'react';
import AppLayout from '@/components/layout/app-layout';
import TaskManager from '@/components/tasks/task-manager';
import { TaskManagerSkeleton } from '@/components/tasks/task-manager-skeleton';

export default function TasksPage() {
  return (
    <AppLayout>
      <Suspense fallback={<TaskManagerSkeleton />}>
        <TaskManager />
      </Suspense>
    </AppLayout>
  );
}