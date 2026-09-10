'use client'
import { useEffect, useState, useCallback } from 'react'
import VirtualCardList from '@/components/virtual-cards/VirtualCardList'
import CreateVirtualCardModal from '@/components/virtual-cards/CreateVirtualCardModal'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorState from '@/components/shared/ErrorState'
import { Plus } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface VirtualCard {
  _id: string
  label: string
  merchant?: string
  amountSpent: number
  spendLimit: number
  paused?: boolean
  autoRenew?: boolean
}

export default function VirtualCardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetchWithAuth('/api/virtual-cards')
      const data = await res.json()
      setCards(Array.isArray(data?.virtualCards) ? data.virtualCards : (Array.isArray(data?.cards) ? data.cards : []))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Virtual Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Isolated digital cards for recurring subscriptions, cloud services, and merchant-locked limits.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>New Virtual Card</span>
        </button>
      </div>

      {loading && <div className="py-20"><LoadingSpinner /></div>}
      {error && !loading && <ErrorState onRetry={fetchCards} />}
      {!loading && !error && <VirtualCardList cards={cards} onRefresh={fetchCards} />}

      <CreateVirtualCardModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchCards} />
    </div>
  )
}

