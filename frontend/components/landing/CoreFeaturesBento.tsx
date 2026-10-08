'use client'

import { useState } from 'react'
import {
  SlidersHorizontal,
  ArrowRightLeft,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Layers,
  Lock,
  Zap,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function CoreFeaturesBento() {
  const [activeRoutingPolicy, setActiveRoutingPolicy] = useState<'sequential' | 'primary' | 'balanced'>('sequential')
  const [demoLimit, setDemoLimit] = useState(45000)

  return (
    <section id="features" className="bg-[#0b101f] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            The Financial Operating System for Nigerian Commerce
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Eliminate card declines, fragmented balances, and manual reconciliations with algorithmic payment routing and automated controls.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento Item 1: Large Wide Card (8 cols) — Programmable Routing Engine */}
          <div className="md:col-span-12 lg:col-span-7 bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <SlidersHorizontal size={20} />
                </div>
                <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">
                  Sub-Second Routing
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Programmable Split Routing Engine
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-6 max-w-lg">
                Choose how transactions are evaluated at swipe time. When any single card lacks sufficient funds, Orchestra atomically coordinates secondary accounts in under 400ms.
              </p>

              {/* Interactive Policy Switcher */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3 mb-6">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Select Live Policy Rule:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveRoutingPolicy('sequential')}
                    className={`p-2.5 rounded-xl text-left border text-xs transition ${
                      activeRoutingPolicy === 'sequential'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-[11px]">Sequential</span>
                    <span className="text-[9px] text-slate-400">Drain cards by priority</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRoutingPolicy('primary')}
                    className={`p-2.5 rounded-xl text-left border text-xs transition ${
                      activeRoutingPolicy === 'primary'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-[11px]">Primary First</span>
                    <span className="text-[9px] text-slate-400">Fallback on deficit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRoutingPolicy('balanced')}
                    className={`p-2.5 rounded-xl text-left border text-xs transition ${
                      activeRoutingPolicy === 'balanced'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-[11px]">Balanced</span>
                    <span className="text-[9px] text-slate-400">Proportional split</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-200 flex items-center justify-between">
                  <span>Policy Active:</span>
                  <span className="font-mono text-emerald-400">
                    {activeRoutingPolicy === 'sequential' && 'Auto-Split Shortfall Enabled (0 POS Declines)'}
                    {activeRoutingPolicy === 'primary' && 'Union Bank Primary -> Fallback GTBank & Access'}
                    {activeRoutingPolicy === 'balanced' && 'Weighted by Bank Account Balances'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={14} /> Atomic sub-second settlement
              </span>
              <a href="#simulator" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                <span>Test in Simulator</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          {/* Bento Item 2: Merchant-Locked Virtual Cards (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Fraud Defense
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Merchant-Locked Virtual Cards
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                Generate disposable or recurring virtual cards locked to specific vendors like Netflix, AWS, or Spotify. Configure hard spending limits that auto-freeze.
              </p>

              {/* Interactive Virtual Card Mockup */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 space-y-3 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">AWS Cloud Services</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    LOCKED
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Monthly Spending Cap:</span>
                    <span className="font-mono font-bold text-white">₦{demoLimit.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={100000}
                    step={5000}
                    value={demoLimit}
                    onChange={(e) => setDemoLimit(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>₦10,000</span>
                    <span>₦100,000</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                  <Lock size={12} className="text-emerald-400" />
                  <span>Automatically declines charges exceeding ₦{demoLimit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">✓ Isolates primary cards from data breaches</span>
            </div>
          </div>

          {/* Bento Item 3: Zero-Trust Anomaly Engine (4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 bg-white/[0.03] border border-white/[0.08] hover:border-rose-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                Zero-Trust Anomaly Engine
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4">
                Continuous heuristic surveillance analyzes transaction velocity, duplicate swipe attempts, and geographic deviation in real time.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between text-emerald-400">
                  <span>Duplicate Swipe Filter:</span>
                  <span>ACTIVE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Velocity Threshold:</span>
                  <span>&lt; 3 swipes/min</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-4">
              <span className="text-[11px] text-slate-400 font-medium">Auto-freezes compromised cards instantly</span>
            </div>
          </div>

          {/* Bento Item 4: AI Financial Intelligence (4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                AI Financial Advisor &amp; Chat
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4">
                Conversational spend auditing powered by OpenAI. Ask natural questions about expenses and receive automated liquidity optimization tips.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 italic">
                "Where did most of my cash go this week? Can I safely pay ₦40,000 for supplies tomorrow?"
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-4">
              <span className="text-[11px] text-purple-400 font-medium">Natural language spend auditing</span>
            </div>
          </div>

          {/* Bento Item 5: Corporate Treasury & Team Approvals (4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                Corporate Treasury &amp; Approvals
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4">
                Equip departmental teams with expense cards. Set hard monthly budgets and route purchases above threshold into automated sign-off queues.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between text-amber-300">
                  <span>Manager Approval Queue:</span>
                  <span>ACTIVE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Default Threshold:</span>
                  <span>₦50,000</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.08] mt-4">
              <span className="text-[11px] text-amber-400 font-medium">Eliminates shared physical cards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
