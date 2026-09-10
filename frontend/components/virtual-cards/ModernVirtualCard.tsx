'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toNaira } from '@/utils/format'
import { Eye, EyeOff, Settings, Pause, Play, Trash2, ArrowLeft, Plus, Lock } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import toast from 'react-hot-toast'

interface PhysicalCardOption {
  _id: string
  label: string
  bank: string
}

interface ModernVirtualCardProps {
  card: {
    _id: string
    label: string
    merchant?: string
    amountSpent: number
    spendLimit: number
    paused?: boolean
    color?: string
    last4?: string
    expiry?: string
    cvv?: string
  }
  isSelected?: boolean
  onClick?: () => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onDelete?: (id: string) => void
  onTopUp?: () => void
  physicalCards?: PhysicalCardOption[]
}

export default function ModernVirtualCard({ card, onPause, onResume, onDelete, onTopUp, physicalCards = [] }: ModernVirtualCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [sourceCardId, setSourceCardId] = useState('')
  const [loading, setLoading] = useState(false)
  
  const isPaused = card.paused
  const spendPercentage = Math.min(100, Math.round(((card.amountSpent || 0) / (card.spendLimit || 1)) * 100))

  // Set default source card if not set
  useEffect(() => {
    if (showTopUp && !sourceCardId && physicalCards.length > 0) {
      setSourceCardId(physicalCards[0]._id)
    }
  }, [showTopUp, physicalCards, sourceCardId])

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
  }

  const toggleReveal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setReveal(!reveal)
  }

  async function handleTopUp(e: React.FormEvent) {
    e.preventDefault()
    if (!topUpAmount || isNaN(Number(topUpAmount)) || !sourceCardId) return
    
    setLoading(true)
    try {
      const res = await fetchWithAuth(`/api/virtual-cards/${card._id}/top-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(topUpAmount),
          sourceCardId
        }),
      })
      if (res.ok) {
        toast.success('Top-up completed successfully')
        setShowTopUp(false)
        setTopUpAmount('')
        onTopUp?.()
      } else {
        toast.error('Top-up failed')
      }
    } catch {
      toast.error('An error occurred during top-up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full aspect-[1.6/1] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full preserve-3d"
      >
        {/* FRONT SIDE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-md border border-slate-700/60 flex flex-col justify-between p-5 sm:p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)' }}
        >
          {/* Subtle sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.07] pointer-events-none" />

          {/* Header Row */}
          <div className="flex justify-between items-start z-10">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {card.merchant ? `Locked: ${card.merchant}` : 'Virtual Subscription Card'}
              </span>
              <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white truncate max-w-[200px]">
                {card.label || 'Subscription Card'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleReveal}
                className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors text-slate-300 hover:text-white"
                title={reveal ? "Hide card details" : "Reveal card details"}
              >
                {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={toggleFlip}
                className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors text-slate-300 hover:text-white"
                title="Card settings & limit"
              >
                <Settings size={13} />
              </button>
            </div>
          </div>

          {/* Card Number Row */}
          <div className="z-10 my-auto">
            <div className="flex items-baseline gap-2">
              <p className="text-white font-mono tracking-[0.18em] text-sm sm:text-base font-medium select-all">
                {reveal ? '•••• •••• •••• ' : '•••• •••• •••• '}
                <span className="text-white font-semibold">{card.last4 || '1234'}</span>
              </p>
            </div>

            {/* Spend Limit Mini Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{toNaira(card.amountSpent || 0)} used</span>
                <span>{toNaira(card.spendLimit)} limit</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${spendPercentage > 85 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-end z-10 pt-1 border-t border-white/10">
            <div className="flex gap-6">
              <div className="space-y-0.5">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Expires</p>
                <p className="text-xs font-mono font-medium text-white">{card.expiry || '12/28'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">CVV</p>
                <p className="text-xs font-mono font-medium text-white">{reveal ? (card.cvv || '123') : '•••'}</p>
              </div>
            </div>

            {/* Network Brand Badge */}
            <div className="relative w-8 h-5 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded border border-white/10">
              <div className="relative flex -space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] mix-blend-screen" />
              </div>
            </div>
          </div>

          {/* Paused Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <Lock size={12} /> Paused
              </span>
            </div>
          )}
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-md rotate-y-180 bg-slate-900 border border-slate-700/80 p-5 sm:p-6 flex flex-col justify-between text-white"
        >
          <div className="flex justify-between items-center z-10">
            <h4 className="font-semibold text-xs text-slate-200">Virtual Card Controls</h4>
            <button
              onClick={toggleFlip}
              className="p-1 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 transition-colors"
              title="Flip to front"
            >
              <ArrowLeft size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto z-10">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">Total Spent</p>
              <p className="text-sm font-mono font-semibold text-white tabular-nums">{toNaira(card.amountSpent)}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">Remaining Limit</p>
              <p className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">{toNaira(Math.max(0, card.spendLimit - card.amountSpent))}</p>
            </div>
          </div>

          <div className="flex gap-2 z-10 pt-2 border-t border-slate-800">
            <button
              onClick={(e) => { 
                e.stopPropagation()
                if (isPaused) {
                  onResume?.(card._id)
                } else {
                  onPause?.(card._id)
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border shadow-xs ${
                isPaused 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowTopUp(true) }}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Top Up</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(card._id) }}
              className="p-1.5 px-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
              title="Delete Virtual Card"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Top-up Modal Overlay */}
          <AnimatePresence>
            {showTopUp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="absolute inset-0 bg-slate-900/98 backdrop-blur-md z-30 p-5 sm:p-6 flex flex-col justify-between rounded-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div>
                  <h4 className="font-semibold text-xs text-white mb-0.5">Top-up Virtual Limit</h4>
                  <p className="text-slate-400 text-[11px] mb-3">Debit funds from a physical source card.</p>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 block">Funding Source</label>
                      <select 
                        value={sourceCardId}
                        onChange={e => setSourceCardId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {physicalCards.length === 0 ? (
                          <option value="">No cards connected</option>
                        ) : (
                          physicalCards.map(c => (
                            <option key={c._id} value={c._id} className="bg-slate-900">{c.label} ({c.bank})</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₦</span>
                      <input 
                        type="number"
                        autoFocus
                        value={topUpAmount}
                        onChange={e => setTopUpAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-7 pr-3 text-sm font-mono font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['500', '1000', '2500'].map(amt => (
                        <button 
                          key={amt}
                          type="button"
                          onClick={() => setTopUpAmount(amt)}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700/80 py-1 rounded-md text-[11px] font-mono text-slate-300 transition-colors"
                        >
                          ₦{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setShowTopUp(false)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleTopUp}
                    disabled={loading || !topUpAmount}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}

