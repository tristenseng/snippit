'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Location {
  id: string
  name: string
  description: string | null
  _count: { users: number; batches: number; userLocations: number }
}

interface LocationTableProps {
  locations: Location[]
}

export function LocationTable({ locations }: LocationTableProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function startEdit(loc: Location) {
    setEditingId(loc.id)
    setEditName(loc.name)
    setEditDescription(loc.description ?? '')
    setError(null)
    setDeleteConfirmId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  async function handleSave(id: string) {
    const name = editName.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: editDescription.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save.')
        return
      }
      setEditingId(null)
      router.refresh()
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete.')
        setDeleteConfirmId(null)
        return
      }
      setDeleteConfirmId(null)
      router.refresh()
    } catch {
      setError('Unable to delete. Please check your connection and try again.')
    } finally {
      setDeleting(false)
    }
  }

  function isInUse(loc: Location) {
    return loc._count.userLocations > 0 || loc._count.batches > 0
  }

  if (locations.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        No locations yet. Add one above.
      </p>
    )
  }

  return (
    <div>
      {error && (
        <p className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100" role="alert">
          {error}
        </p>
      )}

      {/* Desktop table */}
      <table className="hidden sm:table min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {locations.map((loc) => (
            <tr key={loc.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {editingId === loc.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    maxLength={100}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{loc.name}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === loc.id ? (
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    maxLength={300}
                    placeholder="Optional"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm text-gray-500">{loc.description ?? '—'}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                <span className="space-x-2">
                  {loc._count.userLocations > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {loc._count.userLocations} user{loc._count.userLocations !== 1 ? 's' : ''}
                    </span>
                  )}
                  {loc._count.batches > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {loc._count.batches} batch{loc._count.batches !== 1 ? 'es' : ''}
                    </span>
                  )}
                  {!isInUse(loc) && <span className="text-gray-400">—</span>}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm">
                {editingId === loc.id ? (
                  <span className="space-x-3">
                    <button
                      onClick={() => handleSave(loc.id)}
                      disabled={saving || !editName.trim()}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </span>
                ) : deleteConfirmId === loc.id ? (
                  <span className="space-x-3">
                    <span className="text-gray-600 text-xs">Delete?</span>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <span className="space-x-4">
                    <button
                      onClick={() => startEdit(loc)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteConfirmId(loc.id); setError(null) }}
                      disabled={isInUse(loc)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={isInUse(loc) ? 'Has assigned users or batches — cannot delete' : undefined}
                    >
                      Delete
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <ul className="sm:hidden divide-y divide-gray-100">
        {locations.map((loc) => (
          <li key={loc.id} className="px-4 py-4">
            {editingId === loc.id ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={100}
                  placeholder="Name"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={300}
                  placeholder="Description (optional)"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => handleSave(loc.id)}
                    disabled={saving || !editName.trim()}
                    className="text-blue-600 disabled:opacity-50 min-h-[44px]"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="text-gray-500 min-h-[44px]">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                  {loc.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{loc.description}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {loc._count.userLocations > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                        {loc._count.userLocations}u
                      </span>
                    )}
                    {loc._count.batches > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {loc._count.batches}b
                      </span>
                    )}
                  </div>
                </div>
                {deleteConfirmId === loc.id ? (
                  <div className="flex gap-3 text-sm shrink-0">
                    <button
                      onClick={() => handleDelete(loc.id)}
                      disabled={deleting}
                      className="text-red-600 min-h-[44px]"
                    >
                      {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                    <button onClick={() => setDeleteConfirmId(null)} className="text-gray-500 min-h-[44px]">
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 text-sm shrink-0">
                    <button onClick={() => startEdit(loc)} className="text-blue-600 min-h-[44px]">
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteConfirmId(loc.id); setError(null) }}
                      disabled={isInUse(loc)}
                      className="text-red-500 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
