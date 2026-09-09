'use client'
import { useState } from 'react'
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
  Menu,
  X,
  Send,
  Zap,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLogout, useCurrentUser } from '@/hooks/useAuth'

const navItems = [
  { href: '/dashboard',     label: 'Overview',      icon: LayoutDashboard },
  { href: '/transactions',  label: 'Transactions',  icon: History },
  { href: '/cards',         label: 'My Cards',      icon: CreditCard },
  { href: '/virtual-cards', label: 'Virtual Cards', icon: Layers },
  { href: '/transfers',     label: 'Send Money',    icon: Send },
  { href: '/bills',         label: 'Pay Bills',     icon: Zap },
  { href: '/business',      label: 'Business',      icon: Briefcase },
  { href: '/insights',      label: 'AI Insights',   icon: Sparkles },
  { href: '/chat',          label: 'Ask Orchestra', icon: MessageSquare },
]

const primaryMobileNav = [
  { href: '/dashboard',    label: 'Overview',     icon: LayoutDashboard },
  { href: '/cards',        label: 'Cards',        icon: CreditCard },
  { href: '/transactions', label: 'History',      icon: History },
  { href: '/insights',     label: 'Insights',     icon: Sparkles },
]

export default function Sidebar() {
  const pathname = usePathname()
  const logout = useLogout()
  const { data: user } = useCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isMoreActive = !primaryMobileNav.some(item => 
    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#4A90e2] flex-col h-full flex-shrink-0 text-white shadow-xl z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/15">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-base">O</span>
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight leading-none block">Orchestra</span>
              <p className="text-white/70 text-[11px] font-medium mt-0.5">Financial OS</p>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white/25 backdrop-blur-md border border-white/40 text-white shadow-lg shadow-black/5 font-bold translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                )}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-white/80'} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user hint & logout */}
        <div className="px-4 py-4 border-t border-white/15 space-y-2">
          {user && (
            <div className="px-3.5 py-2 rounded-xl bg-white/10 text-xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white uppercase text-xs">
                {user.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate text-xs">{user.name || 'User'}</p>
                <p className="text-white/60 text-[10px] truncate">{user.email || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#4A90e2]/95 backdrop-blur-lg z-40 flex justify-around items-center px-2 py-1.5 border-t border-white/15 shadow-2xl safe-area-pb">
        {primaryMobileNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all',
                active
                  ? 'text-white bg-white/20 font-bold shadow-sm'
                  : 'text-white/70 hover:text-white'
              )}
            >
              <Icon size={19} />
              <span className="text-[10px] tracking-tight">{label}</span>
            </Link>
          )
        })}

        {/* More Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all',
            isMoreActive || mobileMenuOpen
              ? 'text-white bg-white/20 font-bold shadow-sm'
              : 'text-white/70 hover:text-white'
          )}
          aria-label="Open full menu"
        >
          <Menu size={19} />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile Drawer / Slide-Over Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div 
            className="absolute inset-0"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-[#4A90e2] text-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                  <span>O</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">Orchestra Menu</h3>
                  <p className="text-white/70 text-xs">{user?.name || 'Your Financial Hub'}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Grid in Drawer */}
            <div className="p-4 overflow-y-auto space-y-1.5 max-h-[55vh]">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                      active
                        ? 'bg-white/25 border border-white/40 text-white font-bold shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/15 bg-black/10">
              <button
                onClick={() => { setMobileMenuOpen(false); logout() }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
