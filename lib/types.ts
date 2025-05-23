// Habit Types
export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type HabitCustomFrequency = {
  days: number[];
  interval?: number;
};

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: HabitFrequency;
  customFrequency?: HabitCustomFrequency;
  createdAt: string;
  updatedAt: string;
  completions: HabitCompletion[];
  archived: boolean;
  streakCount: number;
  longestStreak: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

// Task Types
export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  subTasks: SubTask[];
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'task' | 'habit';
  color?: string;
  relatedId: string;
}