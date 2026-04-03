'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'
import Link from 'next/link'

interface Strain {
  id: string
  name: string
}

interface Location {
  id: string
  name: string
}

export function CreateBatchForm() {
  const router = useRouter()
  const [strains, setStrains] = useState<Strain[]>([])
  const [selectedStrainIds, setSelectedStrainIds] = useState<string[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [strainsLoading, setStrainsLoading] = useState(true)
  const [locationsLoading, setLocationsLoading] = useState(true)

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

    async function fetchLocations() {
      try {
        const res = await fetch('/api/locations')
        if (res.ok) {
          const data: Location[] = await res.json()
          setLocations(data)
          if (data.length > 0) setSelectedLocationId(data[0].id)
        }
      } catch {
        // non-blocking
      } finally {
        setLocationsLoading(false)
      }
    }

    fetchStrains()
    fetchLocations()
  }, [])

  function toggleStrain(id: string) {
    setSelectedStrainIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedStrainIds.length === 0) {
      setError('Select at least one strain.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strainIds: selectedStrainIds,
          locationId: selectedLocationId || undefined,
        }),
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        {locationsLoading ? (
          <p className="text-sm text-gray-400">Loading location...</p>
        ) : locations.length === 0 ? (
          <p className="text-sm text-red-500">No location assigned. Contact an admin.</p>
        ) : locations.length === 1 ? (
          <p className="text-sm text-gray-700 py-2">{locations[0].name}</p>
        ) : (
          <select
            value={selectedLocationId}
            onChange={e => setSelectedLocationId(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strains <span className="text-red-500">*</span>
        </label>
        {strainsLoading ? (
          <p className="text-sm text-gray-400">Loading strains...</p>
        ) : strains.length === 0 ? (
          <p className="text-sm text-gray-500">
            No strains in the catalog yet.{' '}
            <Link href="/admin/strains" className="text-blue-600 hover:underline">
              Add strains in Admin → Strains
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
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

      <div className="flex justify-end">
        <ActionButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={strains.length === 0 || locations.length === 0}
        >
          Create Batch
        </ActionButton>
      </div>
    </form>
  )
}
