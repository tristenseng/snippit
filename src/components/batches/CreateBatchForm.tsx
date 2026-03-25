'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface Strain {
  id: string
  name: string
}

export function CreateBatchForm() {
  const router = useRouter()
  const [strains, setStrains] = useState<Strain[]>([])
  const [selectedStrainIds, setSelectedStrainIds] = useState<string[]>([])
  const [newStrainName, setNewStrainName] = useState('')
  const [loading, setLoading] = useState(false)
  const [addingStrain, setAddingStrain] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [strainsLoading, setStrainsLoading] = useState(true)

  useEffect(() => {
    async function fetchStrains() {
      try {
        const res = await fetch('/api/strains')
        if (res.ok) {
          const data = await res.json()
          setStrains(data)
        }
      } catch {
        // non-blocking
      } finally {
        setStrainsLoading(false)
      }
    }
    fetchStrains()
  }, [])

  function toggleStrain(id: string) {
    setSelectedStrainIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleAddStrain() {
    const name = newStrainName.trim()
    if (!name || name.length > 50) return
    setAddingStrain(true)
    try {
      const res = await fetch('/api/strains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to add strain.')
        return
      }
      const strain: Strain = await res.json()
      setStrains(prev => [...prev, strain])
      setSelectedStrainIds(prev => [...prev, strain.id])
      setNewStrainName('')
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setAddingStrain(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedStrainIds.length === 0) {
      setError('Strains is required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strainIds: selectedStrainIds }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to save. Please check your connection and try again.')
        return
      }
      router.push('/batches')
      router.refresh()
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <InlineAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Strain multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strains <span className="text-red-500">*</span>
        </label>
        {strainsLoading ? (
          <p className="text-sm text-gray-400">Loading strains...</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
            {strains.length === 0 && (
              <p className="text-sm text-gray-400 italic">No strains yet. Add one below.</p>
            )}
            {strains.map(strain => (
              <label key={strain.id} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={selectedStrainIds.includes(strain.id)}
                  onChange={() => toggleStrain(strain.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{strain.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Add new strain inline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Strain
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newStrainName}
            onChange={e => setNewStrainName(e.target.value)}
            placeholder="Strain name (max 50 chars)"
            maxLength={50}
            className="flex-1 text-base sm:text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[44px] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddStrain()
              }
            }}
          />
          <ActionButton
            type="button"
            variant="secondary"
            onClick={handleAddStrain}
            loading={addingStrain}
            disabled={!newStrainName.trim() || newStrainName.trim().length > 50}
          >
            Add
          </ActionButton>
        </div>
      </div>

      <div className="flex justify-end">
        <ActionButton type="submit" variant="primary" loading={loading}>
          Create Batch
        </ActionButton>
      </div>
    </form>
  )
}
