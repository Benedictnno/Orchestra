'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Shield, ShieldOff, Eye, EyeOff } from 'lucide-react'
import { cardStatusLabel } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { cn } from '@/utils/cn'

interface CardActionsProps {
  cardId: string
  cardStatus: string
  onStatusChange: (newStatus: string) => void
}

export default function CardActions({ cardId, cardStatus, onStatusChange }: CardActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showPan, setShowPan] = useState(false)
  const isBlocked = cardStatus === '2'

  async function toggleBlock() {
    setLoading(true)
    try {
      const action = isBlocked ? 'unblock' : 'block'
      const res = await fetchWithAuth(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const newStatus = isBlocked ? '1' : '2'
      onStatusChange(newStatus)
      toast.success(`Card ${isBlocked ? 'unblocked' : 'blocked'} successfully`)
    } catch {
      toast.error('Action failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleBlock}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs disabled:opacity-50',
            isBlocked
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          )}
        >
          {isBlocked ? <Shield size={13} /> : <ShieldOff size={13} className="text-slate-500" />}
          <span>{isBlocked ? 'Unlock Card' : 'Freeze Card'}</span>
        </button>

        <button
          onClick={() => setShowPan(v => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
        >
          {showPan ? <EyeOff size={13} className="text-slate-500" /> : <Eye size={13} className="text-slate-500" />}
          <span>{showPan ? 'Hide Numbers' : 'Show Numbers'}</span>
        </button>
      </div>

      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border font-mono',
        cardStatus === '1'
          ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
          : cardStatus === '2'
            ? 'bg-rose-50 text-rose-700 border-rose-200/60'
            : 'bg-slate-100 text-slate-600 border-slate-200/60'
      )}>
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          cardStatus === '1' ? 'bg-emerald-500' : cardStatus === '2' ? 'bg-rose-500' : 'bg-slate-400'
        )} />
        {cardStatusLabel(cardStatus)}
      </span>
    </div>
  )
}

