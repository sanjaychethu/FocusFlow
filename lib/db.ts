"use client"

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Habit, Task, CalendarEvent } from '@/lib/types';

interface ProductivityDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
    indexes: { 'by-created': string };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-created': string; 'by-due-date': string; 'by-status': string };
  };
  events: {
    key: string;
    value: CalendarEvent;
    indexes: { 'by-date': string; 'by-type': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ProductivityDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ProductivityDB>('productivity-app', 1, {
      upgrade(db) {
        // Create stores
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
        habitStore.createIndex('by-created', 'createdAt');

        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-created', 'createdAt');
        taskStore.createIndex('by-due-date', 'dueDate');
        taskStore.createIndex('by-status', 'status');

        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        eventStore.createIndex('by-date', 'date');
        eventStore.createIndex('by-type', 'type');
      },
    });
  }
  return dbPromise;
}

// Habit Data Access
export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAllFromIndex('habits', 'by-created');
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  const db = await getDB();
  return db.get('habits', id);
}

export async function saveHabit(habit: Habit): Promise<string> {
  const db = await getDB();
  await db.put('habits', habit);
  return habit.id;
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('habits', id);
}

// Task Data Access
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-created');
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-status', status);
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function saveTask(task: Task): Promise<string> {
  const db = await getDB();
  await db.put('tasks', task);
  return task.id;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// Event Data Access
export async function getAllEvents(): Promise<CalendarEvent[]> {
  const db = await getDB();
  return db.getAllFromIndex('events', 'by-date');
}

export async function getEventsByDate(date: string): Promise<CalendarEvent[]> {
  const db = await getDB();
  return db.getAllFromIndex('events', 'by-date', date);
}

export async function saveEvent(event: CalendarEvent): Promise<string> {
  const db = await getDB();
  await db.put('events', event);
  return event.id;
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('events', id);
}