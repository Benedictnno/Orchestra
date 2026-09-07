'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { toNaira } from '@/utils/format'
import { useTransactionSummary } from '@/hooks/useTransactions'

export default function SpendingChart() {
  const { data: summaryData, isLoading } = useTransactionSummary()

  if (isLoading) {
    return <div className="bg-gray-200 rounded-2xl h-48 animate-pulse" />
  }

  const dailySpend = summaryData?.summary?.dailySpend || {}
  
  // Transform dailySpend (YYYY-MM-DD) into chart data
  const chartData = Object.entries(dailySpend)
    .map(([date, amount]) => {
      const d = new Date(date)
      return {
        date,
        day: d.toLocaleDateString('default', { day: 'numeric', month: 'short' }),
        amount: amount as number,
        timestamp: d.getTime()
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-14) // Show last 14 days for better readability

  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1A1A2E]">Daily Spending Trend</h3>
        <span className="text-xs text-gray-400">Last 14 days</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 10, fill: '#9ca3af' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tickFormatter={v => `₦${(v / 100).toLocaleString()}`} 
            tick={{ fontSize: 10, fill: '#9ca3af' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            labelFormatter={(label, payload) => payload[0]?.payload?.date || label}
            formatter={(v: unknown) => [toNaira((Number(v) || 0) / 100), 'Spent']} 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} 
          />
          <Bar dataKey="amount" fill="#E94560" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

