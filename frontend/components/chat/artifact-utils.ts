'use client'
import { FinancialArtifact } from '@/types/artifact'

// ── Color token map — maps schema color names to Tailwind classes ─────────────
const COLOR_CLASSES: Record<string, { bar: string; dot: string; text: string; bg: string }> = {
  blue:    { bar: 'bg-[#4A90e2]',    dot: 'bg-[#4A90e2]',    text: 'text-[#4A90e2]',    bg: 'bg-[#4A90e2]/10' },
  emerald: { bar: 'bg-emerald-500',  dot: 'bg-emerald-500',  text: 'text-emerald-600',  bg: 'bg-emerald-500/10' },
  rose:    { bar: 'bg-rose-500',     dot: 'bg-rose-500',     text: 'text-rose-600',     bg: 'bg-rose-500/10' },
  indigo:  { bar: 'bg-indigo-500',   dot: 'bg-indigo-500',   text: 'text-indigo-600',   bg: 'bg-indigo-500/10' },
  teal:    { bar: 'bg-teal-500',     dot: 'bg-teal-500',     text: 'text-teal-600',     bg: 'bg-teal-500/10' },
  amber:   { bar: 'bg-amber-500',    dot: 'bg-amber-500',    text: 'text-amber-600',    bg: 'bg-amber-500/10' },
  purple:  { bar: 'bg-purple-500',   dot: 'bg-purple-500',   text: 'text-purple-600',   bg: 'bg-purple-500/10' },
}

export function getColorClasses(color: string) {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES['blue']
}

// ── Observation type → visual config ─────────────────────────────────────────
export const OBSERVATION_CONFIG = {
  behavioral:  { label: 'Behavioral',  bg: 'bg-amber-500/10',   text: 'text-amber-700',   border: 'border-amber-200/60' },
  efficiency:  { label: 'Efficiency',  bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-200/60' },
  opportunity: { label: 'Opportunity', bg: 'bg-[#4A90e2]/10',   text: 'text-[#4A90e2]',  border: 'border-[#4A90e2]/20' },
}

// ── Velocity status → Tailwind bar color ─────────────────────────────────────
export const VELOCITY_STATUS_COLORS: Record<string, string> = {
  spike:    'bg-rose-500',
  elevated: 'bg-amber-500',
  optimal:  'bg-emerald-500',
  normal:   'bg-[#4A90e2]',
}

// ── Format NGN amounts from the artifact (already in Naira) ──────────────────
export function fmtNGN(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  return `${sign}NGN ${abs.toLocaleString('en-NG')}`
}

// Re-export types for convenience
export type { FinancialArtifact }
