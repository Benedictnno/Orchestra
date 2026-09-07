'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'orchestra_theme'
const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDOM(targetResolved: ResolvedTheme) {
  const root = document.documentElement
  if (targetResolved === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      return stored || defaultTheme
    } catch {
      return defaultTheme
    }
  })
  const mounted = useIsMounted()

  const resolvedTheme: ResolvedTheme = theme === 'system' 
    ? (mounted ? getSystemTheme() : 'dark') 
    : theme

  // Synchronize theme to DOM on mount and change
  useEffect(() => {
    applyThemeToDOM(theme === 'system' ? getSystemTheme() : theme)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {}

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    applyThemeToDOM(resolved)
  }, [])

  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }, [resolvedTheme, setTheme])

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme()
        applyThemeToDOM(resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme
        setThemeState(newTheme)
        const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
        applyThemeToDOM(resolved)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
