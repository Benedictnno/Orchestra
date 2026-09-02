'use client'
import TransactionTable, { Transaction } from '@/components/transactions/TransactionTable'
import { Download } from 'lucide-react'
import { useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

export default function TransactionsPage() {
  // hold reference to the currently-filtered transactions from the table
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
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4A90e2] tracking-tight">Transaction History</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Analyze and manage your spending across all connected cards.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <TransactionTable onExport={handleExport} />

      {/* Insight chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-[#4A90e2] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
          <h3 className="text-lg font-bold mb-2">Smart Categorization</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Orchestra uses AI to automatically categorize your transactions across all cards for full spending clarity.
          </p>
        </div>
        <div className="bg-white border p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 text-xl">📊</div>
          <div>
            <h4 className="font-bold text-[#1A1A2E] mb-1">Monthly Analytics</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Visit <strong>AI Insights</strong> to see spending breakdowns, health score, and savings recommendations.
            </p>
          </div>
        </div>
        <div className="bg-white border p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 text-xl">🔗</div>
          <div>
            <h4 className="font-bold text-[#1A1A2E] mb-1">Card Optimization</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Use the <strong>Ultimate Card</strong> simulator to find the best routing strategy for your payment mix.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
