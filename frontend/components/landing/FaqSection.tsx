'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'How does transaction auto-split work if a purchase exceeds one card balance?',
    a: 'When you initiate a transaction through Orchestra, the routing engine checks your selected policy. Under "Sequential Auto-Split", it evaluates your primary card balance, charges what is available, and atomically distributes the remaining shortfall to your backup cards in milliseconds. The merchant receives full settlement with zero checkout declines.',
  },
  {
    q: 'Is my banking and card information secure?',
    a: 'Yes. Orchestra implements tokenized card vaulting interfacing with bank switching protocols. Sensitive 16-digit PANs are cryptographically masked and never stored in raw plaintext on client devices. All communications use TLS encryption and strict session controls.',
  },
  {
    q: 'Can I test Orchestra right now without connecting real bank cards?',
    a: 'Yes. Orchestra includes a comprehensive Sandbox Test Mode pre-loaded with realistic Nigerian bank cards (GTBank, Access Bank, Zenith, Kuda). You can register, test routing algorithms, simulate POS transactions, and create virtual cards immediately.',
  },
  {
    q: 'Which Nigerian banks and card schemes are supported?',
    a: 'Orchestra supports cards across all licensed commercial and microfinance banks in Nigeria running on Mastercard, Visa, and Verve card schemes.',
  },
  {
    q: 'How do corporate expense cards and approval thresholds work?',
    a: 'Businesses can assign cards to team members with dedicated monthly budgets and custom approval thresholds (e.g., ₦50,000). Transactions below the threshold process instantly, while larger purchases automatically enter an administrative queue for manager sign-off.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="bg-slate-900 py-20 sm:py-24 border-b border-slate-800 text-white relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 font-mono">
            Frequently Asked Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Common Inquiries
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Everything you need to know about programmable card orchestration, security, and sandbox testing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-500/20 text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-300/85 text-xs sm:text-sm leading-relaxed border-t border-white/5">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
