'use client'

import { AlertCircle, Layers, CreditCard } from 'lucide-react'

const PROBLEMS = [
  {
    icon: AlertCircle,
    tag: 'Friction 01',
    title: 'POS Decline Embarrassment',
    description:
      'You are at a supermarket checkout with a ₦45,000 bill. Your primary card has ₦38,000. Even though your secondary card has ₦150,000, your transaction is instantly declined.',
    impact: 'Lost time, awkward checkout friction, and urgent frantic app-switching.',
  },
  {
    icon: Layers,
    tag: 'Friction 02',
    title: 'Fragmented Liquidity & Siloed Apps',
    description:
      'Cash is scattered across GTBank, Access, Zenith, and Kuda. You have to open multiple banking apps just to check if you can afford an upcoming bill or transfer.',
    impact: 'No single unified ledger, zero combined spend visibility, and surprise overdrafts.',
  },
  {
    icon: CreditCard,
    tag: 'Friction 03',
    title: 'Uncontrolled Recurring Subscriptions & Team Leaks',
    description:
      'Exposing primary debit cards to international SaaS and local recurring billers leads to surprise charges. Meanwhile, businesses share physical debit cards with employees without real-time approval limits.',
    impact: 'Budget overruns, phantom subscriptions, and manual receipt reconciliation headaches.',
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-slate-900 py-20 sm:py-24 border-b border-slate-800 text-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 font-mono">
            The Multi-Card Friction
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why juggling multiple Nigerian bank cards is broken
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Everyday Nigerians and growing businesses keep balances scattered across multiple banks. Traditional payment rails force each swipe onto a single siloed card — leading to unnecessary declines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={i}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base sm:text-lg mb-2.5 tracking-tight group-hover:text-blue-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 mt-2">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    <strong className="text-rose-400/90 font-medium">Result:</strong> {p.impact}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
