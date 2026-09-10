'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { maskPAN, formatExpiry, toNaira } from '@/utils/format'
import { Eye, EyeOff, Settings, ShieldAlert, Trash2, ArrowLeft, Lock, Unlock, ShieldCheck } from 'lucide-react'

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
  MASTERCARD: 'Mastercard',
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
  
  // Refined palette inspired by high-end physical cards
  const getCardBackground = () => {
    if (card.isUltimate) {
      return 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
    }
    if (card.color?.startsWith('#')) {
      return `linear-gradient(135deg, ${card.color} 0%, #0f172a 100%)`
    }
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  }

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
    <div className={`relative ${hideActions && !showRevealOnly ? 'min-w-0' : 'min-w-[280px] xs:min-w-[320px] sm:min-w-[340px] max-w-[440px]'} w-full aspect-[1.58/1] perspective-1000 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full h-full ${hideActions && !showRevealOnly ? 'cursor-default' : 'cursor-pointer'}`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={onClick}
      >
        {/* FRONT SIDE */}
        <div 
          className={`absolute inset-0 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between overflow-hidden border ${
            card.isUltimate 
              ? 'border-indigo-500/30 ring-1 ring-indigo-500/30' 
              : isSelected 
                ? 'border-slate-900 ring-2 ring-slate-900 shadow-lg' 
                : 'border-slate-700/60'
          }`}
          style={{ 
            background: getCardBackground(),
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: isFlipped ? 0 : 1
          }}
        >
          {/* Subtle satin gradient sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-white/[0.08] pointer-events-none" />

          {/* Header Row: Bank / Network & Reveal Controls */}
          <div className="flex justify-between items-start z-10">
            <div className="space-y-0.5">
              {card.isUltimate ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-white font-semibold text-xs tracking-tight">Orchestra Ultimate</span>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider leading-none">
                    {card.bank || 'Commercial Bank'}
                  </p>
                  <p className="text-white font-medium text-xs tracking-tight">
                    {card.label || card.nameOnCard || 'Orchestra Card'}
                  </p>
                </>
              )}
            </div>
            
            {(showRevealOnly || !hideActions) && (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={toggleReveal} 
                  className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors text-slate-300 hover:text-white"
                  aria-label={reveal ? "Hide card details" : "Reveal card details"}
                  title={reveal ? "Hide PAN" : "Reveal PAN"}
                >
                  {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                {!hideActions && (
                  <button 
                    onClick={toggleFlip} 
                    className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors text-slate-300 hover:text-white"
                    aria-label="Card security settings"
                    title="Flip for card security"
                  >
                    <Settings size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Middle Row: EMV Chip & Available Balance */}
          <div className="flex justify-between items-center z-10 my-auto">
            {!card.isUltimate ? (
              <div className="w-10 h-7 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 rounded-md border border-amber-200/50 shadow-xs flex items-center justify-center">
                <div className="w-6 h-4 border border-amber-600/40 rounded-[2px]" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-mono">
                <ShieldCheck size={11} /> Master Routing
              </div>
            )}

            {balance !== undefined && !isFlipped && !hideBalance && (
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider leading-none mb-1">
                  Balance
                </p>
                <p className="text-white font-mono font-semibold text-base sm:text-lg tracking-tight tabular-nums">
                  {toNaira(balance)}
                </p>
              </div>
            )}
          </div>

          {/* Card Number (PAN) */}
          <div className="z-10 my-1">
            <p className="text-white font-mono tracking-[0.18em] text-sm sm:text-base font-medium select-all">
              {reveal ? (card.pan || (card.isUltimate ? '4000 1234 5678 9010' : '0000 0000 0000 0000')) : (maskPAN(card.pan) ?? '•••• •••• •••• ••••')}
            </p>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-end z-10 pt-1 border-t border-white/10">
            <div className="space-y-0.5">
              <p className="text-slate-400 text-[9px] font-mono uppercase tracking-wider">Cardholder</p>
              <p className="text-white font-medium text-xs truncate max-w-[150px] sm:max-w-[180px] uppercase">
                {card.isUltimate ? 'Master Pool Account' : (card.nameOnCard || card.label || 'AUTHORIZED HOLDER')}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-slate-400 text-[9px] font-mono uppercase tracking-wider">Expires</p>
              <p className="text-white font-mono text-xs font-medium">{formatExpiry(card.expiryDate) || (card.isUltimate ? '12/99' : '••/••')}</p>
            </div>
          </div>

          {/* Blocked Status Badge */}
          {isBlocked && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-rose-500/20 border border-rose-400/40 text-rose-200 px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <ShieldAlert size={13} /> {card.isUltimate ? 'Disabled' : 'Locked / Blocked'}
              </span>
            </div>
          )}
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between bg-slate-900 border border-slate-700/80 text-white"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            zIndex: isFlipped ? 1 : 0
          }}
        >
          {/* Back Header */}
          <div className="flex justify-between items-center z-10">
            <h4 className="font-semibold text-xs text-slate-200">
              {card.isUltimate ? 'Orchestration Controls' : 'Card Security & Controls'}
            </h4>
            <button
              onClick={toggleFlip}
              className="p-1 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 transition-colors"
              title="Flip to front"
            >
              <ArrowLeft size={14} />
            </button>
          </div>

          {/* Magnetic Stripe Band */}
          <div className="absolute top-11 left-0 w-full h-8 bg-slate-950 border-y border-slate-800/80" />

          {/* CVV Box & Security Note */}
          <div className="mt-8 space-y-2.5 z-10">
            <div className="bg-slate-800/80 p-2.5 px-3 rounded-lg border border-slate-700/70 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">Security Code (CVV)</p>
                <p className="text-white font-mono font-semibold text-sm select-all">
                  {card.cvv || (card.isUltimate ? '888' : '123')}
                </p>
              </div>
              <div className="w-8 h-5 rounded bg-slate-700/60 border border-slate-600/40" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <Lock size={10} className="text-slate-400" />
              <span>Never share CVV or authorization codes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto z-10 pt-2 border-t border-slate-800">
            <button
              onClick={(e) => { 
                e.stopPropagation()
                if (isBlocked) {
                  onUnblock?.(card._id)
                } else {
                  onBlock?.(card._id)
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border shadow-xs ${
                isBlocked 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isBlocked ? <Unlock size={12} /> : <Lock size={12} />}
              <span>{isBlocked ? 'Unlock Card' : 'Freeze Card'}</span>
            </button>
            {!card.isUltimate && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(card._id) }}
                className="p-1.5 px-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                title="Remove Card"
              >
                <Trash2 size={13} />
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

