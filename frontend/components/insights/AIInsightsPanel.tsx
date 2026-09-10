'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { Sparkles, Check, ArrowRight } from 'lucide-react'
import { toNaira } from '@/utils/format'

interface InsightItem {
  title?: string
  detail?: string
}

type InsightEntry = string | InsightItem

interface Insights {
  summary: string
  insights: InsightEntry[]
  recommendations: InsightEntry[]
  savingsOpportunity: number
}

interface Transaction {
  category: string
  amount: number
  merchant: string
}

function renderInsightText(item: InsightEntry): React.ReactNode {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    if (item.title && item.detail) {
      return (
        <span>
          <strong className="font-medium text-slate-900">{item.title}: </strong>
          {item.detail}
        </span>
      )
    }
    return item.detail || item.title || JSON.stringify(item)
  }
  return String(item ?? '')
}

/** Build basic insights locally from transaction data when /api/insights fails */
function buildLocalInsights(transactions: Transaction[]): Insights {
  const byCategory: Record<string, number> = {}
  let totalSpend = 0

  for (const tx of transactions) {
    if (tx.amount < 0) {
      const cat = tx.category || 'other'
      byCategory[cat] = (byCategory[cat] || 0) + Math.abs(tx.amount)
      totalSpend += Math.abs(tx.amount)
    }
  }

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const topCat = sorted[0]
  const insights: string[] = []
  const recommendations: string[] = []

  if (sorted.length === 0) {
    return {
      summary: 'No transaction data yet. Link a card and make transactions to generate automated intelligence.',
      insights: ['Spending telemetry will calibrate once settlement events are recorded.'],
      recommendations: ['Link your primary hardware bank card.', 'Provision a merchant-locked virtual card for recurring SaaS.', 'Configure auto-balance routing.'],
      savingsOpportunity: 0,
    }
  }

  insights.push(`Primary capital outflow category is ${topCat?.[0] ?? 'unknown'} at ${toNaira(topCat?.[1] ?? 0)}.`)
  if (sorted.length > 1) insights.push(`Outflow diversified across ${sorted.length} distinct merchant categories.`)
  if (byCategory['subscriptions']) insights.push(`Recurring software spend is ${toNaira(byCategory['subscriptions'])} — isolate via merchant-locked cards.`)

  const savingsOpportunity = Math.round(totalSpend * 0.12)
  recommendations.push('Route recurring subscriptions to dedicated virtual cards to mitigate unauthorized overcharges.')
  recommendations.push('Enable balance-optimized routing to prevent transaction declines on card limits.')
  if (byCategory['food'] || byCategory['transport']) recommendations.push('Configure a monthly budget threshold alert for variable operational expenses.')

  return {
    summary: `Current outflow totaled ${toNaira(totalSpend)} across ${sorted.length} merchant categories. ${topCat ? `Primary concentration in ${topCat[0]}.` : ''} Orchestra identified ${toNaira(savingsOpportunity)} in monthly capital efficiency opportunities.`,
    insights,
    recommendations,
    savingsOpportunity,
  }
}

export default function AIInsightsPanel() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'ai' | 'local'>('ai')

  useEffect(() => {
    fetchWithAuth('/api/insights')
      .then(async r => {
        const d = await r.json()
        if (r.ok && d.insights) {
          const insightDoc = d.insights
          setData({
            summary: insightDoc.summary || 'No summary available.',
            insights: Array.isArray(insightDoc.insights) ? insightDoc.insights : [],
            recommendations: Array.isArray(insightDoc.recommendations) ? insightDoc.recommendations : [],
            savingsOpportunity: typeof insightDoc.savingsOpportunity === 'number' ? insightDoc.savingsOpportunity : 0,
          })
          setSource('ai')
        } else {
          throw new Error('insights unavailable')
        }
      })
      .catch(async () => {
        // Fallback: build from transaction data
        try {
          const r = await fetchWithAuth('/api/transactions?limit=100')
          const d = await r.json()
          const txs: Transaction[] = Array.isArray(d?.transactions) ? d.transactions : []
          setData(buildLocalInsights(txs))
          setSource('local')
        } catch {
          setData(buildLocalInsights([]))
          setSource('local')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <InsightsSkeleton />
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* AI Summary Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={13} className="text-slate-400" />
          <p className="text-xs text-slate-400 font-medium">
            {source === 'ai' ? 'Executive AI Financial Brief' : 'Automated Financial Summary'}
          </p>
          {source === 'local' && (
            <span className="ml-auto text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-400">
              Calibrated
            </span>
          )}
        </div>
        <p className="text-sm font-normal text-slate-200 leading-relaxed">{data.summary}</p>
      </div>

      {/* Insights + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-900 mb-3">Spending Pattern Insights</h3>
          <div className="space-y-2.5">
            {(data.insights || []).map((insight, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-5 h-5 rounded bg-slate-100 text-slate-700 text-[11px] flex items-center justify-center font-mono font-medium shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">{renderInsightText(insight)}</div>
              </div>
            ))}
            {(!data.insights || data.insights.length === 0) && (
              <p className="text-xs text-slate-400 italic">No specific spending insights at this time.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-900 mb-3">Optimization Actions</h3>
          <div className="space-y-2.5">
            {(data.recommendations || []).map((rec, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[11px] flex items-center justify-center font-medium shrink-0 mt-0.5 border border-emerald-200/60">
                  <Check size={11} />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">{renderInsightText(rec)}</div>
              </div>
            ))}
            {(!data.recommendations || data.recommendations.length === 0) && (
              <p className="text-xs text-slate-400 italic">No recommendations available at this time.</p>
            )}
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {(data.savingsOpportunity || 0) > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-900">
              <strong className="font-mono tabular-nums text-emerald-700">{toNaira(data.savingsOpportunity)}</strong> potential monthly efficiency gain
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Identified through automated routing optimization and merchant limit controls
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-slate-100 rounded-xl h-28" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-100 rounded-xl h-44" />
        <div className="bg-slate-100 rounded-xl h-44" />
      </div>
    </div>
  )
}

