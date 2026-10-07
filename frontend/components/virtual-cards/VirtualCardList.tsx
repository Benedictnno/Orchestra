'use client'
import VirtualCardItem from './VirtualCardItem'
import EmptyState from '@/components/shared/EmptyState'
import { useState, useEffect } from 'react'
import CreateVirtualCardModal from './CreateVirtualCardModal'
import toast from 'react-hot-toast'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface VirtualCard {
  _id: string
  label: string
  merchant?: string
  amountSpent: number
  spendLimit: number
  paused?: boolean
  autoRenew?: boolean
  color?: string
  pan?: string
  expiryDate?: string
}

interface PhysicalCardOption {
  _id: string
  label: string
  bank: string
}

interface VirtualCardListProps {
  cards: VirtualCard[]
  onRefresh: () => void
}

export default function VirtualCardList({ cards, onRefresh }: VirtualCardListProps) {
  const [showCreate, setShowCreate] = useState(false)
  const safeCards = Array.isArray(cards) ? cards : []
  const [overrideCards, setOverrideCards] = useState<VirtualCard[] | null>(null)
  const displayCards = overrideCards ?? safeCards
  const [physicalCards, setPhysicalCards] = useState<PhysicalCardOption[]>([])

  // Drop local optimistic edits whenever the parent refetches, so newly created cards show up
  useEffect(() => { setOverrideCards(null) }, [cards])

  useEffect(() => {
    fetchWithAuth('/api/cards')
      .then(r => r.json())
      .then(data => setPhysicalCards(Array.isArray(data?.cards) ? data.cards : []))
      .catch(() => {})
  }, [])

  async function handlePause(id: string) {
    const res = await fetchWithAuth(`/api/virtual-cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pause' }),
    })
    if (res.ok) {
      setOverrideCards(cs => (cs ?? safeCards).map(c => c._id === id ? { ...c, paused: true } : c))
      toast.success('Card paused')
    } else toast.error('Failed to pause card')
  }

  async function handleResume(id: string) {
    const res = await fetchWithAuth(`/api/virtual-cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resume' }),
    })
    if (res.ok) {
      setOverrideCards(cs => (cs ?? safeCards).map(c => c._id === id ? { ...c, paused: false } : c))
      toast.success('Card resumed')
    } else toast.error('Failed to resume card')
  }

  function handleDelete(id: string) {
    toast(t => (
      <div className="flex flex-col gap-2.5">
        <div>
          <p className="text-xs font-semibold text-slate-900">Delete this virtual card?</p>
          <p className="text-[11px] text-slate-500 mt-0.5">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { toast.dismiss(t.id); deleteCard(id) }}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { id: `delete-${id}`, duration: Infinity })
  }

  async function deleteCard(id: string) {
    const res = await fetchWithAuth(`/api/virtual-cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete' }),
    })
    if (res.ok) {
      setOverrideCards(cs => (cs ?? safeCards).filter(c => c._id !== id))
      toast.success('Card deleted')
    } else toast.error('Failed to delete card')
  }

  if (displayCards.length === 0) {
    return (
      <>
        <EmptyState
          title="No virtual cards"
          description="Create a dedicated card for Netflix, Spotify, or any subscription"
          action={{ label: 'Create Virtual Card', icon: '✦', onClick: () => setShowCreate(true) }}
        />
        <CreateVirtualCardModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={onRefresh} />
      </>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCards.map(c => (
          <VirtualCardItem
            key={c._id}
            card={c}
            onPause={handlePause}
            onResume={handleResume}
            onDelete={handleDelete}
            onRefresh={onRefresh}
            physicalCards={physicalCards}
          />
        ))}
      </div>
      <CreateVirtualCardModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={onRefresh} />
    </div>
  )
}
