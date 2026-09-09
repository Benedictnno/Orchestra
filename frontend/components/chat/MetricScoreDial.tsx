'use client'

interface MetricScoreDialProps {
  score: number       // 0–100
  status: string      // e.g. "Tier 1 Buffer Active"
  benchmarkDelta: number
}

export function MetricScoreDial({ score, status, benchmarkDelta }: MetricScoreDialProps) {
  // SVG arc parameters
  const radius = 50
  const circumference = Math.PI * radius     // half-circle = πr
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference

  const scoreColor = score >= 85 ? '#10b981' // emerald-500
    : score >= 70 ? '#f59e0b' // amber-500
    : '#ef4444' // red-500

  const statusBg = score >= 85 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : score >= 70 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'

  const deltaPositive = benchmarkDelta >= 0

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/30 border border-border/60 gap-2 min-w-[150px]">
      <div className="relative w-36 h-20 flex items-center justify-center">
        <svg viewBox="0 0 120 65" className="w-full h-full overflow-visible" aria-label={`Financial health score ${score}`}>
          <defs>
            <linearGradient id="scoreTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d="M10,58 A50,50 0 0,1 110,58"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            className="text-muted/40"
          />

          {/* Filled arc */}
          <path
            d="M10,58 A50,50 0 0,1 110,58"
            fill="none"
            stroke={scoreColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Score label */}
          <text x="60" y="48" textAnchor="middle" fontSize="22" fontWeight="900" fill="currentColor" className="text-foreground">
            {score}
          </text>
          <text x="60" y="60" textAnchor="middle" fontSize="8" fill="currentColor" className="text-muted-foreground font-bold tracking-wider">
            OUT OF 100
          </text>
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBg} text-center leading-tight`}>
          {status}
        </span>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            deltaPositive
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {deltaPositive ? '▲ +' : '▼ -'}{Math.abs(benchmarkDelta)}% vs prior 30d
        </span>
      </div>
    </div>
  )
}
