"use client"

import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, CalendarDays, CheckSquare, BarChart3, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

type MobileNavProps = {
  className?: string
}

export default function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Habits', href: '/habits', icon: BarChart3 },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  ]

  return (
    <div className={cn("h-16 border-t bg-background", className)}>
      <div className="grid h-full grid-cols-4 items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="flex flex-col items-center justify-center">
                <Icon size={20} />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 w-8 bg-primary"
                    layoutId="activeTab"
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Floating action button */}
      <Button
        size="icon"
        className="rounded-full absolute right-4 bottom-20 shadow-lg h-12 w-12"
      >
        <PlusCircle size={24} />
      </Button>
    </div>
  )
}