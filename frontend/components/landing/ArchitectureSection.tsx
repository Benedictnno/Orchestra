'use client'

import { Cpu, ShieldCheck, Zap, Database, Terminal, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const ARCH_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Payment Switch & Tokenization Layer',
    badge: 'Card Infrastructure',
    description:
      'Interfacing with Nigerian switch rails to securely tokenize bank cards (Verve, Mastercard, Visa). Cardholder PANs are cryptographically masked, adhering to strict zero-trust standards.',
    code: 'POST /api/cards/tokenize -> { token, maskedPan, bankRef }',
  },
  {
    icon: Zap,
    title: 'Sub-Second Multi-Card Split Engine',
    badge: 'Atomic Settlement',
    description:
      'A deterministic routing state machine that evaluates card balances and custom policies under 400ms. If a single card lacks sufficient balance, Orchestra executes an atomic multi-source transaction.',
    code: 'POST /api/routing/simulate -> { mode, steps, totalCharged }',
  },
  {
    icon: Cpu,
    title: 'AI Spend Analytics & Anomaly Detection',
    badge: 'OpenAI Integration',
    description:
      'Continuous stream analysis flags sudden velocity spikes, duplicate swipe attempts, and unusual merchant categories. Generates natural language savings projections and personalized advice.',
    code: 'POST /api/chat & /api/insights -> { anomalies, financialScore }',
  },
  {
    icon: Database,
    title: 'High-Performance Next.js & MongoDB Ledger',
    badge: 'Full-Stack Runtime',
    description:
      'Engineered with Next.js App Router, React 19, TypeScript, and MongoDB. Backed by transactional ledger tracking, optimistic UI updates, and real-time session authentication.',
    code: 'MongoDB Singleton + NextAuth Session Management',
  },
]

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-[#0f172a] py-20 sm:py-24 border-b border-slate-800 text-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 font-mono">
            System Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered on Modern Switch &amp; Next.js Rails
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Orchestra isn’t a mock concept. It is a functional programmable orchestration platform built with production-grade protocols and real backend services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {ARCH_PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={i}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-5">
                    {p.description}
                  </p>
                </div>

                {/* Micro Code Snippet */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-2.5 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <Terminal size={13} className="text-blue-400 shrink-0" />
                  <span className="truncate">{p.code}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live API Documentation Callout */}
        <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-blue-900/30 border border-blue-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white mb-1">
              Live API Documentation &amp; Endpoints
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm">
              Explore the deployed OpenAPI schema, routing endpoints, simulation routes, and authentication specifications.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://orchestra-y8vf.onrender.com/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-100 transition shadow-sm flex items-center gap-2"
            >
              <span>View API Docs</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
