'use client'
import Link from 'next/link'
import ApprovalQueue from '@/components/business/ApprovalQueue'
import {
  Briefcase,
  CreditCard,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ListChecks,
  Building2,
} from 'lucide-react'
import { toNaira } from '@/utils/format'
import { useCurrentUser } from '@/hooks/useAuth'
import { useBusinessCards, useApprovalActions } from '@/hooks/useBusiness'
import { BusinessCard, ApprovalRequest } from '@/api-client/types'

const QUEUE_PREVIEW_LIMIT = 3

export default function BusinessOverviewPage() {
  const { data: user } = useCurrentUser()
  const { data, isLoading: loading } = useBusinessCards()
  const { approve, reject } = useApprovalActions()

  const cards: BusinessCard[] = data?.cards || []
  const requests: ApprovalRequest[] = data?.pendingActions || []

  // High level KPIs
  const totalBudget = cards.reduce((acc, c) => acc + (c.budget || c.spendLimit || 0), 0)
  const totalSpent = cards.reduce((acc, c) => acc + (c.amountSpent || 0), 0)
  const activeCount = cards.filter(c => c.status === 'active').length
  const totalUtilization = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  // Spend grouped by department, highest first
  const departmentSpend = Object.entries(
    cards.reduce<Record<string, { spent: number; budget: number }>>((acc, c) => {
      const dept = c.department || 'General'
      acc[dept] ??= { spent: 0, budget: 0 }
      acc[dept].spent += c.amountSpent || 0
      acc[dept].budget += c.budget || c.spendLimit || 0
      return acc
    }, {})
  ).sort(([, a], [, b]) => b.spent - a.spent)

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Business Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Here is your team&apos;s spend and approval status.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="grid grid-cols-3 md:flex md:items-center gap-2 sm:gap-2.5">
          <Link
            href="/business/cards"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <CreditCard size={13} className="text-slate-500" />
            <span>Cards</span>
          </Link>
          <Link
            href="/business/queue"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <ListChecks size={13} className="text-slate-500" />
            <span>Queue</span>
          </Link>
          <Link
            href="/business/chat"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Sparkles size={13} className="text-blue-400" />
            <span>AI Advisor</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Corporate Budget</span>
            <Briefcase size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{toNaira(totalBudget)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Allocated across {cards.length} cardholders</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Spend</span>
            <TrendingUp size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{toNaira(totalSpent)}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full" style={{ width: `${totalUtilization}%` }} />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-500">{totalUtilization}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Active Cards</span>
            <CreditCard size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{activeCount} / {cards.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" /> {cards.length - activeCount} inactive
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Pending Approvals</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-amber-600 tracking-tight">{requests.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting manager review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Approval queue preview */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListChecks size={15} className="text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-900">Approval Queue</h3>
              {requests.length > 0 && (
                <span className="bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-medium border border-amber-200/60">
                  {requests.length} pending
                </span>
              )}
            </div>
            <Link
              href="/business/queue"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse py-1">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
            </div>
          ) : (
            <ApprovalQueue
              requests={requests.slice(0, QUEUE_PREVIEW_LIMIT)}
              onApprove={approve}
              onReject={reject}
            />
          )}
        </div>

        {/* Spend by department */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-900">Spend by Department</h3>
            </div>
            <Link
              href="/business/cards"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>Manage cards</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4 animate-pulse py-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-1.5 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : departmentSpend.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-400">No business cards issued yet</p>
              <Link href="/business/cards" className="mt-2 inline-block text-xs font-medium text-slate-900 hover:underline">
                Issue your first card
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {departmentSpend.map(([dept, { spent, budget }]) => {
                const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
                return (
                  <div key={dept}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{dept}</span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {toNaira(spent)} / {toNaira(budget)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
