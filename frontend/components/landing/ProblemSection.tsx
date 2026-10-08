'use client'

import { useState } from 'react'
import { AlertCircle, Layers, CreditCard, XCircle, CheckCircle2, ArrowRight, ArrowDown } from 'lucide-react'

const PROBLEMS = [
  {
    icon: AlertCircle,
    tag: 'Friction 01',
    title: 'POS Decline Embarrassment',
    description:
      'You are at a supermarket checkout with a ₦45,000 bill. Your primary card has ₦38,000. Even though your secondary account has ₦150,000, the terminal immediately declines.',
    impact: 'Awkward cashier delays, impatient queues, and frantic app-to-app transfers on spotty data.',
  },
  {
    icon: Layers,
    tag: 'Friction 02',
    title: 'Fragmented Multi-App Liquidity',
    description:
      'Cash is scattered across Union Bank, GTBank, Access, Zenith, and Kuda. Checking if you can afford an upcoming bill requires opening multiple separate mobile banking apps with biometric prompts.',
    impact: 'Zero consolidated ledger visibility, accidental overdraft charges, and idle cash sitting unprotected.',
  },
  {
    icon: CreditCard,
    tag: 'Friction 03',
    title: 'Phantom Subscriptions & SME Team Leaks',
    description:
      'Exposing primary debit cards to international SaaS billers leads to unexpected auto-renewals. Meanwhile, growing businesses pass physical debit cards around without spend caps.',
    impact: 'Sudden unexpected FX charges, uncontrolled department spend, and manual paper receipt chaos.',
  },
]

export default function ProblemSection() {
  const [activeTab, setActiveTab] = useState<'traditional' | 'orchestra'>('orchestra')

  return (
    <section className="bg-[#0b101d] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold mb-3">
            <span>The Multi-Card Friction</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why juggling multiple Nigerian bank cards is fundamentally broken
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Everyday Nigerians and growing businesses keep balances dispersed across multiple banks. Traditional POS terminals force each swipe onto a single siloed card — resulting in avoidable declines.
          </p>
        </div>

        {/* 3 Core Frictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
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

                <div className="pt-4 border-t border-white/[0.08] mt-2">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    <strong className="text-rose-400/90 font-medium">Result:</strong> {p.impact}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Interactive Scenario Comparison Widget */}
        <div className="bg-[#0f172a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
            <div>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest font-semibold block mb-1">
                Real-World Simulation
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                The ₦45,000 Supermarket Checkout Scenario
              </h3>
            </div>

            {/* Toggle switch */}
            <div className="inline-flex p-1 bg-black/40 border border-white/10 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('traditional')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'traditional'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Traditional Banking
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orchestra')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'orchestra'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                With Orchestra
              </button>
            </div>
          </div>

          {activeTab === 'traditional' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <XCircle size={18} className="text-rose-400" />
                    <span className="font-bold text-sm">POS Terminal Error: "DECLINED - INSUFFICIENT FUNDS"</span>
                  </div>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Swipe Attempt: <strong>₦45,000</strong> on Union Bank Debit Card (Balance: <strong>₦38,000</strong>). Even though your Access Bank account has ₦120,000, the terminal cannot access it.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Step 1: Cashier repeats swipe — transaction fails again.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Step 2: You step out of line, unlock your phone, and wait for mobile banking OTP.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Step 3: Transfer ₦10,000 from Access to Union Bank, waiting 3-5 minutes for interbank credit.</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-black/40 border border-rose-500/20 rounded-2xl p-5 text-center">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">Friction Rating</p>
                <p className="text-3xl font-black text-rose-400 font-mono mb-2">High Friction</p>
                <p className="text-xs text-slate-300">Total Delay: ~6 minutes</p>
                <p className="text-[11px] text-slate-500 mt-1">Customer Frustration: 100%</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span className="font-bold text-sm">POS Terminal: "APPROVED - RECEIPT PRINTED (320ms)"</span>
                  </div>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">
                    Swipe Attempt: <strong>₦45,000</strong> on Orchestra Master Card. Orchestra instantly intercepted the charge, drafted <strong>₦38,000</strong> from Union Bank and auto-split the remaining <strong>₦7,000</strong> from Access Bank.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Step 1: Single swipe at any standard POS terminal or online checkout.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Step 2: Sub-second atomic multi-card debit executed under 400ms.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Step 3: Instant consolidated push notification sent with itemized split receipts.</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-gradient-to-br from-blue-900/40 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 text-center">
                <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest mb-1">Execution Speed</p>
                <p className="text-3xl font-black text-emerald-400 font-mono mb-2">320ms</p>
                <p className="text-xs text-emerald-100">Zero Declines · Full Merchant Settlement</p>
                <p className="text-[11px] text-emerald-300/70 mt-1">Interswitch Switch Rail Compliant</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
