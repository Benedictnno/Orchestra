'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { toNaira } from '@/utils/format'
import { useTransactionSummary } from '@/hooks/useTransactions'
import { BarChart3 } from 'lucide-react'

export default function SpendingChart() {
  const { data: summaryData, isLoading } = useTransactionSummary()

  if (isLoading) {
    return <div className="bg-slate-100 rounded-xl h-64 animate-pulse border border-slate-200/60" />
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
    .slice(-14) // Show last 14 days for clean density

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={15} className="text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-900">Daily Outflow Trend</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
          Last 14 days
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
          No spending activity recorded in this period
        </div>
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} 
                axisLine={{ stroke: '#e2e8f0' }} 
                tickLine={false} 
              />
              <YAxis 
                tickFormatter={v => `₦${(v / 100000).toFixed(0)}k`} 
                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                labelFormatter={(label, payload) => payload[0]?.payload?.date || label}
                formatter={(v: unknown) => [toNaira((Number(v) || 0) / 100), 'Outflow']} 
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  padding: '8px 12px',
                  color: '#0f172a'
                }} 
              />
              <Bar 
                dataKey="amount" 
                fill="#3B82F6" 
                radius={[3, 3, 0, 0]} 
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}


