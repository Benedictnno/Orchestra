'use client'
import { useEffect, useState, useCallback } from 'react'
import ApprovalQueue from '@/components/business/ApprovalQueue'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import toast from 'react-hot-toast'
import { Plus, Briefcase } from 'lucide-react'
import { toNaira } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface BusinessCard {
  _id: string
  label: string
  department?: string
  cardHolder?: string
  availableBalance: number
  spendLimit: number
  amountSpent: number
  cardStatus: string
}

interface ApprovalRequest {
  _id: string
  amount: number
  merchant: string
  requestedBy: string
  reason?: string
}

export default function BusinessPage() {
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/business')
      const data = await res.json()
      // The API returns { cards, pendingActions } in a single call
      setCards(Array.isArray(data?.cards) ? data.cards : [])
      setRequests(Array.isArray(data?.pendingActions) ? data.pendingActions : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleApprove(id: string) {
    try {
      await fetchWithAuth('/api/business/approve', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action: 'approve' })
      })
      setRequests(rs => rs.filter(r => r._id !== id))
      toast.success('Request approved')
    } catch { toast.error('Failed to approve') }
  }

  async function handleReject(id: string) {
    try {
      await fetchWithAuth('/api/business/approve', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action: 'reject' })
      })
      setRequests(rs => rs.filter(r => r._id !== id))
      toast.success('Request rejected')
    } catch { toast.error('Failed to reject') }
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
              const pct = Math.min(100, Math.round((card.amountSpent / card.spendLimit) * 100))
              return (
                <div key={card._id} className="bg-white rounded-2xl border p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Business</span>
                      <h3 className="font-bold text-[#4A90e2] mt-2">{card.label}</h3>
                      <p className="text-xs text-gray-400">{card.department} · {card.cardHolder}</p>
                    </div>
                    <p className="font-bold text-[#4A90e2]">{toNaira(card.availableBalance)}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{toNaira(card.amountSpent)} spent</span>
                      <span>Limit: {toNaira(card.spendLimit)}</span>
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
