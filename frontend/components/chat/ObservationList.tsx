'use client'
import { Observation } from '@/types/artifact'
import { OBSERVATION_CONFIG } from './artifact-utils'

interface ObservationListProps {
  observations: Observation[]
}

const TYPE_ORDER = ['behavioral', 'efficiency', 'opportunity'] as const

export function ObservationList({ observations }: ObservationListProps) {
  // Ensure Rule of Three order: behavioral → efficiency → opportunity
  const sorted = TYPE_ORDER
    .map(type => observations.find(o => o.type === type))
    .filter(Boolean) as Observation[]

  // Append any extras not in the standard three
  const extras = observations.filter(o => !TYPE_ORDER.includes(o.type as typeof TYPE_ORDER[number]))
  const allObs = [...sorted, ...extras]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-900">Intelligence Observations</span>
        <span className="text-[10px] text-slate-400 font-mono">Rule of Three insights</span>
      </div>

      <div className="space-y-2">
        {allObs.map((obs, i) => {
          const config = OBSERVATION_CONFIG[obs.type as keyof typeof OBSERVATION_CONFIG] ?? OBSERVATION_CONFIG.behavioral

          return (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 transition-colors"
            >
              {/* Icon badge */}
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-xs shrink-0 mt-0.5">
                {obs.icon}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 font-mono">
                    {config.label}
                  </span>
                  <span className="text-xs font-medium text-slate-900 truncate">{obs.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{obs.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

