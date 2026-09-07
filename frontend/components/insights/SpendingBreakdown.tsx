'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toNaira } from '@/utils/format'

const COLORS = ['#E94560', '#1A1A2E', '#16213E', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6']

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
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold text-[#1A1A2E] mb-4">Spending by Category</h3>
        <p className="text-gray-400 text-sm text-center py-8">No spending data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="font-bold text-[#1A1A2E] mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: unknown) => [toNaira(Number(v) || 0), 'Spent']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
          />
          <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
