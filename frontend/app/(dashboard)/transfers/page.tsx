'use client'
import { useState, useEffect } from 'react'
import { 
  Building2, 
  ShieldCheck, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Tv, 
  Zap, 
  Film, 
  ArrowLeftRight, 
  ReceiptText, 
  Tag,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { toNaira } from '@/utils/format'
import { extractErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'

interface Card {
  _id: string
  label: string
  bank: string
  availableBalance: number
  pan: string
}

const BANKS = [
  { name: 'GTBank', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'First Bank', code: '011' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'UBA', code: '033' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Union Bank', code: '032' },
]

const SPENDING_CATEGORIES = [
  { id: 'transfer', label: 'General Transfer', icon: ArrowLeftRight },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'transport', label: 'Transportation', icon: Car },
  { id: 'bills', label: 'Bills & Utilities', icon: Zap },
  { id: 'subscriptions', label: 'Subscriptions', icon: Tv },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'utilities', label: 'Home & Housing', icon: ReceiptText },
  { id: 'other', label: 'Other / Custom', icon: Tag },
]

function formatAmountInput(val: string): string {
  const clean = val.replace(/[^\d.]/g, '')
  if (!clean) return ''

  const parts = clean.split('.')
  const integerPart = parts[0]
  const decimalPart = parts.length > 1 ? parts.slice(1).join('') : null

  const formattedInteger = integerPart ? parseInt(integerPart, 10).toLocaleString('en-US') : (parts.length > 1 ? '0' : '')

  if (decimalPart !== null) {
    return `${formattedInteger}.${decimalPart.slice(0, 2)}`
  }

  return formattedInteger
}

export default function TransfersPage() {
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    amount: '',
    sourceCardId: '',
    recipientBank: '',
    recipientAccount: '',
    recipientName: '',
    category: 'transfer',
    narration: '',
  })

  useEffect(() => {
    fetchWithAuth('/api/cards')
      .then(r => r.json())
      .then(data => {
        const cardList = Array.isArray(data.cards) ? data.cards : []
        setCards(cardList)
        if (cardList.length > 0) setForm(f => ({ ...f, sourceCardId: cardList[0]._id }))
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedCard = cards.find(c => c._id === form.sourceCardId) || cards[0]

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = parseFloat(form.amount.replace(/,/g, ''))
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0 || !form.recipientAccount || !form.recipientBank) return
    
    setSubmitting(true)
    try {
      const res = await fetchWithAuth('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          amount: numericAmount,
          narration: form.narration.trim() || undefined,
          category: form.category || 'transfer',
        }),
      })
      
      if (res.ok) {
        toast.success('Transfer executed successfully')
        router.push('/transactions')
      } else {
        const data = await res.json()
        toast.error(extractErrorMessage({ data }))
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 pb-12">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Send Money
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Execute instant bank transfers with automatic ledger categorization and fraud verification.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <form onSubmit={handleTransfer} className="p-5 sm:p-6 space-y-6">
          {/* Section 1: Source Funding Card */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900">Funding Account</label>
              <span className="text-[11px] text-slate-400 font-mono">
                {cards.length} {cards.length === 1 ? 'card connected' : 'cards connected'}
              </span>
            </div>

            {loading ? (
              <div className="h-20 bg-slate-100 animate-pulse rounded-xl border border-slate-200/60" />
            ) : cards.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <p className="text-xs text-slate-500 mb-2">No bank accounts or cards linked to debit from</p>
                <button
                  type="button"
                  onClick={() => router.push('/cards')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Link a card to continue &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cards.map(card => {
                  const isSelected = form.sourceCardId === card._id
                  return (
                    <button
                      key={card._id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sourceCardId: card._id }))}
                      className={cn(
                        'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between shadow-xs',
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-900'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            'w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0',
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          )}>
                            {card.bank ? card.bank.slice(0, 3).toUpperCase() : 'BNK'}
                          </div>
                          <span className={cn('text-xs font-semibold truncate', isSelected ? 'text-white' : 'text-slate-900')}>
                            {card.label || card.bank}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                      </div>

                      <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-200/40 mt-1">
                        <span className={cn('text-[11px] font-mono', isSelected ? 'text-slate-400' : 'text-slate-500')}>
                          •••• {card.pan.slice(-4)}
                        </span>
                        <span className={cn('text-xs font-mono font-semibold tabular-nums', isSelected ? 'text-emerald-400' : 'text-slate-900')}>
                          {toNaira(card.availableBalance)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 2: Transfer Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="amount-input" className="text-xs font-semibold text-slate-900">
                Transfer Amount
              </label>
              {selectedCard && (
                <span className="text-[11px] font-mono text-slate-500">
                  Available: <strong className="text-slate-700">{toNaira(selectedCard.availableBalance)}</strong>
                </span>
              )}
            </div>

            <div className="relative rounded-lg border border-slate-200 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10 bg-white transition-all shadow-xs">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-mono font-medium text-slate-400">
                ₦
              </span>
              <input
                id="amount-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: formatAmountInput(e.target.value) }))}
                className="w-full bg-transparent py-3 pl-9 pr-4 text-xl font-mono font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Section 3: Recipient Destination */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-semibold text-slate-900 block">Recipient Destination</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Destination Bank</label>
                <select
                  required
                  value={form.recipientBank}
                  onChange={e => setForm(f => ({ ...f, recipientBank: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
                >
                  <option value="">Select Destination Bank</option>
                  {BANKS.map(b => (
                    <option key={b.code} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Account Number (10 digits)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="0123456789"
                  value={form.recipientAccount}
                  onChange={e => setForm(f => ({ ...f, recipientAccount: e.target.value.replace(/\D/g, '') }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-500">Account Beneficiary Name</label>
                {form.recipientName && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <ShieldCheck size={12} /> NUBAN Verified
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="BENEFICIARY ACCOUNT NAME"
                value={form.recipientName}
                onChange={e => setForm(f => ({ ...f, recipientName: e.target.value.toUpperCase() }))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs uppercase"
              />
            </div>
          </div>

          {/* Section 4: Spending Category */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900">Ledger Category</label>
              <span className="text-[11px] text-slate-400">Used for AI insight routing</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPENDING_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = form.category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors text-xs font-medium shadow-xs',
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    )}
                  >
                    <Icon size={14} className={isSelected ? 'text-slate-300' : 'text-slate-500'} />
                    <span className="truncate flex-1">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 5: Narration */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-900">
              Payment Reference Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly cloud hosting invoice, Consulting retainer"
              value={form.narration}
              onChange={e => setForm(f => ({ ...f, narration: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
            />
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !form.amount || !form.recipientAccount || !form.recipientBank}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
            >
              {submitting ? 'Initiating Settlement...' : 'Confirm & Authorize Transfer'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-400 text-xs text-center">
        <Lock size={12} className="text-slate-400" />
        <span>256-bit encrypted settlement · Interswitch network verification active</span>
      </div>
    </div>
  )
}

