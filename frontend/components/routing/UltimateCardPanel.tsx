'use client'
import { toNaira } from '@/utils/format'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Layers, Activity } from 'lucide-react'

interface UltimateCardPanelProps {
  totalLimit: number
  totalAvailable: number
  numCards: number
}

export default function UltimateCardPanel({
  totalLimit,
  totalAvailable,
  numCards
}: UltimateCardPanelProps) {
  const percentSpent = totalLimit > 0 ? Math.min(100, Math.max(0, ((totalLimit - totalAvailable) / totalLimit) * 100)) : 0

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-7 text-white shadow-xl shadow-slate-950/20 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Top bar: Unified Spending Pool & Connected Banks */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                <Layers size={14} />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Unified Spending Pool
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
              {toNaira(totalAvailable)}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 bg-slate-800/60 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400">Linked Payment Cards</span>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-bold text-white font-mono tabular-nums">{numCards}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Capacity Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-400 font-mono tabular-nums">
            <span>Allocated: {toNaira(totalLimit - totalAvailable)}</span>
            <span>Limit: {toNaira(totalLimit)}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentSpent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full"
            />
          </div>
        </div>

        {/* System Capabilities Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-semibold text-xs text-white">Interswitch Fraud Protection</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Real-time rule evaluation &amp; zero-trust verification across linked wallets
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <p className="font-semibold text-xs text-white">Sub-Second Smart Routing</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Sequential auto-split and fee minimization applied dynamically on swipe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
