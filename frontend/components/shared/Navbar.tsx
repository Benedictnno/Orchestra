'use client'
import { Bell } from 'lucide-react'
import AnomalyBadge from '@/components/dashboard/AnomalyBadge'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { useEffect, useState } from 'react'
import { tokenStorage } from '@/utils/tokenStorage'

function parseInitial(): string {
  try {
    const token = tokenStorage.getToken()
    if (!token) return 'U'
    // Our token is a base64-encoded JSON object, not a 3-part JWT.
    const payload = JSON.parse(atob(token))
    const name: string = payload?.name || payload?.email || 'User'
    return name.charAt(0).toUpperCase()
  } catch {
    return 'U'
  }
}

export default function Navbar() {
  const [initial, setInitial] = useState('U')

  useEffect(() => {
    setInitial(parseInitial())
  }, [])

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-6 gap-4 flex-shrink-0 transition-colors duration-200">
      <div className="ml-auto flex items-center gap-3">
        <AnomalyBadge />

        <ThemeToggle />

        <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border bg-card transition-all duration-200 shadow-sm">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4A90e2] rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A90e2] to-[#3B78C4] flex items-center justify-center text-white font-bold text-sm select-none shadow-sm">
          {initial}
        </div>
      </div>
    </header>
  )
}

