'use client'

import { Shield, Zap, RefreshCw, Cpu, CheckCircle2, ArrowRight } from 'lucide-react'

const BADGES = [
  {
    icon: Shield,
    label: 'Bank-Grade Switching Rails',
    detail: 'Interswitch Card360 tokenization',
    highlight: '256-bit AES',
  },
  {
    icon: Zap,
    label: 'Sub-Second Auto-Split',
    detail: 'Atomic multi-card balance settlement',
    highlight: '< 400ms latency',
  },
  {
    icon: RefreshCw,
    label: 'Merchant-Locked Virtual Cards',
    detail: 'Hard spend caps & auto-freeze rules',
    highlight: 'Zero over-billing',
  },
  {
    icon: Cpu,
    label: 'AI Spend Intelligence',
    detail: 'Conversational auditing & anomaly alerts',
    highlight: 'Powered by OpenAI',
  },
]

const SUPPORTED_BANKS = [
  { name: 'Union Bank of Nigeria', code: 'Union Bank', scheme: 'Mastercard' },
  { name: 'Ecobank Nigeria', code: 'Ecobank', scheme: 'Visa' },
  { name: 'Guaranty Trust Bank', code: 'GTBank', scheme: 'Mastercard' },
  { name: 'Zenith Bank PLC', code: 'Zenith', scheme: 'Visa' },
  { name: 'Access Bank PLC', code: 'Access', scheme: 'Visa' },
  { name: 'First Bank of Nigeria', code: 'FirstBank', scheme: 'Verve' },
  { name: 'Kuda Microfinance Bank', code: 'Kuda', scheme: 'Verve' },
  { name: 'United Bank for Africa', code: 'UBA', scheme: 'Mastercard' },
]

export default function TrustStrip() {
  return (
    <section className="bg-[#080d1a] border-y border-white/[0.08] py-8 text-white relative z-20 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-28 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {BADGES.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-blue-500/30 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:scale-105 transition-all shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-white tracking-tight truncate">{b.label}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{b.detail}</p>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium inline-block mt-1">
                    ✓ {b.highlight}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Banking Rails & Network Compatibility Strip */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-white/90">Interoperable Across Nigerian Switching Rails:</span>
            <span className="text-slate-500 hidden sm:inline">Verve · Mastercard · Visa</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {SUPPORTED_BANKS.map((bank, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5 text-[11px] font-mono text-slate-300 hover:text-white hover:border-white/20 transition-colors"
              >
                <span className="font-semibold">{bank.code}</span>
                <span className="text-[9px] text-slate-500 uppercase">({bank.scheme})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
