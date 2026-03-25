'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface ActivateBatchButtonProps {
  batchId: string
}

export function ActivateBatchButton({ batchId }: ActivateBatchButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleActivate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}/activate`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to activate batch.')
        return
      }
      router.refresh()
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <InlineAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}
      <ActionButton variant="primary" onClick={handleActivate} loading={loading}>
        Activate
      </ActionButton>
    </div>
  )
}
