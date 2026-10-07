'use client'

import { CreditCard, Building2, CheckCircle2, Lock, ArrowUpRight, ShieldCheck, UserCheck } from 'lucide-react'
import Link from 'next/link'

export default function VirtualAndBusinessSection() {
  return (
    <section className="bg-[#0b1329] py-20 sm:py-24 border-b border-slate-800 text-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 font-mono">
            Beyond Personal Cards
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Specialized Virtual Cards &amp; Corporate Treasury
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Protect personal subscriptions from surprise renewals and equip company teams with budget-capped expense cards and automated manager approval queues.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Virtual Subscription Cards */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Merchant-Locked
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Virtual Cards for SaaS &amp; Billers
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                Create disposable or recurring virtual cards dedicated to specific merchants like Netflix, AWS, Spotify, or OpenAI. Never expose your primary banking credentials.
              </p>

              {/* Mock Virtual Card UI */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-xl p-4 sm:p-5 mb-6 text-white text-xs">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-mono block">Merchant Lock</span>
                    <span className="font-bold text-sm text-white">AWS Cloud Services</span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-blue-300">VIRTUAL</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-mono block">Spend Cap</span>
                    <span className="font-semibold text-emerald-400">₦45,000 / month</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                    <Lock size={12} className="text-blue-400" />
                    <span>Auto-freezes at 100%</span>
                  </div>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-2.5 text-xs text-slate-300/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                  <span>Hard monthly spend limits prevent accidental overdrafts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                  <span>1-click pause / resume directly from the dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                  <span>Isolates liability if a merchant suffers a data breach</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Issue instant virtual cards</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Business Expense & Approvals */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                  Corporate Tier
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Corporate Cards &amp; Expense Approvals
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                Empower departments and team leads with company cards while maintaining ironclad treasury controls and multi-tier approval policies.
              </p>

              {/* Mock Business Approval Request UI */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-xl p-4 sm:p-5 mb-6 text-white text-xs">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-mono block">Pending Approval</span>
                    <span className="font-bold text-sm text-white">Office Hardware Supplies</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                    Requires Review
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[11px]">
                  <span className="text-white/70">Requested: ₦85,000 (Threshold: ₦50,000)</span>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <UserCheck size={13} />
                    <span>Manager Queue</span>
                  </div>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-2.5 text-xs text-slate-300/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                  <span>Assign cards by department: Marketing, Tech, Operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                  <span>Threshold approval engine holds large transactions for sign-off</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                  <span>Export CSV transaction logs and audit trails instantly</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>Explore business card controls</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
