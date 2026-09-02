import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#4A90e2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E94560] flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">Orchestra</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[#4A90e2] mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your financial OS</p>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#E94560] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Built for Interswitch × Enyata Hackathon 2025
        </p>
      </div>
    </div>
  )
}
