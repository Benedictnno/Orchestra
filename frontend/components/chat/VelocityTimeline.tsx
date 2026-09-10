'use client'
import { VelocityBucket } from '@/types/artifact'
import { VELOCITY_STATUS_COLORS, fmtNGN } from './artifact-utils'

interface VelocityTimelineProps {
  buckets: VelocityBucket[]
}

export function VelocityTimeline({ buckets }: VelocityTimelineProps) {
  const maxAmount = Math.max(...buckets.map(b => b.amount), 1)

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-900">
          <span>Weekly Outflow Cadence</span>
          <span className="text-[10px] text-slate-400 font-mono">30-day velocity</span>
        </div>
      </div>

      {/* Bar chart container */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
        <div className="flex items-end gap-3 h-20 pt-1">
          {buckets.map((bucket) => {
            const heightPct = Math.max(15, (bucket.amount / maxAmount) * 100)
            const barColor = VELOCITY_STATUS_COLORS[bucket.status] ?? 'bg-slate-900'

            return (
              <div key={bucket.period} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '56px' }}>
                  <div
                    className={`w-full rounded-t ${barColor} transition-all duration-500 relative group cursor-pointer hover:opacity-90`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-md">
                      {fmtNGN(bucket.amount)}
                      {bucket.flag && ` · ${bucket.flag}`}
                    </div>
                  </div>
                </div>

                {/* Period label + delta */}
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-[9px] font-mono text-slate-700">{bucket.period}</span>
                  {bucket.delta_pct !== 0 ? (
                    <span className={`text-[8px] font-mono tabular-nums ${
                      bucket.delta_pct > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {bucket.delta_pct > 0 ? '+' : ''}{bucket.delta_pct}%
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-400 font-mono">-</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-2 mt-2 border-t border-slate-200/60 font-mono">
          {[
            { status: 'spike', label: 'Spike', color: 'bg-rose-500' },
            { status: 'elevated', label: 'Elevated', color: 'bg-amber-500' },
            { status: 'optimal', label: 'Optimal', color: 'bg-emerald-500' },
            { status: 'normal', label: 'Normal', color: 'bg-slate-900' },
          ].filter(({ status }) => buckets.some(b => b.status === status)).map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

