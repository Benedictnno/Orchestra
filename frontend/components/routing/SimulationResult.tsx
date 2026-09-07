'use client'
import { toNaira } from '@/utils/format'
import { motion } from 'framer-motion'
import { Check, AlertTriangle } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Simulation Result Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-dark text-lg">Simulation Result</h3>
          <p className="text-xs text-gray-500 font-medium">Mode: <span className="capitalize">{mode.replace('-', ' ')}</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Charged</p>
          <p className="text-2xl font-black text-dark">{toNaira(totalCharged)}</p>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex gap-4 last:mb-0"
          >
            {/* Step Marker */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                {s.step}
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-full bg-brand/20 -mt-1" />}
            </div>

            {/* Step Detail Card */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-brand/20 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-dark text-sm">{s.cardLabel}</h4>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{s.bank} · {s.cardProgram}</p>
                </div>
                <div className="text-right flex items-center gap-1.5 px-2.5 py-1 bg-green-100/50 rounded-lg">
                  <Check size={12} className="text-green-600" />
                  <span className="text-xs font-bold text-green-700">{toNaira(s.charged)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">AVAILABLE BALANCE</span>
                <span className="text-[11px] font-black text-dark">{toNaira(s.remaining)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Anomaly Check */}
      {anomaly ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-800 text-sm mb-1">Anomaly Detected</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              {anomaly.reasons.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <Check size={20} />
          </div>
          <div>
            <h4 className="font-bold text-green-800 text-sm">Security Check Passed</h4>
            <p className="text-xs text-green-700">No anomalies detected in your spending pattern.</p>
          </div>
        </div>
      )}
    </div>
  )
}
