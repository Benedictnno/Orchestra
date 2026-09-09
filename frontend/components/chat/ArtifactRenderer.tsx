'use client'
import { FinancialArtifact } from '@/types/artifact'
import { MetricScoreDial } from './MetricScoreDial'
import { SpendingSpectrumBar } from './SpendingSpectrumBar'
import { VelocityTimeline } from './VelocityTimeline'
import { ObservationList } from './ObservationList'
import { FlaggedMerchantRows } from './FlaggedMerchantRow'
import { ActionTriggerButtons } from './ActionTriggerButton'
import { Sparkles, Activity } from 'lucide-react'

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
    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-muted/50 via-muted/30 to-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#4A90e2]/10 border border-[#4A90e2]/20 flex items-center justify-center shrink-0 shadow-sm text-[#4A90e2]">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-foreground leading-tight truncate">{summary.headline}</h3>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">{summary.scope}</p>
          </div>
        </div>
        {timestamp && (
          <span className="text-[10px] text-muted-foreground font-medium shrink-0 bg-muted/60 px-2 py-1 rounded-lg border border-border/40">
            {timestamp}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Optional Executive Intro text */}
        {introText && (
          <div className="p-3.5 rounded-2xl bg-[#4A90e2]/5 border border-[#4A90e2]/20 text-xs text-foreground leading-relaxed font-medium">
            {introText}
          </div>
        )}

        {/* ── Score Dial + Spectrum (side by side on sm+) ─────────────────── */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-stretch">
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
          <div className="pt-2 border-t border-border/60">
            <VelocityTimeline buckets={velocity_spikes} />
          </div>
        )}

        {/* ── Observations (Rule of Three) ────────────────────────────────── */}
        {observations.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <ObservationList observations={observations} />
          </div>
        )}

        {/* ── Flagged Merchants ───────────────────────────────────────────── */}
        {flagged_merchants.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <FlaggedMerchantRows merchants={flagged_merchants} />
          </div>
        )}

        {/* ── Action Workflows ────────────────────────────────────────────── */}
        {action_workflows.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2.5">
              Recommended Copilot Workflows
            </div>
            <ActionTriggerButtons actions={action_workflows} />
          </div>
        )}
      </div>
    </div>
  )
}
