'use client'
import { toNaira } from '@/utils/format'
import { ApprovalRequest } from '@/api-client/types'

interface ApprovalQueueProps {
  requests: ApprovalRequest[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export default function ApprovalQueue({ requests, onApprove, onReject }: ApprovalQueueProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">✓</div>
        <p className="text-gray-500 text-sm">No pending approvals</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map(r => (
        <div key={r._id} className="border border-amber-200 bg-amber-50 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-[#1A1A2E]">{toNaira(r.amount)}</p>
              <p className="text-sm text-gray-600">{r.merchant} · {r.requestedBy}</p>
              {r.reason && <p className="text-xs text-gray-400 mt-1">{r.reason}</p>}
            </div>
            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Pending</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(r._id)}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(r._id)}
              className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
