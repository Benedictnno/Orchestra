'use client'
import { SpendingSegment } from '@/types/artifact'
import { getColorClasses, fmtNGN } from './artifact-utils'

interface SpendingSpectrumBarProps {
  segments: SpendingSegment[]
}

export function SpendingSpectrumBar({ segments }: SpendingSpectrumBarProps) {
  const top5 = segments.slice(0, 5)

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-900">
          <span>Spending Distribution</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
            {segments.length} active
          </span>
        </div>
      </div>

      {/* Multi-segment bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 gap-0.5">
        {top5.map((seg) => {
          const { bar } = getColorClasses(seg.color)
          return (
            <div
              key={seg.category}
              className={`h-full ${bar} transition-all duration-500`}
              style={{ width: `${Math.max(2, seg.percentage)}%` }}
              title={`${seg.category}: ${seg.percentage}% — ${fmtNGN(seg.amount)}`}
            />
          )
        })}
      </div>

      {/* Legend pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {top5.map((seg) => {
          const { dot } = getColorClasses(seg.color)
          return (
            <div
              key={seg.category}
              className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 bg-slate-50/50 text-[11px]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                <span className="font-medium text-slate-800 capitalize truncate">{seg.category}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1 font-mono text-[10px] tabular-nums">
                <span className="text-slate-400">{seg.percentage}%</span>
                <span className="font-semibold text-slate-900">{fmtNGN(seg.amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

