'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface AddCardModalProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
}

const BANKS = ['GTBank', 'Access Bank', 'UBA', 'First Bank', 'Zenith Bank', 'Stanbic IBTC', 'Polaris Bank', 'Union Bank']
const PROGRAMS = ['VERVE', 'VISA', 'MASTERCARD']
const CARD_COLORS = [
  '#4A90e2',
  '#1A1A2E',
  '#E94560',
  '#0f3460',
  '#533483',
  '#1B4332',
]

export default function AddCardModal({ open, onClose, onAdded }: AddCardModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0])
  const [form, setForm] = useState({
    label: '',
    bank: 'GTBank',
    pan: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    cardProgram: 'VERVE',
    cardType: 'debit',
    accountNumber: ''
  })

  if (!open) return null

  function updateField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        color: selectedColor
      }

      // Backend expects expiryDate in YYMM format (e.g., '2612')
      const res = await fetchWithAuth('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to add card')
      }

      toast.success('Card added successfully!')
      onAdded()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-[#1A1A2E]">Add a Card</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Card color picker */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Card Colour</label>
            <div className="flex gap-2">
              {CARD_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full transition ${selectedColor === c ? 'ring-2 ring-[#E94560] ring-offset-2' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <InputField label="Card Label (e.g. My GTBank)" name="label" value={form.label} onChange={v => updateField('label', v)} placeholder="e.g. GTBank Salary" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bank</label>
              <select value={form.bank} onChange={e => updateField('bank', e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none">
                {BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Network</label>
              <select value={form.cardProgram} onChange={e => updateField('cardProgram', e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none">
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <InputField label="Card Number (16 digits)" name="pan" value={form.pan} onChange={v => updateField('pan', v)} placeholder="1234 5678 9012 3456" maxLength={16} />
          <InputField label="Name on Card" name="nameOnCard" value={form.nameOnCard} onChange={v => updateField('nameOnCard', v)} placeholder="JOHN DOE" />

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Expiry (YYMM)" name="expiryDate" value={form.expiryDate} onChange={v => updateField('expiryDate', v)} placeholder="2612" maxLength={4} />
            <InputField label="CVV" name="cvv" value={form.cvv} onChange={v => updateField('cvv', v)} placeholder="123" maxLength={4} />
          </div>

          <InputField label="Account Number (10 digits)" name="accountNumber" value={form.accountNumber} onChange={v => updateField('accountNumber', v)} placeholder="0123456789" maxLength={10} />

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Card Type</label>
            <select value={form.cardType} onChange={e => updateField('cardType', e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none">
              <option value="debit">Debit</option>
              <option value="prepaid">Prepaid</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !form.label || !form.pan}
            className="w-full bg-[#E94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63850] transition disabled:opacity-50"
          >
            {loading ? 'Adding card…' : 'Add Card'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InputField({ label, name, value, onChange, placeholder, maxLength }: {
  label: string; name: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        id={name}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
      />
    </div>
  )
}
