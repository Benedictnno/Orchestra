'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ArrowRightLeft,
  CreditCard,
  Menu,
  X,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Wifi,
} from 'lucide-react'

// Section Components
import TrustStrip from '@/components/landing/TrustStrip'
import ProblemSection from '@/components/landing/ProblemSection'
import CoreFeaturesBento from '@/components/landing/CoreFeaturesBento'
import InteractiveSimulator from '@/components/landing/InteractiveSimulator'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FaqSection from '@/components/landing/FaqSection'

/* ─── Hero Floating Card Component ─────────────────────────── */
function HeroCardChip({
  color,
  label,
  bank,
  pan,
  balance,
  status,
  delay = '0s',
  className = '',
}: {
  color: string
  label: string
  bank: string
  pan: string
  balance: string
  status: string
  delay?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 shadow-2xl w-full max-w-[280px] sm:max-w-[310px] text-white select-none border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${className}`}
      style={{
        background: color,
        animation: `floatHeroCard 5s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/20 p-0.5 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="Orchestra Logo"
              width={20}
              height={20}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-sm tracking-tight">Orchestra</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-white/70 rotate-90" />
          <span className="opacity-90 uppercase text-[9px] tracking-widest font-mono font-semibold bg-white/10 px-2 py-0.5 rounded">
            {bank}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {/* EMV Chip graphic */}
        <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300/60 shadow-xs relative overflow-hidden">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-600/40" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-amber-600/40" />
        </div>
        <p className="font-mono tracking-[0.2em] text-xs opacity-90">{pan}</p>
      </div>

      <div className="flex justify-between items-end pt-2 border-t border-white/15">
        <div>
          <p className="text-[9px] text-white/60 uppercase font-mono">Available Balance</p>
          <p className="font-mono font-bold text-sm text-white">{balance}</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded font-medium">
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Landing Page Component ──────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#070b16] text-white selection:bg-blue-500 selection:text-white">
      <style>{`
        @keyframes floatHeroCard {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--rot, 0deg)); }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .hero-surface {
          background: radial-gradient(circle at 50% 0%, #102147 0%, #080e1e 50%, #050813 100%);
        }
      `}</style>

      {/* ── TOP NAVIGATION BAR ──────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'bg-[#080d1a]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo & Rails Status */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Orchestra Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="text-white font-black text-xl tracking-tight">Orchestra</span>
            </Link>
          </div>

          {/* Desktop Navigation Links — 5 Core Pillars */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Platform Features
            </a>
            <a href="#problem" className="hover:text-white transition-colors">
              The Solution
            </a>
            <a href="#testimonials" className="hover:text-white transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-300 text-xs font-semibold hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
            >
              Launch Sandbox
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#080d1a] border-b border-white/10 px-6 py-5 space-y-3 text-xs font-semibold text-slate-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-400"
            >
              Platform Features
            </a>
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-400"
            >
              The Solution
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-400"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-400"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Launch Sandbox
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── SECTION 1: HERO & INTEGRATED TRUST STRIP ────────── */}
      <section
        id="hero"
        ref={heroRef}
        className="hero-surface min-h-[92vh] flex flex-col justify-between relative overflow-hidden pt-28 pb-0"
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient mesh glows */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10 py-10 my-auto">
          {/* Left Column — Value & Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 backdrop-blur-sm">
              <Image
                src="/logo.png"
                alt="Orchestra Logo"
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
              <span className="font-medium text-slate-200">The Financial OS for Multi-Card Orchestration</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
              One programmable card to orchestrate every account
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Orchestra unifies your Nigerian bank cards — including Union Bank, GTBank, Access, and Kuda — into a single intelligent payment layer with sub-second auto-splits, merchant-locked virtual cards, and corporate treasury controls.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl text-center text-sm transition-all shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Launch Sandbox Console</span>
                <ArrowRight size={15} />
              </Link>
              <a
                href="#simulator"
                className="w-full sm:w-auto bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl text-center text-sm transition backdrop-blur-md flex items-center justify-center gap-2"
              >
                <span>Try Live Simulator</span>
                <Zap size={14} className="text-blue-400" />
              </a>
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Zero Monthly Maintenance
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Sandbox Ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> 256-Bit Bank Encryption
              </span>
            </div>
          </div>

          {/* Right Column — Dual Layer Card Stack & Live POS Telemetry (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Aggregated Liquidity Floating Gauge */}
            <div className="mb-4 w-full max-w-[310px] bg-slate-900/90 border border-white/20 rounded-2xl p-4 backdrop-blur-xl shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Combined Liquidity</span>
                <span className="font-mono font-bold text-lg text-white">₦150,000.00</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Auto-Split Armed
              </span>
            </div>

            {/* Card Stack */}
            <div className="relative w-full flex flex-col items-center space-y-[-110px] sm:space-y-[-125px]">
              {/* Card 1: Top Master Card */}
              <div style={{ '--rot': '-3deg' } as React.CSSProperties} className="z-30 w-full flex justify-center">
                <HeroCardChip
                  color="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                  label="Alex Morgan"
                  bank="Master Orchestrator"
                  pan="5399 •••• •••• 8888"
                  balance="₦150,000.00"
                  status="Active Orchestrator"
                  delay="0s"
                />
              </div>

              {/* Card 2: Union Bank */}
              <div style={{ '--rot': '4deg' } as React.CSSProperties} className="z-20 w-full flex justify-center">
                <HeroCardChip
                  color="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                  label="Alex Morgan"
                  bank="Union Bank Salary"
                  pan="5061 •••• •••• 1234"
                  balance="₦40,000.00"
                  status="Primary Card"
                  delay="0.7s"
                />
              </div>

              {/* Card 3: Access */}
              <div style={{ '--rot': '-2deg' } as React.CSSProperties} className="z-10 w-full flex justify-center">
                <HeroCardChip
                  color="linear-gradient(135deg, #0d9488 0%, #115e59 100%)"
                  label="Alex Morgan"
                  bank="Access Wallet"
                  pan="6280 •••• •••• 4567"
                  balance="₦60,000.00"
                  status="Reserve 1"
                  delay="1.4s"
                />
              </div>
            </div>

            {/* Live POS Intercept Card Graphic */}
            <div className="mt-8 w-full max-w-[310px] bg-black/60 border border-emerald-500/30 rounded-2xl p-3.5 backdrop-blur-md shadow-2xl space-y-2 z-40">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">POS Intercept (Shoprite):</span>
                <span className="text-emerald-400 font-bold">₦65,000 APPROVED</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg text-[10px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Union Bank:</span>
                  <span className="text-white font-bold">₦40,000 (Drained)</span>
                </div>
                <div className="flex justify-between">
                  <span>Access Reserve:</span>
                  <span className="text-emerald-400 font-bold">₦25,000 (Split)</span>
                </div>
              </div>
              <p className="text-[9px] font-mono text-slate-400 text-center">
                Latency: 290ms · Zero POS Checkout Declines
              </p>
            </div>
          </div>
        </div>

        {/* Integrated Trust & Bank Rails Strip */}
        <TrustStrip />
      </section>

      {/* ── SECTION 2: THE PROBLEM & OPPORTUNITY ────────────── */}
      <section id="problem">
        <ProblemSection />
      </section>

      {/* ── SECTION 3: INTERACTIVE LIVE AUTO-SPLIT SIMULATOR ─── */}
      <InteractiveSimulator />

      {/* ── SECTION 4: PLATFORM CAPABILITIES, WORKFLOW & FAQ ─── */}
      <div id="features" className="space-y-0">
        <CoreFeaturesBento />
        {/* <HowItWorksSection /> */}
        <TestimonialsSection />
        <FaqSection />
      </div>

      {/* ── SECTION 5: FINAL CALL TO ACTION ──────────────────── */}
      <section id="cta" className="bg-gradient-to-b from-[#0b1222] to-[#050811] py-20 sm:py-24 relative overflow-hidden border-t border-white/[0.08]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
            <Image
              src="/logo.png"
              alt="Orchestra Logo"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span>Ready for Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to orchestrate your money?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Experience programmable banking built specifically for modern individuals and growing Nigerian businesses. Pre-loaded sandbox mode ready for instant testing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition backdrop-blur-md"
            >
              Sign In to Dashboard
            </Link>
          </div>

          <p className="text-slate-500 text-xs font-mono pt-3">
            Protected by bank-grade 256-bit AES encryption · Sandbox mode includes simulated Nigerian bank cards
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-[#04060c] border-t border-white/[0.06] py-14 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand & Overview */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Orchestra Logo"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">Orchestra</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                The programmable ATM card orchestration platform unifying Nigerian bank cards, sub-second split routing, merchant-locked virtual cards, and corporate treasury management.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Programmable Multi-Card Liquidity Management</span>
              </div>
            </div>

            {/* Col 2: Platform Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Platform Features
                  </a>
                </li>
                <li>
                  <a href="#problem" className="hover:text-white transition-colors">
                    The Solution
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-white transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources & Console */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
                Console &amp; API
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Sign In to Console
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Sandbox Account
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <a
                    href="https://orchestra-y8vf.onrender.com/api-docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Deployed API Docs</span>
                    <ExternalLink size={11} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
            <p>© 2025 Orchestra. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#faq" className="hover:text-slate-400 transition-colors">
                FAQ
              </a>
              <Link href="/login" className="hover:text-slate-400 transition-colors">
                Sandbox Console
              </Link>
              <a
                href="https://orchestra-y8vf.onrender.com/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-400 transition-colors"
              >
                OpenAPI Spec
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
