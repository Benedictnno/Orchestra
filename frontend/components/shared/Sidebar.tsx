'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  Layers,
  History,
  Briefcase,
  Sparkles,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLogout } from '@/hooks/useAuth'

const navItems = [
  { href: '/dashboard',     label: 'Overview',      icon: LayoutDashboard },
  { href: '/transactions',  label: 'Transactions',  icon: History },
  { href: '/cards',         label: 'My Cards',      icon: CreditCard },
  { href: '/virtual-cards', label: 'Virtual Cards', icon: Layers },
  { href: '/business',      label: 'Business',      icon: Briefcase },
  { href: '/insights',      label: 'AI Insights',   icon: Sparkles },
  { href: '/chat',          label: 'Ask Orchestra', icon: MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const logout = useLogout()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#1A1A2E] flex-col h-full flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E94560] flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Orchestra</span>
          </div>
          <p className="text-white/40 text-xs mt-1">Financial OS</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user hint */}
        <div className="px-4 py-5 border-t border-white/10 space-y-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A2E] z-40 flex justify-around items-center px-2 py-2 border-t border-white/10">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all',
                active ? 'text-[#E94560]' : 'text-white/50'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
