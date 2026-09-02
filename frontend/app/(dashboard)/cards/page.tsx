'use client'
import { useEffect, useState, useCallback } from 'react'
import CardGrid from '@/components/cards/CardGrid'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorState from '@/components/shared/ErrorState'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface Card {
  _id: string
  pan?: string
  cardStatus: string
  cardProgram?: string
  nameOnCard?: string
  label?: string
  expiryDate?: string
  availableBalance?: number
  color?: string
  bank?: string
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetchWithAuth('/api/cards')
      const data = await res.json()
      setCards(Array.isArray(data?.cards) ? data.cards : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4A90e2]">My Cards</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your physical ATM cards across all banks</p>
      </div>

      {loading && <div className="py-16"><LoadingSpinner /></div>}
      {error && !loading && <ErrorState onRetry={fetchCards} />}
      {!loading && !error && <CardGrid cards={cards} onRefresh={fetchCards} />}
    </div>
  )
}
