'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'

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
          <strong className="font-semibold text-gray-900">{item.title}: </strong>
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
      summary: 'No transaction data yet. Add a card and make some transactions to unlock AI insights.',
      insights: ['Your spending data will appear here once you have transactions.'],
      recommendations: ['Add a physical card to get started.', 'Create a virtual card for subscriptions.', 'Set up your routing preference.'],
      savingsOpportunity: 0,
    }
  }

  insights.push(`Your highest spend category is ${topCat?.[0] ?? 'unknown'} at ₦${(topCat?.[1] ?? 0).toLocaleString('en-NG')}.`)
  if (sorted.length > 1) insights.push(`You spent across ${sorted.length} categories this period.`)
  if (byCategory['subscriptions']) insights.push(`Subscription spending: ₦${byCategory['subscriptions'].toLocaleString('en-NG')} — consider a virtual card to isolate these.`)

  const savingsOpportunity = Math.round(totalSpend * 0.12)
  recommendations.push('Switch subscriptions to a merchant-locked virtual card to avoid accidental overcharges.')
  recommendations.push('Enable "Balance Optimised" routing to avoid declined transactions near your card limits.')
  if (byCategory['food'] || byCategory['transport']) recommendations.push('Set a monthly budget alert for food and transport — your two largest variable expenses.')

  return {
    summary: `This period you spent ₦${totalSpend.toLocaleString('en-NG')} across ${sorted.length} categories. ${topCat ? `Your biggest area is ${topCat[0]}.` : ''} Orchestra has identified ₦${savingsOpportunity.toLocaleString('en-NG')} in potential monthly savings.`,
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
    <div className="space-y-6">
      {/* AI Summary */}
      <div className="bg-[#1A1A2E] text-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#E94560]">✦</span>
          <p className="text-sm text-white/60 font-medium">
            {source === 'ai' ? 'AI Financial Summary' : 'Financial Summary'}
          </p>
          {source === 'local' && (
            <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">Auto-generated</span>
          )}
        </div>
        <p className="text-lg leading-relaxed">{data.summary}</p>
      </div>

      {/* Insights + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border">
          <h3 className="font-bold text-[#1A1A2E] mb-4">Spending Insights</h3>
          <div className="space-y-3">
            {(data.insights || []).map((insight, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="text-sm text-gray-700">{renderInsightText(insight)}</div>
              </div>
            ))}
            {(!data.insights || data.insights.length === 0) && (
              <p className="text-sm text-gray-400 italic">No specific spending insights at this time.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border">
          <h3 className="font-bold text-[#1A1A2E] mb-4">Recommendations</h3>
          <div className="space-y-3">
            {(data.recommendations || []).map((rec, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                <div className="text-sm text-gray-700">{renderInsightText(rec)}</div>
              </div>
            ))}
            {(!data.recommendations || data.recommendations.length === 0) && (
              <p className="text-sm text-gray-400 italic">No recommendations available at this time.</p>
            )}
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {(data.savingsOpportunity || 0) > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="text-green-700 font-bold text-lg">
            ₦{data.savingsOpportunity.toLocaleString('en-NG')} potential monthly savings
          </p>
          <p className="text-green-600 text-sm mt-1">If you follow all {(data.recommendations || []).length} recommendations above</p>
        </div>
      )}
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-800 rounded-2xl h-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-200 rounded-2xl h-48" />
        <div className="bg-gray-200 rounded-2xl h-48" />
      </div>
    </div>
  )
}
