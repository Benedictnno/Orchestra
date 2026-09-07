'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toNaira } from '@/utils/format'
import { Eye, EyeOff, Settings, Pause, Play, Trash2, ArrowLeft, Plus } from 'lucide-react'
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
  const bgColor = card.color || '#0052FF'

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
        toast.success('Top-up successful')
        setShowTopUp(false)
        setTopUpAmount('')
        onTopUp?.()
      } else {
        toast.error('Top-up failed')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full aspect-[1.6/1] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* FRONT SIDE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-xl"
          style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustColor(bgColor, -30)} 100%)` }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

          <div className="relative h-full w-full p-8 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase mb-1">Virtual Subscription</p>
                <h3 className="text-2xl font-bold tracking-tight">{card.label || 'New Card'}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleReveal} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all">
                  {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={toggleFlip} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all">
                  <Settings size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-6 items-center">
              <div className="flex gap-2">
                {[1, 2, 3].map(group => (
                  <div key={group} className="flex gap-1.5">
                    {reveal ? (
                      <span className="text-2xl font-mono tracking-wider opacity-90">0000</span>
                    ) : (
                      <div className="flex gap-1.5 py-2">
                        {[1, 2, 3, 4].map(dot => <div key={dot} className="w-2 h-2 rounded-full bg-white opacity-90" />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-2xl font-mono tracking-wider text-white/90">{card.last4 || '1234'}</span>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold tracking-widest opacity-60 uppercase">Expiry</p>
                  <p className="text-sm font-bold font-mono tracking-wider">{card.expiry || '12/28'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold tracking-widest opacity-60 uppercase">CVV</p>
                  <p className="text-sm font-bold font-mono tracking-wider">{reveal ? '123' : '***'}</p>
                </div>
              </div>
              <div className="relative w-12 h-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="relative flex -space-x-4">
                  <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-90" />
                  <div className="w-6 h-6 rounded-full bg-[#F79E1B] mix-blend-screen" />
                </div>
              </div>
            </div>
          </div>
          {isPaused && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2">
                <span>PAUSED</span>
              </div>
            </div>
          )}
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-xl rotate-y-180 bg-[#4A90e2]"
          style={{ background: `linear-gradient(135deg, #4A90e2 0%, ${bgColor} 100%)` }}
        >
          <div className="relative h-full w-full p-8 flex flex-col justify-between text-white">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg">Card Settings</h4>
              <button onClick={toggleFlip} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <ArrowLeft size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Spent</p>
                <p className="text-lg font-bold">{toNaira(card.amountSpent)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Remaining</p>
                <p className="text-lg font-bold">{toNaira(card.spendLimit - card.amountSpent)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => { 
                  e.stopPropagation()
                  if (isPaused) {
                    onResume?.(card._id)
                  } else {
                    onPause?.(card._id)
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-3 rounded-2xl font-bold transition-all hover:bg-white/90"
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowTopUp(true) }}
                className="bg-blue-500/20 text-blue-100 p-3 rounded-2xl border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(card._id) }}
                className="bg-red-500/20 text-red-100 p-3 rounded-2xl border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Top-up Overlay */}
          <AnimatePresence>
            {showTopUp && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-[#4A90e2]/95 backdrop-blur-md rounded-3xl z-30 p-8 flex flex-col justify-between"
                onClick={e => e.stopPropagation()}
              >
                <div>
                  <h4 className="font-bold text-lg mb-1">Top-up Card</h4>
                  <p className="text-white/50 text-xs mb-6">Fund your virtual card from a physical card.</p>
                  
                  <div className="space-y-4">
                    {/* Source Card Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Source Card</label>
                      <select 
                        value={sourceCardId}
                        onChange={e => setSourceCardId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {physicalCards.length === 0 ? (
                          <option value="">No cards connected</option>
                        ) : (
                          physicalCards.map(c => (
                            <option key={c._id} value={c._id} className="bg-[#4A90e2]">{c.label} ({c.bank})</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₦</span>
                      <input 
                        type="number"
                        autoFocus
                        value={topUpAmount}
                        onChange={e => setTopUpAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['500', '1000', '2500'].map(amt => (
                        <button 
                          key={amt}
                          onClick={() => setTopUpAmount(amt)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          ₦{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowTopUp(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white/60 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTopUp}
                    disabled={loading || !topUpAmount}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-2xl text-sm font-bold transition-all"
                  >
                    {loading ? 'Processing...' : 'Confirm Top-up'}
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

function adjustColor(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}
