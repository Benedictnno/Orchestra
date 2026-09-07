'use client'
import ApprovalQueue from '@/components/business/ApprovalQueue'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import toast from 'react-hot-toast'
import { Plus, Briefcase } from 'lucide-react'
import { toNaira } from '@/utils/format'
import { useBusinessCards, useApproveExpense } from '@/hooks/useBusiness'
import { BusinessCard, ApprovalRequest } from '@/api-client/types'

export default function BusinessPage() {
  const { data, isLoading: loading } = useBusinessCards()
  const { mutate: approveExpenseMutation } = useApproveExpense()

  const cards: BusinessCard[] = data?.cards || []
  const requests: ApprovalRequest[] = data?.pendingActions || []

  function handleApprove(id: string) {
    approveExpenseMutation(
      { requestId: id, action: 'approve' },
      {
        onSuccess: () => toast.success('Request approved'),
        onError: () => toast.error('Failed to approve'),
      }
    )
  }

  function handleReject(id: string) {
    approveExpenseMutation(
      { requestId: id, action: 'reject' },
      {
        onSuccess: () => toast.success('Request rejected'),
        onError: () => toast.error('Failed to reject'),
      }
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#4A90e2]">Business Cards</h1>
          <p className="text-gray-500 text-sm mt-1">Manage team cards, budgets, and approval workflows</p>
        </div>
        <button className="flex items-center gap-2 bg-[#E94560] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63850] transition">
          <Plus size={16} /> New Card
        </button>
      </div>

      {loading && <div className="py-16"><LoadingSpinner /></div>}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business cards list */}
          <div className="lg:col-span-2 space-y-4">
            {cards.length === 0 ? (
              <EmptyState
                title="No business cards"
                description="Create cards for your team departments with spend limits"
                action={{ label: 'Create Card', icon: <Briefcase size={20} />, onClick: () => {} }}
              />
            ) : cards.map(card => {
              const limit = card.spendLimit || card.budget || 0
              const pct = limit > 0 ? Math.min(100, Math.round((card.amountSpent / limit) * 100)) : 0
              return (
                <div key={card._id} className="bg-white rounded-2xl border p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Business</span>
                      <h3 className="font-bold text-[#4A90e2] mt-2">{card.label || card.purpose || 'Expense Card'}</h3>
                      <p className="text-xs text-gray-400">{card.department || 'General'} · {card.cardHolder || card.assignedTo}</p>
                    </div>
                    <p className="font-bold text-[#4A90e2]">{toNaira(card.availableBalance || (limit - card.amountSpent))}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{toNaira(card.amountSpent)} spent</span>
                      <span>Limit: {toNaira(limit)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Approval queue */}
          <div className="bg-white rounded-2xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#4A90e2]">Approval Queue</h2>
              {requests.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {requests.length} pending
                </span>
              )}
            </div>
            <ApprovalQueue requests={requests} onApprove={handleApprove} onReject={handleReject} />
          </div>
        </div>
      )}
    </div>
  )
}
