'use client'

import { User, Laptop, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const USE_CASES = [
  {
    icon: User,
    persona: 'Everyday Consumers',
    roleTag: 'Personal Banking',
    headline: 'Zero POS Embarrassment',
    description:
      'Keep your salary in Union Bank, savings in Kuda, and pocket money in GTBank or Access. Orchestra unifies them into a single swipe. If a dinner bill exceeds your main card, backup balances cover the rest seamlessly.',
    benefit: 'No more frantic banking app transfers while the cashier waits.',
  },
  {
    icon: Laptop,
    persona: 'Digital Freelancers & Tech Pros',
    roleTag: 'Subscription Shield',
    headline: 'SaaS Control Without Surprises',
    description:
      'Manage recurring charges for ChatGPT, AWS, GitHub, and Figma. Generate virtual cards with hard monthly spending limits that automatically freeze before over-billing occurs.',
    benefit: 'Complete budget isolation and zero unauthorized renewals.',
  },
  {
    icon: Briefcase,
    persona: 'Growing Startups & SMEs',
    roleTag: 'Corporate Treasury',
    headline: 'Team Cards with Real-Time Approvals',
    description:
      'Equip departmental heads with dedicated cards. Set strict monthly budgets, and route any purchase above custom thresholds into an automated manager approval workflow.',
    benefit: 'Eliminates shared physical cards and manual receipt reconciliation.',
  },
]

export default function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-[#0b101f] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Tailored Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for Modern Consumers, Freelancers &amp; Growing Teams
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Whether you are managing personal cashflow across three banks or allocating company budgets to staff, Orchestra adapts seamlessly to your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USE_CASES.map((u, i) => {
            const Icon = u.icon
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
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      {u.roleTag}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 font-mono">
                    {u.persona}
                  </p>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-3 tracking-tight group-hover:text-blue-300 transition-colors">
                    {u.headline}
                  </h3>
                  <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4">
                    {u.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ {u.benefit}
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
