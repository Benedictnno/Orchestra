'use client'
import { SpendingSegment } from '@/types/artifact'
import { getColorClasses, fmtNGN } from './artifact-utils'

interface SpendingSpectrumBarProps {
  segments: SpendingSegment[]
}

export function SpendingSpectrumBar({ segments }: SpendingSpectrumBarProps) {
  const top5 = segments.slice(0, 5)

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">Spending Spectrum</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
            {segments.length} active
          </span>
        </div>
      </div>

      {/* Multi-segment bar */}
      <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-muted shadow-inner p-0.5 gap-0.5">
        {top5.map((seg) => {
          const { bar } = getColorClasses(seg.color)
          return (
            <div
              key={seg.category}
              className={`h-full ${bar} rounded-full transition-all duration-700 hover:opacity-90 cursor-default`}
              style={{ width: `${Math.max(2, seg.percentage)}%` }}
              title={`${seg.category}: ${seg.percentage}% — ${fmtNGN(seg.amount)}`}
            />
          )
        })}
      </div>

      {/* Legend pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {top5.map((seg) => {
          const { dot, text, bg } = getColorClasses(seg.color)
          return (
            <div
              key={seg.category}
              className={`flex items-center justify-between p-2 rounded-xl border border-border/50 ${bg} text-[11px]`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                <span className="font-semibold text-foreground capitalize truncate">{seg.category}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <span className="text-muted-foreground text-[10px]">{seg.percentage}%</span>
                <span className={`font-bold ${text}`}>{fmtNGN(seg.amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
