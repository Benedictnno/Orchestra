'use client'
import { useState, useEffect } from 'react'
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react'
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
]

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
    recipientName: ''
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
    if (!form.amount || !form.recipientAccount || !form.recipientBank) return
    
    setSubloading(true)
    try {
      const res = await fetchWithAuth('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
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
          Transfer funds instantly to any bank account in Nigeria.
        </p>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <form onSubmit={handleTransfer} className="p-8 space-y-8">
          {/* Source Card */}
          <section className="space-y-4">
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
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {cards.map(card => (
                    <button
                      key={card._id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sourceCardId: card._id }))}
                      className={`flex-shrink-0 w-64 p-5 rounded-2xl border-2 transition-all text-left
                        ${form.sourceCardId === card._id 
                          ? 'border-[#E94560] bg-[#E94560]/5 ring-4 ring-[#E94560]/5' 
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <Building2 size={16} className="text-gray-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{card.bank}</span>
                      </div>
                      <p className="font-bold text-[#4A90e2] text-sm mb-0.5">{card.label}</p>
                      <p className="text-xs text-gray-500 font-medium mb-3">**** {card.pan.slice(-4)}</p>
                      <p className="text-sm font-black text-[#E94560]">{toNaira(card.availableBalance)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Amount */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction Details</h3>
            <div className="space-y-4">
              <div className="relative group">
                <label className="absolute left-5 top-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all group-focus-within:text-[#E94560]">Amount to Send</label>
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
