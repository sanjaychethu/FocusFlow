"use client"

import { useState } from 'react'
import { useAppData } from '@/providers/app-data-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Calendar, LayoutDashboard, ListChecks, CheckCircle, Circle, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import HabitCompletionRing from '@/components/habits/habit-completion-ring'
import { HabitFormDialog } from '@/components/habits/habit-form-dialog'
import { TaskFormDialog } from '@/components/tasks/task-form-dialog'
import TaskItem from '@/components/tasks/task-item'
import { Task } from '@/lib/types'

export default function Dashboard() {
  const { habits, tasks, isLoading } = useAppData()
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d')
  
  // Get tasks due today
  const tasksForToday = tasks.filter(task => {
    if (!task.dueDate) return false
    if (task.status === 'completed') return false
    return task.dueDate === format(today, 'yyyy-MM-dd')
  }).slice(0, 3)
  
  // Calculate task completion stats
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length
  const totalTasksCount = tasks.length
  const taskCompletionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0
  
  // Calculate habit completion for today
  const habitsForToday = habits.filter(habit => {
    // Simple filtering logic - would need to be expanded for weekly/custom frequencies
    return !habit.archived
  })
  
  const todayStr = format(today, 'yyyy-MM-dd')
  const completedHabitsToday = habitsForToday.filter(habit => {
    return habit.completions.some(completion => 
      completion.date === todayStr && completion.completed
    )
  }).length
  
  const habitCompletionRate = habitsForToday.length > 0 
    ? (completedHabitsToday / habitsForToday.length) * 100 
    : 0
  
  // Handle task status update
  const handleTaskStatusChange = async (task: Task, newStatus: 'todo' | 'in-progress' | 'completed') => {
    // This would be handled by the app data provider in a real implementation
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTaskForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
          <Button onClick={() => setShowHabitForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasksCount} / {totalTasksCount}</div>
            <Progress value={taskCompletionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedHabitsToday} / {habitsForToday.length}</div>
            <Progress value={habitCompletionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {habits.length > 0 ? Math.max(...habits.map(h => h.streakCount)) : 0} days
            </div>
            <p className="text-xs text-muted-foreground mt-2">Your longest active streak</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              No upcoming events
            </div>
            <p className="text-xs text-muted-foreground mt-2">Check your calendar</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Habits for Today */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Habits</CardTitle>
            <Link href="/habits">
              <Button variant="ghost" className="h-8 text-sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Circle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="font-medium">No habits yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first habit to start tracking
                </p>
                <Button className="mt-4" onClick={() => setShowHabitForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Habit
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {habitsForToday.slice(0, 5).map(habit => (
                  <div key={habit.id} className="flex items-center gap-4">
                    <HabitCompletionRing 
                      habit={habit} 
                      date={todayStr} 
                      size={36}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{habit.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {habit.streakCount > 0 ? `${habit.streakCount} day streak` : 'Start your streak today'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {habits.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/habits">
                      <Button variant="ghost" className="text-sm">
                        View all {habits.length} habits
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tasks for Today */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>Tasks due today</CardDescription>
            </div>
            <Link href="/tasks">
              <Button variant="ghost" className="h-8 text-sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ListChecks className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="font-medium">No tasks yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first task to get started
                </p>
                <Button className="mt-4" onClick={() => setShowTaskForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </div>
            ) : tasksForToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="font-medium">No tasks due today</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You're all caught up!
                </p>
                <Button className="mt-4" onClick={() => setShowTaskForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasksForToday.map(task => (
                  <TaskItem key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
                ))}
                
                {tasks.length > tasksForToday.length && (
                  <div className="text-center pt-2">
                    <Link href="/tasks">
                      <Button variant="ghost" className="text-sm">
                        View all {tasks.length} tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal Forms */}
      <HabitFormDialog 
        open={showHabitForm} 
        onOpenChange={setShowHabitForm} 
      />
      
      <TaskFormDialog 
        open={showTaskForm} 
        onOpenChange={setShowTaskForm} 
      />
    </div>
  )
}