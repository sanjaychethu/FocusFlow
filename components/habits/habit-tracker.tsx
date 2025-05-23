"use client"

import { useState } from 'react'
import { useAppData } from '@/providers/app-data-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, CalendarDays, BarChart, List } from 'lucide-react'
import { format, startOfWeek, addDays } from 'date-fns'
import { HabitFormDialog } from './habit-form-dialog'
import HabitItem from './habit-item'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HabitCompletionRing from './habit-completion-ring'
import { Habit } from '@/lib/types'

export default function HabitTracker() {
  const { habits, loadingHabits } = useAppData()
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'list' | 'grid'>('list')
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  // Generate week dates for the weekly view
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))
  
  // Calculate completion stats
  const activeHabits = habits.filter(habit => !habit.archived)
  const completedToday = activeHabits.filter(habit => 
    habit.completions.some(c => c.date === dateStr && c.completed)
  ).length
  
  const completionRate = activeHabits.length > 0 
    ? Math.round((completedToday / activeHabits.length) * 100) 
    : 0
  
  // Get top streaks
  const topStreaks = [...habits]
    .sort((a, b) => b.streakCount - a.streakCount)
    .slice(0, 3)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            {completedToday} of {activeHabits.length} habits completed today ({completionRate}%)
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-muted rounded-md p-1 flex">
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setView('grid')}
            >
              <BarChart className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
          </div>
          <Button onClick={() => setShowHabitForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="today" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="all">All Habits</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="today" className="space-y-4">
          {activeHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full border-4 border-muted p-4 mb-4">
                <CalendarDays className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight mb-2">No habits yet</h2>
              <p className="text-muted-foreground max-w-sm mb-4">
                Start building positive routines by creating your first habit
              </p>
              <Button onClick={() => setShowHabitForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Habit
              </Button>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-2">
              {activeHabits.map(habit => (
                <HabitItem 
                  key={habit.id} 
                  habit={habit} 
                  date={dateStr}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {activeHabits.map(habit => (
                <Card key={habit.id} className="overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <HabitCompletionRing habit={habit} date={dateStr} size={64} />
                    <h3 className="font-medium mt-3">{habit.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {habit.streakCount} day streak
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="week" className="space-y-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDates.map((date) => {
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              const dayStr = format(date, 'yyyy-MM-dd')
              
              return (
                <div 
                  key={dayStr} 
                  className={`text-center p-2 cursor-pointer rounded-md ${
                    isToday ? 'bg-primary/10' : 'hover:bg-muted'
                  } ${
                    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                      ? 'border-2 border-primary' 
                      : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="text-xs font-medium">{format(date, 'EEE')}</div>
                  <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>
                    {format(date, 'd')}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="space-y-2">
            {activeHabits.map(habit => (
              <HabitItem 
                key={habit.id} 
                habit={habit} 
                date={format(selectedDate, 'yyyy-MM-dd')}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Streaks */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Top Streaks</h3>
                {topStreaks.length > 0 ? (
                  <div className="space-y-4">
                    {topStreaks.map((habit) => (
                      <div key={habit.id} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-primary/10">
                          {habit.streakCount}
                        </div>
                        <div>
                          <h4 className="font-medium">{habit.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {habit.streakCount} day streak
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Complete habits consistently to build streaks
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* All Habits List */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">All Habits</h3>
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-8 rounded-full" 
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="font-medium">{habit.title}</span>
                      </div>
                      {habit.archived && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <HabitFormDialog 
        open={showHabitForm} 
        onOpenChange={setShowHabitForm} 
      />
    </div>
  )
}