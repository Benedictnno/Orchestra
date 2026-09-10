'use client'
import { useState, useEffect, useCallback } from 'react'
import { toNaira } from '@/utils/format'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { Sliders } from 'lucide-react'

const CATEGORIES = ['food', 'transport', 'subscriptions', 'utilities', 'entertainment', 'shopping']

interface SavingsCalculatorProps {
  byCategory: Record<string, number>
}

interface SavingsResult {
  monthlySavings: number
  annualSavings: number
}

export default function SavingsCalculator({ byCategory }: SavingsCalculatorProps) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map(c => [c, 1.0]))
  )
  const [result, setResult] = useState<SavingsResult | null>(null)

  const calculate = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/insights/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustments }),
      })
      if (res.ok) setResult(await res.json())
      else {
        // Client-side fallback calculation
        const monthly = CATEGORIES.reduce((acc, cat) => {
          const current = byCategory[cat] || 0
          return acc + current * (1 - adjustments[cat])
        }, 0)
        setResult({ monthlySavings: monthly, annualSavings: monthly * 12 })
      }
    } catch {
      const monthly = CATEGORIES.reduce((acc, cat) => {
        const current = byCategory[cat] || 0
        return acc + current * (1 - adjustments[cat])
      }, 0)
      setResult({ monthlySavings: monthly, annualSavings: monthly * 12 })
    }
  }, [adjustments, byCategory])

  useEffect(() => {
    const timer = setTimeout(calculate, 400)
    return () => clearTimeout(timer)
  }, [calculate])

  const activeCategories = CATEGORIES.filter(c => byCategory[c] > 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 h-full flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center gap-1.5 mb-1 text-slate-900">
          <Sliders size={14} className="text-slate-500" />
          <h3 className="text-xs font-semibold">Simulated Savings Model</h3>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">Calibrate category expenditure targets</p>

        <div className="space-y-3.5">
          {activeCategories.map(cat => (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 capitalize">{cat}</span>
                <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                  {toNaira(byCategory[cat] * adjustments[cat])}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={adjustments[cat]}
                onChange={e =>
                  setAdjustments(prev => ({ ...prev, [cat]: parseFloat(e.target.value) }))
                }
                className="w-full accent-slate-900 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>0%</span>
                <span>{Math.round(adjustments[cat] * 100)}% allocation</span>
                <span>100%</span>
              </div>
            </div>
          ))}

          {activeCategories.length === 0 && (
            <p className="text-slate-400 text-xs text-center py-6">No historical data available</p>
          )}
        </div>
      </div>

      {result && result.monthlySavings > 0 ? (
        <div className="mt-4 bg-emerald-50 border border-emerald-200/80 rounded-lg p-3">
          <p className="text-emerald-900 font-semibold text-xs font-mono tabular-nums">
            +{toNaira(result.monthlySavings)} / month
          </p>
          <p className="text-emerald-700 text-[10px] font-mono mt-0.5">
            {toNaira(result.annualSavings)} annualized capital yield
          </p>
        </div>
      ) : activeCategories.length > 0 ? (
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
          <p className="text-slate-500 text-[11px]">Adjust targets below 100% to simulate yield</p>
        </div>
      ) : null}
    </div>
  )
}

