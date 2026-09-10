'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLogin } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending: loading } = useLogin()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    login({ email, password }, {
      onSuccess: () => {
        toast.success('Welcome back!')
        router.push('/dashboard')
      },
      onError: (err: unknown) => {
        setError(extractErrorMessage(err))
      }
    })
  }

  const handleDemoFill = () => {
    const form = document.getElementById('login-email') as HTMLInputElement
    const pass = document.getElementById('login-password') as HTMLInputElement
    if (form) form.value = 'alice@example.com'
    if (pass) pass.value = 'Password123!'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div>
        <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="name@company.com"
          required
          className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150"
        />
      </div>

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
            Password
          </label>
        </div>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            required
            className="w-full h-10 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150 font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin text-white/80" />
            <span>Signing in…</span>
          </>
        ) : (
          <span>Sign in to Orchestra</span>
        )}
      </button>

      {/* 1-Click Demo Shortcut */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleDemoFill}
          className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles size={13} className="text-amber-500" />
          <span>Autofill test credentials (alice@example.com)</span>
        </button>
      </div>
    </form>
  )
}
