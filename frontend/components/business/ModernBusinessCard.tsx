'use client'
import { useState } from 'react'
import { 
  Building2, 
  User, 
  ShieldAlert, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Layers,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { toNaira } from '@/utils/format'
import { BusinessCard } from '@/api-client/types'
import { useUpdateBusinessCardStatus } from '@/hooks/useBusiness'
import toast from 'react-hot-toast'

interface ModernBusinessCardProps {
  card: BusinessCard
}

export default function ModernBusinessCard({ card }: ModernBusinessCardProps) {
  const [copied, setCopied] = useState(false)
  const { mutate: updateStatusMutation, isPending: updating } = useUpdateBusinessCardStatus()

  const limit = card.spendLimit || card.budget || 0
  const spent = card.amountSpent || 0
  const remaining = Math.max(0, limit - spent)
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0
  const isSuspended = card.status === 'suspended'
  const isExhausted = card.status === 'exhausted' || (limit > 0 && spent >= limit)

  function handleCopyPan() {
    if (card.pan) {
      navigator.clipboard.writeText(card.pan)
      setCopied(true)
      toast.success('Card number copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function toggleStatus() {
    const newStatus = isSuspended ? 'active' : 'suspended'
    updateStatusMutation(
      { id: card._id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Card ${newStatus === 'active' ? 'activated' : 'suspended'}`)
        },
        onError: () => {
          toast.error('Failed to update card status')
        }
      }
    )
  }

  // Formatting masked PAN
  const displayPan = card.pan 
    ? (card.pan.length > 8 ? `${card.pan.slice(0, 4)} •••• ${card.pan.slice(-4)}` : card.pan)
    : 'BIZ•••• 8921'

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
      isSuspended ? 'opacity-85 border-amber-200 bg-amber-50/10' : 'border-gray-100 hover:border-gray-200'
    }`}>
      {/* Visual Card Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#1A1D2E] via-[#161826] to-[#0E101B] text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full text-blue-300 border border-white/10 flex items-center gap-1">
              <Building2 size={11} /> {card.department || 'Corporate'}
            </span>
            {card.pendingApprovals ? (
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle size={10} /> {card.pendingApprovals} Pending
              </span>
            ) : null}
          </div>

          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
            isSuspended 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : isExhausted 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {isSuspended ? 'Suspended' : isExhausted ? 'Budget Exhausted' : 'Active'}
          </span>
        </div>

        <div className="my-2 relative z-10">
          <h3 className="text-lg font-bold text-white tracking-tight truncate">
            {card.label || card.purpose || 'Expense Card'}
          </h3>
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
            <User size={12} className="text-blue-400" /> {card.cardHolder || card.assignedTo || 'Team Member'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10">
          <button
            type="button"
            onClick={handleCopyPan}
            className="flex items-center gap-2 text-xs font-mono text-gray-300 hover:text-white transition group"
            title="Click to copy card PAN"
          >
            <span>{displayPan}</span>
            {copied ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} className="opacity-60 group-hover:opacity-100 transition" />
            )}
          </button>
          
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Available</p>
            <p className="text-sm font-black text-white">{toNaira(remaining)}</p>
          </div>
        </div>
      </div>

      {/* Card Details & Budget Controls */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Budget Progress */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-gray-500">
              <strong className="text-gray-900">{toNaira(spent)}</strong> spent
            </span>
            <span className="text-gray-400">
              Limit: <strong className="text-gray-700">{toNaira(limit)}</strong>
            </span>
          </div>

          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
            <span>{pct}% utilized</span>
            <span>{toNaira(remaining)} left</span>
          </div>
        </div>

        {/* Policy Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          {card.approvalThreshold ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
              <ShieldAlert size={12} className="text-amber-600" />
              Approvals &gt; {toNaira(card.approvalThreshold)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-[11px] font-medium">
              Auto-Approved Under Limit
            </span>
          )}

          {card.expiresAt ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 text-[11px]">
              <Calendar size={12} className="text-gray-400" />
              Expires {new Date(card.expiresAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        {/* Merchant Categories Chips */}
        {card.merchantCategories && card.merchantCategories.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Layers size={11} /> Allowed Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.merchantCategories.map((cat, i) => (
                <span key={i} className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-medium border border-blue-100">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            disabled={updating}
            onClick={toggleStatus}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              isSuspended
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {isSuspended ? (
              <>
                <Unlock size={13} className="text-emerald-600" /> Activate Card
              </>
            ) : (
              <>
                <Lock size={13} className="text-gray-500" /> Suspend Card
              </>
            )}
          </button>

          <span className="text-[11px] font-mono text-gray-400">
            ID: {card._id.slice(-6)}
          </span>
        </div>
      </div>
    </div>
  )
}
