'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center opacity-60">
        <span className="w-4 h-4 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative p-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted/80 hover:text-brand transition-all duration-200 shadow-sm flex items-center justify-center group"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          size={18}
          className={`absolute transition-all duration-300 text-amber-500 ${
            isDark
              ? 'scale-0 rotate-90 opacity-0 pointer-events-none'
              : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          size={18}
          className={`absolute transition-all duration-300 text-sky-400 ${
            isDark
              ? 'scale-100 rotate-0 opacity-100'
              : 'scale-0 -rotate-90 opacity-0 pointer-events-none'
          }`}
        />
      </div>
    </button>
  )
}
