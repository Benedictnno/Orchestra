'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { maskPAN, formatExpiry, toNaira } from '@/utils/format'
import { Eye, EyeOff, Settings, ShieldAlert, Trash2, ArrowLeft, Lock, Unlock } from 'lucide-react'

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
  cvv?: string
  isUltimate?: boolean
}

interface CardWidgetProps {
  card: Card
  balance?: number
  isSelected?: boolean
  onClick?: () => void
  onBlock?: (id: string) => void
  onUnblock?: (id: string) => void
  onDelete?: (id: string) => void
  isDraggable?: boolean
  hideBalance?: boolean
  hideActions?: boolean
  showRevealOnly?: boolean
}

const NETWORK_LOGOS: Record<string, string> = {
  VERVE: 'VERVE',
  VISA: 'VISA',
  MASTERCARD: '◉◎',
}

export default function CardWidget({ 
  card, 
  balance, 
  isSelected, 
  onClick, 
  onBlock, 
  onUnblock, 
  onDelete, 
  isDraggable,
  hideBalance = false,
  hideActions = false,
  showRevealOnly = false
}: CardWidgetProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [reveal, setReveal] = useState(false)
  
  const isBlocked = card.cardStatus === '2'
  const bgColor = card.isUltimate 
    ? 'linear-gradient(135deg, #4A90e2 0%, #16213E 50%, #4A90e2 100%)'
    : (card.color?.startsWith('#') ? `linear-gradient(135deg, ${card.color} 0%, ${adjustColor(card.color, -20)} 100%)` : (card.color || 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)'))

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hideActions && !showRevealOnly) return
    setIsFlipped(!isFlipped)
  }

  const toggleReveal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setReveal(!reveal)
  }

  return (
    <div className={`relative ${hideActions && !showRevealOnly ? 'min-w-0' : 'min-w-[340px] max-w-[440px]'} w-full aspect-[1.58/1] perspective-1000 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className={`relative w-full h-full ${hideActions && !showRevealOnly ? 'cursor-default' : 'cursor-pointer'}`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={onClick}
      >
        {/* FRONT SIDE */}
        <div 
          className={`absolute inset-0 rounded-[24px] p-8 shadow-2xl flex flex-col justify-between overflow-hidden
            ${card.isUltimate ? 'ring-2 ring-blue-500/50' : (isSelected ? 'ring-2 ring-[#E94560]' : '')}`}
          style={{ 
            background: bgColor,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: isFlipped ? 0 : 1
          }}
        >
          {/* Circuit Pattern for Ultimate Card */}
          {card.isUltimate && (
            <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 400 250">
                <path d="M0 100 H100 L150 50 H250 L300 100 H400" stroke="#4F46E5" fill="none" strokeWidth="1" />
                <path d="M0 150 H120 L170 200 H280 L330 150 H400" stroke="#4F46E5" fill="none" strokeWidth="1" />
                <path d="M50 0 V60 L90 100" stroke="#4F46E5" fill="none" strokeWidth="1" />
                <circle cx="150" cy="50" r="3" fill="#60A5FA" />
                <circle cx="300" cy="100" r="3" fill="#60A5FA" />
                <circle cx="170" cy="200" r="3" fill="#60A5FA" />
                <circle cx="120" cy="150" r="3" fill="#60A5FA" />
              </svg>
            </div>
          )}

          {/* Network & Icons */}
          <div className="flex justify-between items-start z-10">
            <div className="space-y-1">
              {card.isUltimate ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center p-1">
                    <div className="w-full h-full border border-white/30 rounded-full" />
                  </div>
                  <span className="text-white font-bold tracking-tight">Orchestra</span>
                </div>
              ) : (
                <>
                  {card.bank && <p className="text-white/60 text-[10px] uppercase tracking-widest leading-none mb-1">{card.bank}</p>}
                  <div className="text-white font-bold text-sm opacity-90 uppercase leading-none">
                    {card.cardProgram ? (NETWORK_LOGOS[card.cardProgram] ?? card.cardProgram) : 'VERVE'}
                  </div>
                </>
              )}
            </div>
            
            {(showRevealOnly || !hideActions) && (
              <div className="flex items-center gap-2">
                {card.isUltimate && !hideActions && <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mr-1">Ultimate Card</span>}
                <button 
                  onClick={toggleReveal} 
                  className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all text-white/80"
                  aria-label={reveal ? "Hide card details" : "Reveal card details"}
                >
                  {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {!hideActions && (
                  <button 
                    onClick={toggleFlip} 
                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all text-white/80"
                    aria-label="Card settings"
                  >
                    <Settings size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Middle Row: Chip & Available Balance */}
          <div className="flex justify-between items-center z-10 my-auto">
            {!card.isUltimate ? (
              <div className="w-11 h-7 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-md shadow-sm border border-yellow-200/40 flex-shrink-0" />
            ) : <div />}

            {balance !== undefined && !isFlipped && !hideBalance && (
              <div className="text-right">
                <p className="text-white/50 text-[10px] uppercase tracking-wider leading-none mb-1">Available</p>
                <p className="text-white font-bold text-lg sm:text-xl tracking-tight">{toNaira(balance)}</p>
              </div>
            )}
          </div>

          {/* Card Number (PAN) */}
          <div className="z-10 my-1">
            <p className={`text-white font-mono tracking-[0.16em] sm:tracking-[0.2em] font-medium select-all ${card.isUltimate ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>
              {reveal ? (card.pan || (card.isUltimate ? '4000 1234 5678 9010' : '0000 0000 0000 0000')) : (maskPAN(card.pan) ?? '•••• •••• •••• ••••')}
            </p>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-end z-10">
            <div className="space-y-0.5">
              <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-[0.15em]">Card Holder</p>
              <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[200px] uppercase">
                {card.isUltimate ? 'Orchestra Master' : (card.nameOnCard || card.label || 'YOUR NAME')}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-[0.15em]">Expires</p>
              <p className="text-white font-semibold text-sm sm:text-base font-mono">{formatExpiry(card.expiryDate) || (card.isUltimate ? '12/99' : '••/••')}</p>
            </div>
          </div>

          {/* Status Badge */}
          {isBlocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                <ShieldAlert size={14} /> {card.isUltimate ? 'DISABLED' : 'BLOCKED'}
              </span>
            </div>
          )}
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 rounded-[24px] p-8 shadow-2xl flex flex-col justify-between"
          style={{ 
            background: '#1A1A2E',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            zIndex: isFlipped ? 1 : 0
          }}
        >
          {/* Back Header */}
          <div className="flex justify-between items-center text-white">
            <h4 className="font-bold text-sm">{card.isUltimate ? 'Orchestra Control' : 'Security & Control'}</h4>
            <button onClick={toggleFlip} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70">
              <ArrowLeft size={18} />
            </button>
          </div>

          {/* Magnetic Stripe Effect */}
          <div className="absolute top-12 left-0 w-full h-10 bg-black/80" />

          {/* CVV & Stats */}
          <div className="mt-12 space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">CVV / CVC</p>
                  <p className="text-white font-mono font-bold text-xl select-all">{card.cvv || (card.isUltimate ? '888' : '123')}</p>
                </div>
                <div className="h-8 w-12 bg-gray-200/10 rounded border border-white/5" />
              </div>
            </div>

            <div className="flex gap-2 items-center text-white/50 text-[10px] px-2 italic">
              <Lock size={10} /> Do not share your card details with anyone.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={(e) => { 
                e.stopPropagation()
                if (isBlocked) {
                  onUnblock?.(card._id)
                } else {
                  onBlock?.(card._id)
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all
                ${isBlocked 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600 hover:text-white' 
                  : (card.isUltimate ? 'bg-red-600/20 text-red-200 border border-red-600/30 hover:bg-red-600 hover:text-white' : 'bg-amber-600/20 text-amber-100 border border-amber-600/30 hover:bg-amber-600 hover:text-white')}`}
            >
              {isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
              {card.isUltimate ? (isBlocked ? 'Enable Card' : 'Disable Card') : (isBlocked ? 'Unlock Card' : 'Block Card')}
            </button>
            {!card.isUltimate && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(card._id) }}
                className="px-4 py-3 rounded-xl bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  )
}

function adjustColor(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}
