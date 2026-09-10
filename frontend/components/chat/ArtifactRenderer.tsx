'use client'
import { FinancialArtifact } from '@/types/artifact'
import { MetricScoreDial } from './MetricScoreDial'
import { SpendingSpectrumBar } from './SpendingSpectrumBar'
import { VelocityTimeline } from './VelocityTimeline'
import { ObservationList } from './ObservationList'
import { FlaggedMerchantRows } from './FlaggedMerchantRow'
import { ActionTriggerButtons } from './ActionTriggerButton'
import { Sparkles } from 'lucide-react'

interface ArtifactRendererProps {
  artifact: FinancialArtifact
  timestamp?: string
}

/**
 * Root dispatcher — maps FinancialArtifact schema keys to deterministic UI components.
 * Layout, typography, contrast, and micro-interactions are pixel-perfect and branded.
 */
export function ArtifactRenderer({ artifact, timestamp }: ArtifactRendererProps) {
  const { summary, spending_spectrum, velocity_spikes, observations, flagged_merchants, action_workflows, introText } = artifact

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 text-white">
            <Sparkles size={13} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-slate-900 leading-tight truncate">{summary.headline}</h3>
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{summary.scope}</p>
          </div>
        </div>
        {timestamp && (
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            {timestamp}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Optional Executive Intro text */}
        {introText && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            {introText}
          </div>
        )}

        {/* ── Score Dial + Spectrum (side by side on sm+) ─────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
          <div className="shrink-0 w-full sm:w-auto flex justify-center">
            <MetricScoreDial
              score={summary.health_score}
              status={summary.health_status}
              benchmarkDelta={summary.benchmark_variance_pct}
            />
          </div>

          <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
            {spending_spectrum.length > 0 && (
              <SpendingSpectrumBar segments={spending_spectrum} />
            )}
          </div>
        </div>

        {/* ── Velocity Timeline ───────────────────────────────────────────── */}
        {velocity_spikes.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <VelocityTimeline buckets={velocity_spikes} />
          </div>
        )}

        {/* ── Observations (Rule of Three) ────────────────────────────────── */}
        {observations.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <ObservationList observations={observations} />
          </div>
        )}

        {/* ── Flagged Merchants ───────────────────────────────────────────── */}
        {flagged_merchants.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <FlaggedMerchantRows merchants={flagged_merchants} />
          </div>
        )}

        {/* ── Action Workflows ────────────────────────────────────────────── */}
        {action_workflows.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Recommended Workflows
            </div>
            <ActionTriggerButtons actions={action_workflows} />
          </div>
        )}
      </div>
    </div>
  )
}

