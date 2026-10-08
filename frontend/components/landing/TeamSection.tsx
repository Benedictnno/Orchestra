'use client'

import { Code2, Layout, Award } from 'lucide-react'

const TEAM = [
  {
    name: 'Nnaoma Benedict Chigozie',
    role: 'Backend Developer & System Architect',
    focus: 'API Routing Engine, Database Ledger & Security',
    contributions: [
      'Engineered backend architecture with Next.js API routes & MongoDB singleton',
      'Developed transaction routing engine and multi-card split simulation logic',
      'Implemented virtual card creation, business approvals, and AI insights endpoints',
      'Configured NextAuth authentication and session tokenization architecture',
    ],
    icon: Code2,
  },
  {
    name: 'Nnabugwu Solomon Chukwuebuka',
    role: 'Frontend Developer & UI/UX Designer',
    focus: 'User Interface, Interactive Simulator & Experience',
    contributions: [
      'Built complete frontend application using Next.js App Router & Tailwind CSS',
      'Designed interactive transaction routing simulator and card management visualizer',
      'Developed full-canvas AI chat console and responsive business expense views',
      'Crafted micro-animations, skeleton loaders, and financial health visualizations',
    ],
    icon: Layout,
  },
]

export default function TeamSection() {
  return (
    <section id="team" className="bg-[#0b101f] py-20 sm:py-24 border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <span>Engineering &amp; Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Meet the Builders Behind Orchestra
          </h2>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
            Engineered to eliminate point-of-sale card declines and solve multi-card payment fragmentation across Nigerian commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEAM.map((member, i) => {
            const Icon = member.icon
            return (
              <div
                key={i}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7 hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs text-blue-400 font-medium">{member.role}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 font-mono font-medium">
                    Focus: {member.focus}
                  </p>

                  <ul className="space-y-2 text-xs text-slate-300/80">
                    {member.contributions.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold text-xs mt-0.5">•</span>
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Hackathon Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
            <Award size={15} className="text-blue-400" />
            <span>Programmable ATM Card Orchestration Platform</span>
          </div>
        </div>
      </div>
    </section>
  )
}
