'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Zap, Layers, Sparkles, SlidersHorizontal, ArrowRightLeft, CreditCard, ChevronRight } from 'lucide-react'

/* ─── tiny hook for intersection observer fade-in ─────────── */
function useFadeIn<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect() } },
      { threshold }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

/* ─── floating card chip ──────────────────────────────────── */
function CardChip({ color, label, bank, pan, delay = '0s' }: {
  color: string; label: string; bank: string; pan: string; delay?: string
}) {
  return (
    <div
      className="absolute rounded-2xl p-5 sm:p-6 shadow-2xl w-64 text-white text-xs select-none border border-white/20 backdrop-blur-md"
      style={{
        background: color,
        animation: `floatCard 4s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className="flex justify-between items-start mb-7">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-black text-[10px]">O</div>
          <span className="font-bold text-sm tracking-tight">Orchestra</span>
        </div>
        <span className="opacity-80 uppercase text-[9px] tracking-widest font-mono font-semibold">{bank}</span>
      </div>
      <p className="font-mono tracking-[0.2em] text-xs mb-5 opacity-90">{pan}</p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-white/60 uppercase font-medium">Cardholder</p>
          <p className="font-semibold text-xs opacity-95">{label}</p>
        </div>
        <div className="w-9 h-5 bg-white/20 rounded border border-white/30 backdrop-blur-sm" />
      </div>
    </div>
  )
}

/* ─── feature card ────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }: {
  icon: React.ElementType; title: string; desc: string; delay: string
}) {
  const [ref, visible] = useFadeIn()
  return (
    <div
      ref={ref}
      className="bg-white/10 border border-white/15 rounded-2xl p-6 hover:bg-white/15 hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`,
      }}
    >
      <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform shadow-xs">
        <Icon size={18} />
      </div>
      <h3 className="font-bold text-white text-base mb-2 tracking-tight">{title}</h3>
      <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

/* ─── step card (for "how it works") ─────────────────────── */
function StepCard({ n, title, desc, delay }: {
  n: string; title: string; desc: string; delay: number
}) {
  const [ref, visible] = useFadeIn(0.15)
  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.5s ease ${delay}s`,
      }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-base font-bold text-white mx-auto mb-4 font-mono shadow-xs">
        {n}
      </div>
      <h3 className="text-white font-bold text-base mb-1.5 tracking-tight">{title}</h3>
      <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

/* ─── main page ───────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const [featuresRef, featuresVisible] = useFadeIn()

  return (
    <>
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-gradient {
          background: linear-gradient(135deg, #4A90e2 0%, #1e3a8a 45%, #0f172a 100%);
          background-size: 200% 200%;
        }
        .slide-up { animation: slideUp 0.8s ease forwards; }
        .fade-in { animation: fadeIn 1s ease forwards; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#4A90e2]/95 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-sm">O</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">Orchestra</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-white/80">
            <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Security &amp; Routing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/90 text-xs font-semibold hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-100 transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Ambient glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-slate-900/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left — copy */}
          <div>
          

            <h1
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight"
              style={{ animation: 'slideUp 0.8s ease 0.1s both' }}
            >
              One card to orchestrate them all
            </h1>

            <p
              className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
              style={{ animation: 'slideUp 0.8s ease 0.2s both' }}
            >
              Orchestra is an AI-powered financial OS that unifies all your Nigerian bank cards into a single programmable payment layer — intelligently routing, splitting, and optimizing every transaction.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
              style={{ animation: 'slideUp 0.8s ease 0.3s both' }}
            >
              <Link
                href="/register"
                className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl text-center text-sm hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-center text-sm hover:bg-white/25 transition backdrop-blur-md"
              >
                Sign in to console
              </Link>
            </div>

            <p
              className="text-white/50 text-xs mt-5"
              style={{ animation: 'fadeIn 1s ease 0.4s both' }}
            >
              Zero monthly maintenance fees · Sandbox test mode included
            </p>
          </div>

          {/* Right — floating cards */}
          <div className="relative h-96 lg:h-[420px] hidden lg:block">
            <div style={{ '--rot': '-6deg' } as React.CSSProperties} className="absolute top-0 left-20 z-30">
              <CardChip color="linear-gradient(135deg,#1e293b,#0f172a)" label="Alex Morgan" bank="Master Orchestrator" pan="5399 •••• •••• 8888" delay="0s" />
            </div>
            <div style={{ '--rot': '5deg' } as React.CSSProperties} className="absolute top-28 left-48 z-20">
              <CardChip color="linear-gradient(135deg,#0284c7,#0369a1)" label="Alex Morgan" bank="GTBank Debit" pan="4111 •••• •••• 1234" delay="0.8s" />
            </div>
            <div style={{ '--rot': '-2deg' } as React.CSSProperties} className="absolute top-56 left-24 z-10">
              <CardChip color="linear-gradient(135deg,#0d9488,#115e59)" label="Alex Morgan" bank="Access Virtual" pan="6280 •••• •••• 4567" delay="1.6s" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="bg-[#4A90e2] py-20 sm:py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div
            ref={featuresRef}
            className="text-center mb-14"
            style={{
              opacity: featuresVisible ? 1 : 0,
              transform: featuresVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 0.6s ease',
            }}
          >
            <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-2 font-mono">Platform Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">The Financial OS for Nigerian Commerce</h2>
            <p className="text-white/70 mt-3 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
              Eliminate card declines, fragmented balances, and manual reconciliations with algorithmic payment routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <FeatureCard delay="0s" icon={SlidersHorizontal} title="Programmable Routing" desc="Configure sequential auto-split, default primary priority, or balanced proportion rules evaluated at swipe time." />
            <FeatureCard delay="0.1s" icon={ArrowRightLeft} title="Sub-Second Auto-Split" desc="When a single card has insufficient balance, Orchestra splits the transaction seamlessly across multiple linked wallets." />
            <FeatureCard delay="0.2s" icon={ShieldCheck} title="Zero-Trust Anomaly Engine" desc="Interswitch-powered fraud heuristics flag out-of-pattern spending, duplicate attempts, and sudden velocity spikes in real time." />
            <FeatureCard delay="0.3s" icon={CreditCard} title="Merchant-Locked Virtual Cards" desc="Issue instant virtual cards for SaaS subscriptions and vendor bills with configurable spending caps and auto-freeze rules." />
            <FeatureCard delay="0.4s" icon={Sparkles} title="AI Financial Intelligence" desc="Access conversational spend auditing, automated anomaly investigations, and predictive savings scenario modeling." />
            <FeatureCard delay="0.5s" icon={Layers} title="Corporate Treasury &amp; Teams" desc="Manage business departmental cards, configure multi-tier approval limits, and consolidate company disbursements in one ledger." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" className="bg-slate-900 py-20 sm:py-24 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 font-mono">Streamlined Onboarding</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Up and running in three steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <StepCard n="01" title="Link your cards" desc="Connect debit and prepaid cards from major Nigerian banks via secure tokenization." delay={0} />
            <StepCard n="02" title="Define routing policy" desc="Select sequential auto-split, default primary, or let our AI optimizer balance cashflow." delay={0.12} />
            <StepCard n="03" title="Swipe &amp; transact" desc="Use your single Orchestra card anywhere — funds route instantly with zero friction." delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section id="security" className="hero-gradient py-20 sm:py-24 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Ready to orchestrate your money?
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Experience programmable banking built specifically for modern individuals and growing Nigerian businesses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-slate-900 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-slate-100 transition shadow-lg"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/15 border border-white/30 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-white/25 transition backdrop-blur-md"
            >
              Sign in to dashboard
            </Link>
          </div>
          <p className="text-white/50 text-xs mt-5">
            Protected by bank-grade 256-bit encryption · Interswitch Hackathon 2025
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center">
              <span className="text-white font-black text-xs">O</span>
            </div>
            <span className="text-white font-bold text-sm">Orchestra</span>
          </div>
          <p className="text-slate-400 text-xs text-center">
            Built for Interswitch × Enyata ATM Card Orchestration Hackathon 2025
          </p>
          <div className="flex items-center gap-5 text-slate-400 text-xs font-medium">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
