'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface Employee {
  id: string
  name: string
}

interface EmployeeAutocompleteProps {
  locationId: string
  excludeIds: string[]
  onSelect: (employee: Employee) => void
  disabled?: boolean
}

export function EmployeeAutocomplete({
  locationId,
  excludeIds,
  onSelect,
  disabled = false,
}: EmployeeAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = 'employee-autocomplete-listbox'

  const debouncedQuery = useDebounce(query, 200)

  // Fetch all active employees for this location on mount
  useEffect(() => {
    if (!locationId) return
    fetch(`/api/employees/search?locationId=${encodeURIComponent(locationId)}`)
      .then(res => res.ok ? res.json() : [])
      .then((data: Employee[]) => setAllEmployees(data))
      .catch(() => setAllEmployees([]))
  }, [locationId])

  // Filter based on debounced query + excluded IDs
  const filtered = allEmployees.filter(emp => {
    if (excludeIds.includes(emp.id)) return false
    if (!debouncedQuery) return true
    return emp.name.toLowerCase().startsWith(debouncedQuery.toLowerCase())
  })

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setOpen(true)
    setActiveIndex(-1)
  }, [])

  const handleSelect = useCallback((emp: Employee) => {
    onSelect(emp)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
  }, [onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown') {
        setOpen(true)
        setActiveIndex(0)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        handleSelect(filtered[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }, [open, filtered, activeIndex, handleSelect])

  const activeDescendant =
    open && activeIndex >= 0 && filtered[activeIndex]
      ? `employee-option-${filtered[activeIndex].id}`
      : undefined

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search employee by name..."
        disabled={disabled}
        className="w-full text-base sm:text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[44px] focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
      />

      {open && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400 italic">
              {debouncedQuery
                ? `No employees match '${debouncedQuery}'. Check spelling or add a new account.`
                : 'No employees available.'}
            </li>
          ) : (
            filtered.map((emp, index) => (
              <li
                key={emp.id}
                id={`employee-option-${emp.id}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={() => handleSelect(emp)}
                className={`px-3 py-2 text-sm cursor-pointer min-h-[44px] flex items-center ${
                  index === activeIndex ? 'bg-blue-50' : 'hover:bg-blue-50'
                }`}
              >
                {emp.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
