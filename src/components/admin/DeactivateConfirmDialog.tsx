'use client'

import { useEffect, useRef, useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface DeactivateConfirmDialogProps {
  isOpen: boolean
  userName: string
  userId: string
  onClose: () => void
  onDeactivated: () => void
}

export function DeactivateConfirmDialog({
  isOpen,
  userName,
  userId,
  onClose,
  onDeactivated,
}: DeactivateConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const keepButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement
      setTimeout(() => {
        keepButtonRef.current?.focus()
      }, 50)
    } else {
      triggerRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    }
  }, [isOpen])

  async function handleDeactivate() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'POST',
      })

      if (res.ok) {
        onDeactivated()
      } else {
        setError('Unable to save. Please check your connection and try again.')
      }
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-dialog-title"
      >
        <h2 id="deactivate-dialog-title" className="text-xl font-semibold text-gray-900 mb-3">
          Deactivate {userName}?
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Their historical data will be preserved. They will no longer be able to log in.
        </p>

        {error && (
          <div className="mb-4">
            <InlineAlert type="error" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            ref={keepButtonRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md min-h-[44px] min-w-[44px] px-4"
          >
            Keep Account
          </button>
          <ActionButton
            type="button"
            variant="destructive"
            loading={loading}
            onClick={handleDeactivate}
          >
            Deactivate Account
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
