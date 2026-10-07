'use client'

import { useState } from 'react'
import { Zap, Play, CheckCircle2, SlidersHorizontal, ArrowRightLeft, ShieldCheck, Target, Scale } from 'lucide-react'

interface MockCard {
  id: string
  label: string
  bank: string
  scheme: string
  balance: number
  color: string
}

const INITIAL_CARDS: MockCard[] = [
  {
    id: 'gtb',
    label: 'GTBank Salary Debit',
    bank: 'Guaranty Trust Bank',
    scheme: 'Mastercard',
    balance: 40000,
    color: 'from-blue-600 to-sky-700',
  },
  {
    id: 'access',
    label: 'Access Virtual Wallet',
    bank: 'Access Bank PLC',
    scheme: 'Visa',
    balance: 60000,
    color: 'from-teal-600 to-emerald-700',
  },
  {
    id: 'kuda',
    label: 'Kuda Spending Card',
    bank: 'Kuda Microfinance Bank',
    scheme: 'Verve',
    balance: 50000,
    color: 'from-indigo-600 to-purple-700',
  },
]

export default function InteractiveSimulator() {
  const [amount, setAmount] = useState<number>(65000)
  const [mode, setMode] = useState<'auto-split' | 'primary' | 'balanced'>('auto-split')
  const [isRunning, setIsRunning] = useState<boolean>(false)

  const totalLiquidity = INITIAL_CARDS.reduce((sum, c) => sum + c.balance, 0)

  // Calculate allocation steps based on chosen mode and amount
  const calculateAllocations = () => {
    const requested = Math.max(0, amount)

    if (mode === 'auto-split') {
      let remaining = requested
      return INITIAL_CARDS.map((card) => {
        const allocated = Math.min(card.balance, remaining)
        remaining -= allocated
        return {
          card,
          allocated,
          remainingBalance: card.balance - allocated,
        }
      })
    }

    if (mode === 'primary') {
      const primary = INITIAL_CARDS[0]
      if (requested <= primary.balance) {
        return INITIAL_CARDS.map((card, i) => ({
          card,
          allocated: i === 0 ? requested : 0,
          remainingBalance: i === 0 ? primary.balance - requested : card.balance,
        }))
      } else {
        // Primary is insufficient: fallback to split
        let remaining = requested
        return INITIAL_CARDS.map((card) => {
          const allocated = Math.min(card.balance, remaining)
          remaining -= allocated
          return {
            card,
            allocated,
            remainingBalance: card.balance - allocated,
          }
        })
      }
    }

    // Balanced mode: proportional to balance
    return INITIAL_CARDS.map((card) => {
      const proportion = card.balance / totalLiquidity
      const allocated = Math.round(Math.min(card.balance, requested * proportion))
      return {
        card,
        allocated,
        remainingBalance: Math.max(0, card.balance - allocated),
      }
    })
  }

  const allocations = calculateAllocations()
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0)
  const isCovered = totalAllocated >= amount && amount > 0

  const handlePreset = (val: number) => {
    setIsRunning(true)
    setAmount(val)
    setTimeout(() => setIsRunning(false), 300)
  }

  return (
    <section id="simulator" className="bg-[#4A90e2] py-20 sm:py-24 text-white relative border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-2 font-mono">
            Interactive Product Sandbox
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            See Orchestra Auto-Split in Action
          </h2>
          <p className="text-white/80 mt-3 text-xs sm:text-sm leading-relaxed">
            Test how Orchestra intercepts transactions and automatically splits the charge across multiple linked bank cards to guarantee zero POS declines.
          </p>
        </div>

        {/* Sandbox Console Container */}
        <div className="bg-[#0f172a] rounded-3xl border border-white/15 p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls: Amount & Mode (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/90">Transaction Amount (NGN)</label>
                  <span className="text-[11px] font-mono text-blue-400">
                    Combined Liquidity: ₦{totalLiquidity.toLocaleString()}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₦</span>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={1000}
                    max={150000}
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white text-base font-bold focus:outline-none focus:border-blue-400 transition"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handlePreset(25000)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      amount === 25000 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    ₦25,000 (Lunch)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(65000)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      amount === 65000 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    ₦65,000 (Grocery Run)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(120000)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      amount === 120000 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    ₦120,000 (Flight Ticket)
                  </button>
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="text-xs font-semibold text-white/90 mb-2.5 block">
                  Select Routing Algorithm
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setMode('auto-split')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                      mode === 'auto-split'
                        ? 'bg-blue-600/20 border-blue-500/80 text-white ring-1 ring-blue-500'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                      <Zap size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Sequential Auto-Split</span>
                        <span className="text-[10px] bg-blue-500/30 text-blue-300 font-mono px-1.5 py-0.2 rounded">Recommended</span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5 leading-tight">
                        Drains priority cards sequentially until the exact swipe amount is fully covered.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('primary')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                      mode === 'primary'
                        ? 'bg-blue-600/20 border-blue-500/80 text-white ring-1 ring-blue-500'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white/10 text-white/80 mt-0.5">
                      <Target size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white">Primary Card First</span>
                      <p className="text-[11px] text-white/60 mt-0.5 leading-tight">
                        Charges designated primary card, auto-falling back only if balance is insufficient.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('balanced')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                      mode === 'balanced'
                        ? 'bg-blue-600/20 border-blue-500/80 text-white ring-1 ring-blue-500'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white/10 text-white/80 mt-0.5">
                      <Scale size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white">Balanced Proportion</span>
                      <p className="text-[11px] text-white/60 mt-0.5 leading-tight">
                        Distributes transaction weight proportionally across all active bank balances.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Display: Live Split Allocations (7 cols) */}
            <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-tight">Live Settlement Engine</span>
                </div>
                <span className="text-[10px] font-mono text-white/50 bg-white/10 px-2 py-0.5 rounded">
                  Latency: 280ms
                </span>
              </div>

              {/* Card Allocations List */}
              <div className="space-y-3.5">
                {allocations.map((item, idx) => {
                  const percentOfTx = amount > 0 ? Math.round((item.allocated / amount) * 100) : 0
                  return (
                    <div
                      key={item.card.id}
                      className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-white/50">0{idx + 1}</span>
                          <span className="text-xs font-bold text-white">{item.card.label}</span>
                          <span className="text-[10px] text-white/50 uppercase font-mono">({item.card.scheme})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400">
                            -₦{item.allocated.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-white/50 block">
                            ₦{item.remainingBalance.toLocaleString()} left
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentOfTx}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Status Outcome Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                  isCovered
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCovered ? (
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldCheck size={20} className="text-rose-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-bold tracking-tight">
                      {isCovered
                        ? `Transaction Approved — ₦${amount.toLocaleString()} Settled`
                        : `Insufficient Combined Funds (Short by ₦${(amount - totalAllocated).toLocaleString()})`}
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {isCovered
                        ? `Split smoothly across ${allocations.filter((a) => a.allocated > 0).length} cards with 0 POS declines.`
                        : 'Please lower amount or link additional bank accounts.'}
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 rounded bg-white/10 uppercase tracking-wider font-semibold">
                  {mode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
