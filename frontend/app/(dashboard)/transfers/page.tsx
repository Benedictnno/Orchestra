'use client'
import { useState, useEffect, useCallback } from 'react'
import {
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
  Circle,
  Layers,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
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
  color?: string
}

interface FundingAllocation {
  accountId: string
  label: string
  bank?: string | null
  maskedPan?: string | null
  amountRequested: number
  amountAllocated: number
  balanceBefore: number
  balanceAfter: number
}

interface TransferPreview {
  status: 'OK' | 'INSUFFICIENT_FUNDS' | 'INVALID_AMOUNT'
  requestedAmount: number
  totalAvailable: number
  totalAllocated: number
  shortfall: number
  allocations: FundingAllocation[]
}

interface TransferResult {
  _id: string
  amount: number
  recipientName: string
  recipientAccount: string
  recipientBank: string
  isPooled?: boolean
  fundingSources?: { label?: string; bank?: string; amount: number }[]
  reference?: string
}

interface RecentTransfer extends TransferResult {
  createdAt?: string
  status?: string
}

type Step = 'form' | 'review' | 'processing' | 'success'

const BANKS = [
  { name: 'Union Bank', code: '032' },
  { name: 'GTBank', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'First Bank', code: '011' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'UBA', code: '033' },
  { name: 'Stanbic IBTC', code: '221' },
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

const PROCESSING_STEPS = [
  'Validating funding sources',
  'Allocating funds',
  'Creating funding pool',
  'Processing transfer',
  'Updating balances',
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
  const [step, setStep] = useState<Step>('form')
  const [previewing, setPreviewing] = useState(false)
  const [processIndex, setProcessIndex] = useState(0)

  const [form, setForm] = useState({
    amount: '',
    recipientBank: '',
    recipientAccount: '',
    recipientName: '',
    category: 'transfer',
    narration: '',
  })

  // Selection order is preserved — it defines the allocation waterfall order.
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [preview, setPreview] = useState<TransferPreview | null>(null)
  const [result, setResult] = useState<TransferResult | null>(null)
  const [recent, setRecent] = useState<RecentTransfer[]>([])
  const [expandedRecent, setExpandedRecent] = useState<string | null>(null)

  const loadTransfers = useCallback(() => {
    fetchWithAuth('/api/transfers')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.transfers) ? data.transfers : []
        // Only show transfers that were funded from a pool for the breakdown demo.
        setRecent(list.filter((t: RecentTransfer) => t.isPooled || (t.fundingSources?.length ?? 0) > 0))
      })
      .catch(() => setRecent([]))
  }, [])

  useEffect(() => {
    fetchWithAuth('/api/cards')
      .then((r) => r.json())
      .then((data) => {
        const cardList: Card[] = Array.isArray(data.cards) ? data.cards : []
        setCards(cardList)
        // Default-select every source so the combined balance is visible up-front.
        setSelectedIds(cardList.map((c) => c._id))
      })
      .finally(() => setLoading(false))

    loadTransfers()
  }, [loadTransfers])

  const numericAmount = parseFloat(form.amount.replace(/,/g, ''))
  const validAmount = !!numericAmount && !isNaN(numericAmount) && numericAmount > 0

  const selectedCards = selectedIds
    .map((id) => cards.find((c) => c._id === id))
    .filter((c): c is Card => Boolean(c))

  const combinedAvailable = selectedCards.reduce((sum, c) => sum + (c.availableBalance || 0), 0)

  const toggleSource = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const canContinue =
    validAmount &&
    selectedIds.length > 0 &&
    form.recipientAccount.length === 10 &&
    !!form.recipientBank &&
    !!form.recipientName.trim()

  const recipientReady =
    form.recipientAccount.length === 10 && !!form.recipientBank && !!form.recipientName.trim()

  async function goToReview() {
    if (!canContinue) return
    setPreviewing(true)
    try {
      const res = await fetchWithAuth('/api/transfers/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount, sourceCardIds: selectedIds }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(extractErrorMessage({ data }))
        return
      }
      setPreview(data.preview)
      setStep('review')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setPreviewing(false)
    }
  }

  async function confirmTransfer() {
    setStep('processing')
    setProcessIndex(0)

    // Controlled demo animation around the real (mock) transaction.
    for (let i = 0; i < PROCESSING_STEPS.length - 1; i++) {
      setProcessIndex(i)
      await delay(380)
    }
    setProcessIndex(PROCESSING_STEPS.length - 1)

    try {
      const res = await fetchWithAuth('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          sourceCardIds: selectedIds,
          recipientBank: form.recipientBank,
          recipientAccount: form.recipientAccount,
          recipientName: form.recipientName.trim(),
          category: form.category || 'transfer',
          narration: form.narration.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw { data }

      await delay(280)
      setResult(data.transfer)
      setStep('success')
      loadTransfers()
    } catch (err) {
      toast.error(extractErrorMessage(err))
      setStep('review')
    }
  }

  function resetFlow() {
    setForm({ amount: '', recipientBank: '', recipientAccount: '', recipientName: '', category: 'transfer', narration: '' })
    setPreview(null)
    setResult(null)
    setSelectedIds(cards.map((c) => c._id))
    setStep('form')
  }

  const insufficient = preview?.status === 'INSUFFICIENT_FUNDS'
  const invalidAmount = preview?.status === 'INVALID_AMOUNT'

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 pb-12">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Send Money</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 text-[10px] font-bold uppercase tracking-wider">
            <Layers size={11} /> Funding Pool
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pool funds from multiple accounts and send one transfer. Orchestra allocates, collects, and settles it for you.
        </p>
      </div>

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="flex items-center gap-2 mb-5 text-[11px] font-medium text-slate-400">
          <span className={cn(step === 'form' ? 'text-slate-900' : '')}>1. Details</span>
          <span className="flex-1 h-px bg-slate-200" />
          <span className={cn(step === 'review' ? 'text-slate-900' : '')}>2. Review</span>
          <span className="flex-1 h-px bg-slate-200" />
          <span className={cn(step === 'processing' ? 'text-slate-900' : '')}>3. Process</span>
        </div>
      )}

      {/* ───────────────────────── Step: FORM ───────────────────────── */}
      {step === 'form' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 space-y-6">
            {/* Section 1: Funding sources (multi-select) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-900">Funding Sources</label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedIds.length} of {cards.length} selected
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
                  {cards.map((card) => {
                    const isSelected = selectedIds.includes(card._id)
                    return (
                      <button
                        key={card._id}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => toggleSource(card._id)}
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
                          {isSelected
                            ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                            : <Circle size={15} className="text-slate-300 shrink-0" />}
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

              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-medium text-slate-500">Combined available balance</span>
                  <span className="text-sm font-mono font-semibold text-slate-900 tabular-nums">
                    {toNaira(combinedAvailable)}
                  </span>
                </div>
              )}
            </div>

            {/* Section 2: Transfer amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="amount-input" className="text-xs font-semibold text-slate-900">
                  Transfer Amount
                </label>
                {validAmount && numericAmount * 100 > combinedAvailable && (
                  <span className="text-[11px] font-medium text-rose-600">Exceeds selected balance</span>
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
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: formatAmountInput(e.target.value) }))}
                  className="w-full bg-transparent py-3 pl-9 pr-4 text-xl font-mono font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums"
                />
              </div>
            </div>

            {/* Section 3: Recipient */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-semibold text-slate-900 block">Recipient Destination</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Destination Bank</label>
                  <select
                    value={form.recipientBank}
                    onChange={(e) => setForm((f) => ({ ...f, recipientBank: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
                  >
                    <option value="">Select Destination Bank</option>
                    {BANKS.map((b) => (
                      <option key={b.code} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Account Number (10 digits)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={form.recipientAccount}
                    onChange={(e) => setForm((f) => ({ ...f, recipientAccount: e.target.value.replace(/\D/g, '') }))}
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
                  placeholder="BENEFICIARY ACCOUNT NAME"
                  value={form.recipientName}
                  onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value.toUpperCase() }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs uppercase"
                />
              </div>
            </div>

            {/* Section 4: Category */}
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
                      onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
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
                onChange={(e) => setForm((f) => ({ ...f, narration: e.target.value }))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
              />
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={goToReview}
                disabled={!canContinue || previewing}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
              >
                {previewing ? <><Loader2 size={14} className="animate-spin" /> Calculating allocation…</> : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────── Step: REVIEW ───────────────────────── */}
      {step === 'review' && preview && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Review Transfer</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Confirm how Orchestra will fund this transfer.</p>
            </div>

            {insufficient || invalidAmount ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold text-rose-700">
                  {invalidAmount ? 'Invalid amount' : 'Insufficient funds'}
                </p>
                {insufficient && (
                  <p className="text-[11px] text-rose-600 mt-1 leading-relaxed">
                    You selected {selectedIds.length} funding source{selectedIds.length === 1 ? '' : 's'} with a combined
                    available balance of {toNaira(preview.totalAvailable)}. You need an additional{' '}
                    <strong>{toNaira(preview.shortfall)}</strong>.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 hover:text-rose-800"
                >
                  <ArrowLeft size={12} /> Adjust amount or sources
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Send</span>
                    <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums">
                      {toNaira(preview.requestedAmount)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-t border-slate-200/70 pt-3">
                    <span className="text-[11px] text-slate-500">To</span>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-900">{form.recipientName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{form.recipientAccount} · {form.recipientBank}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900">Funding Sources</span>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                    {preview.allocations.map((a) => (
                      <div key={a.accountId} className="flex items-center justify-between px-3.5 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">{a.label}</p>
                          <p className="text-[10px] font-mono text-slate-400">{a.maskedPan}</p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
                          {toNaira(a.amountAllocated)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50">
                      <span className="text-xs font-semibold text-slate-700">Total</span>
                      <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {toNaira(preview.totalAllocated)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Funds are collected into an internal Orchestra funding pool, then settled to the recipient as one transfer.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmTransfer}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────── Step: PROCESSING ───────────────────────── */}
      {step === 'processing' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-3">
              <Loader2 size={22} className="text-white animate-spin" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Orchestra is processing your transfer…</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Pooling funds across {selectedIds.length} source{selectedIds.length === 1 ? '' : 's'}.</p>
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            {PROCESSING_STEPS.map((label, i) => {
              const done = i < processIndex
              const active = i === processIndex
              return (
                <div key={label} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : active ? (
                    <Loader2 size={16} className="text-slate-900 animate-spin shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-300 shrink-0" />
                  )}
                  <span className={cn('text-xs font-medium', done ? 'text-slate-700' : active ? 'text-slate-900' : 'text-slate-400')}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────── Step: SUCCESS ───────────────────────── */}
      {step === 'success' && result && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col items-center text-center border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Transfer Successful</h2>
            <p className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">{toNaira(result.amount)}</p>
            <p className="text-xs text-slate-500 mt-1">Sent to {result.recipientName}</p>
            {result.reference && (
              <p className="text-[10px] font-mono text-slate-400 mt-1">Ref: {result.reference.slice(0, 18)}</p>
            )}
          </div>

          {(result.fundingSources?.length ?? 0) > 0 && (
            <div className="p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-900">Funding</span>
                {result.isPooled && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/70 text-[9px] font-bold uppercase tracking-wider">
                    Pooled
                  </span>
                )}
              </div>
              <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                {result.fundingSources!.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-xs font-medium text-slate-900">{s.label || s.bank || 'Account'}</span>
                    <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">{toNaira(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 sm:p-6 pt-0 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/transactions')}
              className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              View Transactions
            </button>
            <button
              type="button"
              onClick={resetFlow}
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              New Transfer
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────── Recent pooled transfers ───────────────────────── */}
      {step === 'form' && recent.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900">Recent Pooled Transfers</h3>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {recent.slice(0, 5).map((t) => {
              const open = expandedRecent === t._id
              return (
                <div key={t._id}>
                  <button
                    type="button"
                    onClick={() => setExpandedRecent(open ? null : t._id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">Sent to {t.recipientName}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {t.recipientAccount} · {t.recipientBank}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">-{toNaira(t.amount)}</span>
                      {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-4 pb-3">
                      <div className="rounded-lg border border-slate-200/70 divide-y divide-slate-100 overflow-hidden">
                        {t.fundingSources?.map((s, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2">
                            <span className="text-[11px] font-medium text-slate-700">{s.label || s.bank || 'Account'}</span>
                            <span className="text-[11px] font-mono text-slate-600 tabular-nums">{toNaira(s.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recipient readiness hint (form step only) */}
      {step === 'form' && !recipientReady && selectedIds.length > 0 && validAmount && (
        <p className="text-[11px] text-slate-400 mt-3 text-center">
          Complete the recipient details to continue.
        </p>
      )}
    </div>
  )
}
