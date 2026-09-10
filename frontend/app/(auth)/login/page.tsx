import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import { ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#4A90e2] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle ambient lighting & grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-slate-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">O</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">Orchestra</span>
          </div>
          <p className="text-white/80 text-xs font-medium tracking-wide">
            Financial OS &amp; Card Orchestration Platform
          </p>
        </div>

        {/* Auth Surface Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl shadow-slate-950/20">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Sign in to manage your unified cards and routing</p>
          </div>

          <LoginForm />

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Don&apos;t have an account?</span>
            <Link href="/register" className="text-slate-900 font-semibold hover:text-[#4A90e2] transition-colors">
              Create an account
            </Link>
          </div>
        </div>

     
      </div>
    </div>
  )
}
