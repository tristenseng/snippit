'use client'

import { useState, useCallback } from 'react'
import { EmployeeAutocomplete } from './EmployeeAutocomplete'
import { WeightEntryRow } from './WeightEntryRow'
import { ActionButton } from '@/components/ui/ActionButton'
import { InlineAlert } from '@/components/ui/InlineAlert'

interface EmployeeDayEntry {
  id: string
  amount: number
  hours: number | null
  employee: { id: string; name: string | null }
}

interface WeightEntryFormProps {
  batchId: string
  dayId: string
  batchDay: number
  strainName: string
  locationId: string
  entries: EmployeeDayEntry[]
  isSubmitted: boolean
}

export function WeightEntryForm({
  batchId,
  dayId,
  batchDay,
  strainName,
  locationId,
  entries: initialEntries,
  isSubmitted,
}: WeightEntryFormProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null)
  const [grams, setGrams] = useState('')
  const [hours, setHours] = useState('')
  const [entries, setEntries] = useState<EmployeeDayEntry[]>(initialEntries)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(isSubmitted)

  // IDs of employees already added to the current list
  const excludeIds = entries.map(e => e.employee.id)

  const handleEmployeeSelect = useCallback((emp: { id: string; name: string }) => {
    setSelectedEmployee(emp)
  }, [])

  async function handleAddEntry() {
    if (!selectedEmployee || !grams || parseFloat(grams) <= 0) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}/days/${dayId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          amount: parseFloat(grams),
          ...(hours ? { hours: parseFloat(hours) } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to add entry. Please try again.')
        return
      }
      const newEntry: EmployeeDayEntry = await res.json()
      setEntries(prev => [...prev, newEntry])
      setSelectedEmployee(null)
      setGrams('')
      setHours('')
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setAdding(false)
    }
  }

  async function handleSubmitDay() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}/days/${dayId}/submit`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to submit day. Please try again.')
        return
      }
      setSubmitted(true)
      setShowSubmitConfirm(false)
    } catch {
      setError('Unable to save. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const gramsFloat = parseFloat(grams)
  const canAddEntry = !!selectedEmployee && !isNaN(gramsFloat) && gramsFloat > 0

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <InlineAlert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Weight entry form (hidden when submitted) */}
      {!submitted && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Add Weight Entry</h3>

          {/* Employee autocomplete */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Employee
            </label>
            {selectedEmployee ? (
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-1 rounded-md">
                  {selectedEmployee.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  aria-label="Remove selected employee"
                >
                  &times;
                </button>
              </div>
            ) : (
              <EmployeeAutocomplete
                locationId={locationId}
                excludeIds={excludeIds}
                onSelect={handleEmployeeSelect}
              />
            )}
          </div>

          {/* Grams field */}
          <div className="space-y-1">
            <label htmlFor="grams-input" className="block text-sm font-medium text-gray-700">
              Grams <span className="text-red-500">*</span>
            </label>
            <input
              id="grams-input"
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              step="0.1"
              min="0"
              placeholder="0.0"
              className="w-full text-base sm:text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[44px] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Hours field (optional) */}
          <div className="space-y-1">
            <label htmlFor="hours-input" className="block text-sm font-medium text-gray-700">
              Hours <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="hours-input"
              type="number"
              value={hours}
              onChange={e => setHours(e.target.value)}
              step="0.1"
              min="0"
              placeholder="—"
              className="w-full text-base sm:text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[44px] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <ActionButton
            type="button"
            variant="primary"
            onClick={handleAddEntry}
            loading={adding}
            disabled={!canAddEntry}
          >
            Add Entry
          </ActionButton>
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Entries for Day {batchDay} — {strainName}
          </h3>

          {/* Submit Day button */}
          {!submitted && entries.length > 0 && !showSubmitConfirm && (
            <ActionButton
              type="button"
              variant="secondary"
              onClick={() => setShowSubmitConfirm(true)}
            >
              Submit Day
            </ActionButton>
          )}
        </div>

        {/* Inline submit confirmation */}
        {showSubmitConfirm && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 space-y-3">
            <p className="text-sm text-gray-700">
              Submit Day {batchDay}? Employees will see this data.
            </p>
            <div className="flex gap-2">
              <ActionButton
                type="button"
                variant="primary"
                onClick={handleSubmitDay}
                loading={submitting}
              >
                Submit Day
              </ActionButton>
              <ActionButton
                type="button"
                variant="ghost"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Keep Editing
              </ActionButton>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-base font-semibold text-gray-700">No entries for Day {batchDay}</p>
            <p className="text-sm text-gray-500 mt-1">
              Search for an employee to add the first weight entry.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {entries.map(entry => (
              <div key={entry.id} className="px-4">
                <WeightEntryRow
                  entry={entry}
                  batchId={batchId}
                  dayId={dayId}
                  onUpdated={(updatedEntry) => {
                    if (updatedEntry === null) {
                      setEntries(prev => prev.filter(e => e.id !== entry.id))
                    } else {
                      setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e))
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
