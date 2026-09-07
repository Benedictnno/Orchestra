'use client'
import { useState } from 'react'
import BalanceSummary from '@/components/dashboard/BalanceSummary'
import QuickStats from '@/components/dashboard/QuickStats'
import SpendingChart from '@/components/dashboard/SpendingChart'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { ArrowUpRight, Send, Zap } from 'lucide-react'
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
  const sign = amount >= 0 ? '+' : '-'
  return `${sign}₦${abs.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
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
    savedThisMonth: 0, // Placeholder for future implementation
  }

  const recentTx = txData?.transactions || []

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 pb-10">
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#4A90e2]">Welcome {user?.name || 'User'} </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your financial overview for today</p>
      </div>

      <BalanceSummary />

      {/* Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Link href="/transfers" className="bg-white border-2 border-gray-50 hover:border-[#E94560]/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Send size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-xs md:text-sm font-bold text-[#4A90e2]">Send Money</span>
        </Link>
        <Link href="/bills" className="bg-white border-2 border-gray-50 hover:border-[#E94560]/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-xs md:text-sm font-bold text-[#4A90e2]">Pay Bills</span>
        </Link>
        <Link href="/transactions" className="bg-white border-2 border-gray-50 hover:border-[#E94560]/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-xs md:text-sm font-bold text-[#4A90e2]">History</span>
        </Link>
        <Link href="/chat" className="bg-[#4A90e2] p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02] group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#E94560] text-white flex items-center justify-center shadow-lg shadow-[#E94560]/20">
            <span className="text-lg md:text-xl">✦</span>
          </div>
          <span className="text-xs md:text-sm font-bold text-white">AI Advisor</span>
        </Link>
      </div>

      <QuickStats {...stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />

        <div className="bg-white rounded-2xl border p-5 md:p-6">
          <h3 className="font-bold text-[#4A90e2] mb-4">Recent Transactions</h3>
          {txLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No recent transactions</p>
          ) : (
            <div className="space-y-1">
              {recentTx.map((tx, i) => (
                <div key={tx._id || i} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                    {tx.merchant?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#4A90e2] truncate">{tx.merchant}</p>
                    <p className="text-[10px] md:text-xs text-gray-400 capitalize truncate">{tx.category} · {timeAgo(tx.transactionDate)}</p>
                  </div>
                  <p className={`font-semibold text-xs md:text-sm shrink-0 ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatTxAmount(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
