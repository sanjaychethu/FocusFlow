"use client"

import { useState } from 'react'
import { useAppData } from '@/providers/app-data-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react'
import { format, addMonths, subMonths, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { TaskFormDialog } from '../tasks/task-form-dialog'
import { HabitFormDialog } from '../habits/habit-form-dialog'
import { CalendarEvent, Habit, Task } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import AgendaView from './agenda-view'

export default function CalendarView() {
  const { habits, tasks, isLoading } = useAppData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [showHabits, setShowHabits] = useState(true)
  const [showTasks, setShowTasks] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  
  // Handle navigation
  const goToPreviousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }
  
  const goToNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }
  
  // Generate dates for month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Generate dates for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start week on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Generate events for calendar
  const getCalendarEvents = (date: Date): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Add habits
    if (showHabits) {
      habits.forEach(habit => {
        if (!habit.archived) {
          const completion = habit.completions.find(c => c.date === dateStr)
          if (
            // For daily habits
            habit.frequency === 'daily' ||
            // For weekly habits - just show on weekends for simplicity
            (habit.frequency === 'weekly' && [0, 6].includes(date.getDay())) ||
            // For habits with completions on this date
            completion
          ) {
            events.push({
              id: `habit-${habit.id}-${dateStr}`,
              title: habit.title,
              date: dateStr,
              type: 'habit',
              color: habit.color,
              relatedId: habit.id,
            })
          }
        }
      })
    }
    
    // Add tasks
    if (showTasks) {
      tasks.forEach(task => {
        if (task.dueDate === dateStr) {
          events.push({
            id: `task-${task.id}`,
            title: task.title,
            date: dateStr,
            type: 'task',
            color: task.priority === 'high' ? 'hsl(0, 84.2%, 60.2%)' : 
                   task.priority === 'medium' ? 'hsl(220, 70%, 50%)' : 
                   'hsl(0, 0%, 45.1%)',
            relatedId: task.id,
          })
        }
      })
    }
    
    return events
  }
  
  // Handle day selection
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }
  
  // Get tasks and habits for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const selectedDateTasks = tasks.filter(task => task.dueDate === selectedDateStr)
  const selectedDateHabits = habits.filter(habit => {
    if (habit.archived) return false
    
    // Simple filtering - would need more complex logic for real app
    if (habit.frequency === 'daily') return true
    if (habit.frequency === 'weekly' && selectedDate && [0, 6].includes(selectedDate.getDay())) return true
    
    return habit.completions.some(c => c.date === selectedDateStr)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your tasks and habits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHabitForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
          </Button>
          <Button onClick={() => setShowTaskForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPeriod}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {view === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
            }
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPeriod}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="ml-2"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs 
            defaultValue="month" 
            value={view} 
            onValueChange={(v) => setView(v as 'month' | 'week')}
            className="w-[220px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ListFilter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Show/Hide</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showTasks}
                onCheckedChange={setShowTasks}
              >
                Tasks
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showHabits}
                onCheckedChange={setShowHabits}
              >
                Habits
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              {view === 'month' ? (
                // Month view
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {/* Fill in days before the first of the month */}
                    {Array.from({ length: (monthStart.getDay() || 7) - 1 }).map((_, i) => (
                      <div key={`empty-start-${i}`} className="p-2 h-24 border border-transparent" />
                    ))}
                    
                    {/* Render days of the month */}
                    {monthDates.map(date => {
                      const isCurrentMonth = isSameMonth(date, currentDate)
                      const isSelectedDay = selectedDate && isSameDay(date, selectedDate)
                      const events = getCalendarEvents(date)
                      
                      return (
                        <div
                          key={date.toISOString()}
                          className={`p-1 min-h-[6rem] border rounded-md hover:bg-muted/50 transition-colors ${
                            !isCurrentMonth ? 'opacity-40' : ''
                          } ${
                            isToday(date) ? 'bg-primary/5 border-primary/20' : 'border-border'
                          } ${
                            isSelectedDay ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                          onClick={() => handleSelectDate(date)}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${isToday(date) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                              {format(date, 'd')}
                            </span>
                          </div>
                          
                          <div className="mt-1 space-y-1 overflow-hidden max-h-20">
                            {events.map(event => (
                              <div
                                key={event.id}
                                className="text-xs truncate rounded px-1 py-0.5"
                                style={{ 
                                  backgroundColor: `${event.color}20`,
                                  color: event.color,
                                  borderLeft: `3px solid ${event.color}`
                                }}
                              >
                                {event.title}
                              </div>
                            ))}
                            
                            {events.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{events.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Fill in days after the last of the month */}
                    {Array.from({ length: 7 - ((monthEnd.getDay() || 7) - 1) - 1 }).map((_, i) => (
                      <div key={`empty-end-${i}`} className="p-2 h-24 border border-transparent" />
                    ))}
                  </div>
                </div>
              ) : (
                // Week view
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDates.map(date => (
                      <div key={date.toISOString()} className="text-center py-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {format(date, 'EEE')}
                        </div>
                        <div className={`text-xl font-semibold mt-1 ${
                          isToday(date) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''
                        }`}>
                          {format(date, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {weekDates.map(date => {
                      const isSelectedDay = selectedDate && isSameDay(date, selectedDate)
                      const events = getCalendarEvents(date)
                      
                      return (
                        <div
                          key={date.toISOString()}
                          className={`p-2 min-h-[20rem] border rounded-md hover:bg-muted/50 transition-colors ${
                            isToday(date) ? 'bg-primary/5 border-primary/20' : 'border-border'
                          } ${
                            isSelectedDay ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                          onClick={() => handleSelectDate(date)}
                        >
                          <div className="space-y-1">
                            {events.map(event => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded mb-1"
                                style={{ 
                                  backgroundColor: `${event.color}20`,
                                  color: event.color,
                                  borderLeft: `3px solid ${event.color}`
                                }}
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Agenda for selected date */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <AgendaView 
                  date={selectedDate}
                  tasks={selectedDateTasks}
                  habits={selectedDateHabits}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal Forms */}
      <TaskFormDialog 
        open={showTaskForm} 
        onOpenChange={setShowTaskForm} 
      />
      
      <HabitFormDialog 
        open={showHabitForm} 
        onOpenChange={setShowHabitForm} 
      />
    </div>
  )
}