"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAppData } from '@/providers/app-data-provider'
import { Task, SubTask } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, X, Check, Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { v4 as uuidv4 } from 'uuid'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

// Schema for form validation
const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional().nullable(),
  subTasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
    })
  ),
  tags: z.array(z.string()),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurringInterval: z.number().min(1).optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

// Props for the dialog component
interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskToEdit?: Task
}

export function TaskFormDialog({ open, onOpenChange, taskToEdit }: TaskFormDialogProps) {
  const { addTask, updateTask } = useAppData()
  const [newTag, setNewTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Set up form with default values
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskToEdit ? {
      title: taskToEdit.title,
      description: taskToEdit.description || '',
      priority: taskToEdit.priority,
      dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
      subTasks: taskToEdit.subTasks,
      tags: taskToEdit.tags,
      isRecurring: taskToEdit.isRecurring,
      recurringFrequency: taskToEdit.recurringPattern?.frequency,
      recurringInterval: taskToEdit.recurringPattern?.interval,
    } : {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: null,
      subTasks: [],
      tags: [],
      isRecurring: false,
    },
  })
  
  // Watch for recurring flag
  const isRecurring = form.watch('isRecurring')
  
  // Handle form submission
  const onSubmit = async (data: TaskFormValues) => {
    setSubmitting(true)
    
    try {
      if (taskToEdit) {
        // Update existing task
        await updateTask({
          ...taskToEdit,
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
          subTasks: data.subTasks,
          tags: data.tags,
          isRecurring: data.isRecurring,
          recurringPattern: data.isRecurring ? {
            frequency: data.recurringFrequency || 'daily',
            interval: data.recurringInterval || 1,
          } : undefined,
        })
      } else {
        // Create new task
        await addTask({
          title: data.title,
          description: data.description,
          status: 'todo',
          priority: data.priority,
          dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
          subTasks: data.subTasks,
          tags: data.tags,
          isRecurring: data.isRecurring,
          recurringPattern: data.isRecurring ? {
            frequency: data.recurringFrequency || 'daily',
            interval: data.recurringInterval || 1,
          } : undefined,
        })
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  // Handle adding a subtask
  const addSubTask = () => {
    const currentSubTasks = form.getValues('subTasks') || []
    form.setValue('subTasks', [
      ...currentSubTasks,
      { id: uuidv4(), title: '', completed: false },
    ])
  }
  
  // Handle removing a subtask
  const removeSubTask = (index: number) => {
    const currentSubTasks = form.getValues('subTasks')
    form.setValue('subTasks', currentSubTasks.filter((_, i) => i !== index))
  }
  
  // Handle adding a tag
  const addTag = () => {
    if (!newTag.trim()) return
    
    const currentTags = form.getValues('tags') || []
    if (!currentTags.includes(newTag.trim())) {
      form.setValue('tags', [...currentTags, newTag.trim()])
    }
    setNewTag('')
  }
  
  // Handle removing a tag
  const removeTag = (tag: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(t => t !== tag))
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit task' : 'Create a new task'}</DialogTitle>
          <DialogDescription>
            {taskToEdit 
              ? 'Update your task details below.'
              : 'Add a new task with details, due date, and subtasks.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details about this task..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-2"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem 
                              value="low" 
                              id="priority-low" 
                              className="sr-only peer"
                            />
                          </FormControl>
                          <label
                            htmlFor="priority-low"
                            className={`px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer border ${
                              field.value === 'low' 
                                ? 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600' 
                                : 'bg-transparent hover:bg-muted'
                            }`}
                          >
                            Low
                          </label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem 
                              value="medium" 
                              id="priority-medium" 
                              className="sr-only peer"
                            />
                          </FormControl>
                          <label
                            htmlFor="priority-medium"
                            className={`px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer border ${
                              field.value === 'medium' 
                                ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' 
                                : 'bg-transparent hover:bg-muted'
                            }`}
                          >
                            Medium
                          </label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem 
                              value="high" 
                              id="priority-high" 
                              className="sr-only peer"
                            />
                          </FormControl>
                          <label
                            htmlFor="priority-high"
                            className={`px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer border ${
                              field.value === 'high' 
                                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-800' 
                                : 'bg-transparent hover:bg-muted'
                            }`}
                          >
                            High
                          </label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {field.value?.map(tag => (
                      <Badge key={tag} className="px-2 py-1">
                        {tag}
                        <button
                          type="button"
                          className="ml-1.5 h-3.5 w-3.5 rounded-full hover:bg-muted"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {tag}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      className="rounded-r-none"
                    />
                    <Button 
                      type="button"
                      variant="secondary"
                      className="rounded-l-none"
                      onClick={addTag}
                    >
                      Add
                    </Button>
                  </div>
                  <FormDescription>
                    Press Enter or click Add to add a tag
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subTasks"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Subtasks</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={addSubTask}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add subtask
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {field.value?.map((subtask, index) => (
                      <div key={subtask.id || index} className="flex items-center gap-2">
                        <Checkbox
                          id={`subtask-${index}`}
                          checked={subtask.completed}
                          onCheckedChange={(checked) => {
                            const updatedSubtasks = [...field.value]
                            updatedSubtasks[index] = {
                              ...updatedSubtasks[index],
                              completed: checked as boolean,
                            }
                            form.setValue('subTasks', updatedSubtasks)
                          }}
                        />
                        <Input
                          placeholder="Subtask description"
                          value={subtask.title}
                          onChange={(e) => {
                            const updatedSubtasks = [...field.value]
                            updatedSubtasks[index] = {
                              ...updatedSubtasks[index],
                              title: e.target.value,
                            }
                            form.setValue('subTasks', updatedSubtasks)
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeSubTask(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                    
                    {field.value.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No subtasks yet. Add one to break down this task.
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Task</FormLabel>
                    <FormDescription>
                      Make this task repeat on a schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="daily" id="frequency-daily" />
                            </FormControl>
                            <FormLabel htmlFor="frequency-daily" className="cursor-pointer">
                              Daily
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="weekly" id="frequency-weekly" />
                            </FormControl>
                            <FormLabel htmlFor="frequency-weekly" className="cursor-pointer">
                              Weekly
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="monthly" id="frequency-monthly" />
                            </FormControl>
                            <FormLabel htmlFor="frequency-monthly" className="cursor-pointer">
                              Monthly
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recurringInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat every</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                          value={field.value || 1}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch('recurringFrequency') === 'daily' && 'days'}
                        {form.watch('recurringFrequency') === 'weekly' && 'weeks'}
                        {form.watch('recurringFrequency') === 'monthly' && 'months'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {taskToEdit ? 'Update task' : 'Create task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}