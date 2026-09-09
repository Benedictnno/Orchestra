'use client'
import { useState } from 'react'
import { toNaira } from '@/utils/format'
import { ApprovalRequest } from '@/api-client/types'
import { CheckCircle2, XCircle, Store, User, Clock, MessageSquare } from 'lucide-react'

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
      <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} />
        </div>
        <p className="font-bold text-gray-800 text-sm">All caught up!</p>
        <p className="text-gray-400 text-xs mt-0.5">No pending card approval requests</p>
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
            className="border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white rounded-2xl p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-black text-gray-900 tracking-tight">{toNaira(r.amount)}</p>
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
                  <Store size={13} className="text-amber-600" /> {r.merchant || 'Merchant Purchase'}
                </p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <User size={11} className="text-gray-400" /> {r.requestedBy || 'Cardholder'}
                  {cardObj?.purpose && <span className="text-gray-400">· {cardObj.purpose}</span>}
                </p>
              </div>

              <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Pending
              </span>
            </div>

            {r.reason && (
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-start gap-2">
                <MessageSquare size={13} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="italic font-normal">&ldquo;{r.reason}&rdquo;</p>
              </div>
            )}

            {isRejecting ? (
              <div className="space-y-2 pt-1 border-t border-amber-100">
                <input
                  type="text"
                  placeholder="Reason for rejection (optional)..."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400 font-medium"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmReject(r._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> Confirm Rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onApprove(r._id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingId(r._id)}
                  className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
