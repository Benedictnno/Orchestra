'use client'
import { useEffect, useState } from 'react'
import AIInsightsPanel from '@/components/insights/AIInsightsPanel'
import SpendingBreakdown from '@/components/insights/SpendingBreakdown'
import SavingsCalculator from '@/components/insights/SavingsCalculator'
import AnomalyFeed from '@/components/insights/AnomalyFeed'
import FinancialHealthScore from '@/components/insights/FinancialHealthScore'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import toast from 'react-hot-toast'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { Download, AlertCircle } from 'lucide-react'

interface InsightsData {
  insights: {
    byCategory: Record<string, number>
  }
}

export default function InsightsPage() {
  const [byCategory, setByCategory] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // Try the AI insights endpoint first
      try {
        const r = await fetchWithAuth('/api/insights')
        const d: InsightsData = await r.json()
        if (r.ok && d.insights?.byCategory) {
          setByCategory(d.insights.byCategory)
          setLoading(false)
          return
        }
      } catch { /* fallthrough */ }

      // Fallback: aggregate byCategory from raw transactions
      try {
        const r = await fetchWithAuth('/api/transactions?limit=200')
        const d = await r.json()
        const txs: Array<{ category: string; amount: number }> = Array.isArray(d?.transactions) ? d.transactions : []
        const catMap: Record<string, number> = {}
        for (const tx of txs) {
          if (tx.amount < 0) {
            catMap[tx.category] = (catMap[tx.category] || 0) + Math.abs(tx.amount)
          }
        }
        setByCategory(catMap)
      } catch { /* empty state */ }
      setLoading(false)
    }
    load()
  }, [])

  async function downloadReport() {
    try {
      const res = await fetchWithAuth('/api/report?days=30')
      const { report } = await res.json()
      const txList = Array.isArray(report?.transactions) ? report.transactions : [];
      const rows = [
        ['Date', 'Merchant', 'Category', 'Amount (NGN)', 'Reference', 'Flagged'],
        ...txList.map((t: {
          date: string; merchant: string; category: string;
          amount: number; reference: string; flagged: boolean
        }) => [
          new Date(t.date).toLocaleDateString('en-NG'),
          t.merchant,
          t.category,
          t.amount,
          t.reference,
          t.flagged ? 'Yes' : 'No',
        ])
      ]
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orchestra-report-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch {
      toast.error('Failed to download report')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">AI Financial Insights</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated spending pattern diagnostics, predictive burn rate, and capital efficiency recommendations.
          </p>
        </div>
        <button
          onClick={downloadReport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <Download size={13} className="text-slate-500" /> Export CSV Report
        </button>
      </div>

      {loading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Health Score + AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 h-full">
              <FinancialHealthScore />
            </div>
            <div className="lg:col-span-8 h-full">
              <AIInsightsPanel />
            </div>
          </div>

          {/* Bottom Row: Anomaly Feed + Spending Breakdown + Savings Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 h-full flex flex-col shadow-sm">
              <div className="flex items-center gap-1.5 mb-4 text-slate-900">
                <AlertCircle size={14} className="text-amber-500" />
                <h3 className="text-xs font-semibold">Live Anomaly Feed</h3>
              </div>
              <div className="flex-1">
                <AnomalyFeed />
              </div>
            </div>
            
            <div className="h-full">
              <SpendingBreakdown byCategory={byCategory} />
            </div>

            <div className="md:col-span-2 xl:col-span-1 h-full">
              <SavingsCalculator byCategory={byCategory} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

