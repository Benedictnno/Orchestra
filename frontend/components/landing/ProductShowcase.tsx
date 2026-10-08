'use client'

import { useState } from 'react'
import {
  CreditCard,
  Layers,
  History,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

type TabKey = 'treasury' | 'splits' | 'virtual' | 'corporate' | 'ai'

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>('treasury')
  const [cardStatusMap, setCardStatusMap] = useState<Record<string, boolean>>({
    gtb: true,
    access: true,
    kuda: true,
  })

  const toggleCard = (id: string) => {
    setCardStatusMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="showcase" className="bg-[#090d19] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Ambient gradient backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Product Interface Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for Instant Clarity &amp; Effortless Control
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Explore the live interface components that power Orchestra — from multi-card liquidity aggregation and sub-second auto-splits to merchant locks and team treasury workflows.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-hide gap-1.5 p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl max-w-3xl mx-auto mb-10">
          <button
            type="button"
            onClick={() => setActiveTab('treasury')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'treasury'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} />
            <span>Treasury &amp; Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('splits')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'splits'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History size={14} />
            <span>Split Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('virtual')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'virtual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock size={14} />
            <span>Virtual Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('corporate')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'corporate'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 size={14} />
            <span>Corporate Approvals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Intelligence</span>
          </button>
        </div>

        {/* Display Frame / Browser Preview Window */}
        <div className="bg-[#0b1222] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Browser Bar */}
          <div className="px-5 py-3.5 bg-black/40 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-slate-500 ml-2 hidden sm:inline">
                app.orchestra.ng/dashboard
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Interswitch Rail: Connected
              </span>
              <Link
                href="/dashboard"
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Open Console</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Canvas Content Body */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Tab 1: Treasury & Cards Deck */}
            {activeTab === 'treasury' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Aggregated Liquidity */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-6 rounded-2xl border border-white/10 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Consolidated Liquidity
                      </span>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                        3 Cards Linked
                      </span>
                    </div>

                    <div>
                      <p className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                        ₦150,000<span className="text-slate-500 text-lg">.00</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Available across all active Nigerian bank cards</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Active Routing Engine:</span>
                        <strong className="text-blue-400 font-mono">Sequential Auto-Split</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Auto-Split Shortfall Coverage:</span>
                        <strong className="text-emerald-400 font-mono">100% Protected</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Switch Response Time:</span>
                        <strong className="text-slate-300 font-mono">310ms avg</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Card Stack with Freeze Toggle */}
                  <div className="lg:col-span-7 space-y-3">
                    <p className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Linked Bank Accounts &amp; Cards (Click to Toggle Freeze)</span>
                      <span className="text-[11px] text-slate-500 font-normal">Real-Time Interswitch Tokenization</span>
                    </p>

                    {/* Card 1: GTBank */}
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                          GT
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">GTBank Salary Debit</p>
                            <span className="text-[9px] font-mono uppercase bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded">
                              Primary
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">•••• 1234 · Mastercard</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold font-mono text-white">₦40,000.00</p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {cardStatusMap.gtb ? 'Active' : 'Frozen'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCard('gtb')}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                            cardStatusMap.gtb
                              ? 'bg-white/10 text-slate-300 border-white/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {cardStatusMap.gtb ? 'Freeze' : 'Unfreeze'}
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Access */}
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                          AC
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">Access Bank Savings</p>
                            <span className="text-[9px] font-mono uppercase bg-white/10 text-slate-300 px-1.5 py-0.2 rounded">
                              Reserve 1
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">•••• 5678 · Visa</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold font-mono text-white">₦60,000.00</p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {cardStatusMap.access ? 'Active' : 'Frozen'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCard('access')}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                            cardStatusMap.access
                              ? 'bg-white/10 text-slate-300 border-white/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {cardStatusMap.access ? 'Freeze' : 'Unfreeze'}
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Kuda */}
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                          KD
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">Kuda Spending Wallet</p>
                            <span className="text-[9px] font-mono uppercase bg-white/10 text-slate-300 px-1.5 py-0.2 rounded">
                              Reserve 2
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">•••• 9012 · Verve</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold font-mono text-white">₦50,000.00</p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {cardStatusMap.kuda ? 'Active' : 'Frozen'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCard('kuda')}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                            cardStatusMap.kuda
                              ? 'bg-white/10 text-slate-300 border-white/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {cardStatusMap.kuda ? 'Freeze' : 'Unfreeze'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Split Ledger */}
            {activeTab === 'splits' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-sm font-bold text-white">Real-Time Multi-Card Split Ledger</h4>
                  <span className="text-xs font-mono text-slate-400">Interswitch Atomic Routing Log</span>
                </div>

                <div className="space-y-3">
                  {/* Tx 1: Shoprite */}
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                          S
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Shoprite Mall — Ikeja City Mall</p>
                          <p className="text-[10px] text-slate-400">Physical POS Terminal Swipe · Today, 14:28</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-white">₦45,000.00</p>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ✓ Auto-Split Approved (290ms)
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300 gap-2">
                      <span className="text-slate-400">Split Breakdown:</span>
                      <span>GTBank: <strong className="text-emerald-400">₦38,000</strong> (100% drained)</span>
                      <span>+ Access Bank: <strong className="text-emerald-400">₦7,000</strong> (covered remainder)</span>
                      <span className="text-blue-400">0 Declines</span>
                    </div>
                  </div>

                  {/* Tx 2: DSTV */}
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                          D
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">DSTV Premium Subscription Renewal</p>
                          <p className="text-[10px] text-slate-400">Online Recurring Web Payment · Yesterday, 09:12</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-white">₦29,500.00</p>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ✓ Approved (340ms)
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300 gap-2">
                      <span className="text-slate-400">Split Breakdown:</span>
                      <span>Access Bank: <strong className="text-emerald-400">₦29,500</strong></span>
                      <span className="text-slate-400">Rule: Utility Recurring Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Virtual Subscriptions */}
            {activeTab === 'virtual' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-bold text-white">Merchant-Locked Virtual Cards</h4>
                    <p className="text-xs text-slate-400">Isolate subscriptions to dedicated virtual PANs with hard monthly spending caps.</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    3 Active Virtual Cards
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Virtual Card 1: AWS */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Merchant Locked</span>
                        <h5 className="text-sm font-bold text-white">AWS Cloud Services</h5>
                      </div>
                      <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                        VIRTUAL
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-400">Monthly Spending Limit:</p>
                      <p className="text-base font-mono font-bold text-emerald-400">₦45,000 / month</p>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-blue-500 h-full w-[62%]" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">₦28,000 utilized (62%)</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Lock size={11} /> Auto-Freeze Cap
                      </span>
                      <span className="text-slate-400">Active</span>
                    </div>
                  </div>

                  {/* Virtual Card 2: Netflix */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Merchant Locked</span>
                        <h5 className="text-sm font-bold text-white">Netflix Premium</h5>
                      </div>
                      <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                        VIRTUAL
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-400">Monthly Spending Limit:</p>
                      <p className="text-base font-mono font-bold text-emerald-400">₦5,500 / month</p>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-emerald-500 h-full w-[81%]" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">₦4,500 utilized (81%)</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Lock size={11} /> Zero Over-billing
                      </span>
                      <span className="text-slate-400">Active</span>
                    </div>
                  </div>

                  {/* Virtual Card 3: OpenAI */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Merchant Locked</span>
                        <h5 className="text-sm font-bold text-white">OpenAI API Billing</h5>
                      </div>
                      <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                        VIRTUAL
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-400">Monthly Spending Limit:</p>
                      <p className="text-base font-mono font-bold text-emerald-400">₦30,000 / month</p>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-amber-500 h-full w-[45%]" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">₦13,500 utilized (45%)</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Lock size={11} /> Auto-Freeze Cap
                      </span>
                      <span className="text-slate-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Corporate Approvals */}
            {activeTab === 'corporate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-bold text-white">Corporate Treasury &amp; Approval Engine</h4>
                    <p className="text-xs text-slate-400">Automatic multi-tier approvals when staff expenses exceed set thresholds.</p>
                  </div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                    Threshold: ₦50,000
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                        PO
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">Office Hardware Supplies — Konga Online</p>
                          <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            Review Required
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Department: Engineering · Initiated by: David Okon</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-white">₦85,000.00</p>
                      <span className="text-[10px] text-rose-400">Exceeds ₦50k Auto-Approve</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[11px] text-slate-300">
                      Routing Status: <strong className="text-amber-400">Transaction Held in Administrative Queue</strong>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                        1-Click Manager Sign-Off
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: AI Intelligence */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Financial Intelligence Engine</h4>
                    <p className="text-xs text-slate-400">Continuous anomaly auditing and algorithmic savings scenario analysis.</p>
                  </div>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    Health Score: 94/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Zero-Trust Anomaly Audit: Clean</span>
                    </div>
                    <p className="text-xs text-slate-300/80 leading-relaxed">
                      All recent swipe attempts follow established geolocation and velocity patterns. No fraudulent duplicate requests detected across Union Bank, GTBank, Access, or Kuda cards.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Sparkles size={16} className="text-blue-400" />
                      <span>Predictive Cashflow Optimization</span>
                    </div>
                    <p className="text-xs text-slate-300/80 leading-relaxed">
                      "Moving ₦20,000 to your Access Bank card before Friday ensures your recurring AWS cloud invoice is covered without touching your weekend grocery allocation."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
