'use client'

import { Star, Quote, CheckCircle2 } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:
      'Orchestra completely solved the POS decline embarrassment. At supermarket checkout, my primary account was low, but the auto-split immediately covered the shortfall from my secondary reserve. Approved in 290ms without stepping out of line.',
    author: 'Bolanle Adeleke',
    role: 'Operations & Finance Lead',
    company: 'Lagos Commerce Hub',
    highlight: 'Zero POS Declines',
    avatar: 'BA',
    avatarBg: 'from-blue-600 to-indigo-700',
  },
  {
    quote:
      'Managing international subscriptions for AWS, GitHub, and OpenAI used to be stressful with surprise exchange rate spikes. With merchant-locked virtual cards, I set a hard monthly limit that auto-freezes. Zero unexpected charges.',
    author: 'Tunde Bakare',
    role: 'Senior Cloud Architect',
    company: 'Tech Stack Studio',
    highlight: 'Budget Protected',
    avatar: 'TB',
    avatarBg: 'from-teal-600 to-emerald-700',
  },
  {
    quote:
      'Having a single unified liquidity balance across our Union Bank, GTBank, Access, and Kuda accounts while keeping individual cards isolated is incredible. The live split ledger gives our internal audit instant clarity with zero manual reconciliation.',
    author: 'Chioma Okon',
    role: 'E-Commerce Founder',
    company: 'NextGen Retail NG',
    highlight: 'Consolidated Ledger',
    avatar: 'CO',
    avatarBg: 'from-purple-600 to-indigo-800',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-[#080d1a] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Customer Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Loved by Modern Spenders &amp; Growing Teams
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            See how everyday consumers and business teams across Nigeria use Orchestra to eliminate checkout declines and protect recurring budgets.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {t.highlight}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-xs`}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{t.author}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
