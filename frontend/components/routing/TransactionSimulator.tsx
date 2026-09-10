'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toNaira } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { Zap, Play, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SimulationStep {
  step: number
  cardLabel: string
  bank: string
  cardProgram: string
  charged: number
  remaining: number
}

interface SimulationResult {
  success: boolean
  mode: string
  steps: SimulationStep[]
  totalCharged: number
  reason?: string
  anomaly?: {
    reasons: string[]
  }
}

const CATEGORIES = ['food', 'transport', 'subscriptions', 'utilities', 'entertainment', 'shopping', 'other']

export default function TransactionSimulator() {
  const [amount,   setAmount]   = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState('shopping')
  const [result,   setResult]   = useState<SimulationResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [step,     setStep]     = useState(0)

  async function handleSimulate() {
    if (!amount || isNaN(Number(amount))) return
    setLoading(true)
    setResult(null)
    setStep(0)

    try {
      const res = await fetchWithAuth('/api/routing/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Backend expects amount in Kobo for simulations
          amount: Math.round(parseFloat(amount) * 100),
          merchant,
          category,
        }),
      })
      const data: SimulationResult = await res.json()
      setResult(data)
      setLoading(false)

      if (data.success && data.steps?.length) {
        data.steps.forEach((_, i) => {
          setTimeout(() => setStep(i + 1), (i + 1) * 700)
        })
      }
    } catch {
      setLoading(false)
      setResult({ success: false, mode: '', steps: [], totalCharged: 0, reason: 'Network error — please retry.' })
    }
  }

  const amountKobo = parseFloat(amount) * 100

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Interactive Routing Simulator</h2>
              <p className="text-[11px] text-slate-500">Test how multi-card splits trigger against live rules</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Sandbox
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Amount (NGN)</label>
            <input
              type="number"
              placeholder="e.g. 150000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Merchant</label>
            <input
              type="text"
              placeholder="e.g. Shoprite Ikeja"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSimulate}
          disabled={loading || !amount}
          className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 mb-5"
        >
          {loading ? (
            <span>Simulating multi-card routing…</span>
          ) : amount ? (
            <span>Execute Test Payment of {toNaira(amountKobo)}</span>
          ) : (
            <span>Enter amount to simulate</span>
          )}
        </button>

        {/* Anomaly Detection Feedback */}
        {result?.anomaly && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 mb-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Anomaly Detected by Interswitch Engine</span>
            </div>
            <ul className="text-amber-700 pl-5 list-disc space-y-0.5 text-[11px]">
              {result.anomaly.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Execution Sequence List */}
        {result?.success && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Applied Mode: <strong className="text-slate-900 capitalize">{result.mode.replace('-', ' ')}</strong></span>
              <span className="font-mono text-[11px]">Steps: {result.steps.length}</span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {result.steps.slice(0, step).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between bg-slate-50/80 border border-slate-200/80 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-900 truncate">{s.cardLabel}</p>
                        <p className="text-[11px] text-slate-500 truncate">{s.bank} · {s.cardProgram}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs text-slate-900 font-mono tabular-nums">
                        {toNaira(s.charged)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                        Remaining: {toNaira(s.remaining)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {step >= (result.steps?.length ?? 0) && step > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3"
              >
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-900">Payment Simulation Successful</p>
                  <p className="text-emerald-700 text-[11px]">
                    {toNaira(result.totalCharged)} successfully cleared across {result.steps.length} card{result.steps.length > 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Failure banner */}
        {result && !result.success && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-3 text-xs">
            <XCircle size={18} className="text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-rose-900">Simulation Failed</p>
              <p className="text-rose-700 text-[11px]">{result.reason || 'Insufficient funds across all linked cards'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
