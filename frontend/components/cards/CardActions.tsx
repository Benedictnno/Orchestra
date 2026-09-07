'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Shield, ShieldOff, Eye, EyeOff } from 'lucide-react'
import { cardStatusLabel, cardStatusColor } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface CardActionsProps {
  cardId: string
  cardStatus: string
  onStatusChange: (newStatus: string) => void
}

export default function CardActions({ cardId, cardStatus, onStatusChange }: CardActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showPan, setShowPan] = useState(false)
  const isBlocked = cardStatus === '2'

  async function toggleBlock() {
    setLoading(true)
    try {
      const action = isBlocked ? 'unblock' : 'block'
      const res = await fetchWithAuth(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const newStatus = isBlocked ? '1' : '2'
      onStatusChange(newStatus)
      toast.success(`Card ${isBlocked ? 'unblocked' : 'blocked'} successfully`)
    } catch {
      toast.error('Action failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap mt-4">
      <button
        onClick={toggleBlock}
        disabled={loading}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
          isBlocked
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        } disabled:opacity-50`}
      >
        {isBlocked ? <Shield size={14} /> : <ShieldOff size={14} />}
        {isBlocked ? 'Unblock' : 'Block Card'}
      </button>

      <button
        onClick={() => setShowPan(v => !v)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
      >
        {showPan ? <EyeOff size={14} /> : <Eye size={14} />}
        {showPan ? 'Hide PAN' : 'Reveal PAN'}
      </button>

      <span className={`ml-auto self-center text-sm font-medium ${cardStatusColor(cardStatus)}`}>
        ● {cardStatusLabel(cardStatus)}
      </span>
    </div>
  )
}
