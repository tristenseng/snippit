'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function SetPasswordPage() {
  const router = useRouter()
  const { update } = useSession()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Failed to set password. Please try again.")
        return
      }

      // Clear forcePasswordReset in the session JWT
      await update({ forcePasswordReset: false })
      router.push("/dashboard")
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-md">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome</h1>
      <p className="text-sm text-gray-600 mb-6">
        Please set your password to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Repeat your new password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Setting password..." : "Set Password"}
        </button>
      </form>
    </div>
  )
}
