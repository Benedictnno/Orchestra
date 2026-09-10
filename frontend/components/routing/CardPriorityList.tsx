'use client'
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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toNaira } from '@/utils/format'
import { GripVertical } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Card {
  _id: string
  label?: string
  nameOnCard?: string
  bank?: string
  color?: string
  availableBalance?: number
}

function SortableCard({ card, rank }: { card: Card; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-3 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 transition-all duration-150 select-none cursor-grab active:cursor-grabbing',
        isDragging
          ? 'shadow-lg bg-white border-slate-900 scale-[1.02] z-50 ring-1 ring-slate-900'
          : 'hover:bg-white hover:border-slate-300 hover:shadow-xs'
      )}
    >
      <div className="flex items-center gap-2 shrink-0">
        <GripVertical size={15} className="text-slate-400 hover:text-slate-600 transition-colors" />
        <span className="w-5 h-5 rounded-md bg-slate-200/80 text-slate-700 text-[11px] font-bold font-mono flex items-center justify-center">
          {rank}
        </span>
      </div>

      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
        style={{ background: card.color || '#0f172a' }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs text-slate-900 truncate">{card.label || card.nameOnCard}</p>
        <p className="text-[11px] text-slate-500 truncate">{card.bank}</p>
      </div>

      <p className="text-xs font-bold text-slate-900 font-mono tabular-nums shrink-0">
        {toNaira(card.availableBalance ?? 0)}
      </p>
    </div>
  )
}

interface CardPriorityListProps {
  cards: Card[]
  onReorder: (cards: Card[]) => void
}

export default function CardPriorityList({ cards, onReorder }: CardPriorityListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex(c => c._id === active.id)
      const newIndex = cards.findIndex(c => c._id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(cards, oldIndex, newIndex))
      }
    }
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
        No payment cards linked yet
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {cards.map((card, idx) => (
            <SortableCard key={card._id} card={card} rank={idx + 1} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
