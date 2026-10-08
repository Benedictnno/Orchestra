'use client'
import ApprovalQueue from '@/components/business/ApprovalQueue'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { ShieldCheck, Clock, Wallet } from 'lucide-react'
import { toNaira } from '@/utils/format'
import { useBusinessCards, useApprovalActions } from '@/hooks/useBusiness'
import { ApprovalRequest } from '@/api-client/types'

export default function BusinessQueuePage() {
  const { data, isLoading: loading } = useBusinessCards()
  const { approve, reject } = useApprovalActions()

  const requests: ApprovalRequest[] = data?.pendingActions || []
  const pendingTotal = requests.reduce((acc, r) => acc + (r.amount || 0), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Approval Queue</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review expense requests held by the policy engine. Approve to settle, or decline with a note.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-slate-900">Pending Requests</h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                Policy Engine
              </span>
            </div>
            {requests.length > 0 && (
              <span className="bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-medium border border-amber-200/60">
                {requests.length} pending
              </span>
            )}
          </div>
          {loading ? (
            <div className="py-12"><LoadingSpinner /></div>
          ) : (
            <ApprovalQueue requests={requests} onApprove={approve} onReject={reject} />
          )}
        </div>

        {/* Summary + policy */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-medium">Awaiting Review</span>
              <Clock size={14} className="text-slate-400" />
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums text-amber-600 tracking-tight">{requests.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Requests held for sign-off</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-medium">Value On Hold</span>
              <Wallet size={14} className="text-slate-400" />
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{toNaira(pendingTotal)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total of pending requests</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm space-y-2 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <h3 className="text-xs font-semibold text-white">Expense Policy Engine</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Transactions violating department merchant categories or exceeding configured approval thresholds are held for admin sign-off before settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
