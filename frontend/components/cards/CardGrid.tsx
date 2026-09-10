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
import { Plus, Sparkles, Layers, ShieldCheck } from 'lucide-react'

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
    disabled: card.isUltimate
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
  const safeCards = useMemo(() => Array.isArray(cards) ? cards : [], [cards])

  const ultimateCardData: Card = useMemo(() => {
    return {
      _id: 'ultimate_card_001',
      label: 'Orchestra Ultimate Card',
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
    if (cardId === 'ultimate_card_001') return
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
    <div className="space-y-6">
      {/* Master Orchestration Card Hero */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-blue-600" />
            <h2 className="text-xs font-semibold text-slate-900">Primary Aggregation Card</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
            Auto-Routes Multi-Bank Balances
          </span>
        </div>

        <div className="max-w-md mx-auto py-2">
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

      {/* Physical Cards Ledger Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-slate-500" />
            <h2 className="text-xs font-semibold text-slate-900">Linked Bank Accounts & Hardware Cards</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">{physicalCards.length} Cards in Priority Sequence</span>
        </div>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
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

            {/* Add Card Action Card */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 snap-center rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-[260px] min-h-[165px] p-6 shadow-xs group"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform shadow-xs">
                <Plus size={16} />
              </div>
              <p className="text-xs font-semibold">Link Another Bank Card</p>
              <p className="text-[11px] text-slate-400">Debit, Credit or Prepaid</p>
            </button>
          </div>
        </DndContext>
      </section>

      {/* Selected Card Security Detail Panel */}
      {selectedCard && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900">
                  {selectedCard.label || selectedCard.nameOnCard || 'Card Details'}
                </h3>
                {selectedCard.isUltimate ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <ShieldCheck size={11} /> Master Routing
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedCard.bank || ''} · {selectedCard.cardProgram || 'Debit'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCard.isUltimate 
                  ? 'All incoming settlement charges are automatically split across available linked balances.'
                  : 'Individual funding card with dedicated balance and freeze controls.'}
              </p>
            </div>
          </div>

          {!selectedCard.isUltimate && (
            <CardActions
              cardId={selectedCard._id}
              cardStatus={selectedCard.cardStatus}
              onStatusChange={s => handleStatusChange(selectedCard._id, s)}
            />
          )}
        </div>
      )}

      <AddCardModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={onRefresh} />
    </div>
  )
}

