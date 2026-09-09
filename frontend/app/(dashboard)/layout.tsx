'use client'
import Sidebar from '@/components/shared/Sidebar'
import Navbar from '@/components/shared/Navbar'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { tokenStorage } from '@/utils/tokenStorage'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)

  // Full Canvas routes — no padding, no scroll wrapper; the page owns its own layout
  const isFullCanvas = pathname === '/chat'

  useEffect(() => {
    const check = () => {
      const token = tokenStorage.getToken()
      if (!token) {
        router.replace('/login')
      } else {
        setAuthChecked(true)
      }
    }

    check()

    // Re-check when storage changes (e.g. logout in another tab, or 401 handler clears token)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'orchestra_token' && !e.newValue) {
        router.replace('/login')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [router])

  // Don't render dashboard at all until we've confirmed auth
  if (!authChecked) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center animate-pulse">
            <span className="text-white font-bold">O</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* <Navbar /> */}
        {isFullCanvas ? (
          // Full Canvas mode — zero padding, overflow hidden, page manages its own height
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        ) : (
          // Standard dashboard pages — padded scrollable main
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        )}
      </div>
    </div>
  )
}
