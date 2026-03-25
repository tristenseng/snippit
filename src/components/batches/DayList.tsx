'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface DayItem {
  id: string
  batchDay: number
  isSubmitted: boolean
  _count?: { employeeDays: number }
}

interface DayListProps {
  days: DayItem[]
  batchId: string
  batchStatus: string
}

export function DayList({ days, batchId, batchStatus }: DayListProps) {
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAddDay() {
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to add day. Please try again.')
        return
      }
      // Reload page to reflect new day
      window.location.reload()
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <InlineAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Add Day button for active batches */}
      {batchStatus === 'ACTIVE' && (
        <div className="flex justify-end">
          <ActionButton variant="primary" onClick={handleAddDay} loading={adding}>
            Add Day
          </ActionButton>
        </div>
      )}

      {days.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          {batchStatus === 'ACTIVE'
            ? 'Add your first day to start recording weights.'
            : 'No days recorded.'}
        </p>
      ) : (
        <>
          {/* Desktop table — hidden sm:table */}
          <table className="hidden sm:table w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Day #</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {days.map(day => (
                <tr key={day.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Day {day.batchDay}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {day._count?.employeeDays ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    {day.isSubmitted ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        Submitted
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        Not submitted
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/batches/${batchId}/days/${day.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile stacked cards — sm:hidden */}
          <div className="sm:hidden space-y-3">
            {days.map(day => (
              <div key={day.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Day {day.batchDay}</span>
                  {day.isSubmitted ? (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      Submitted
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      Not submitted
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Entries: {day._count?.employeeDays ?? 0}
                </div>
                <Link
                  href={`/batches/${batchId}/days/${day.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Day
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
