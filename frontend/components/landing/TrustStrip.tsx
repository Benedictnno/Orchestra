'use client'

import { Shield, Zap, RefreshCw, Cpu } from 'lucide-react'

const BADGES = [
  {
    icon: Shield,
    label: 'Bank-Grade Switching Rails',
    detail: 'Tokenized multi-bank routing protocol',
  },
  {
    icon: Zap,
    label: 'Sub-Second Auto-Split',
    detail: 'Atomic multi-card balance settlement',
  },
  {
    icon: RefreshCw,
    label: 'Merchant-Locked Virtual Cards',
    detail: 'Dynamic spending limits & auto-freeze',
  },
  {
    icon: Cpu,
    label: 'AI Spend Intelligence',
    detail: 'Conversational spend auditing & anomaly detection',
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-[#0b1329] border-y border-white/10 py-5 sm:py-6 text-white relative z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BADGES.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-blue-400 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white tracking-tight truncate">{b.label}</p>
                  <p className="text-[11px] text-white/60 truncate">{b.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
