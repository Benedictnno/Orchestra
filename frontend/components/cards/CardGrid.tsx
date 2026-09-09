'use client'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { extractErrorMessage } from '@/lib/utils'
import CardWidget from './CardWidget'
import CardActions from './CardActions'
import AddCardModal from './AddCardModal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  isUltimate?: boolean
}

interface SortableCardProps {
  id: string
  card: Card
  balance?: number
  isSelected?: boolean
  onClick?: () => void
  onBlock?: (id: string) => void
  onUnblock?: (id: string) => void
  onDelete?: (id: string) => void
}

function SortableCard({ id, card, balance, isSelected, onClick, onBlock, onUnblock, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    disabled: card.isUltimate // Disable dragging for Ultimate card
  })
  
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex-shrink-0 snap-center">
      <CardWidget
        card={card}
        balance={balance}
        isSelected={isSelected}
        onClick={onClick}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDelete={onDelete}
        isDraggable={!card.isUltimate}
      />
    </div>
  )
}

interface CardGridProps {
  cards: Card[]
  onRefresh: () => void
}

export default function CardGrid({ cards, onRefresh }: CardGridProps) {
  // Ensure cards is an array to avoid map errors
  const safeCards = useMemo(() => Array.isArray(cards) ? cards : [], [cards])

  // Split localCards into ultimate and physical
  const ultimateCardData: Card = useMemo(() => {
    return {
      _id: 'ultimate_card_001',
      label: 'Orchestra Ultimate',
      cardStatus: '1',
      isUltimate: true,
      pan: '4000123456789010',
      expiryDate: '1299',
      availableBalance: safeCards.reduce((acc, c) => acc + (c.availableBalance || 0), 0)
    }
  }, [safeCards])

  const [overrideCards, setOverrideCards] = useState<Card[] | null>(null)
  const physicalCards = overrideCards ?? safeCards

  const [selectedId, setSelectedId] = useState<string | null>(ultimateCardData._id)
  const [showAdd, setShowAdd] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedCard = selectedId === ultimateCardData._id 
    ? ultimateCardData 
    : physicalCards.find(c => c._id === selectedId)

  async function handleStatusChange(cardId: string, newStatus: string) {
    if (cardId === 'ultimate_card_001') return // Manage ultimate status separately if needed
    setOverrideCards(cs => (cs ?? safeCards).map(c => c._id === cardId ? { ...c, cardStatus: newStatus } : c))
  }

  async function handleBlock(id: string) {
    try {
      const res = await fetchWithAuth(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block' }),
      })
      if (res.ok) {
        handleStatusChange(id, '2')
        toast.success('Card blocked')
      } else {
        const data = await res.json()
        toast.error(extractErrorMessage({ data }))
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleUnblock(id: string) {
    try {
      const res = await fetchWithAuth(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock' }),
      })
      if (res.ok) {
        handleStatusChange(id, '1')
        toast.success('Card unblocked')
      } else {
        const data = await res.json()
        toast.error(extractErrorMessage({ data }))
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this card?')) return
    try {
      const res = await fetchWithAuth(`/api/cards/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setOverrideCards(cs => (cs ?? safeCards).filter(c => c._id !== id))
        if (selectedId === id) setSelectedId(ultimateCardData._id)
        toast.success('Card removed')
      } else {
        const data = await res.json()
        toast.error(extractErrorMessage({ data }))
      }
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setOverrideCards(() => {
        const current = overrideCards ?? safeCards
        const oldIndex = current.findIndex(i => i._id === active.id)
        const newIndex = current.findIndex(i => i._id === over.id)
        return arrayMove(current, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Section: Ultimate Card */}
      <section className="flex flex-col items-center">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 self-start">Master Orchestration</h2>
        <div className="w-full max-w-lg">
          <CardWidget
            card={ultimateCardData}
            balance={ultimateCardData.availableBalance}
            isSelected={selectedId === ultimateCardData._id}
            onClick={() => setSelectedId(ultimateCardData._id)}
            onBlock={() => {}}
            onUnblock={() => {}}
            onDelete={() => {}}
            isDraggable={false}
          />
        </div>
      </section>

      <div className="h-px bg-gray-100 mx-[-20px]" />

      {/* Bottom Section: Physical Cards */}
      <section className="pt-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Physical Cards</h2>
          <span className="text-xs font-medium text-gray-400">{physicalCards.length} Cards Connected</span>
        </div>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <SortableContext items={physicalCards.map(c => c._id)} strategy={horizontalListSortingStrategy}>
              {physicalCards.map(card => (
                <SortableCard
                  key={card._id}
                  id={card._id}
                  card={card}
                  balance={card.availableBalance}
                  isSelected={selectedId === card._id}
                  onClick={() => setSelectedId(card._id)}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>

            <button
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 snap-center rounded-[24px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#E94560] hover:text-[#E94560] transition bg-gray-50/50 w-[180px] sm:w-[215px] min-h-[180px] sm:min-h-[215px]"
            >
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gray-200/50 flex items-center justify-center text-2xl sm:text-3xl font-light">+</div>
              <p className="text-xs sm:text-sm font-bold tracking-tight">Add New Card</p>
            </button>
          </div>
        </DndContext>
      </section>

      {/* Selected card actions */}
      {selectedCard && (
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-[#1A1A2E]">{selectedCard.label || selectedCard.nameOnCard}</h3>
              <p className="text-gray-500 text-sm">{selectedCard.isUltimate ? 'Master Card' : `${selectedCard.bank || ''} · ${selectedCard.cardProgram || ''}`}</p>
            </div>
          </div>
          {!selectedCard.isUltimate && (
            <CardActions
              cardId={selectedCard._id}
              cardStatus={selectedCard.cardStatus}
              onStatusChange={s => handleStatusChange(selectedCard._id, s)}
            />
          )}
          {selectedCard.isUltimate && (
            <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 mt-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">✨</div>
              <div>
                <p className="text-sm font-bold text-blue-900">Ultimate Orchestration Active</p>
                <p className="text-xs text-blue-700">This card automatically routes transactions to your prioritized physical cards.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <AddCardModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={onRefresh} />
    </div>
  )
}
