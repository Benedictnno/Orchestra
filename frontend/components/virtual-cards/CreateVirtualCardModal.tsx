'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-[#4A90e2]">Create Virtual Card</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set up in under 30 seconds</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent card selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Linked Physical Card</label>
            {physicalCards.length === 0 ? (
              <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                ⚠ You need to add a physical card first before creating a virtual card.
              </p>
            ) : (
              <select
                value={form.parentCardId}
                onChange={e => update('parentCardId', e.target.value)}
                required
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
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
            <label className="text-xs text-gray-500 mb-1 block">Card Label</label>
            <input
              type="text"
              placeholder="e.g. Netflix Subscription"
              value={form.label}
              onChange={e => update('label', e.target.value)}
              required
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lock to Merchant (optional)</label>
            <input
              type="text"
              placeholder="e.g. Netflix"
              value={form.merchant}
              onChange={e => update('merchant', e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monthly Spend Limit (₦)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={form.spendLimit}
              onChange={e => update('spendLimit', e.target.value)}
              required
              min="1"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.autoRenew}
              onChange={e => update('autoRenew', e.target.checked)}
              className="w-4 h-4 rounded accent-[#E94560]"
            />
            <span className="text-sm text-gray-700">Auto-renew monthly</span>
          </label>

          <button
            type="submit"
            disabled={loading || !form.label || !form.spendLimit || !form.parentCardId}
            className="w-full bg-[#E94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63850] transition disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Virtual Card'}
          </button>
        </form>
      </div>
    </div>
  )
}
