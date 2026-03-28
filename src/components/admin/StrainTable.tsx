'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Strain {
  id: string
  name: string
  _count: { batchStrains: number }
}

interface StrainTableProps {
  strains: Strain[]
}

export function StrainTable({ strains }: StrainTableProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function startEdit(strain: Strain) {
    setEditingId(strain.id)
    setEditName(strain.name)
    setError(null)
    setDeleteConfirmId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setError(null)
  }

  async function handleSave(id: string) {
    const name = editName.trim()
    if (!name) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/strains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
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
      const res = await fetch(`/api/strains/${id}`, { method: 'DELETE' })
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

  if (strains.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No strains yet</h3>
        <p className="text-sm text-gray-500">Add a strain above to get started.</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <p className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100" role="alert">
          {error}
        </p>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Used in batches
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {strains.map((strain) => (
              <tr key={strain.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editingId === strain.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(strain.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      maxLength={50}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{strain.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {strain._count.batchStrains > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {strain._count.batchStrains} batch{strain._count.batchStrains !== 1 ? 'es' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === strain.id ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(strain.id)}
                        disabled={saving || !editName.trim()}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium min-h-[44px] inline-flex items-center disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium min-h-[44px] inline-flex items-center"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : deleteConfirmId === strain.id ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">Delete?</span>
                      <button
                        onClick={() => handleDelete(strain.id)}
                        disabled={deleting}
                        className="text-sm text-red-600 hover:text-red-800 font-medium min-h-[44px] inline-flex items-center disabled:opacity-50"
                      >
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium min-h-[44px] inline-flex items-center"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEdit(strain)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium min-h-[44px] inline-flex items-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteConfirmId(strain.id); setError(null) }}
                        disabled={strain._count.batchStrains > 0}
                        className="text-sm text-red-600 hover:text-red-800 font-medium min-h-[44px] inline-flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
                        title={strain._count.batchStrains > 0 ? 'Used in a batch — cannot delete' : undefined}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden space-y-3 p-4">
        {strains.map((strain) => (
          <div
            key={strain.id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            {editingId === strain.id ? (
              <div className="space-y-3">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleSave(strain.id)}
                    disabled={saving || !editName.trim()}
                    className="text-sm text-blue-600 font-medium min-h-[44px] inline-flex items-center disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-sm text-gray-500 font-medium min-h-[44px] inline-flex items-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900">{strain.name}</p>
                  {strain._count.batchStrains > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {strain._count.batchStrains} batch{strain._count.batchStrains !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                {deleteConfirmId === strain.id ? (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600">Delete?</span>
                    <button
                      onClick={() => handleDelete(strain.id)}
                      disabled={deleting}
                      className="text-sm text-red-600 font-medium min-h-[44px] inline-flex items-center disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-sm text-gray-500 font-medium min-h-[44px] inline-flex items-center"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => startEdit(strain)}
                      className="text-sm text-blue-600 font-medium min-h-[44px] inline-flex items-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteConfirmId(strain.id); setError(null) }}
                      disabled={strain._count.batchStrains > 0}
                      className="text-sm text-red-600 font-medium min-h-[44px] inline-flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
