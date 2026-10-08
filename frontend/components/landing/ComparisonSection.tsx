'use client'

import { Check, X } from 'lucide-react'

const COMPARISONS = [
  {
    capability: 'Handling Insufficient Balance at POS',
    traditional: 'Transaction is immediately declined. Frantic app transfers required.',
    orchestra: 'Sub-second auto-split across secondary cards with zero checkout friction.',
  },
  {
    capability: 'Multi-Card Liquidity Overview',
    traditional: 'Manually opening 3 to 4 banking apps to check individual balances.',
    orchestra: 'Unified real-time dashboard displaying consolidated liquidity.',
  },
  {
    capability: 'Online SaaS Subscriptions',
    traditional: 'Main card exposed; unexpected recurring renewals and billing surprises.',
    orchestra: 'Merchant-locked virtual cards with monthly spend caps and auto-freeze.',
  },
  {
    capability: 'Business & Team Expenses',
    traditional: 'Sharing physical cards or chasing employees for paper receipts weeks later.',
    orchestra: 'Department cards with preset budgets and real-time manager approval thresholds.',
  },
  {
    capability: 'Fraud & Anomaly Detection',
    traditional: 'Cryptic bank SMS alerts received minutes after fraudulent charges.',
    orchestra: 'AI anomaly detection heuristics flagging suspicious velocity spikes instantly.',
  },
]

export default function ComparisonSection() {
  return (
    <section id="difference" className="bg-[#080d1a] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Direct Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Traditional Banking Rails vs. Orchestra Orchestration
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            See how adding an intelligent multi-card routing layer eliminates checkout friction and revolutionizes Nigerian financial workflows.
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 bg-white/[0.04] p-4 sm:p-5 border-b border-white/10 font-bold text-xs text-white uppercase tracking-wider">
            <div className="col-span-12 sm:col-span-4">Capability</div>
            <div className="col-span-6 sm:col-span-4 text-slate-400 hidden sm:block">Traditional Banking</div>
            <div className="col-span-6 sm:col-span-4 text-blue-400 hidden sm:block">Orchestra Platform</div>
          </div>

          <div className="divide-y divide-white/10">
            {COMPARISONS.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 items-start sm:items-center gap-3 sm:gap-0 hover:bg-white/[0.02] transition-colors">
                <div className="col-span-12 sm:col-span-4 pr-4">
                  <p className="font-bold text-white text-xs sm:text-sm">{row.capability}</p>
                </div>

                {/* Traditional */}
                <div className="col-span-12 sm:col-span-4 pr-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-rose-400 block sm:hidden mb-1">Traditional Banking:</span>
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <X size={15} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{row.traditional}</span>
                  </div>
                </div>

                {/* Orchestra */}
                <div className="col-span-12 sm:col-span-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block sm:hidden mb-1">With Orchestra:</span>
                  <div className="flex items-start gap-2 text-xs text-slate-200">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{row.orchestra}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
