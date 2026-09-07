'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63850] transition disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      {/* Demo shortcut */}
      <button
        type="button"
        onClick={() => {
          const form = document.getElementById('login-email') as HTMLInputElement
          const pass = document.getElementById('login-password') as HTMLInputElement
          if (form) form.value = 'alice@example.com'
          if (pass) pass.value = 'Password123!'
        }}
        className="w-full text-sm text-gray-400 hover:text-[#E94560] transition"
      >
        Use demo account →
      </button>
    </form>
  )
}
