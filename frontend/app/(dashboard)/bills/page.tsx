'use client'
import { useState, useEffect } from 'react'
import { Zap, Wifi, Tv, Droplets, ArrowRight } from 'lucide-react'
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
  { id: 'electricity', label: 'Electricity', icon: Zap, color: 'bg-yellow-50 text-yellow-600', billers: ['EKEDC', 'IKEDC', 'PHED'] },
  { id: 'tv', label: 'Cable TV', icon: Tv, color: 'bg-blue-50 text-blue-600', billers: ['DSTV', 'GOTV', 'STARTIMES'] },
  { id: 'internet', label: 'Internet', icon: Wifi, color: 'bg-purple-50 text-purple-600', billers: ['MTN', 'AIRTEL', 'GLO', '9MOBILE'] },
  { id: 'water', label: 'Utilities', icon: Droplets, color: 'bg-cyan-50 text-cyan-600', billers: ['LWC', 'Water Board'] },
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
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#4A90e2] tracking-tight">Pay Bills</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Settled utilities and services instantly using your connected cards.
        </p>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <form onSubmit={handlePayment} className="p-8 space-y-8">
          {/* Categories */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BILL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setSelectedCat(cat); setForm(f => ({ ...f, billerCode: '' })) }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                    ${selectedCat.id === cat.id 
                      ? 'border-[#E94560] bg-[#E94560]/5' 
                      : 'border-gray-50 hover:border-gray-100 bg-gray-50/50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#4A90e2] uppercase">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Source Card */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Method</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {loading ? (
                <div className="h-24 bg-gray-50 animate-pulse rounded-2xl w-full" />
              ) : (
                cards.map(card => (
                  <button
                    key={card._id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, sourceCardId: card._id }))}
                    className={`flex-shrink-0 w-64 p-5 rounded-2xl border-2 transition-all text-left
                      ${form.sourceCardId === card._id 
                        ? 'border-[#E94560] bg-[#E94560]/5' 
                        : 'border-gray-50 hover:border-gray-100 bg-gray-50/50'}`}
                  >
                    <p className="font-bold text-[#4A90e2] text-sm mb-0.5">{card.label}</p>
                    <p className="text-xs text-gray-500 font-medium mb-3">**** {card.pan.slice(-4)}</p>
                    <p className="text-sm font-black text-[#E94560]">{toNaira(card.availableBalance)}</p>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Bill Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Biller Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Provider</label>
                <select 
                  required
                  value={form.billerCode}
                  onChange={e => setForm(f => ({ ...f, billerCode: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
                >
                  <option value="">Select Biller</option>
                  {selectedCat.billers.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Customer ID / Meter</label>
                <input 
                  type="text"
                  required
                  placeholder="ID Number"
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 text-sm font-bold text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="relative group">
              <label className="absolute left-5 top-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all group-focus-within:text-[#E94560]">Amount to Pay</label>
              <span className="absolute left-5 bottom-4 text-2xl font-black text-[#4A90e2]">₦</span>
              <input 
                type="number"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pt-10 pb-4 pl-10 pr-6 text-2xl font-black text-[#4A90e2] focus:outline-none focus:border-[#E94560]/20 focus:bg-white transition-all"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting || !form.amount || !form.billerCode || !form.customerId}
            className="w-full bg-[#E94560] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#d63850] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#E94560]/20"
          >
            {submitting ? 'Processing Payment...' : 'Pay Bill Now'}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
