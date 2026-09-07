'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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
      className="absolute rounded-[24px] p-6 shadow-2xl w-64 text-white text-xs select-none"
      style={{
        background: color,
        animation: `floatCard 4s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className="flex justify-between items-start mb-8">
        <span className="font-black text-xl tracking-tight">Orchestra</span>
        <span className="opacity-70 uppercase text-[10px] tracking-widest font-bold">{bank}</span>
      </div>
      <p className="font-mono tracking-[0.2em] text-[13px] mb-5 opacity-90">{pan}</p>
      <div className="flex justify-between items-end">
        <p className="font-bold text-sm opacity-90">{label}</p>
        <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-sm" />
      </div>
    </div>
  )
}

/* ─── feature card ────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }: {
  icon: string; title: string; desc: string; delay: string
}) {
  const [ref, visible] = useFadeIn()
  return (
    <div
      ref={ref}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}, transform 0.6s ease ${delay}`,
      }}
    >
      <div className="w-12 h-12 rounded-xl bg-[#E94560]/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
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
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `all 0.6s ease ${delay}s`,
      }}
    >
      <div className="w-20 h-20 rounded-2xl bg-[#E94560]/20 border border-[#E94560]/30 flex items-center justify-center text-2xl font-black text-[#E94560] mx-auto mb-5 hover:bg-[#E94560]/30 transition">
        {n}
      </div>
      <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
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
          50% { transform: translateY(-14px) rotate(var(--rot, 0deg)); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-gradient {
          background: linear-gradient(135deg, #4A90e2 0%, #16213E 40%, #0F3460 70%, #4A90e2 100%);
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
        }
        .text-gradient {
          background: linear-gradient(90deg, #E94560, #F59E0B, #E94560);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s linear infinite;
        }
        .slide-up { animation: slideUp 0.8s ease forwards; }
        .fade-in { animation: fadeIn 1s ease forwards; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#4A90e2]/95 backdrop-blur-md shadow-xl' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E94560] flex items-center justify-center">
              <span className="text-white font-black text-sm">O</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">Orchestra</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#stats" className="hover:text-white transition">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/80 text-sm font-medium hover:text-white transition hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-[#E94560] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#d63850] transition hover:shadow-lg hover:shadow-[#E94560]/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#E94560]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left — copy */}
          <div>
            {/* <div
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 font-medium mb-6"
              style={{ animation: 'fadeIn 0.8s ease forwards' }}
            >
              <span className="w-2 h-2 bg-[#E94560] rounded-full animate-pulse" />
             
            </div> */}

            <h1
              className="text-5xl md:text-6xl font-black text-white leading-tight mb-6"
              style={{ animation: 'slideUp 0.9s ease 0.1s both' }}
            >
              
              One card to{' '}
              <span className="text-gradient">orchestrate</span>
              {' '}them all
            </h1>

            <p
              className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg"
              style={{ animation: 'slideUp 0.9s ease 0.25s both' }}
            >
              Orchestra is an AI-powered ATM card orchestration platform that unifies all your bank cards into a single programmable payment layer — routing every naira intelligently.
            </p>

            <div
              className="flex flex-wrap gap-3"
              style={{ animation: 'slideUp 0.9s ease 0.4s both' }}
            >
              <Link
                href="/register"
                className="group relative bg-[#E94560] text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-[#d63850] transition-all duration-200 hover:shadow-2xl hover:shadow-[#E94560]/40 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Start for free</span>
                {/* pulse ring */}
                <span className="absolute inset-0 rounded-2xl bg-[#E94560] opacity-0 group-hover:opacity-100" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }} />
              </Link>
              <Link
                href="/login"
                className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/20 transition backdrop-blur-sm"
              >
                Sign in →
              </Link>
            </div>

            <p
              className="text-white/30 text-xs mt-5"
              style={{ animation: 'fadeIn 1.2s ease 0.6s both' }}
            >
              No credit card required · Free during hackathon
            </p>
          </div>

          {/* Right — floating cards */}
          <div className="relative h-96 lg:h-[450px] hidden lg:block">
            <div style={{ '--rot': '-8deg' } as React.CSSProperties} className="absolute top-0 left-24 z-30">
              <CardChip color="linear-gradient(135deg,#4A90e2,#E94560)" label="Master Orchestrator" bank="Ultimate Card" pan="5399 •••• •••• 8888" delay="0s" />
            </div>
            <div style={{ '--rot': '4deg' } as React.CSSProperties} className="absolute top-32 left-52 z-20">
              <CardChip color="linear-gradient(135deg,#0F3460,#533483)" label="Primary Debit" bank="Physical Card" pan="4111 •••• •••• 1234" delay="0.8s" />
            </div>
            <div style={{ '--rot': '-3deg' } as React.CSSProperties} className="absolute top-64 left-28 z-10">
              <CardChip color="linear-gradient(135deg,#16213E,#E94560CC)" label="Netflix Subscription" bank="Virtual Card" pan="6280 •••• •••• 4567" delay="1.6s" />
            </div>
            {/* Connection lines SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <line x1="200" y1="80" x2="320" y2="180" stroke="#E94560" strokeWidth="2" strokeDasharray="8 6" />
              <line x1="320" y1="180" x2="230" y2="280" stroke="#E94560" strokeWidth="2" strokeDasharray="8 6" />
            </svg>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-white text-xs">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/40 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white rounded-full" style={{ animation: 'slideUp 1.5s ease infinite' }} />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      {/* <section id="stats" className="bg-[#16213E] py-20 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat to={18} suffix="+" label="Supported banks" />
          <Stat to={99} suffix="%" label="Routing accuracy" />
          <Stat to={3} suffix="s" label="Avg routing time" />
          <Stat to={40} suffix="%" label="Fewer declined txns" />
        </div>
      </section> */}

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="bg-[#4A90e2] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div
            ref={featuresRef}
            className="text-center mb-16"
            style={{
              opacity: featuresVisible ? 1 : 0,
              transform: featuresVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s ease',
            }}
          >
            <p className="text-[#E94560] font-semibold text-sm uppercase tracking-widest mb-3">Why Orchestra</p>
            <h2 className="text-4xl font-black text-white">The financial OS for modern Nigerians</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">Stop juggling multiple banking apps. Orchestra unifies everything and makes your money work smarter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard delay="0s" icon="🎼" title="Programmable Routing" desc="Set rules based on cashback, balance thresholds, merchant categories, or time of day. Orchestra picks the best card — automatically." />
            <FeatureCard delay="0.1s" icon="⚡" title="Auto-Split Payments" desc="When one card doesn't have enough, Orchestra splits the charge intelligently across multiple cards in milliseconds." />
            <FeatureCard delay="0.2s" icon="🛡️" title="Anomaly Detection" desc="Our AI flags unusual transactions in real-time — duplicate charges, sudden merchant changes, or out-of-pattern spending." />
            <FeatureCard delay="0.3s" icon="💳" title="Virtual Cards" desc="Create merchant-locked virtual cards for subscriptions. Pause, resume, or destroy them with one tap — your data, your rules." />
            <FeatureCard delay="0.4s" icon="🤖" title="AI Insights" desc="Get a financial health score, personalised recommendations, and a what-if savings calculator powered by your real spending data." />
            <FeatureCard delay="0.5s" icon="🏢" title="Business Workflows" desc="Issue departmental cards with spend limits, enforce approval workflows, and get consolidated reports across your entire team." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" className="bg-[#16213E] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#E94560] font-semibold text-sm uppercase tracking-widest mb-3">Simple setup</p>
            <h2 className="text-4xl font-black text-white">Up and running in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#E94560]/50 via-[#E94560] to-[#E94560]/50" />
            <StepCard n="01" title="Add your cards" desc="Link all your ATM cards from any Nigerian bank. We support 18+ banks and counting." delay={0} />
            <StepCard n="02" title="Set your rules" desc="Choose auto-split, primary card, or balance-optimised routing. Or let our AI decide." delay={0.15} />
            <StepCard n="03" title="Pay smarter" desc="Tap to pay and Orchestra routes instantly — maximising cashback, avoiding declines." delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="hero-gradient py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#E94560]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto px-6 text-center relative">
          <h2 className="text-5xl font-black text-white mb-4 leading-tight">
            Ready to <span className="text-gradient">orchestrate</span> your money?
          </h2>
          <p className="text-white/50 text-lg mb-10">Join thousands of Nigerians making every naira work harder.</p>
          <Link
            href="/register"
            className="inline-block bg-[#E94560] text-white font-bold text-lg px-12 py-5 rounded-2xl hover:bg-[#d63850] transition-all hover:shadow-2xl hover:shadow-[#E94560]/40 hover:-translate-y-1"
          >
            Create your free account →
          </Link>
          <p className="text-white/30 text-sm mt-5">Already have an account? <Link href="/login" className="text-white/60 hover:text-white underline">Sign in</Link></p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-[#4A90e2] border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E94560] flex items-center justify-center">
              <span className="text-white font-black text-xs">O</span>
            </div>
            <span className="text-white font-bold">Orchestra</span>
          </div>
          <p className="text-white/30 text-xs text-center">
            Built for the Interswitch × Enyata ATM Card Orchestration Hackathon 2025
          </p>
          <div className="flex items-center gap-6 text-white/40 text-xs">
            <Link href="/login" className="hover:text-white transition">Login</Link>
            <Link href="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
