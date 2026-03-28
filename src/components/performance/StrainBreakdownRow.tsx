'use client'

import { useState } from 'react'

interface StrainEntry {
  strainName: string
  amount: number
}

interface StrainBreakdownRowProps {
  totalGrams: number
  dateLabel: string
  dayNumber: number
  strainEntries: StrainEntry[]
}

export function StrainBreakdownRow({ totalGrams, dateLabel, dayNumber, strainEntries }: StrainBreakdownRowProps) {
  const [expanded, setExpanded] = useState(false)
  const panelId = `strain-panel-${dayNumber}-${dateLabel.replace(/\s/g, '-')}`

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between px-4 min-h-[44px] active:bg-stone-50 transition-colors duration-150"
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-stone-900 tabular-nums">
            {totalGrams.toLocaleString('en-US')}g
          </span>
          <span className="text-sm text-stone-500">
            {dateLabel} &middot; Day {dayNumber}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-stone-400 transition-transform duration-200 will-change-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div id={panelId} className="pl-4 pt-2 pb-3 space-y-1 px-4">
          {strainEntries.map(e => (
            <div key={e.strainName} className="text-sm text-stone-600">
              {e.strainName}: {e.amount.toLocaleString('en-US')}g
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
