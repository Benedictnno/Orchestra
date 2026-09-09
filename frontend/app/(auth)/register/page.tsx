import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
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

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h1 className="text-xl sm:text-2xl font-bold text-[#4A90e2] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Start unifying your cards in minutes</p>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E94560] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
