"use client"

import { useState, useEffect } from 'react'
import Sidebar from './sidebar'
import MobileNav from './mobile-nav'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import AuthButton from '@/components/ui/auth-button'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navigation bar */}
      <header className="h-14 border-b px-4 flex items-center justify-between lg:h-16">
        <h1 className="text-lg font-semibold">Focusflow</h1>
        <div className="flex items-center gap-2">
          <AuthButton />
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <Sidebar className="hidden lg:block" />

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav className="lg:hidden" />
    </div>
  )
}