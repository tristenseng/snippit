'use client'

import React from 'react'

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  loading?: boolean
}

const variantClasses: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-lg px-4 py-2 min-h-[44px] disabled:bg-emerald-400 transition-all duration-200',
  secondary:
    'bg-white hover:bg-stone-50 active:bg-stone-100 active:scale-[0.98] text-stone-700 border border-stone-300 font-semibold rounded-lg px-4 py-2 min-h-[44px] transition-all duration-200',
  destructive:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-[0.98] text-white font-semibold rounded-lg px-4 py-2 min-h-[44px] transition-all duration-200',
  ghost:
    'p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 active:bg-stone-200 active:scale-[0.97] rounded-md min-h-[44px] min-w-[44px] transition-all duration-200',
}

export function ActionButton({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:cursor-not-allowed'
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
