'use client'
import { useState } from 'react'
import { 
  X, 
  Briefcase, 
  User, 
  Building2, 
  CreditCard, 
  ShieldAlert, 
  Calendar, 
  Sparkles,
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

  const budgetNum = parseFloat(form.budget.replace(/,/g, '') || '0') * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-gray-900 to-[#1A1A2E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-white">Issue Corporate Business Card</h2>
              <p className="text-xs text-gray-400">Provision smart expense cards with automated approval policies</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Card Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-500" /> Live Card Preview
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                {form.department}
              </span>
            </div>
            <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#1E2235] via-[#16192B] to-[#0D101D] text-white shadow-xl overflow-hidden border border-gray-700/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-5 rounded bg-amber-400/80 border border-amber-300/40 flex items-center justify-center text-[8px] font-bold text-amber-950">
                    CHIP
                  </div>
                  <span className="text-xs font-mono tracking-widest text-gray-300">ORCHESTRA BIZ</span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2.5 py-0.5 rounded-full">
                  Corporate
                </span>
              </div>

              <div className="my-2">
                <p className="text-xs text-gray-400 font-medium">Monthly Spend Limit</p>
                <p className="text-2xl font-black text-white tracking-tight">
                  {budgetNum > 0 ? toNaira(budgetNum) : '₦0.00'}
                </p>
              </div>

              <div className="flex justify-between items-end pt-3 border-t border-white/10 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Cardholder</p>
                  <p className="font-bold text-gray-100 truncate max-w-[200px]">
                    {form.assignedTo || 'Employee Name'}
                  </p>
                </div>
                <div className="text-right font-mono text-gray-300">
                  <p className="text-[10px] text-gray-400 uppercase">Card Label</p>
                  <p className="font-semibold text-gray-200 truncate max-w-[180px]">
                    {form.label || 'Expense Card'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Card & Team Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-blue-500" /> Card Label / Purpose *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. AWS & Cloud Tools"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User size={14} className="text-blue-500" /> Assigned Cardholder *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Emeka Okafor"
                  value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-500" /> Department
              </label>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Budget & Policy Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Budget & Spending Limits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Monthly Budget (₦) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">₦</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    placeholder="150,000"
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: formatNumberInput(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-500" /> Card Expiry
                </label>
                <select
                  value={form.expiryMonths}
                  onChange={e => setForm(f => ({ ...f, expiryMonths: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
              </div>
            </div>

            {/* Approval threshold checkbox & input */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={form.hasThreshold}
                  onChange={e => setForm(f => ({ ...f, hasThreshold: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-500" />
                  Require Manager Approval for High-Value Purchases
                </span>
              </label>

              {form.hasThreshold && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Approval Threshold Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">₦</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="25,000"
                      value={form.approvalThreshold}
                      onChange={e => setForm(f => ({ ...f, approvalThreshold: formatNumberInput(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Any transaction on this card exceeding this amount will route directly to your Approval Queue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Allowed Merchant Categories */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Layers size={14} className="text-blue-500" /> Allowed Merchant Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => {
                const isSelected = form.merchantCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.budget || !form.label || !form.assignedTo}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#4A90e2] hover:bg-[#357abd] text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              {submitting ? 'Issuing Card...' : 'Issue Business Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
