'use client'
import { useState } from 'react'
import BalanceSummary from '@/components/dashboard/BalanceSummary'
import QuickStats from '@/components/dashboard/QuickStats'
import SpendingChart from '@/components/dashboard/SpendingChart'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { ArrowUpRight, Send, Zap, Sparkles, ArrowRight, History } from 'lucide-react'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/useAuth'
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions'
import { useCards } from '@/hooks/useCards'
import { useVirtualCards } from '@/hooks/useVirtualCards'

function timeAgo(dateStr?: string) {
  if (!dateStr) return 'Recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatTxAmount(amount: number) {
  const abs = Math.abs(amount / 100)
  const isCredit = amount >= 0
  const sign = isCredit ? '+' : '-'
  return {
    formatted: `${sign}₦${abs.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    isCredit
  }
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser()
  const { data: cardsData } = useCards()
  const { data: vcData } = useVirtualCards()
  const { data: summaryData } = useTransactionSummary()
  const { data: txData, isLoading: txLoading } = useTransactions({ limit: 5 })

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('orchestra_onboarded')
  })

  const stats = {
    totalCards: cardsData?.length || 0,
    virtualCards: vcData?.length || 0,
    monthlySpend: (summaryData?.summary?.totalSpent ?? 0) / 100,
    savedThisMonth: 0,
  }

  const recentTx = txData?.transactions || []

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Here is your real-time treasury status.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/transfers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Send size={13} className="text-slate-500" />
            <span>Transfer</span>
          </Link>
          <Link
            href="/bills"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Zap size={13} className="text-slate-500" />
            <span>Pay Bill</span>
          </Link>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <History size={13} className="text-slate-500" />
            <span>Ledger</span>
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Sparkles size={13} className="text-blue-400" />
            <span>AI Advisor</span>
          </Link>
        </div>
      </div>

      {/* Balance Summary Hero */}
      <BalanceSummary />

      {/* Key Metric Gauges */}
      <QuickStats {...stats} />

      {/* Analytics & Recent Activity Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SpendingChart />

        {/* Recent Transactions Module */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={15} className="text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-900">Recent Transactions</h3>
            </div>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {txLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-2 bg-slate-50 rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-400">No recent transactions recorded</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTx.map((tx, i) => {
                const { formatted, isCredit } = formatTxAmount(tx.amount)
                return (
                  <div key={tx._id || i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:bg-slate-50/60 px-1 rounded-md transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                        {tx.merchant ? tx.merchant.charAt(0).toUpperCase() : '•'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-slate-900 truncate">
                          {tx.merchant || 'Unknown Merchant'}
                        </p>
                        <p className="text-[11px] text-slate-400 capitalize truncate">
                          {tx.category || 'General'} · {timeAgo(tx.transactionDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <p
                        className={`font-mono text-xs font-medium tabular-nums ${
                          isCredit ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {formatted}
                      </p>
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

