'use client'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import AnomalyBadge from '@/components/dashboard/AnomalyBadge'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { useCurrentUser } from '@/hooks/useAuth'

export default function Navbar() {
  const { data: user } = useCurrentUser()
  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 gap-3 flex-shrink-0 transition-colors duration-200">
      {/* Mobile Branding (visible only when desktop sidebar is hidden) */}
      <div className="flex md:hidden items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4A90e2] flex items-center justify-center text-white font-black text-sm shadow-sm">
            O
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Orchestra</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <AnomalyBadge />

        <ThemeToggle />

        <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border bg-card transition-all duration-200 shadow-sm" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4A90e2] rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A90e2] to-[#3B78C4] flex items-center justify-center text-white font-bold text-xs sm:text-sm select-none shadow-sm" title={user?.name || user?.email}>
          {initial}
        </div>
      </div>
    </header>
  )
}
