'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteBatchButtonProps {
  batchId: string
}

export function DeleteBatchButton({ batchId }: DeleteBatchButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete batch.')
        setConfirming(false)
        return
      }
      router.push('/batches')
      router.refresh()
    } catch {
      setError('Unable to delete. Please check your connection and try again.')
      setConfirming(false)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-3 text-sm">
        <span className="text-gray-600">Delete batch?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-500 hover:text-red-700 font-medium min-h-[44px] px-2"
    >
      Delete
    </button>
  )
}
