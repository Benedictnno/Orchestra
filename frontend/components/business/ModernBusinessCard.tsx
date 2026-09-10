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
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-sm hover:border-slate-300 ${
      isSuspended ? 'opacity-75 border-amber-200 bg-amber-50/10' : 'border-slate-200/80'
    }`}>
      {/* Visual Card Banner */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/40 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 flex items-center gap-1">
              <Building2 size={10} /> {card.department || 'Corporate'}
            </span>
            {card.pendingApprovals ? (
              <span className="text-[10px] uppercase font-medium bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle size={10} /> {card.pendingApprovals} Pending
              </span>
            ) : null}
          </div>

          <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${
            isSuspended 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : isExhausted 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {isSuspended ? 'Suspended' : isExhausted ? 'Exhausted' : 'Active'}
          </span>
        </div>

        <div className="my-1.5 relative z-10">
          <h3 className="text-sm font-semibold text-white tracking-tight truncate">
            {card.label || card.purpose || 'Expense Card'}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <User size={11} className="text-slate-400" /> {card.cardHolder || card.assignedTo || 'Team Member'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 relative z-10">
          <button
            type="button"
            onClick={handleCopyPan}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
            title="Click to copy card PAN"
          >
            <span>{displayPan}</span>
            {copied ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy size={12} className="opacity-60 hover:opacity-100" />
            )}
          </button>
          
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-medium">Available</p>
            <p className="text-xs font-semibold font-mono tabular-nums text-white">{toNaira(remaining)}</p>
          </div>
        </div>
      </div>

      {/* Card Details & Budget Controls */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Budget Progress */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-slate-500">
              <strong className="text-slate-900 font-mono tabular-nums">{toNaira(spent)}</strong> spent
            </span>
            <span className="text-slate-400 text-[11px] font-mono tabular-nums">
              Limit: {toNaira(limit)}
            </span>
          </div>

          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-slate-900'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 font-mono tabular-nums">
            <span>{pct}% utilized</span>
            <span>{toNaira(remaining)} left</span>
          </div>
        </div>

        {/* Policy Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          {card.approvalThreshold ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-medium font-mono tabular-nums">
              <ShieldAlert size={11} className="text-amber-600" />
              Approvals &gt; {toNaira(card.approvalThreshold)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-medium">
              Auto-Approved Under Limit
            </span>
          )}

          {card.expiresAt ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-mono">
              <Calendar size={11} className="text-slate-400" />
              Exp {new Date(card.expiresAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        {/* Merchant Categories Chips */}
        {card.merchantCategories && card.merchantCategories.length > 0 && (
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers size={10} /> Allowed Categories
            </p>
            <div className="flex flex-wrap gap-1">
              {card.merchantCategories.map((cat, i) => (
                <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={updating}
            onClick={toggleStatus}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              isSuspended
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {isSuspended ? (
              <>
                <Unlock size={12} className="text-emerald-600" /> Unsuspend Card
              </>
            ) : (
              <>
                <Lock size={12} className="text-slate-400" /> Suspend Card
              </>
            )}
          </button>

          <span className="text-[10px] font-mono text-slate-400">
            ID: {card._id.slice(-6)}
          </span>
        </div>
      </div>
    </div>
  )
}

