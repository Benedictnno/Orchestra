'use client'
import { VelocityBucket } from '@/types/artifact'
import { VELOCITY_STATUS_COLORS, fmtNGN } from './artifact-utils'

interface VelocityTimelineProps {
  buckets: VelocityBucket[]
}

export function VelocityTimeline({ buckets }: VelocityTimelineProps) {
  const maxAmount = Math.max(...buckets.map(b => b.amount), 1)

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">Weekly Spend Velocity</span>
          <span className="text-[10px] text-muted-foreground">30-day outflow cadence</span>
        </div>
      </div>

      {/* Bar chart container */}
      <div className="p-3 rounded-2xl bg-muted/20 border border-border/50">
        <div className="flex items-end gap-3 h-24 pt-2">
          {buckets.map((bucket) => {
            const heightPct = Math.max(12, (bucket.amount / maxAmount) * 100)
            const barColor = VELOCITY_STATUS_COLORS[bucket.status] ?? 'bg-[#4A90e2]'

            return (
              <div key={bucket.period} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '68px' }}>
                  <div
                    className={`w-full rounded-t-lg ${barColor} transition-all duration-700 relative group cursor-pointer shadow-sm hover:brightness-110`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-md">
                      {fmtNGN(bucket.amount)}
                      {bucket.flag && ` · ${bucket.flag}`}
                    </div>
                  </div>
                </div>

                {/* Period label + delta */}
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-[10px] font-bold text-foreground">{bucket.period}</span>
                  {bucket.delta_pct !== 0 ? (
                    <span className={`text-[9px] font-bold ${
                      bucket.delta_pct > 0 ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                      {bucket.delta_pct > 0 ? '+' : ''}{bucket.delta_pct}%
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium">-</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground pt-3 mt-2 border-t border-border/40">
          {[
            { status: 'spike', label: 'Spike', color: 'bg-rose-500' },
            { status: 'elevated', label: 'Elevated', color: 'bg-amber-500' },
            { status: 'optimal', label: 'Optimal', color: 'bg-emerald-500' },
            { status: 'normal', label: 'Normal', color: 'bg-[#4A90e2]' },
          ].filter(({ status }) => buckets.some(b => b.status === status)).map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
