'use client'
import { toNaira } from '@/utils/format'
import { motion } from 'framer-motion'
import { Check, AlertTriangle, ShieldCheck } from 'lucide-react'

interface Step {
  step: number
  cardLabel: string
  bank: string
  cardProgram: string
  charged: number
  remaining: number
}

interface SimulationResultProps {
  steps: Step[]
  mode: string
  totalCharged: number
  anomaly: { reasons: string[] } | null
}

export default function SimulationResult({ steps, mode, totalCharged, anomaly }: SimulationResultProps) {
  return (
    <div className="space-y-5">
      {/* Simulation Result Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Simulation Result</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Mode: <span className="text-slate-900 font-semibold capitalize">{mode.replace('-', ' ')}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Charged</p>
          <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{toNaira(totalCharged)}</p>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex gap-3.5 last:mb-0"
          >
            {/* Step Marker */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 z-10 shadow-xs">
                {s.step}
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-full bg-slate-200 -mt-1" />}
            </div>

            {/* Step Detail Card */}
            <div className="flex-1 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">{s.cardLabel}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{s.bank} · {s.cardProgram}</p>
                </div>
                <div className="text-right flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200/60 rounded-md">
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums">{toNaira(s.charged)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">AVAILABLE BALANCE</span>
                <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">{toNaira(s.remaining)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Anomaly Check */}
      {anomaly ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 text-xs mb-1">Anomaly Detected</h4>
            <ul className="text-[11px] text-amber-700 space-y-0.5 list-disc pl-4">
              {anomaly.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex gap-3 items-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900 text-xs">Security Verification Passed</h4>
            <p className="text-[11px] text-emerald-700">Zero fraud risk or pattern anomalies detected.</p>
          </div>
        </div>
      )}
    </div>
  )
}
