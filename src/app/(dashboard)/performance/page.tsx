import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { fetchEmployeePerformanceData, groupByBatch, groupByStrain, groupDaysByBatch } from '@/lib/performance'
import { StrainBreakdownRow } from '@/components/performance/StrainBreakdownRow'

export default async function PerformancePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const activeRole = ((session.user as any).activeRole ?? session.user?.role) as Role
  if (activeRole !== Role.EMPLOYEE) redirect('/dashboard')

  const userId = session.user?.id as string

  let entries
  try {
    entries = await fetchEmployeePerformanceData(userId)
  } catch {
    return (
      <main className="space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-2xl font-bold tracking-tighter text-stone-900">My Performance</h2>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">Could not load your performance data. Try refreshing the page.</p>
        </div>
      </main>
    )
  }

  if (entries.length === 0) {
    return (
      <main className="space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-2xl font-bold tracking-tighter text-stone-900">My Performance</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-bold text-stone-900">No performance data yet</p>
          <p className="text-sm text-stone-500 mt-1 max-w-[280px]">Your data will appear here once your manager submits a day.</p>
        </div>
      </main>
    )
  }

  const batches = groupByBatch(entries)
  const recentBatch = batches[0]
  const recentBatchDays = groupDaysByBatch(entries, recentBatch.batchId)
  const olderBatches = batches.slice(1)
  const strainTotals = groupByStrain(entries)

  return (
    <main className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-2xl font-bold tracking-tighter text-stone-900">My Performance</h2>
      </div>

      {/* Section 1: Recent Batch */}
      <section>
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Recent Batch</h3>
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {recentBatchDays.map(day => (
            <StrainBreakdownRow
              key={day.dayId}
              totalGrams={day.totalGrams}
              dateLabel={day.dateLabel}
              dayNumber={day.dayNumber}
              strainEntries={day.strainEntries}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Batch History (only if older batches exist) */}
      {olderBatches.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Batch History</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {olderBatches.map(batch => (
              <div key={batch.batchId} className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-3">
                <p className="text-sm font-bold text-stone-900">Batch #{batch.batchNumber}</p>
                <p className="text-sm text-stone-500">
                  {batch.startDateISO ? new Date(batch.startDateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  {' – '}
                  {batch.endDateISO ? new Date(batch.endDateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ongoing'}
                </p>
                <p className="text-sm font-bold text-stone-900 tabular-nums">{batch.totalGrams.toLocaleString('en-US')}g total</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Strain Totals */}
      <section>
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Strain Totals</h3>
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 px-4">
          {Array.from(strainTotals.entries()).map(([name, total]) => (
            <div key={name} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-stone-900">{name}</span>
              <span className="text-sm tabular-nums text-stone-600">{total.toLocaleString('en-US')}g total across all batches</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
