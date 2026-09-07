'use client'
import { useState, useEffect } from 'react'
import TransactionSimulator from '@/components/routing/TransactionSimulator'
import RoutingModeSelector from '@/components/routing/RoutingModeSelector'
import CardPriorityList from '@/components/routing/CardPriorityList'
import UltimateCardPanel from '@/components/routing/UltimateCardPanel'
import toast from 'react-hot-toast'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface Card {
  _id: string
  label?: string
  nameOnCard?: string
  bank?: string
  color?: string
  availableBalance?: number
}

export default function UltimateCardPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [mode, setMode] = useState('auto-split')
  const [primaryCardId, setPrimaryCardId] = useState<string>('')
  const [orderedCards, setOrderedCards] = useState<Card[]>([])

  useEffect(() => {
    let activeEffect = true

    async function load() {
      try {
        const [cardsRes, routingRes] = await Promise.all([
          fetchWithAuth('/api/cards'),
          fetchWithAuth('/api/routing')
        ])

        const cardsData = await cardsRes.json()
        const routingData = await routingRes.json()

        if (!activeEffect) return

        const active = (cardsData?.cards || []).filter((c: { cardStatus: string }) => c.cardStatus === '1')
        setCards(active)

        if (routingData) {
          setMode(routingData.mode || 'auto-split')
          setPrimaryCardId(routingData.primaryCardId || (active[0]?._id || ''))

          if (routingData.cardOrder && routingData.cardOrder.length > 0) {
            const sorted = [...active].sort((a, b) => {
              const idxA = routingData.cardOrder.indexOf(a._id)
              const idxB = routingData.cardOrder.indexOf(b._id)
              if (idxA === -1) return 1
              if (idxB === -1) return -1
              return idxA - idxB
            })
            setOrderedCards(sorted)
          } else {
            setOrderedCards(active)
          }
        } else {
          setOrderedCards(active)
        }
      } catch {}
    }

    load()
    return () => { activeEffect = false }
  }, [])

  async function saveRouting(updates: { mode?: string, primaryCardId?: string, cardIds?: string[] }) {
    const payload = {
      mode: updates.mode || mode,
      primaryCardId: updates.primaryCardId || primaryCardId,
      cardOrder: updates.cardIds || orderedCards.map(c => c._id)
    }

    try {
      const res = await fetchWithAuth('/api/routing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success('Routing preferences saved')
      } else {
        toast.error('Failed to save routing')
      }
    } catch {
      toast.error('Connection error')
    }
  }

  async function handleModeChange(newMode: string) {
    setMode(newMode)
    saveRouting({ mode: newMode })
  }

  async function handleReorder(reordered: Card[]) {
    setOrderedCards(reordered)
    saveRouting({ cardIds: reordered.map(c => c._id) })
  }

  async function handlePrimaryChange(id: string) {
    setPrimaryCardId(id)
    saveRouting({ primaryCardId: id })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Ultimate Card</h1>
        <p className="text-gray-500 text-sm mt-1">Configure how Orchestra routes your payments across cards</p>
      </div>

      <div className="mb-8">
        <UltimateCardPanel
          totalAvailable={cards.reduce((acc, c) => acc + (c.availableBalance || 0), 0)}
          totalLimit={cards.reduce((acc, c) => acc + (c.availableBalance || 0) + 50000000, 0)} // Mock limit
          numCards={cards.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Routing Mode */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-dark mb-4">Routing Mode</h2>
            <RoutingModeSelector selected={mode} onChange={handleModeChange} />
            
            {mode === 'primary' && (
              <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Primary Card</label>
                <div className="space-y-2">
                  {cards.map(card => (
                    <button
                      key={card._id}
                      onClick={() => handlePrimaryChange(card._id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                        ${primaryCardId === card._id 
                          ? 'border-[#E94560] bg-[#E94560]/5 ring-4 ring-[#E94560]/5' 
                          : 'border-gray-50 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {card.bank?.slice(0, 3)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-[#4A90e2]">{card.label}</p>
                          <p className="text-[10px] text-gray-500">{card.bank}</p>
                        </div>
                      </div>
                      {primaryCardId === card._id && <div className="w-2 h-2 rounded-full bg-[#E94560]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Priority */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-dark mb-1">Card Priority</h2>
            <p className="text-xs text-gray-500 mb-4">Drag to reorder — highest priority first</p>
            <CardPriorityList cards={orderedCards} onReorder={handleReorder} />
          </div>
        </div>

        {/* Right column — Simulator */}
        <TransactionSimulator />
      </div>
    </div>
  )
}
