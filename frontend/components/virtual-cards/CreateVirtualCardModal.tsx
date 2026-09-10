'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { X, ShieldAlert } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface CreateVirtualCardModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface PhysicalCard {
  _id: string
  label?: string
  bank?: string
}

export default function CreateVirtualCardModal({ open, onClose, onCreated }: CreateVirtualCardModalProps) {
  const [loading, setLoading] = useState(false)
  const [physicalCards, setPhysicalCards] = useState<PhysicalCard[]>([])
  const [form, setForm] = useState({
    label: '',
    merchant: '',
    spendLimit: '',
    parentCardId: '',
    autoRenew: true,
  })

  useEffect(() => {
    if (!open) return
    fetchWithAuth('/api/cards')
      .then(r => r.json())
      .then(d => {
        const cards = d.cards || []
        setPhysicalCards(cards)
        if (cards.length > 0 && !form.parentCardId) {
          setForm(f => ({ ...f, parentCardId: cards[0]._id }))
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  function update(k: string, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.parentCardId) {
      toast.error('Please add a physical card first before creating a virtual card')
      return
    }
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/virtual-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: form.label,
          merchant: form.merchant || undefined,
          spendLimit: parseFloat(form.spendLimit),
          parentCardId: form.parentCardId,
          autoRenew: form.autoRenew,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      toast.success('Virtual card created!')
      onCreated()
      onClose()
      setForm({ label: '', merchant: '', spendLimit: '', parentCardId: '', autoRenew: true })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create virtual card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Create Virtual Card</h2>
            <p className="text-xs text-slate-500 mt-0.5">Provision an isolated merchant-locked virtual card</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent card selector */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Source Funding Card</label>
            {physicalCards.length === 0 ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>You need to link a funding bank card first before provisioning virtual cards.</p>
              </div>
            ) : (
              <select
                value={form.parentCardId}
                onChange={e => update('parentCardId', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                {physicalCards.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.label || c.bank || c._id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Card Purpose / Label</label>
            <input
              type="text"
              placeholder="e.g. AWS Cloud Infrastructure"
              value={form.label}
              onChange={e => update('label', e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
              Lock to Specific Merchant <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Amazon Web Services"
              value={form.merchant}
              onChange={e => update('merchant', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Monthly Spend Limit (NGN)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₦</span>
              <input
                type="number"
                placeholder="50,000"
                value={form.spendLimit}
                onChange={e => update('spendLimit', e.target.value)}
                required
                min="1"
                className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-mono tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={form.autoRenew}
              onChange={e => update('autoRenew', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Auto-reset spend limit on 1st of every month</span>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !form.label || !form.spendLimit || !form.parentCardId}
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Provisioning Card…' : 'Create Virtual Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

