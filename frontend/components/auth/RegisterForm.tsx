'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Briefcase, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRegister } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/utils'
import { cn } from '@/utils/cn'

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
      {/* Account Type Segmented Picker */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setRole('individual')}
            className={cn(
              'flex flex-col p-3 rounded-xl border text-left transition-all duration-150 relative',
              role === 'individual'
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5">
                <User size={15} className={role === 'individual' ? 'text-slate-900' : 'text-slate-400'} />
                <span className={cn('text-xs font-semibold', role === 'individual' ? 'text-slate-900' : 'text-slate-700')}>
                  Individual
                </span>
              </div>
              {role === 'individual' && (
                <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">Personal cards &amp; smart routing</p>
          </button>

          <button
            type="button"
            onClick={() => setRole('business')}
            className={cn(
              'flex flex-col p-3 rounded-xl border text-left transition-all duration-150 relative',
              role === 'business'
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5">
                <Briefcase size={15} className={role === 'business' ? 'text-slate-900' : 'text-slate-400'} />
                <span className={cn('text-xs font-semibold', role === 'business' ? 'text-slate-900' : 'text-slate-700')}>
                  Business
                </span>
              </div>
              {role === 'business' && (
                <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">Team cards &amp; treasury controls</p>
          </button>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Full Name
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          placeholder="e.g. Alex Morgan"
          required
          className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Email address
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          placeholder="name@company.com"
          required
          className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150"
        />
      </div>

      {/* Business Name (Conditional) */}
      {role === 'business' && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <label htmlFor="reg-business" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Registered Company Name
          </label>
          <input
            id="reg-business"
            name="businessName"
            type="text"
            placeholder="Acme Financial Ltd"
            required={role === 'business'}
            className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150"
          />
        </div>
      )}

      {/* Password & Confirm Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150 font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans"
          />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <input
            id="reg-confirm"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
            required
            className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-150 font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans"
          />
        </div>
      </div>

      {/* Error Banner */}
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
            <span>Creating account…</span>
          </>
        ) : (
          <span>Create Orchestra Account</span>
        )}
      </button>
    </form>
  )
}
