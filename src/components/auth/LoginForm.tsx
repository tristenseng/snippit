'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'AccountDeactivated') {
          setError('This account has been deactivated. Contact your administrator.')
        } else {
          setError('Invalid email or password.')
        }
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg bg-white
                     placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     min-h-[44px] text-base sm:text-sm transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg bg-white
                     placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     min-h-[44px] text-base sm:text-sm transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg
                   text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700
                   active:scale-[0.98] active:bg-emerald-800
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                   disabled:bg-emerald-400 disabled:cursor-not-allowed min-h-[44px]
                   transition-all duration-200"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
