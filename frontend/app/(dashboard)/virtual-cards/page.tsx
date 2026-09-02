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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#4A90e2]">Virtual Cards</h1>
          <p className="text-gray-500 text-sm mt-1">Isolated cards for subscriptions and online spending</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#E94560] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d63850] transition"
        >
          <Plus size={16} />
          New Card
        </button>
      </div>

      {loading && <div className="py-16"><LoadingSpinner /></div>}
      {error && !loading && <ErrorState onRetry={fetchCards} />}
      {!loading && !error && <VirtualCardList cards={cards} onRefresh={fetchCards} />}

      <CreateVirtualCardModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchCards} />
    </div>
  )
}
