"use client"

import { useAppData } from '@/providers/app-data-provider'
import { Habit } from '@/lib/types'
import { Circle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitCompletionRingProps {
  habit: Habit
  date: string
  size?: number
  onClick?: () => void
}

export default function HabitCompletionRing({ 
  habit, 
  date, 
  size = 40,
  onClick
}: HabitCompletionRingProps) {
  const { completeHabit } = useAppData()
  
  const completion = habit.completions.find(c => c.date === date)
  const isCompleted = completion?.completed || false
  
  const handleClick = async () => {
    if (onClick) {
      onClick()
    } else {
      await completeHabit(habit.id, date, !isCompleted)
    }
  }
  
  return (
    <div 
      className={cn(
        "relative rounded-full cursor-pointer transition-all flex items-center justify-center",
        isCompleted ? "bg-primary/10" : "bg-muted hover:bg-muted/80"
      )} 
      style={{ 
        width: size, 
        height: size,
      }}
      onClick={handleClick}
    >
      {isCompleted ? (
        <CheckCircle2 
          className="text-primary"
          style={{ color: habit.color }}
          size={size * 0.65} 
        />
      ) : (
        <Circle 
          className="text-muted-foreground" 
          size={size * 0.65} 
          style={{ color: habit.color, opacity: 0.5 }}
        />
      )}
      
      {/* Circular progress indicator */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-0 left-0 rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 2}
          strokeWidth="2"
          stroke={habit.color}
          fill="none"
          strokeDasharray={(size - 4) * Math.PI}
          strokeDashoffset={isCompleted ? 0 : (size - 4) * Math.PI * 0.75}
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  )
}