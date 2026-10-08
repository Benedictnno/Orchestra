'use client'

import { useState } from 'react'
import {
  CreditCard,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
} from 'lucide-react'

const STEPS = [
  {
    step: '01',
    title: 'Link Your Nigerian Bank Cards',
    tagline: 'Bank-Grade Tokenization',
    summary:
      'Connect debit and virtual cards from Union Bank, GTBank, Access, Zenith, and Kuda. Sensitive 16-digit PANs are tokenized directly with switching protocols and cryptographically masked.',
    metrics: 'Compatible with Verve, Mastercard & Visa',
    previewType: 'cards',
  },
  {
    step: '02',
    title: 'Define Your Routing Policy',
    tagline: 'Deterministic Logic Engine',
    summary:
      'Select Sequential Auto-Split, Default Primary, or Balanced Proportion. Define which card takes the initial charge and which accounts serve as liquidity backup.',
    metrics: 'Evaluated under 400ms at swipe time',
    previewType: 'routing',
  },
  {
    step: '03',
    title: 'Transact Anywhere with Single Card',
    tagline: 'Omnichannel POS & Web Checkout',
    summary:
      'Use your single Orchestra card at any standard POS terminal, supermarket checkout, or e-commerce merchant. Orchestra intercepts the charge before terminal declines can occur.',
    metrics: 'Zero merchant integration required',
    previewType: 'swipe',
  },
  {
    step: '04',
    title: 'Atomic Multi-Card Settlement',
    tagline: 'Instant Consolidated Ledger',
    summary:
      'If your primary account balance falls short, the deficit is atomically deducted from your secondary cards. The transaction approves seamlessly and receipt prints immediately.',
    metrics: '100% successful checkout rate',
    previewType: 'settlement',
  },
]

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0)

  return (
    <section id="how" className="bg-[#080d1a] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Workflow &amp; Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Orchestra Eliminates Payment Declines
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            From card tokenization to sub-second atomic settlement — understand the 4-step workflow that keeps your payments flowing smoothly.
          </p>
        </div>

        {/* 4 Steps Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Step Selectors (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {STEPS.map((s, idx) => {
              const isActive = activeStep === idx
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600/15 border-blue-500/80 shadow-lg ring-1 ring-blue-500/50'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      STEP {s.step}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      {s.tagline}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-300/80 leading-relaxed">
                    {s.summary}
                  </p>
                  {isActive && (
                    <div className="mt-3 pt-2.5 border-t border-blue-500/20 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>{s.metrics}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Visual Stage Simulation (7 cols) */}
          <div className="lg:col-span-7 bg-[#0f172a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Stage Indicator Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Stage Simulation: {STEPS[activeStep].tagline}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Step {activeStep + 1} of 4
              </span>
            </div>

            {/* Stage 1 Visual */}
            {activeStep === 0 && (
              <div className="py-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Card credentials are vaulted using tokenized proxies. Raw card details never touch non-PCI layers:
                </p>
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        UB
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Union Bank Salary Debit</p>
                        <p className="text-[10px] font-mono text-slate-400">tok_card360_ubn_94827 · Verified</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Vaulted
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                        GT
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">GTBank Reserve Wallet</p>
                        <p className="text-[10px] font-mono text-slate-400">tok_card360_gtb_51290 · Verified</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Vaulted
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 2 Visual */}
            {activeStep === 1 && (
              <div className="py-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Routing rules determine priority order and allocation rules:
                </p>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-blue-400 font-bold">// Active Routing Policy Config</div>
                  <div>rule_type: <span className="text-emerald-400">"SEQUENTIAL_AUTO_SPLIT"</span></div>
                  <div>primary_card: <span className="text-amber-300">"Union Bank (₦40,000)"</span></div>
                  <div>fallback_reserve: <span className="text-amber-300">"GTBank / Access (₦60,000)"</span></div>
                  <div>max_latency_budget: <span className="text-cyan-400">400ms</span></div>
                  <div>on_deficit: <span className="text-emerald-400">"AUTO_SPLIT_AND_APPROVE"</span></div>
                </div>
              </div>
            )}

            {/* Stage 3 Visual */}
            {activeStep === 2 && (
              <div className="py-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  A single Orchestra card works at any in-person POS terminal or web checkout:
                </p>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 text-white space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">POS TERMINAL INTERCEPT</span>
                    <span className="text-emerald-400 font-mono text-[10px]">VERVE / MASTERCARD / VISA</span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-white">₦65,000.00</p>
                  <p className="text-xs text-slate-300">Merchant: Shoprite Retail Nigeria</p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-blue-300">
                    <span>Terminal Mode: Chip &amp; PIN</span>
                    <span>Status: Evaluating Multi-Card Split...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 4 Visual */}
            {activeStep === 3 && (
              <div className="py-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Funds settle atomically without POS declines:
                </p>
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> TRANSACTION APPROVED
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Execution Time: 280ms</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span>Union Bank Debit (Primary):</span>
                      <strong className="text-white">-₦40,000.00 (Drained)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Access Bank (Reserve 1):</span>
                      <strong className="text-emerald-400">-₦25,000.00 (Split Covered)</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 text-white font-bold">
                      <span>Total Settled to Merchant:</span>
                      <span>₦65,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Progress Controls */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((stepIdx) => (
                  <button
                    key={stepIdx}
                    type="button"
                    onClick={() => setActiveStep(stepIdx)}
                    className={`h-2 rounded-full transition-all ${
                      activeStep === stepIdx ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to step ${stepIdx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) % STEPS.length)}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>{activeStep === 3 ? 'Restart Tour' : 'Next Step'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
