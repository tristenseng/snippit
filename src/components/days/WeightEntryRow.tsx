'use client'

import { useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'

interface EmployeeDayEntry {
  id: string
  amount: number
  hours: number | null
  batchStrainId: string
  employee: { id: string; name: string | null }
}

interface WeightEntryRowProps {
  entry: EmployeeDayEntry
  batchId: string
  dayId: string
  onUpdated: (updatedEntry: EmployeeDayEntry | null) => void
}

export function WeightEntryRow({ entry, batchId, dayId, onUpdated }: WeightEntryRowProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [grams, setGrams] = useState(String(entry.amount))
  const [hours, setHours] = useState(entry.hours !== null ? String(entry.hours) : '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const endpoint = `/api/batches/${batchId}/days/${dayId}/entries/${entry.id}`

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(grams),
          hours: hours ? parseFloat(hours) : null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEditing(false)
        onUpdated(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (res.ok) {
        onUpdated(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-3 py-2 px-1 border-b border-gray-100 last:border-0">
      {/* Employee name */}
      <span className="flex-1 text-sm text-gray-900 font-medium min-w-0 truncate">
        {entry.employee.name ?? 'Unknown'}
      </span>

      {editing ? (
        <>
          <input
            type="number"
            value={grams}
            onChange={e => setGrams(e.target.value)}
            step="0.1"
            min="0"
            placeholder="0.0"
            className="w-24 text-base sm:text-sm border border-gray-300 rounded-md px-2 py-1 min-h-[44px] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            aria-label="Grams"
          />
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            step="0.1"
            min="0"
            placeholder="—"
            className="w-20 text-base sm:text-sm border border-gray-300 rounded-md px-2 py-1 min-h-[44px] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            aria-label="Hours"
          />
          <ActionButton variant="primary" onClick={handleSave} loading={saving} className="text-sm px-3">
            Save
          </ActionButton>
          <ActionButton variant="ghost" onClick={() => setEditing(false)} type="button" className="text-sm">
            Cancel
          </ActionButton>
        </>
      ) : (
        <>
          <span className="text-sm text-gray-700 w-20 text-right">{entry.amount}g</span>
          <span className="text-sm text-gray-500 w-16 text-right">
            {entry.hours !== null ? `${entry.hours}h` : '---'}
          </span>

          {/* Delete confirm or action icons */}
          {confirmDelete ? (
            <span className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">Remove?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:underline font-medium"
                type="button"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-600 hover:underline"
                type="button"
              >
                Keep Entry
              </button>
            </span>
          ) : (
            <div className="flex items-center gap-1">
              {/* Edit icon button */}
              <ActionButton
                variant="ghost"
                onClick={() => setEditing(true)}
                aria-label="Edit entry"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </ActionButton>
              {/* Delete icon button */}
              <ActionButton
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete entry"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </ActionButton>
            </div>
          )}
        </>
      )}
    </div>
  )
}
