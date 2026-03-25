'use client'

import React from 'react'

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  loading?: boolean
}

const variantClasses: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 min-h-[44px] disabled:bg-blue-400',
  secondary:
    'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-md px-4 py-2 min-h-[44px]',
  destructive:
    'bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2 min-h-[44px]',
  ghost:
    'p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md min-h-[44px] min-w-[44px]',
}

export function ActionButton({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed'
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  )
}
