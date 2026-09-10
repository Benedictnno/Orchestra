'use client'
import { Search, CreditCard, RefreshCw, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
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

function formatTxAmount(amount: number) {
  const abs = Math.abs(amount / 100)
  const isCredit = amount >= 0
  const sign = isCredit ? '+' : '-'
  return {
    formatted: `${sign}₦${abs.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    isCredit
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d)
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-slate-100 rounded w-28" />
            <div className="h-2.5 bg-slate-50 rounded w-20" />
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3.5 bg-slate-100 rounded w-24" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3 bg-slate-100 rounded w-20" />
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="h-3.5 bg-slate-100 rounded w-16 ml-auto" />
      </td>
      <td className="px-5 py-3.5 text-center">
        <div className="h-5 bg-slate-100 rounded-md w-20 mx-auto" />
      </td>
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
      (t.cardLabel || t.card || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.reference || '').toLowerCase().includes(query.toLowerCase())
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory
    return matchQ && matchCat
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Expose for CSV export
  useEffect(() => { onExport?.(filtered) }, [filtered, onExport])

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/40">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by merchant, card, or reference…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 w-full transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {CATEGORIES.filter(c => c === 'all' || transactions.some(t => t.category === c)).map(cat => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            )
          })}
          <button
            onClick={fetchTx}
            className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition shrink-0 ml-1"
            title="Refresh transactions"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden divide-y divide-slate-100 flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse py-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-2 bg-slate-50 rounded w-1/3" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center px-4 text-slate-400">
            <Search size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium text-slate-600">No transactions match your search</p>
            <p className="text-[11px] text-slate-400 mt-1">Try clearing filters or search query</p>
          </div>
        ) : (
          paginated.map((t, i) => {
            const cardName = t.cardLabel || t.card || 'Orchestra Routing'
            const { formatted, isCredit } = formatTxAmount(t.amount)
            return (
              <div key={t._id || i} className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                    {t.merchant ? t.merchant.charAt(0).toUpperCase() : '•'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-xs text-slate-900 truncate">{t.merchant}</p>
                      {t.flagged && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle size={9} /> Flagged
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <span className="capitalize">{t.category}</span>
                      <span>·</span>
                      <span className="truncate max-w-[120px]">{cardName}</span>
                      <span>·</span>
                      <span className="font-mono">{formatDate(t.transactionDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn('font-mono text-xs font-medium tabular-nums', isCredit ? 'text-emerald-600' : 'text-slate-900')}>
                    {formatted}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {t.status || 'Completed'}
                  </span>
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
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Payment Source
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">
                Amount
              </th>
              <th className="px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                    <Search size={28} className="text-slate-300 mb-1" />
                    <p className="text-xs font-medium text-slate-700">No transactions found</p>
                    <p className="text-[11px] text-slate-400">No records match the active search and filter criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((t, i) => {
                const cardName = t.cardLabel || t.card || 'Orchestra Multi-Bank'
                const { formatted, isCredit } = formatTxAmount(t.amount)
                const isCompleted = (t.status || 'completed').toLowerCase() === 'completed'
                const isPending = (t.status || '').toLowerCase() === 'pending'
                return (
                  <tr
                    key={t._id || i}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0">
                          {t.merchant ? t.merchant.charAt(0).toUpperCase() : '•'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-xs text-slate-900 truncate">
                              {t.merchant || 'Unknown Merchant'}
                            </p>
                            {t.flagged && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle size={9} /> Flagged
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 capitalize">
                              {t.category || 'General'}
                            </span>
                            {t.reference && (
                              <span className="text-[10px] font-mono text-slate-400">
                                Ref: {t.reference.slice(-8)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <CreditCard size={13} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600 truncate max-w-[160px]">{cardName}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-xs text-slate-700 font-mono">{formatDate(t.transactionDate)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{formatTime(t.transactionDate)}</p>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className={cn('font-mono text-xs font-medium tabular-nums', isCredit ? 'text-emerald-600' : 'text-slate-900')}>
                        {formatted}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
                        isCompleted
                          ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
                          : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                            : 'bg-rose-50 text-rose-700 border-rose-200/60'
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isCompleted ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'
                        )} />
                        {isCompleted ? 'Completed' : isPending ? 'Pending' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Pagination Toolbar */}
      <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-slate-500 font-mono">
          {loading ? 'Loading…' : `Showing ${filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length} transactions`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : i + page - 2
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 rounded-md text-xs font-mono font-medium transition shadow-xs',
                      p === page
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

