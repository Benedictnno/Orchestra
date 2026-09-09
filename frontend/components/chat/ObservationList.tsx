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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-foreground">AI Intelligence Observations</span>
        <span className="text-[10px] text-muted-foreground">Rule of Three insights</span>
      </div>

      {allObs.map((obs, i) => {
        const config = OBSERVATION_CONFIG[obs.type as keyof typeof OBSERVATION_CONFIG] ?? OBSERVATION_CONFIG.behavioral

        return (
          <div
            key={i}
            className={`flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border ${config.bg} ${config.border} transition-all hover:shadow-sm`}
          >
            {/* Icon badge */}
            <div className="w-8 h-8 rounded-xl bg-card border border-border/60 flex items-center justify-center text-lg shrink-0 shadow-sm mt-0.5">
              {obs.icon}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
                <span className="text-xs font-bold text-foreground truncate">{obs.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{obs.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
