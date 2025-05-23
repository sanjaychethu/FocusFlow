"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAppData } from '@/providers/app-data-provider'
import { Habit, HabitFrequency } from '@/lib/types'
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
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Activity, Heart, Brain, Dumbbell, Book, Coffee, Sun } from 'lucide-react'

// Schema for form validation
const habitFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  customDays: z.array(z.number()).optional(),
})

type HabitFormValues = z.infer<typeof habitFormSchema>

// Props for the dialog component
interface HabitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habitToEdit?: Habit
}

// Available color options
const colorOptions = [
  { value: 'hsl(12, 76%, 61%)', label: 'Coral' },
  { value: 'hsl(43, 74%, 66%)', label: 'Yellow' },
  { value: 'hsl(173, 58%, 39%)', label: 'Teal' },
  { value: 'hsl(220, 70%, 50%)', label: 'Blue' },
  { value: 'hsl(280, 65%, 60%)', label: 'Purple' },
  { value: 'hsl(340, 75%, 55%)', label: 'Pink' },
]

// Icon options
const iconOptions = [
  { value: 'activity', icon: Activity, label: 'Activity' },
  { value: 'heart', icon: Heart, label: 'Heart' },
  { value: 'brain', icon: Brain, label: 'Brain' },
  { value: 'dumbbell', icon: Dumbbell, label: 'Fitness' },
  { value: 'book', icon: Book, label: 'Reading' },
  { value: 'coffee', icon: Coffee, label: 'Coffee' },
  { value: 'sun', icon: Sun, label: 'Wellness' },
]

export function HabitFormDialog({ open, onOpenChange, habitToEdit }: HabitFormDialogProps) {
  const { addHabit, updateHabit } = useAppData()
  const [submitting, setSubmitting] = useState(false)
  
  // Set up form with default values
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: habitToEdit ? {
      title: habitToEdit.title,
      description: habitToEdit.description || '',
      color: habitToEdit.color,
      icon: habitToEdit.icon || 'activity',
      frequency: habitToEdit.frequency,
      customDays: habitToEdit.customFrequency?.days,
    } : {
      title: '',
      description: '',
      color: colorOptions[0].value,
      icon: 'activity',
      frequency: 'daily' as HabitFrequency,
      customDays: [1, 2, 3, 4, 5],
    },
  })
  
  // Handle form submission
  const onSubmit = async (data: HabitFormValues) => {
    setSubmitting(true)
    
    try {
      if (habitToEdit) {
        // Update existing habit
        await updateHabit({
          ...habitToEdit,
          title: data.title,
          description: data.description,
          color: data.color,
          icon: data.icon,
          frequency: data.frequency,
          customFrequency: data.frequency === 'custom' ? {
            days: data.customDays || [],
          } : undefined,
        })
      } else {
        // Create new habit
        await addHabit({
          title: data.title,
          description: data.description,
          color: data.color,
          icon: data.icon,
          frequency: data.frequency,
          customFrequency: data.frequency === 'custom' ? {
            days: data.customDays || [],
          } : undefined,
          archived: false,
        })
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save habit:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{habitToEdit ? 'Edit habit' : 'Create a new habit'}</DialogTitle>
          <DialogDescription>
            {habitToEdit 
              ? 'Update your habit details below.'
              : 'Add a new habit to track your progress and build consistency.'}
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
                    <Input placeholder="e.g., Morning Meditation" {...field} />
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
                    <Input placeholder="e.g., 10 minutes of mindfulness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-2"
                    >
                      {colorOptions.map((color) => (
                        <FormItem key={color.value} className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={color.value}
                              id={`color-${color.value}`}
                              className="sr-only"
                            />
                          </FormControl>
                          <label
                            htmlFor={`color-${color.value}`}
                            className={`h-8 w-8 rounded-full cursor-pointer ring-offset-2 transition-all ${
                              field.value === color.value ? "ring-2 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: color.value }}
                          />
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency"
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
                          <RadioGroupItem value="custom" id="frequency-custom" />
                        </FormControl>
                        <FormLabel htmlFor="frequency-custom" className="cursor-pointer">
                          Custom
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch('frequency') === 'custom' && (
              <FormField
                control={form.control}
                name="customDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom days</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 1, label: 'Mon' },
                        { value: 2, label: 'Tue' },
                        { value: 3, label: 'Wed' },
                        { value: 4, label: 'Thu' },
                        { value: 5, label: 'Fri' },
                        { value: 6, label: 'Sat' },
                        { value: 0, label: 'Sun' },
                      ].map((day) => (
                        <FormItem
                          key={day.value}
                          className="flex items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || []
                                if (checked) {
                                  field.onChange([...currentValues, day.value])
                                } else {
                                  field.onChange(
                                    currentValues.filter((value) => value !== day.value)
                                  )
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">{day.label}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormDescription>
                      Select the days of the week for this habit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {habitToEdit ? 'Update habit' : 'Create habit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}