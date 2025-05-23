"use client"

import { format } from 'date-fns'
import { Task, Habit } from '@/lib/types'
import { useAppData } from '@/providers/app-data-provider'
import { CheckCircle, Circle, CalendarDays, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TaskFormDialog } from '../tasks/task-form-dialog'
import HabitCompletionRing from '../habits/habit-completion-ring'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AgendaViewProps {
  date: Date
  tasks: Task[]
  habits: Habit[]
}

export default function AgendaView({ date, tasks, habits }: AgendaViewProps) {
  const { completeHabit, updateTask } = useAppData()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined)
  
  const dateStr = format(date, 'yyyy-MM-dd')
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
  
  const incompleteTasks = tasks.filter(task => task.status !== 'completed')
  const completedTasks = tasks.filter(task => task.status === 'completed')
  
  const handleToggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return
    
    const isCompleted = habit.completions.some(c => c.date === dateStr && c.completed)
    await completeHabit(habitId, dateStr, !isCompleted)
  }
  
  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    await updateTask({
      ...task,
      status: newStatus,
    })
  }
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
    setShowTaskForm(true)
  }
  
  const handleAddTask = () => {
    setTaskToEdit(undefined)
    setShowTaskForm(true)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isToday ? 'Today' : format(date, 'EEEE')}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleAddTask}>
          Add Task
        </Button>
      </div>
      
      {/* Habits section */}
      {habits.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Habits</h3>
          <div className="space-y-3">
            {habits.map(habit => {
              const isCompleted = habit.completions.some(c => c.date === dateStr && c.completed)
              
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <HabitCompletionRing 
                    habit={habit} 
                    date={dateStr} 
                    size={32}
                    onClick={() => handleToggleHabit(habit.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      isCompleted && "line-through opacity-70"
                    )}>
                      {habit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {habit.streakCount} day streak
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Tasks section */}
      <div>
        <h3 className="text-sm font-medium mb-3">Tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks scheduled for this day
          </p>
        ) : (
          <div className="space-y-2">
            {/* Incomplete tasks */}
            {incompleteTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-start gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleEditTask(task)}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full shrink-0 mt-0.5 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleTask(task)
                  }}
                >
                  <Circle className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium truncate">
                      {task.title}
                    </h4>
                    
                    {task.priority && (
                      <Badge variant="outline" className={cn(
                        "text-xs px-1.5 py-0",
                        task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        task.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      )}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <>
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-3 p-2 hover:bg-muted rounded-md cursor-pointer opacity-70"
                      onClick={() => handleEditTask(task)}
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full shrink-0 mt-0.5 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleTask(task)
                        }}
                      >
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate line-through">
                          {task.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Task form dialog */}
      <TaskFormDialog 
        open={showTaskForm} 
        onOpenChange={setShowTaskForm}
        taskToEdit={taskToEdit}
      />
    </div>
  )
}