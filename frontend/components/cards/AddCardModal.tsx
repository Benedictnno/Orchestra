'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, CreditCard, Lock } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface AddCardModalProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
}

const BANKS = ['GTBank', 'Access Bank', 'UBA', 'First Bank', 'Zenith Bank', 'Stanbic IBTC', 'Polaris Bank', 'Union Bank']
const PROGRAMS = ['VERVE', 'VISA', 'MASTERCARD']
const CARD_COLORS = [
  '#0f172a',
  '#1e293b',
  '#1e1b4b',
  '#134e4a',
  '#312e81',
  '#3b0764',
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

      toast.success('Card added successfully')
      onAdded()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-slate-200/80 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-slate-500" />
            <h2 className="text-xs font-semibold text-slate-900">Link Bank Card</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Card Finish Swatches */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Card Finish Palette</label>
            <div className="flex gap-2">
              {CARD_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-md transition-all ${selectedColor === c ? 'ring-2 ring-slate-900 ring-offset-2 scale-105' : 'opacity-80 hover:opacity-100'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <InputField label="Card Label" name="label" value={form.label} onChange={v => updateField('label', v)} placeholder="e.g. Salary Primary Account" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Issuing Bank</label>
              <select
                value={form.bank}
                onChange={e => updateField('bank', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:outline-none shadow-xs"
              >
                {BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Payment Network</label>
              <select
                value={form.cardProgram}
                onChange={e => updateField('cardProgram', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:outline-none shadow-xs"
              >
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <InputField label="Card Number (PAN 16 Digits)" name="pan" value={form.pan} onChange={v => updateField('pan', v.replace(/\D/g, ''))} placeholder="1234 5678 9012 3456" maxLength={16} isMono />
          <InputField label="Name on Card" name="nameOnCard" value={form.nameOnCard} onChange={v => updateField('nameOnCard', v.toUpperCase())} placeholder="JOHN DOE" />

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Expiry (YYMM)" name="expiryDate" value={form.expiryDate} onChange={v => updateField('expiryDate', v.replace(/\D/g, ''))} placeholder="2612" maxLength={4} isMono />
            <InputField label="CVV" name="cvv" value={form.cvv} onChange={v => updateField('cvv', v.replace(/\D/g, ''))} placeholder="123" maxLength={4} isMono />
          </div>

          <InputField label="Account Number (10 Digits)" name="accountNumber" value={form.accountNumber} onChange={v => updateField('accountNumber', v.replace(/\D/g, ''))} placeholder="0123456789" maxLength={10} isMono />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !form.label || !form.pan}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
            >
              <Lock size={12} />
              <span>{loading ? 'Verifying & Linking...' : 'Authorize & Link Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InputField({ label, name, value, onChange, placeholder, maxLength, isMono = false }: {
  label: string; name: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; isMono?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[11px] font-medium text-slate-500 mb-1 block">{label}</label>
      <input
        id={name}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:outline-none shadow-xs ${isMono ? 'font-mono' : ''}`}
      />
    </div>
  )
}

