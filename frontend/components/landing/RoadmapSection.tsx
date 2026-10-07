'use client'

import { CheckCircle2, Clock, Compass } from 'lucide-react'

const ROADMAP_PHASES = [
  {
    phase: 'Phase 01',
    status: 'Live MVP',
    title: 'Current Platform Release',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    items: [
      'Multi-bank card linking & secure tokenization',
      '3 programmable routing algorithms (Auto-Split, Primary, Balanced)',
      'Interactive routing simulator sandbox',
      'Merchant-locked virtual cards with spending caps',
      'Corporate expense cards & manager approval queues',
      'AI financial intelligence & anomaly detection (OpenAI)',
      'Multi-card pooled transfer settlement',
    ],
  },
  {
    phase: 'Phase 02',
    status: 'Up Next (Q2 2025)',
    title: 'Physical Rails & Omnichannel',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Clock,
    iconColor: 'text-blue-400',
    items: [
      'Physical multi-bank chip & PIN debit card issuance',
      'USSD routing fallback for low-connectivity POS terminals',
      'WhatsApp conversational banking assistant for instant card freeze',
      'Automated recurring bill split for utility bills (DSTV, EKEDC)',
    ],
  },
  {
    phase: 'Phase 03',
    status: 'Future Vision (Q3+ 2025)',
    title: 'Cross-Border & Treasury Yield',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Compass,
    iconColor: 'text-purple-400',
    items: [
      'Multi-currency cross-border FX liquidity routing (USD/EUR)',
      'Automated high-yield idle balance sweep accounts',
      'Direct ERP accounting sync (QuickBooks, Xero, Zoho)',
      'Developer API SDK for Nigerian fintechs & merchants',
    ],
  },
]

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="bg-slate-900 py-20 sm:py-24 border-b border-slate-800 text-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 font-mono">
            Execution Strategy
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Product Evolution &amp; Roadmap
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Orchestra has a clear path from its hackathon foundation to a full-fledged financial orchestration infrastructure for African commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROADMAP_PHASES.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={i}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {p.phase}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${p.badgeClass}`}>
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base sm:text-lg mb-4 tracking-tight flex items-center gap-2">
                    <Icon size={18} className={p.iconColor} />
                    <span>{p.title}</span>
                  </h3>

                  <ul className="space-y-2.5 text-xs text-slate-300/80">
                    {p.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold text-xs mt-0.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
