'use client'
import { Search, ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from 'lucide-react'
import { toNaira } from '@/utils/format'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { fetchWithAuth } from '@/lib/fetch-utils'

export interface Transaction {
  _id: string
  merchant: string
  category: string
  amount: number
  transactionDate: string
  card?: string
  cardLabel?: string
  status?: string
  reference?: string
  flagged?: boolean
}

const CATEGORIES = ['all', 'shopping', 'subscriptions', 'transport', 'income', 'utilities', 'food', 'savings', 'entertainment', 'other']

const CATEGORY_COLORS: Record<string, string> = {
  shopping: 'bg-purple-100 text-purple-700',
  subscriptions: 'bg-blue-100 text-blue-700',
  transport: 'bg-amber-100 text-amber-700',
  income: 'bg-green-100 text-green-700',
  utilities: 'bg-orange-100 text-orange-700',
  food: 'bg-red-100 text-red-700',
  savings: 'bg-teal-100 text-teal-700',
  entertainment: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
}

function SkeletonRow() {
  return (
    <tr className="border-b animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function TransactionTable({ onExport }: { onExport?: (txs: Transaction[]) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const fetchTx = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/transactions?limit=100')
      const data = await res.json()
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : (Array.isArray(data?.data) ? data.data : []))
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTx() }, [fetchTx])

  const filtered = transactions.filter(t => {
    const matchQ = t.merchant?.toLowerCase().includes(query.toLowerCase()) ||
      (t.cardLabel || t.card || '').toLowerCase().includes(query.toLowerCase())
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory
    return matchQ && matchCat
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Expose for CSV export
  useEffect(() => { onExport?.(filtered) }, [filtered, onExport])

  return (
    <div className="bg-white rounded-2xl border shadow-sm flex flex-col min-h-[500px]">
      {/* Filters */}
      <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by merchant or card…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-[#E94560] outline-none w-full transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORIES.filter(c => c === 'all' || transactions.some(t => t.category === c)).map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPage(1) }}
              className={cn(
                'px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-[#E94560] text-white shadow-md shadow-[#E94560]/20'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <button onClick={fetchTx} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition shrink-0 ml-1" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden divide-y divide-gray-100 flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse py-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-50 rounded w-1/3" />
                </div>
                <div className="h-3.5 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Search size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No transactions found</p>
          </div>
        ) : (
          paginated.map((t, i) => {
            const cardName = t.cardLabel || t.card || 'Card'
            const catColor = CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.other
            return (
              <div key={t._id || i} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0',
                  t.amount >= 0 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                )}>
                  {t.amount >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-bold text-[#4A90e2] text-sm truncate">{t.merchant}</p>
                    <p className={cn('font-bold text-sm shrink-0', t.amount >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {t.amount >= 0 ? '+' : '-'}{toNaira(Math.abs(t.amount))}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-1.5 truncate text-[11px] text-gray-400">
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0', catColor)}>
                        {t.category}
                      </span>
                      <span>·</span>
                      <span className="truncate">{cardName}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(t.transactionDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/60 sticky top-0">
              {['Transaction', 'Card', 'Amount', 'Status'].map(h => (
                <th key={h} className={cn(
                  'px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest',
                  h === 'Amount' && 'text-right',
                  h === 'Status' && 'text-center'
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : paginated.length === 0
                ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Search size={36} />
                        <p className="font-semibold text-sm">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )
                : paginated.map((t, i) => {
                  const cardName = t.cardLabel || t.card || '—'
                  const catColor = CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.other
                  return (
                    <tr
                      key={t._id || i}
                      className="hover:bg-gray-50/70 transition-colors group"
                      style={{ animation: `fadeInRow 0.2s ease ${i * 0.03}s both` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0',
                            t.amount >= 0 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                          )}>
                            {t.amount >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-[#4A90e2] text-sm group-hover:text-[#E94560] transition-colors">
                              {t.merchant}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase', catColor)}>
                                {t.category}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(t.transactionDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {t.flagged && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">⚠ Flagged</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-5 rounded bg-gray-900 flex items-center justify-center">
                            <CreditCard size={11} className="text-white opacity-70" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 truncate max-w-28">{cardName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={cn('font-bold text-sm', t.amount >= 0 ? 'text-green-600' : 'text-red-600')}>
                          {t.amount >= 0 ? '+' : '-'}{toNaira(Math.abs(t.amount))}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border',
                          (t.status || 'completed') === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : (t.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-red-50 text-red-700 border-red-100')
                        )}>
                          {(t.status || 'COMPLETED').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>

      {/* Footer + Pagination */}
      <div className="p-4 border-t bg-gray-50/30 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-gray-400 font-medium">
          {loading ? '…' : `Showing ${Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length} transactions`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : i + page - 2
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-bold transition',
                    p === page ? 'bg-[#E94560] text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
