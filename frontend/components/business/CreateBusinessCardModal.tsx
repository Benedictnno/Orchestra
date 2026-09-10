'use client'
import { useState } from 'react'
import { 
  X, 
  User, 
  Building2, 
  CreditCard, 
  ShieldAlert, 
  Calendar, 
  Layers
} from 'lucide-react'
import { toNaira } from '@/utils/format'
import { useCreateBusinessCard } from '@/hooks/useBusiness'
import toast from 'react-hot-toast'
import { extractErrorMessage } from '@/lib/utils'

interface CreateBusinessCardModalProps {
  open: boolean
  onClose: () => void
}

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Operations',
  'Finance',
  'Product',
  'Executive',
  'Human Resources',
  'Customer Support',
  'General',
]

const CATEGORY_OPTIONS = [
  'SaaS & Software',
  'Cloud Infrastructure',
  'Travel & Lodging',
  'Advertising & Marketing',
  'Office & Hardware',
  'Meals & Entertainment',
  'Transportation & Fuel',
  'Professional Services',
]

function formatNumberInput(val: string): string {
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

export default function CreateBusinessCardModal({ open, onClose }: CreateBusinessCardModalProps) {
  const { mutate: createCardMutation, isPending: submitting } = useCreateBusinessCard()

  const [form, setForm] = useState({
    label: '',
    assignedTo: '',
    department: 'Engineering',
    budget: '',
    approvalThreshold: '',
    hasThreshold: false,
    merchantCategories: ['SaaS & Software', 'Cloud Infrastructure'],
    expiryMonths: '12',
  })

  if (!open) return null

  function toggleCategory(cat: string) {
    setForm(f => {
      const exists = f.merchantCategories.includes(cat)
      const next = exists 
        ? f.merchantCategories.filter(c => c !== cat)
        : [...f.merchantCategories, cat]
      return { ...f, merchantCategories: next }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericBudget = parseFloat(form.budget.replace(/,/g, ''))
    if (!numericBudget || isNaN(numericBudget) || numericBudget <= 0) {
      toast.error('Please enter a valid card budget')
      return
    }

    const numericThreshold = form.hasThreshold && form.approvalThreshold
      ? parseFloat(form.approvalThreshold.replace(/,/g, ''))
      : undefined

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + parseInt(form.expiryMonths || '12', 10))

    createCardMutation(
      {
        label: form.label.trim() || `${form.department} Expense Card`,
        purpose: form.label.trim() || `${form.department} Operational Spend`,
        assignedTo: form.assignedTo.trim() || 'Team Member',
        department: form.department,
        budget: numericBudget,
        approvalThreshold: numericThreshold,
        merchantCategories: form.merchantCategories,
        expiresAt: expiresAt.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Business Card issued successfully!')
          onClose()
        },
        onError: (err: any) => {
          toast.error(extractErrorMessage(err) || 'Failed to issue card')
        },
      }
    )
  }

  const budgetNum = parseFloat(form.budget.replace(/,/g, '') || '0')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Issue Corporate Card</h2>
            <p className="text-xs text-slate-500 mt-0.5">Provision a department team expense card with spending controls</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Card Live Preview */}
          <div className="rounded-lg p-4 bg-slate-900 text-white shadow-sm border border-slate-800">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded bg-amber-400/80 border border-amber-300/40" />
                <span className="text-[10px] font-mono tracking-widest text-slate-400">ORCHESTRA BIZ</span>
              </div>
              <span className="text-[10px] uppercase font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {form.department}
              </span>
            </div>

            <div className="my-2">
              <p className="text-[10px] text-slate-400 font-medium uppercase">Spend Limit</p>
              <p className="text-lg font-semibold font-mono tabular-nums text-white tracking-tight">
                {budgetNum > 0 ? toNaira(budgetNum) : '₦0.00'}
              </p>
            </div>

            <div className="flex justify-between items-end pt-2 border-t border-slate-800 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Cardholder</p>
                <p className="text-xs font-medium text-slate-200 truncate max-w-[180px]">
                  {form.assignedTo || 'Team Member'}
                </p>
              </div>
              <div className="text-right font-mono text-slate-400">
                <p className="text-[10px] text-slate-400 uppercase">Purpose</p>
                <p className="text-xs font-medium text-slate-300 truncate max-w-[160px]">
                  {form.label || 'Operational Spend'}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Card Purpose / Label *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. AWS & Cloud Tools"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Assigned Cardholder *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Emeka Okafor"
                  value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 block">Department</label>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Budget & Policy Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Monthly Budget (NGN) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₦</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    placeholder="150,000"
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: formatNumberInput(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-mono tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1.5 block">Card Expiry</label>
                <select
                  value={form.expiryMonths}
                  onChange={e => setForm(f => ({ ...f, expiryMonths: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
              </div>
            </div>

            {/* Approval threshold checkbox & input */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={form.hasThreshold}
                  onChange={e => setForm(f => ({ ...f, hasThreshold: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-800">
                  Require managerial sign-off for large transactions
                </span>
              </label>

              {form.hasThreshold && (
                <div className="pt-1 animate-in fade-in duration-150">
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Approval Threshold Amount (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₦</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="25,000"
                      value={form.approvalThreshold}
                      onChange={e => setForm(f => ({ ...f, approvalThreshold: formatNumberInput(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-1.5 text-xs font-mono tabular-nums text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Any transaction on this card exceeding this amount will route directly to your Approval Queue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Allowed Merchant Categories */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Layers size={12} className="text-slate-500" /> Allowed Merchant Categories
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map(cat => {
                const isSelected = form.merchantCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition ${
                      isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.budget || !form.label || !form.assignedTo}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm disabled:opacity-50 transition"
            >
              {submitting ? 'Issuing Card…' : 'Issue Corporate Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

