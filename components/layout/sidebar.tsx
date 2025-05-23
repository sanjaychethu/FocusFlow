"use client"

import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, CalendarDays, CheckSquare, BarChart3, Settings, PlusCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

type SidebarProps = {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const mainNavItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Habits', href: '/habits', icon: BarChart3 },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  ]

  return (
    <div className={cn("w-64 border-r shrink-0 bg-background", className)}>
      <ScrollArea className="h-full py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6 px-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <PlusCircle size={16} />
              <span>New task</span>
            </Button>
          </div>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "font-medium"
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
          <Separator className="my-4" />
          <div className="space-y-1">
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings size={16} />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}