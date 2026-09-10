'use client'
import { useState, useEffect } from 'react'
import { Zap, Wifi, Tv, Droplets, Check, ShieldCheck, CreditCard } from 'lucide-react'
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

const BILL_CATEGORIES = [
  { 
    id: 'electricity', 
    label: 'Electricity', 
    desc: 'Prepaid & Postpaid Meters',
    icon: Zap, 
    billers: ['EKEDC', 'IKEDC', 'PHED', 'AEDC', 'EEDC', 'IBEDC'] 
  },
  { 
    id: 'tv', 
    label: 'Cable & TV', 
    desc: 'Decoder Subscriptions',
    icon: Tv, 
    billers: ['DSTV', 'GOTV', 'STARTIMES', 'SHOWMAX'] 
  },
  { 
    id: 'internet', 
    label: 'Internet & Data', 
    desc: 'ISP & Broadband Bundles',
    icon: Wifi, 
    billers: ['MTN', 'AIRTEL', 'GLO', '9MOBILE', 'SMILE', 'SPECTRANET'] 
  },
  { 
    id: 'water', 
    label: 'Utilities & Water', 
    desc: 'Municipal Water Boards',
    icon: Droplets, 
    billers: ['LWC', 'Water Board', 'FCT Water'] 
  },
]

export default function BillsPage() {
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubloading] = useState(false)
  const [selectedCat, setSelectedCat] = useState(BILL_CATEGORIES[0])
  
  const [form, setForm] = useState({
    amount: '',
    sourceCardId: '',
    billerCode: '',
    customerId: '',
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

  const selectedCard = cards.find(c => c._id === form.sourceCardId)

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || !form.billerCode || !form.customerId) return
    
    setSubloading(true)
    try {
      const res = await fetchWithAuth('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      
      if (res.ok) {
        toast.success('Bill Payment Successful!')
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Pay Bills</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Direct settlement of utility invoices, internet subscriptions, and services from linked funding accounts.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <form onSubmit={handlePayment} className="p-6 sm:p-7 space-y-6">
          {/* Category Selector */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-2.5">
              Service Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BILL_CATEGORIES.map(cat => {
                const isSelected = selectedCat.id === cat.id
                const IconComponent = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { 
                      setSelectedCat(cat)
                      setForm(f => ({ ...f, billerCode: '' })) 
                    }}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all relative ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComponent size={15} />
                      </div>
                      {isSelected && <Check size={13} className="text-white" />}
                    </div>
                    <span className="text-xs font-semibold">{cat.label}</span>
                    <span className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}>
                      {cat.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Funding Source Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-700">Funding Card</label>
              {selectedCard && (
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Avail: <strong className="text-slate-900 font-medium">{toNaira(selectedCard.availableBalance)}</strong>
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-16 bg-slate-50 animate-pulse rounded-lg border border-slate-100 w-full" />
            ) : cards.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No funding cards found. Please link a bank card in the Cards tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {cards.map(card => {
                  const isSelected = form.sourceCardId === card._id
                  return (
                    <button
                      key={card._id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sourceCardId: card._id }))}
                      className={`p-3 rounded-lg border text-left transition-all relative ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/70 ring-1 ring-slate-900 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <CreditCard size={13} />
                          <span className="text-[11px] font-mono">•••• {card.pan.slice(-4)}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-900 truncate">{card.label}</p>
                      <p className="text-xs font-mono font-medium text-slate-700 mt-1 tabular-nums">
                        {toNaira(card.availableBalance)}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Biller & Customer Details */}
          <div className="space-y-4 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                  Service Provider / Biller
                </label>
                <select 
                  required
                  value={form.billerCode}
                  onChange={e => setForm(f => ({ ...f, billerCode: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                >
                  <option value="">Select Biller</option>
                  {selectedCat.billers.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                  Customer ID / SmartCard / Meter No.
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 04192849102"
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                Payment Amount (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₦</span>
                <input 
                  type="number"
                  required
                  placeholder="0.00"
                  min="1"
                  step="any"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-mono tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>
            </div>
          </div>

          {/* Action Button & Security */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !form.amount || !form.billerCode || !form.customerId || !form.sourceCardId}
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? 'Processing Payment…' : `Pay ${form.amount ? toNaira(parseFloat(form.amount)) : 'Bill'}`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Direct automated provider settlement • 256-bit encrypted</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

