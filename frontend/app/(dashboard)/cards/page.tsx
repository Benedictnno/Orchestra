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
    <div className="max-w-5xl mx-auto px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Physical Cards & Wallets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage, prioritize, and orchestrate debit and prepaid cards linked across banking institutions.
        </p>
      </div>

      {loading && <div className="py-20"><LoadingSpinner /></div>}
      {error && !loading && <ErrorState onRetry={fetchCards} />}
      {!loading && !error && <CardGrid cards={cards} onRefresh={fetchCards} />}
    </div>
  )
}

