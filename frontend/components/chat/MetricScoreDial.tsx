'use client'

interface MetricScoreDialProps {
  score: number
  status: string
  benchmarkDelta: number
}

export function MetricScoreDial({ score, status, benchmarkDelta }: MetricScoreDialProps) {
  // SVG arc parameters
  const radius = 48
  const circumference = Math.PI * radius
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference

  const scoreColor = score >= 85 ? '#0F172A'
    : score >= 70 ? '#F59E0B'
    : '#EF4444'

  const deltaPositive = benchmarkDelta >= 0

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-200/70 gap-2 min-w-[140px]">
      <div className="relative w-32 h-16 flex items-center justify-center">
        <svg viewBox="0 0 120 65" className="w-full h-full overflow-visible" aria-label={`Financial health score ${score}`}>
          {/* Background track */}
          <path
            d="M10,58 A50,50 0 0,1 110,58"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Filled arc */}
          <path
            d="M10,58 A50,50 0 0,1 110,58"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Score label */}
          <text x="60" y="48" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0F172A" className="font-mono">
            {score}
          </text>
          <text x="60" y="60" textAnchor="middle" fontSize="7" fill="#64748B" fontWeight="600" letterSpacing="0.05em">
            OUT OF 100
          </text>
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-center leading-tight">
          {status}
        </span>

        <span
          className={`text-[10px] font-mono tabular-nums font-medium ${
            deltaPositive
              ? 'text-rose-600'
              : 'text-emerald-600'
          }`}
        >
          {deltaPositive ? '+ ' : '- '}{Math.abs(benchmarkDelta)}% vs prior 30d
        </span>
      </div>
    </div>
  )
}

