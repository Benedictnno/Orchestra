'use client'
import { useState, useEffect } from 'react'
import TransactionSimulator from '@/components/routing/TransactionSimulator'
import RoutingModeSelector from '@/components/routing/RoutingModeSelector'
import CardPriorityList from '@/components/routing/CardPriorityList'
import UltimateCardPanel from '@/components/routing/UltimateCardPanel'
import toast from 'react-hot-toast'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { Sparkles, Check, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { cn } from '@/utils/cn'

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Ultimate Card &amp; Routing Engine</h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-semibold tracking-wide">
              Smart Orchestrator
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Configure how Orchestra unifies balances, applies priorities, and routes ATM &amp; online charges
          </p>
        </div>
      </div>

      {/* Unified Spending Pool Hero */}
      <UltimateCardPanel
        totalAvailable={cards.reduce((acc, c) => acc + (c.availableBalance || 0), 0)}
        totalLimit={cards.reduce((acc, c) => acc + (c.availableBalance || 0) + 50000000, 0)} // Mock limit
        numCards={cards.length}
      />

      {/* Grid: Routing Configuration + Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Routing Mode + Card Priority */}
        <div className="space-y-6">
          {/* Routing Mode Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <SlidersHorizontal size={16} className="text-slate-600" />
              <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Execution Strategy</h2>
            </div>
            
            <RoutingModeSelector selected={mode} onChange={handleModeChange} />
            
            {mode === 'primary' && (
              <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Designate Primary Card
                </label>
                <div className="space-y-2">
                  {cards.map(card => {
                    const isSelected = primaryCardId === card._id
                    return (
                      <button
                        key={card._id}
                        type="button"
                        onClick={() => handlePrimaryChange(card._id)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150',
                          isSelected
                            ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 shadow-xs"
                            style={{ backgroundColor: card.color || '#0f172a' }}
                          >
                            {card.bank?.slice(0, 3) || 'CRD'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{card.label || card.nameOnCard}</p>
                            <p className="text-[11px] text-slate-500 truncate">{card.bank}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card Priority */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-slate-600" />
                <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Fallback Priority Hierarchy</h2>
              </div>
              <span className="text-[11px] text-slate-500">Drag to reorder</span>
            </div>
            <CardPriorityList cards={orderedCards} onReorder={handleReorder} />
          </div>
        </div>

        {/* Right column — Simulator */}
        <TransactionSimulator />
      </div>
    </div>
  )
}
