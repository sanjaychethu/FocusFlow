"use client"

import { Task, TaskStatus } from '@/lib/types'
import { useAppData } from '@/providers/app-data-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Tag, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  ArrowRight,
  CircleCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface TaskItemProps {
  task: Task
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  onEdit?: () => void
}

export default function TaskItem({ task, onStatusChange, onEdit }: TaskItemProps) {
  const { removeTask } = useAppData()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const handleStatusToggle = async () => {
    if (task.status === 'completed') {
      onStatusChange(task, 'todo')
    } else {
      onStatusChange(task, 'completed')
    }
  }
  
  const handleMoveToInProgress = async () => {
    onStatusChange(task, 'in-progress')
  }
  
  const handleDeleteTask = async () => {
    await removeTask(task.id)
    setShowDeleteDialog(false)
  }
  
  // Determine the due date display
  let dueDisplay = null
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate)
    dueDisplay = formatDistanceToNow(dueDate, { addSuffix: true })
  }
  
  // Priority color
  const priorityColor = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }[task.priority]
  
  return (
    <>
      <Card className={cn(
        "flex items-start gap-3 p-4 transition-colors",
        task.status === 'completed' && "bg-muted/50"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 rounded-full shrink-0 mt-0.5 p-0"
          onClick={handleStatusToggle}
        >
          {task.status === 'completed' ? (
            <CheckCircle className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn(
              "font-medium text-base",
              task.status === 'completed' && "line-through opacity-70"
            )}>
              {task.title}
            </h3>
            
            {task.priority && (
              <Badge variant="outline" className={cn("text-xs px-1.5 py-0", priorityColor)}>
                {task.priority}
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{dueDisplay}</span>
              </div>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{task.tags.slice(0, 2).join(', ')}{task.tags.length > 2 ? '...' : ''}</span>
              </div>
            )}
            
            {task.subTasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>
                  {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex shrink-0 gap-1">
          {task.status === 'todo' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleMoveToInProgress}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Move to In Progress</span>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStatusToggle}>
                <CircleCheck className="h-4 w-4 mr-2" />
                {task.status === 'completed' ? 'Mark as todo' : 'Mark as completed'}
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
        </div>
      </Card>
      
      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}