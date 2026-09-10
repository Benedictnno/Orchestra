'use client'
import { useState } from 'react'
import { toNaira } from '@/utils/format'
import { ApprovalRequest } from '@/api-client/types'
import { CheckCircle2, XCircle, Store, User, MessageSquare } from 'lucide-react'

interface ApprovalQueueProps {
  requests: ApprovalRequest[]
  onApprove: (id: string, note?: string) => void
  onReject: (id: string, note?: string) => void
}

export default function ApprovalQueue({ requests, onApprove, onReject }: ApprovalQueueProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={18} />
        </div>
        <p className="font-medium text-slate-800 text-xs">All caught up</p>
        <p className="text-slate-400 text-[11px] mt-0.5">No pending card approval requests</p>
      </div>
    )
  }

  function handleConfirmReject(id: string) {
    onReject(id, rejectNote.trim() || undefined)
    setRejectingId(null)
    setRejectNote('')
  }

  return (
    <div className="space-y-3">
      {requests.map(r => {
        const isRejecting = rejectingId === r._id
        const cardObj = typeof r.businessCardId === 'object' ? r.businessCardId : null
        
        return (
          <div 
            key={r._id} 
            className="border border-slate-200 bg-white rounded-lg p-3.5 shadow-sm space-y-2.5 transition-all hover:border-slate-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold font-mono tabular-nums text-slate-900 tracking-tight">
                  {toNaira(r.amount)}
                </p>
                <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Store size={12} className="text-slate-400" /> {r.merchant || 'Merchant Purchase'}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <User size={11} className="text-slate-400" /> {r.requestedBy || 'Cardholder'}
                  {cardObj?.purpose && <span className="text-slate-400">· {cardObj.purpose}</span>}
                </p>
              </div>

              <span className="text-[10px] uppercase font-medium bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/60">
                Pending Review
              </span>
            </div>

            {r.reason && (
              <div className="p-2 rounded-md bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                <MessageSquare size={12} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="italic">&ldquo;{r.reason}&rdquo;</p>
              </div>
            )}

            {isRejecting ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmReject(r._id)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <XCircle size={13} /> Confirm Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-md text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onApprove(r._id)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={13} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingId(r._id)}
                  className="px-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

