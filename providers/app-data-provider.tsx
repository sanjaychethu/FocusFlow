"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Habit, Task, CalendarEvent } from '@/lib/types';
import { 
  getAllHabits, 
  saveHabit, 
  deleteHabit, 
  getAllTasks, 
  saveTask, 
  deleteTask,
  getAllEvents,
  saveEvent,
  deleteEvent
} from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

type AppDataContextType = {
  // Habits
  habits: Habit[];
  loadingHabits: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completions' | 'streakCount' | 'longestStreak'>) => Promise<string>;
  updateHabit: (habit: Habit) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, date: string, completed: boolean) => Promise<void>;
  
  // Tasks
  tasks: Task[];
  loadingTasks: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  
  // Events
  events: CalendarEvent[];
  loadingEvents: boolean;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<string>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const { toast } = useToast();
  
  const isLoading = loadingHabits || loadingTasks || loadingEvents;

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load habits
        setLoadingHabits(true);
        const habitData = await getAllHabits();
        setHabits(habitData);
        setLoadingHabits(false);
        
        // Load tasks
        setLoadingTasks(true);
        const taskData = await getAllTasks();
        setTasks(taskData);
        setLoadingTasks(false);
        
        // Load events
        setLoadingEvents(true);
        const eventData = await getAllEvents();
        setEvents(eventData);
        setLoadingEvents(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error loading data",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        });
      }
    };
    
    loadData();
  }, [toast]);
  
  // Habit functions
  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completions' | 'streakCount' | 'longestStreak'>) => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      completions: [],
      streakCount: 0,
      longestStreak: 0,
      archived: false,
    };
    
    try {
      await saveHabit(newHabit);
      setHabits(prev => [...prev, newHabit]);
      toast({ title: "Habit created", description: "Your new habit has been added." });
      return newHabit.id;
    } catch (error) {
      console.error('Failed to add habit:', error);
      toast({
        title: "Failed to create habit",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateHabit = async (habit: Habit) => {
    try {
      const updatedHabit = {
        ...habit,
        updatedAt: new Date().toISOString(),
      };
      await saveHabit(updatedHabit);
      setHabits(prev => prev.map(h => h.id === habit.id ? updatedHabit : h));
      toast({ title: "Habit updated", description: "Your habit has been updated." });
    } catch (error) {
      console.error('Failed to update habit:', error);
      toast({
        title: "Failed to update habit",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const removeHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
      toast({ title: "Habit deleted", description: "Your habit has been removed." });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast({
        title: "Failed to delete habit",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const completeHabit = async (habitId: string, date: string, completed: boolean) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');
      
      const completionId = uuidv4();
      const existingCompletionIndex = habit.completions.findIndex(c => c.date === date);
      
      let newCompletions;
      if (existingCompletionIndex >= 0) {
        // Update existing completion
        newCompletions = [...habit.completions];
        newCompletions[existingCompletionIndex] = {
          ...newCompletions[existingCompletionIndex],
          completed,
        };
      } else {
        // Add new completion
        newCompletions = [...habit.completions, {
          id: completionId,
          habitId,
          date,
          completed,
        }];
      }
      
      // Calculate streak
      // This is a simplified calculation and would need more logic for accurate streaks
      const streakCount = completed ? habit.streakCount + 1 : 0;
      const longestStreak = Math.max(habit.longestStreak, streakCount);
      
      const updatedHabit = {
        ...habit,
        completions: newCompletions,
        streakCount,
        longestStreak,
        updatedAt: new Date().toISOString(),
      };
      
      await saveHabit(updatedHabit);
      setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
      
      if (completed) {
        toast({ title: "Habit completed", description: "Keep up the good work!" });
      }
    } catch (error) {
      console.error('Failed to update habit completion:', error);
      toast({
        title: "Failed to update habit",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Task functions
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      await saveTask(newTask);
      setTasks(prev => [...prev, newTask]);
      toast({ title: "Task created", description: "Your new task has been added." });
      return newTask.id;
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: "Failed to create task",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateTask = async (task: Task) => {
    try {
      const updatedTask = {
        ...task,
        updatedAt: new Date().toISOString(),
      };
      await saveTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      toast({ title: "Task updated", description: "Your task has been updated." });
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: "Failed to update task",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const removeTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: "Task deleted", description: "Your task has been removed." });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: "Failed to delete task",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const completeTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      
      const updatedTask = {
        ...task,
        status: 'completed' as const,
        updatedAt: new Date().toISOString(),
      };
      
      await saveTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      toast({ title: "Task completed", description: "Nice work!" });
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast({
        title: "Failed to complete task",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Event functions
  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: uuidv4(),
    };
    
    try {
      await saveEvent(newEvent);
      setEvents(prev => [...prev, newEvent]);
      return newEvent.id;
    } catch (error) {
      console.error('Failed to add event:', error);
      throw error;
    }
  };
  
  const updateEvent = async (event: CalendarEvent) => {
    try {
      await saveEvent(event);
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };
  
  const removeEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  };
  
  const contextValue = {
    habits,
    loadingHabits,
    addHabit,
    updateHabit,
    removeHabit,
    completeHabit,
    
    tasks,
    loadingTasks,
    addTask,
    updateTask,
    removeTask,
    completeTask,
    
    events,
    loadingEvents,
    addEvent,
    updateEvent,
    removeEvent,
    
    isLoading,
  };
  
  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}