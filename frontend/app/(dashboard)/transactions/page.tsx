'use client'
import TransactionTable, { Transaction } from '@/components/transactions/TransactionTable'
import { Download, Sparkles, BarChart3, Layers } from 'lucide-react'
import { useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function TransactionsPage() {
  // Hold reference to the currently-filtered transactions from the table
  const filteredRef = useRef<Transaction[]>([])

  const handleExport = useCallback((txs: Transaction[]) => {
    filteredRef.current = txs
  }, [])

  function downloadCSV() {
    const txs = filteredRef.current
    if (txs.length === 0) {
      toast.error('No transactions to export')
      return
    }
    const rows = [
      ['Date', 'Merchant', 'Category', 'Card', 'Amount (NGN)', 'Reference', 'Flagged'],
      ...txs.map(t => [
        new Date(t.transactionDate).toLocaleDateString('en-NG'),
        t.merchant,
        t.category,
        t.cardLabel || t.card || '',
        (Math.abs(t.amount) / 100).toFixed(2),
        t.reference || '',
        t.flagged ? 'Yes' : 'No',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orchestra-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${txs.length} transactions`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time ledger and multi-bank settlement audit trail across all connected cards.
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download size={13} className="text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Ledger Table */}
      <TransactionTable onExport={handleExport} />

      {/* Contextual Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-blue-600" />
            <h4 className="text-xs font-semibold text-slate-900">Smart Categorization</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Neural classification automatically categorizes merchant settlements and identifies recurring subscriptions.
          </p>
        </div>

        <Link
          href="/insights"
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
            <h4 className="text-xs font-semibold text-slate-900">Monthly Velocity</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect category concentration, run-rate analytics, and anomaly alerts on the AI Insights dashboard.
          </p>
        </Link>

        <Link
          href="/cards"
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
            <h4 className="text-xs font-semibold text-slate-900">Card Orchestration</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage multi-bank routing priority rules and configure smart limits for virtual card subscriptions.
          </p>
        </Link>
      </div>
    </div>
  )
}

