'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface BatchStrainItem {
  id: string
  strain: { name: string }
}

interface DayItem {
  id: string
  batchDay: number
  batchStrainId: string
  batchStrain: { strain: { name: string } }
  isSubmitted: boolean
  _count?: { employeeDays: number }
}

interface DayListProps {
  days: DayItem[]
  batchId: string
  batchStatus: string
  batchStrains: BatchStrainItem[]
}

function computeNextDay(days: DayItem[], strainId: string): number {
  const strainDays = days.filter(d => d.batchStrainId === strainId)
  const maxBatchDay = days.length > 0 ? Math.max(...days.map(d => d.batchDay)) : 0
  if (strainDays.length === 0) return maxBatchDay === 0 ? 1 : maxBatchDay
  return Math.max(...strainDays.map(d => d.batchDay)) + 1
}

export function DayList({ days, batchId, batchStatus, batchStrains }: DayListProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedStrainId, setSelectedStrainId] = useState<string>(batchStrains[0]?.id ?? '')
  const [dayNumber, setDayNumber] = useState<number>(1)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (showForm && selectedStrainId) {
      setDayNumber(computeNextDay(days, selectedStrainId))
    }
  }, [showForm, selectedStrainId, days])

  async function handleAddDay() {
    if (!selectedStrainId) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchStrainId: selectedStrainId, batchDay: dayNumber }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to add day. Please try again.')
        return
      }
      window.location.reload()
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteDay(dayId: string) {
    setDeletingId(dayId)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}/days/${dayId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to delete day. Please try again.')
        return
      }
      window.location.reload()
    } catch {
      setError('Unable to delete. Please check your connection and try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <InlineAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Add Day controls for active batches */}
      {batchStatus === 'ACTIVE' && (
        <div className="flex justify-end">
          {showForm ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedStrainId}
                onChange={e => setSelectedStrainId(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                {batchStrains.map(bs => (
                  <option key={bs.id} value={bs.id}>{bs.strain.name}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">Day #</span>
              <input
                type="number"
                min={1}
                value={dayNumber}
                onChange={e => setDayNumber(Number(e.target.value))}
                className="w-20 text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <ActionButton variant="primary" onClick={handleAddDay} loading={adding} disabled={!selectedStrainId}>
                Add Day
              </ActionButton>
              <ActionButton variant="ghost" onClick={() => { setShowForm(false); setDayNumber(1) }}>
                Cancel
              </ActionButton>
            </div>
          ) : (
            <ActionButton variant="primary" onClick={() => setShowForm(true)}>
              Add Day
            </ActionButton>
          )}
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
                <th className="px-4 py-3">Strain</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {days.map(day => (
                <tr key={day.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Day {day.batchDay}</td>
                  <td className="px-4 py-3 text-gray-600">{day.batchStrain.strain.name}</td>
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
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/batches/${batchId}/days/${day.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      {!day.isSubmitted && (
                        <ActionButton
                          variant="ghost"
                          onClick={() => handleDeleteDay(day.id)}
                          loading={deletingId === day.id}
                        >
                          <span className="text-red-600 hover:text-red-800">Delete</span>
                        </ActionButton>
                      )}
                    </div>
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
                <div className="text-sm text-gray-600">{day.batchStrain.strain.name}</div>
                <div className="text-sm text-gray-500">
                  Entries: {day._count?.employeeDays ?? 0}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/batches/${batchId}/days/${day.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Day
                  </Link>
                  {!day.isSubmitted && (
                    <ActionButton
                      variant="ghost"
                      onClick={() => handleDeleteDay(day.id)}
                      loading={deletingId === day.id}
                    >
                      <span className="text-red-600 hover:text-red-800">Delete</span>
                    </ActionButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
