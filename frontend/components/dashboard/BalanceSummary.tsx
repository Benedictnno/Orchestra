'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Copy, Check, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { toNaira } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { useCards } from '@/hooks/useCards'
import { Card } from '@/api-client/types'

export default function BalanceSummary() {
  const { data: cardsData, isLoading: loading, refetch } = useCards()
  const [copying, setCopying] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

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

  const handleSyncAll = async () => {
    const firstCard = cards[0]
    if (!firstCard) return
    setIsSyncing(true)
    try {
      await toast.promise(
        fetchWithAuth(`/api/cards/${firstCard._id}/balance`).then(r => r.json()),
        {
          loading: 'Syncing live balances...',
          success: 'Balances updated successfully',
          error: 'Balance sync failed'
        }
      )
      await refetch()
    } finally {
      setIsSyncing(false)
    }
  }

  if (loading) return <BalanceSummarySkeleton />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      {/* Primary Balance Panel */}
      <div className="lg:col-span-7 bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xs border border-slate-800">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Treasury
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {active} of {cardCount} {cardCount === 1 ? 'account' : 'accounts'} active
              </span>
            </div>

            <Link
              href="/cards"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <Plus size={14} className="text-slate-300" />
              <span>Link Account</span>
            </Link>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Total Available Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-mono tabular-nums">
                {toNaira(total)}
              </h2>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Multi-Bank Liquidity Orchestration Active</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 py-0.5 px-1.5 rounded hover:bg-slate-800"
            title="Refresh balance data"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Connected Accounts Ledger */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900">Connected Accounts</h3>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
            {cards.length} {cards.length === 1 ? 'Bank' : 'Banks'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[200px] custom-scrollbar">
          {cards.length > 0 ? (
            cards.map((card) => (
              <div key={card._id} className="p-2.5 px-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-[10px] font-semibold text-slate-600 shrink-0">
                    {card.bank ? card.bank.slice(0, 3).toUpperCase() : 'BNK'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{card.bank || 'Bank Account'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-mono text-slate-500">
                        •••• {card.accountNumber ? card.accountNumber.slice(-4) : '••••'}
                      </span>
                      {card.accountNumber && (
                        <button
                          onClick={() => copyToClipboard(card.accountNumber || '', card._id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
                          title="Copy account number"
                        >
                          {copying === card._id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-semibold text-slate-900 font-mono tabular-nums">
                    {toNaira(card.availableBalance)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center px-4">
              <p className="text-xs text-slate-500">No bank accounts linked yet</p>
              <Link href="/cards" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-2">
                Link a card or bank <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50/80 border-t border-slate-100">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing || cards.length === 0}
            className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>Sync All Account Balances</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function BalanceSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 animate-pulse">
      <div className="lg:col-span-7 bg-slate-200 rounded-xl h-[200px]" />
      <div className="lg:col-span-5 bg-slate-200 rounded-xl h-[200px]" />
    </div>
  )
}

