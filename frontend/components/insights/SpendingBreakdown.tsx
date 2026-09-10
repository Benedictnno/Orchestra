'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toNaira } from '@/utils/format'
import { PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B']

interface SpendingBreakdownProps {
  byCategory: Record<string, number>
}

export default function SpendingBreakdown({ byCategory }: SpendingBreakdownProps) {
  const data = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 h-full flex flex-col justify-between shadow-sm">
        <div className="flex items-center gap-1.5 mb-2 text-slate-900">
          <PieChartIcon size={14} className="text-slate-500" />
          <h3 className="text-xs font-semibold">Spending by Category</h3>
        </div>
        <p className="text-slate-400 text-xs text-center py-8">No spending telemetry recorded yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 h-full flex flex-col justify-between shadow-sm">
      <div className="flex items-center gap-1.5 mb-2 text-slate-900">
        <PieChartIcon size={14} className="text-slate-500" />
        <h3 className="text-xs font-semibold">Spending by Category</h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: unknown) => [toNaira(Number(v) || 0), 'Settled']}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #E2E8F0', 
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
            <Legend 
              formatter={(v) => <span className="text-[11px] text-slate-600 capitalize">{v}</span>} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

