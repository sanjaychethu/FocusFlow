"use client"

import { useState } from 'react'
import { Habit } from '@/lib/types'
import { useAppData } from '@/providers/app-data-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, MoreHorizontal, Edit, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HabitFormDialog } from './habit-form-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface HabitItemProps {
  habit: Habit
  date: string
}

export default function HabitItem({ habit, date }: HabitItemProps) {
  const { completeHabit, removeHabit, updateHabit } = useAppData()
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const completion = habit.completions.find(c => c.date === date)
  const isCompleted = completion?.completed || false
  
  const handleToggleCompletion = async () => {
    await completeHabit(habit.id, date, !isCompleted)
  }
  
  const handleArchiveHabit = async () => {
    await updateHabit({
      ...habit,
      archived: !habit.archived,
    })
  }
  
  const handleDeleteHabit = async () => {
    await removeHabit(habit.id)
    setShowDeleteDialog(false)
  }
  
  return (
    <>
      <Card className={cn(
        "flex items-center gap-3 p-4 transition-colors",
        isCompleted && "bg-primary/5"
      )}>
        <Button 
          variant={isCompleted ? "default" : "outline"} 
          size="icon" 
          className="h-10 w-10 rounded-full shrink-0"
          onClick={handleToggleCompletion}
          style={{ 
            backgroundColor: isCompleted ? habit.color : undefined,
            borderColor: habit.color
          }}
        >
          {isCompleted && <Check className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-medium text-base truncate",
              isCompleted && "line-through opacity-70"
            )}>
              {habit.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {habit.streakCount > 0 
                ? `${habit.streakCount} day streak` 
                : "Start your streak today"}
            </span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowHabitForm(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchiveHabit}>
              {habit.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
      
      {/* Edit Modal */}
      <HabitFormDialog 
        open={showHabitForm} 
        onOpenChange={setShowHabitForm} 
        habitToEdit={habit}
      />
      
      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit "{habit.title}" and all of its completion data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}