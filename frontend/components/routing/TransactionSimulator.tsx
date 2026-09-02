'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toNaira } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'

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
    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-[#E94560]/10 rounded-lg flex items-center justify-center">
          <span className="text-[#E94560] text-base">⚡</span>
        </div>
        <h2 className="text-xl font-bold text-[#4A90e2]">Simulate a Transaction</h2>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Amount (NGN)</label>
          <input
            type="number"
            placeholder="e.g. 150000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Merchant</label>
          <input
            type="text"
            placeholder="e.g. Shoprite"
            value={merchant}
            onChange={e => setMerchant(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E94560] focus:outline-none bg-white"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading || !amount}
        className="w-full bg-[#E94560] text-white py-3 rounded-xl font-bold hover:bg-[#d63850] transition disabled:opacity-50 mb-6"
      >
        {loading
          ? 'Routing payment…'
          : amount
            ? `Pay ${toNaira(amountKobo)}`
            : 'Enter an amount to simulate'}
      </button>

      {/* Anomaly warning */}
      {result?.anomaly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="font-bold text-amber-700 text-sm">⚠ Anomaly Detected</p>
          {result.anomaly.reasons.map((r, i) => (
            <p key={i} className="text-amber-600 text-xs mt-1">{r}</p>
          ))}
        </div>
      )}

      {/* Animated steps */}
      {result?.success && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Routing mode: <span className="font-bold text-[#4A90e2] capitalize">{result.mode}</span>
          </p>

          <AnimatePresence>
            {result.steps.slice(0, step).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#4A90e2]">{s.cardLabel}</p>
                    <p className="text-xs text-gray-500">{s.bank} · {s.cardProgram}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#4A90e2]">{toNaira(s.charged)}</p>
                  <p className="text-xs text-gray-400">Bal: {toNaira(s.remaining)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {step >= (result.steps?.length ?? 0) && step > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
            >
              <p className="text-green-700 font-bold">✓ Payment Successful</p>
              <p className="text-green-600 text-sm">
                {toNaira(result.totalCharged)} charged across {result.steps.length} card{result.steps.length > 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {result && !result.success && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 font-bold">Payment Failed</p>
          <p className="text-red-600 text-sm">{result.reason}</p>
        </div>
      )}
    </div>
  )
}
