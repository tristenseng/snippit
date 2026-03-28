'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/components/ui/ActionButton'

export function AddStrainForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/strains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to add strain.')
        return
      }
      setName('')
      router.refresh()
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Strain name (max 50 chars)"
          maxLength={50}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <ActionButton
        type="submit"
        variant="primary"
        loading={saving}
        disabled={!name.trim()}
      >
        Add
      </ActionButton>
    </form>
  )
}
