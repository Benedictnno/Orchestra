// ─────────────────────────────────────────────────────────────────────────────
// Orchestra AI Artifact Schema
// Typed financial artifacts returned by the structured AI pipeline.
// The LLM is instructed to respond with a JSON object matching this schema.
// ─────────────────────────────────────────────────────────────────────────────

export type ObservationType = 'behavioral' | 'efficiency' | 'opportunity'
export type ActionStyle = 'primary' | 'secondary'
export type VelocityStatus = 'normal' | 'elevated' | 'optimal' | 'spike'
export type CategoryColor =
  | 'rose'
  | 'emerald'
  | 'blue'
  | 'indigo'
  | 'teal'
  | 'amber'
  | 'purple'

// ── Summary header ────────────────────────────────────────────────────────────
export interface ArtifactSummary {
  headline: string
  scope: string
  health_score: number
  health_status: string
  benchmark_variance_pct: number
}

// ── Spending spectrum bar segments ───────────────────────────────────────────
export interface SpendingSegment {
  category: string
  percentage: number
  amount: number
  color: CategoryColor
}

// ── Weekly velocity buckets (W1–W4) ─────────────────────────────────────────
export interface VelocityBucket {
  period: 'W1' | 'W2' | 'W3' | 'W4'
  amount: number
  delta_pct: number
  status: VelocityStatus
  flag?: string
}

// ── Narrative observations (Rule of Three) ──────────────────────────────────
export interface Observation {
  type: ObservationType
  icon: string
  title: string
  detail: string
}

// ── Flagged / notable merchant rows ─────────────────────────────────────────
export interface FlaggedMerchant {
  id: string
  name: string
  amount: number
  date: string
  category: string
}

// ── Actionable CTA workflows ─────────────────────────────────────────────────
export interface ActionWorkflow {
  action_id: string
  label: string
  style: ActionStyle
  payload?: Record<string, unknown>
}

// ── Root artifact ────────────────────────────────────────────────────────────
export interface FinancialArtifact {
  introText?: string
  summary: ArtifactSummary
  spending_spectrum: SpendingSegment[]
  velocity_spikes: VelocityBucket[]
  observations: Observation[]
  flagged_merchants: FlaggedMerchant[]
  action_workflows: ActionWorkflow[]
}
