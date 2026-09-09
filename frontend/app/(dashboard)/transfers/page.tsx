'use client'
import { useState, useEffect } from 'react'
import { 
  Building2, 
  ArrowRight, 
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
  FileText
} from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { toNaira } from '@/utils/format'
import { extractErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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
  { id: 'transfer', label: 'General Transfer', icon: ArrowLeftRight, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', activeBg: 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'text-rose-600 bg-rose-50 border-rose-200', activeBg: 'bg-rose-600 text-white border-rose-600 shadow-rose-200' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-purple-600 bg-purple-50 border-purple-200', activeBg: 'bg-purple-600 text-white border-purple-600 shadow-purple-200' },
  { id: 'transport', label: 'Transportation', icon: Car, color: 'text-amber-600 bg-amber-50 border-amber-200', activeBg: 'bg-amber-600 text-white border-amber-600 shadow-amber-200' },
  { id: 'bills', label: 'Bills & Utilities', icon: Zap, color: 'text-orange-600 bg-orange-50 border-orange-200', activeBg: 'bg-orange-600 text-white border-orange-600 shadow-orange-200' },
  { id: 'subscriptions', label: 'Subscriptions', icon: Tv, color: 'text-blue-600 bg-blue-50 border-blue-200', activeBg: 'bg-blue-600 text-white border-blue-600 shadow-blue-200' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'text-pink-600 bg-pink-50 border-pink-200', activeBg: 'bg-pink-600 text-white border-pink-600 shadow-pink-200' },
  { id: 'utilities', label: 'Home & Housing', icon: ReceiptText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200' },
  { id: 'other', label: 'Other / Custom', icon: Tag, color: 'text-gray-600 bg-gray-50 border-gray-200', activeBg: 'bg-gray-700 text-white border-gray-700 shadow-gray-200' },
]

function formatAmountInput(val: string): string {
  // Remove all non-digit and non-period characters
  const clean = val.replace(/[^\d.]/g, '')
  if (!clean) return ''

  // Support single decimal point
  const parts = clean.split('.')
  const integerPart = parts[0]
  const decimalPart = parts.length > 1 ? parts.slice(1).join('') : null

  // Format integer portion with commas
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
  const [submitting, setSubloading] = useState(false)
  
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

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = parseFloat(form.amount.replace(/,/g, ''))
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0 || !form.recipientAccount || !form.recipientBank) return
    
    setSubloading(true)
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
        toast.success('Transfer Successful!')
        router.push('/transactions')
      } else {
        const data = await res.json()
        toast.error(extractErrorMessage({ data }))
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubloading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#4A90e2] tracking-tight">Send Money</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Transfer funds instantly with intelligent spending categorization and fraud protection.
        </p>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <form onSubmit={handleTransfer} className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Source Card */}
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Source Card</h3>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
              ) : cards.length === 0 ? (
                <div className="p-6 border-2 border-dashed rounded-2xl text-center">
                  <p className="text-sm text-gray-400 mb-2">No physical cards connected</p>
                  <button type="button" onClick={() => router.push('/cards')} className="text-[#E94560] font-bold text-sm">Add a card first</button>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                  {cards.map(card => (
                    <button
                      key={card._id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sourceCardId: card._id }))}
                      className={`flex-shrink-0 w-56 sm:w-64 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left
                        ${form.sourceCardId === card._id 
                          ? 'border-[#E94560] bg-[#E94560]/5 ring-4 ring-[#E94560]/5' 
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <Building2 size={16} className="text-gray-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{card.bank}</span>
                      </div>
                      <p className="font-bold text-[#4A90e2] text-sm mb-0.5 truncate">{card.label}</p>
                      <p className="text-xs text-gray-500 font-medium mb-2 sm:mb-3">**** {card.pan.slice(-4)}</p>
                      <p className="text-sm font-black text-[#E94560]">{toNaira(card.availableBalance)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Amount */}
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction Details</h3>
            <div className="space-y-4">
              <div className="relative group">
                <label className="absolute left-4 sm:left-5 top-3 sm:top-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all group-focus-within:text-[#E94560]">Amount to Send</label>
                <span className="absolute left-4 sm:left-5 bottom-3 sm:bottom-4 text-xl sm:text-2xl font-black text-[#4A90e2]">₦</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  required
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: formatAmountInput(e.target.value) }))}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pt-9 sm:pt-10 pb-3 sm:pb-4 pl-9 sm:pl-10 pr-4 sm:pr-6 text-xl sm:text-2xl font-black text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
                />
              </div>
            </div>
          </section>

          {/* Recipient */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recipient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Bank Name</label>
                <select 
                  required
                  value={form.recipientBank}
                  onChange={e => setForm(f => ({ ...f, recipientBank: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all appearance-none"
                >
                  <option value="">Select Bank</option>
                  {BANKS.map(b => <option key={b.code} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Account Number</label>
                <input 
                  type="text"
                  required
                  maxLength={10}
                  placeholder="0123456789"
                  value={form.recipientAccount}
                  onChange={e => setForm(f => ({ ...f, recipientAccount: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="relative group">
              <label className="absolute left-5 top-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Name</label>
              <input 
                type="text"
                required
                placeholder="RECIPIENT NAME"
                value={form.recipientName}
                onChange={e => setForm(f => ({ ...f, recipientName: e.target.value.toUpperCase() }))}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pt-10 pb-4 px-5 text-sm font-bold text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase">Verified</span>
              </div>
            </div>
          </section>

          {/* Spending Category & Data Labeling */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Spending Category & Labeling</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Label this transfer so Orchestra AI, spending insights, and budgets stay organized.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SPENDING_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = form.category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 ${
                      isSelected 
                        ? `${cat.activeBg} shadow-md ring-2 ring-offset-1 ring-blue-400 font-semibold scale-[1.02]` 
                        : 'bg-gray-50/70 border-gray-200/80 hover:bg-gray-100/80 text-gray-700 font-medium'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : cat.color}`}>
                      <Icon size={15} />
                    </div>
                    <span className="text-xs flex-1 truncate">{cat.label}</span>
                    {isSelected && <CheckCircle2 size={14} className="shrink-0 opacity-90" />}
                  </button>
                )
              })}
            </div>

            {/* Optional Narration / Note */}
            <div className="relative group pt-1">
              <label className="absolute left-4 top-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Transaction Note / Narration (Optional)
              </label>
              <div className="relative flex items-center">
                <FileText size={16} className="absolute left-4 bottom-3.5 text-gray-400 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="e.g. Grocery run, Freelance retainer, Split rent"
                  value={form.narration}
                  onChange={e => setForm(f => ({ ...f, narration: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pt-8 pb-3 pl-11 pr-5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting || !form.amount || !form.recipientAccount || !form.recipientBank}
            className="w-full bg-[#4A90e2] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#252545] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
          >
            {submitting ? 'Processing Transfer...' : 'Confirm Transfer'}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6 font-medium">
        All transfers are subject to our <strong>Fraud Detection Engine</strong>. <br />
        Standard Interswitch network fees may apply.
      </p>
    </div>
  )
}
