'use client'
import { useState, useEffect, Suspense } from 'react'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLogout, useCurrentUser } from '@/hooks/useAuth'
import { useChatSessions, useDeleteChatSession } from '@/hooks/useInsights'
import toast from 'react-hot-toast'

// ─── Nav sections ──────────────────────────────────────────────────────────────

const intelligenceItems = [
  { href: '/insights', label: 'AI Insights',   icon: Sparkles },
  { href: '/chat',    label: 'Ask Orchestra', icon: MessageSquare, isChat: true },
]

const bankingItems = [
  { href: '/dashboard',     label: 'Overview',      icon: LayoutDashboard },
  { href: '/transactions',  label: 'Transactions',  icon: History },
  { href: '/cards',         label: 'My Cards',      icon: CreditCard },
  { href: '/virtual-cards', label: 'Virtual Cards', icon: Layers },
  { href: '/transfers',     label: 'Send Money',    icon: Send },
  { href: '/bills',         label: 'Pay Bills',     icon: Zap },
  { href: '/business',      label: 'Business',      icon: Briefcase },
]

const primaryMobileNav = [
  { href: '/dashboard',    label: 'Overview',     icon: LayoutDashboard },
  { href: '/cards',        label: 'Cards',        icon: CreditCard },
  { href: '/transactions', label: 'History',      icon: History },
  { href: '/insights',     label: 'Insights',     icon: Sparkles },
]

// ─── Tooltip wrapper (collapsed mode) ─────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <span className="
        pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
        px-2.5 py-1.5 rounded-lg bg-[#1a2a4a] text-white text-xs font-semibold whitespace-nowrap shadow-xl
        opacity-0 group-hover/tip:opacity-100 scale-95 group-hover/tip:scale-100
        transition-all duration-150
      ">
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a2a4a]" />
      </span>
    </div>
  )
}

// ─── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-auto my-1.5 w-5 h-px bg-white/20 rounded-full" />
  }
  return (
    <p className="px-3.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40 select-none">
      {children}
    </p>
  )
}

// ─── Sidebar inner content ─────────────────────────────────────────────────────

function SidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const logout = useLogout()
  const { data: user } = useCurrentUser()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatDropdownOpen, setChatDropdownOpen] = useState(true)

  const isChatRoute = pathname.startsWith('/chat')
  const currentSessionId = searchParams.get('session')

  const { data: sessionsData, isLoading: sessionsLoading } = useChatSessions()
  const deleteSessionMutation = useDeleteChatSession()
  const sessions = sessionsData?.sessions || []

  // Persist collapsed state across page loads
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev))
      return !prev
    })
  }

  // Auto-expand dropdown when entering /chat
  useEffect(() => {
    if (isChatRoute) setChatDropdownOpen(true)
  }, [isChatRoute])

  // Also expand sidebar when entering chat so history is visible
  useEffect(() => {
    if (isChatRoute && collapsed) {
      setCollapsed(false)
      localStorage.setItem('sidebar-collapsed', 'false')
    }
  }, [isChatRoute])

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId)
      toast.success('Chat deleted')
      if (currentSessionId === sessionId) router.push('/chat')
    } catch {
      toast.error('Failed to delete chat')
    }
  }

  const handleNewChat = () => {
    setMobileMenuOpen(false)
    router.push(`/chat?new=${Date.now()}`)
  }

  const isMoreActive = !primaryMobileNav.some(item =>
    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
  )

  // ── Chat submenu (only shown when expanded) ──────────────────────────────────
  const renderChatSubmenu = (isMobile = false) => (
    <div className="pl-3 pr-1 pt-1 pb-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <button
        type="button"
        onClick={handleNewChat}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-dashed shadow-sm',
          !currentSessionId && isChatRoute
            ? 'bg-white/30 border-white text-white shadow-md'
            : 'border-white/30 text-white/90 hover:bg-white/20 hover:border-white/60 bg-white/10'
        )}
      >
        <div className="flex items-center gap-2">
          <Plus size={13} className="text-white" />
          <span>New Chat</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">AI</span>
      </button>

      {sessionsLoading ? (
        <div className="px-3 py-2 space-y-1.5">
          <div className="h-3 bg-white/20 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/15 rounded animate-pulse w-1/2" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="px-3 py-1.5 text-[11px] text-white/60 italic">No saved chats yet</div>
      ) : (
        <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {sessions.map((s) => {
            const isSessionActive = isChatRoute && currentSessionId === s._id
            return (
              <div
                key={s._id}
                className={cn(
                  'group/item flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all',
                  isSessionActive
                    ? 'bg-white/25 text-white font-bold shadow-sm border border-white/35'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                <Link
                  href={`/chat?session=${s._id}`}
                  onClick={() => { if (isMobile) setMobileMenuOpen(false) }}
                  className="flex items-center gap-2 min-w-0 flex-1 py-0.5"
                  title={s.title}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isSessionActive ? 'bg-white' : 'bg-white/50')} />
                  <span className="truncate text-[11px] leading-tight">{s.title || 'Conversation'}</span>
                </Link>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSession(s._id) }}
                  className="opacity-0 group-hover/item:opacity-100 p-1 text-white/50 hover:text-white hover:bg-red-500/40 rounded-lg transition-all shrink-0"
                  title="Delete chat"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // ── Render a single nav item — aware of collapsed state ──────────────────────
  const renderNavItem = (
    { href, label, icon: Icon, isChat }: typeof intelligenceItems[0],
    isMobile = false
  ) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

    if (isChat) {
      if (collapsed) {
        return (
          <Tooltip key={href} label={label}>
            <Link
              href={href}
              className={cn(
                'flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200',
                isChatRoute ? 'bg-white/25 border border-white/40 text-white shadow-md' : 'text-white/80 hover:text-white hover:bg-white/15'
              )}
            >
              <Icon size={18} />
            </Link>
          </Tooltip>
        )
      }

      return (
        <div key={href} className="space-y-1">
          <div className="flex items-center justify-between">
            <Link
              href={href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-0',
                isChatRoute
                  ? 'bg-white/25 backdrop-blur-md border border-white/40 text-white shadow-lg shadow-black/5 font-bold translate-x-1'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              )}
            >
              <Icon size={18} className={isChatRoute ? 'text-white' : 'text-white/80'} />
              <span className="truncate">{label}</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold tracking-wider uppercase text-white/90">AI</span>
            </Link>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setChatDropdownOpen(prev => !prev) }}
              className="p-2 ml-1 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors shrink-0"
              title={chatDropdownOpen ? 'Collapse history' : 'Expand history'}
              aria-label="Toggle chat history dropdown"
            >
              {chatDropdownOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
          {chatDropdownOpen && renderChatSubmenu(isMobile)}
        </div>
      )
    }

    if (collapsed) {
      return (
        <Tooltip key={href} label={label}>
          <Link
            href={href}
            className={cn(
              'flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200',
              active ? 'bg-white/25 border border-white/40 text-white shadow-md' : 'text-white/80 hover:text-white hover:bg-white/15'
            )}
          >
            <Icon size={18} />
          </Link>
        </Tooltip>
      )
    }

    return (
      <Link
        key={href}
        href={href}
        onClick={() => { if (isMobile) setMobileMenuOpen(false) }}
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
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full flex-shrink-0 text-white shadow-xl z-20 bg-[#4A90e2]',
          'transition-[width] duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {/* Header: logo + collapse toggle */}
        <div className={cn(
          'border-b border-white/15 flex items-center',
          collapsed ? 'px-3 py-5 justify-center' : 'px-5 py-5 justify-between'
        )}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-base">O</span>
              </div>
              <div className="min-w-0">
                <span className="text-white font-black text-xl tracking-tight leading-none block">Orchestra</span>
                <p className="text-white/70 text-[11px] font-medium mt-0.5">Financial OS</p>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
              <span className="text-white font-black text-base">O</span>
            </Link>
          )}

          <button
            onClick={toggleCollapsed}
            className={cn(
              'p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-colors shrink-0',
              collapsed ? 'mt-3 mx-auto block' : ''
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={16}
              className={cn('transition-transform duration-300', collapsed ? 'rotate-180' : '')}
            />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className={cn(
          'flex-1 py-3 overflow-y-auto overflow-x-hidden custom-scrollbar',
          collapsed ? 'px-2 space-y-1' : 'px-4 space-y-0.5'
        )}>
          <SectionLabel collapsed={collapsed}>Banking &amp; Treasury</SectionLabel>
          {bankingItems.map(item => renderNavItem(item, false))}

          <SectionLabel collapsed={collapsed}>Intelligence</SectionLabel>
          {intelligenceItems.map(item => renderNavItem(item, false))}
        </nav>

        {/* Bottom: user info + logout */}
        <div className={cn('border-t border-white/15', collapsed ? 'px-2 py-3' : 'px-4 py-4')}>
          {collapsed ? (
            // Collapsed: just avatar with tooltip + logout icon below
            <div className="flex flex-col items-center gap-2">
              <Tooltip label={user?.name || 'User'}>
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white uppercase text-sm cursor-default">
                  {user?.name?.[0] || 'U'}
                </div>
              </Tooltip>
              <Tooltip label="Sign out">
                <button
                  onClick={logout}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate text-xs">{user?.name || 'User'}</p>
                <p className="text-white/60 text-[10px] truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-colors shrink-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#4A90e2]/95 backdrop-blur-lg z-40 flex justify-around items-center px-2 py-1.5 border-t border-white/15 shadow-2xl safe-area-pb">
        {primaryMobileNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all',
                active ? 'text-white bg-white/20 font-bold shadow-sm' : 'text-white/70 hover:text-white'
              )}
            >
              <Icon size={19} />
              <span className="text-[10px] tracking-tight">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all',
            isMoreActive || mobileMenuOpen ? 'text-white bg-white/20 font-bold shadow-sm' : 'text-white/70 hover:text-white'
          )}
          aria-label="Open full menu"
        >
          <Menu size={19} />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative bg-[#4A90e2] text-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
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

            <div className="p-4 overflow-y-auto space-y-0.5 max-h-[50vh]">
              <SectionLabel collapsed={false}>Banking &amp; Treasury</SectionLabel>
              {bankingItems.map(item => renderNavItem(item, true))}
              <SectionLabel collapsed={false}>Intelligence</SectionLabel>
              {intelligenceItems.map(item => renderNavItem(item, true))}
            </div>

            <div className="p-4 border-t border-white/15 bg-black/10">
              <div className="flex items-center gap-3 mb-3 px-3.5 py-2.5 rounded-xl bg-white/10">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate text-xs">{user?.name || 'User'}</p>
                  <p className="text-white/60 text-[10px] truncate">{user?.email || ''}</p>
                </div>
              </div>
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

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="hidden md:flex w-64 bg-[#4A90e2] flex-col h-full flex-shrink-0 text-white shadow-xl z-20" />}>
      <SidebarContent />
    </Suspense>
  )
}
