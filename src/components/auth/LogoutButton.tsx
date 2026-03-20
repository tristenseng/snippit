'use client'

import { signOut } from 'next-auth/react'

interface LogoutButtonProps {
  variant?: 'default' | 'text'
  className?: string
}

export default function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        className={`text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium
                   min-h-[44px] min-w-[44px] ${className}`}
      >
        Sign out
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                 min-h-[44px] text-sm font-medium ${className}`}
    >
      Sign out
    </button>
  )
}
