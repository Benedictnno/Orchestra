'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useRegister } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/utils'

export default function RegisterForm() {
  const router = useRouter()
  const { mutate: register, isPending: loading } = useRegister()
  const [error, setError] = useState('')
  const [role, setRole] = useState<'individual' | 'business'>('individual')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const businessName = formData.get('businessName') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    register({ name, email, password, role, businessName }, {
      onSuccess: () => {
        // Clear onboarding flag for new users
        localStorage.removeItem('orchestra_onboarded')
        toast.success('Account created! Welcome to Orchestra.')
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
        <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input id="reg-name" name="name" type="text" placeholder="John Doe" required
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]" />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input id="reg-email" name="email" type="email" placeholder="you@example.com" required
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
        <div className="flex gap-4">
          <label className="flex-1 flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
            <input type="radio" name="role" value="individual" checked={role === 'individual'} onChange={() => setRole('individual')} className="accent-[#E94560]" />
            <span className="text-sm">Individual</span>
          </label>
          <label className="flex-1 flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
            <input type="radio" name="role" value="business" checked={role === 'business'} onChange={() => setRole('business')} className="accent-[#E94560]" />
            <span className="text-sm">Business</span>
          </label>
        </div>
      </div>

      {role === 'business' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="reg-business" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input id="reg-business" name="businessName" type="text" placeholder="Your Company Ltd" required
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]" />
        </div>
      )}

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input id="reg-password" name="password" type="password" placeholder="At least 8 characters" required minLength={8}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]" />
      </div>
      <div>
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input id="reg-confirm" name="confirmPassword" type="password" placeholder="••••••••" required
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]" />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#E94560] text-white py-3 rounded-xl font-semibold hover:bg-[#d63850] transition disabled:opacity-50">
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
