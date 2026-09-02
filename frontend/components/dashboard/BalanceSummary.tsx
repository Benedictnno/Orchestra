'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Copy, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { toNaira } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { useCurrentUser } from '@/hooks/useAuth'
import { useCards } from '@/hooks/useCards'
import { Card } from '@/api-client/types'

export default function BalanceSummary() {
  const { data: user } = useCurrentUser()
  const { data: cardsData, isLoading: loading, refetch } = useCards()
  const [copying, setCopying] = useState<string | null>(null)

  const cards: Card[] = cardsData || []
  const total = cards.reduce((s, c) => s + (c.availableBalance || 0), 0)
  const active = cards.filter(c => c.cardStatus === '1').length
  const cardCount = cards.length

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopying(id)
    setTimeout(() => setCopying(null), 2000)
    toast.success('Account number copied')
  }

  if (loading) return <BalanceSummarySkeleton />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#4A90e2] rounded-3xl p-8 text-white lg:col-span-2 relative overflow-hidden flex flex-col justify-between min-h-[240px] md:min-h-[280px]">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 200">
            <path d="M0 50 H100 L150 20 H250 L300 50 H400" stroke="#4F46E5" fill="none" strokeWidth="1" />
            <path d="M0 150 H120 L170 180 H280 L330 150 H400" stroke="#4F46E5" fill="none" strokeWidth="1" />
            <circle cx="150" cy="20" r="2" fill="#4F46E5" />
            <circle cx="300" cy="50" r="2" fill="#4F46E5" />
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Total Balance Across All Cards</p>
            <p className="text-4xl md:text-5xl font-black tracking-tight">{toNaira(total)}</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">
              {active} Active / {cardCount} Total Cards
            </p>
          </div>
          <Link href="/cards" className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all group shrink-0">
            <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </Link>
        </div>

        <div className="relative z-10 mt-8">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Multi-Bank Orchestration Active</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col h-[280px]">
        <div className="p-5 border-b flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-[#1A1A2E] text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected Accounts
          </h3>
          <button 
            onClick={() => refetch()}
            className="p-2 text-gray-400 hover:text-[#E94560] transition-colors rounded-xl hover:bg-white"
            title="Refresh Balances"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cards.length > 0 ? (
            cards.map((card) => (
              <div key={card._id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center text-[9px] font-black text-gray-400 shadow-sm shrink-0">
                    {card.bank?.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A1A2E] truncate">{card.bank}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-gray-500">{card.accountNumber || '0123456789'}</span>
                      <button 
                        onClick={() => copyToClipboard(card.accountNumber || '0123456789', card._id)}
                        className="text-gray-300 hover:text-[#E94560] transition-colors"
                      >
                        {copying === card._id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs font-black text-green-500">{toNaira(card.availableBalance)}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Live</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <p className="text-xs text-gray-400 font-medium">No accounts connected yet</p>
              <Link href="/cards" className="text-[10px] font-black text-[#E94560] uppercase mt-2 hover:underline">Link a Card</Link>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50/50 border-t">
          <button 
            onClick={() => {
              const firstCard = cards[0];
              if (firstCard) {
                toast.promise(
                  fetchWithAuth(`/api/cards/${firstCard._id}/balance`).then(r => r.json()),
                  {
                    loading: 'Fetching live balance...',
                    success: 'Balances updated',
                    error: 'Sync failed'
                  }
                ).then(() => refetch())
              }
            }}
            className="w-full py-2.5 rounded-xl bg-[#4A90e2] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#252545] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={12} />
            Check All Card Balances
          </button>
        </div>
      </div>
    </div>
  )
}

function BalanceSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-pulse">
      <div className="bg-gray-200 rounded-3xl h-[240px] md:h-[280px] lg:col-span-2" />
      <div className="bg-gray-200 rounded-3xl h-[240px] md:h-[280px]" />
    </div>
  )
}
