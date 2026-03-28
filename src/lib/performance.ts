import { prisma } from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface EmployeeDayWithRelations {
  id: string
  amount: number
  hours: number | null
  dayId: string
  day: {
    id: string
    batchDay: number
    batchId: string
    batch: {
      id: string
      number: number
      startDate: Date | null
      endDate: Date | null
    }
  }
  batchStrain: {
    strain: {
      name: string
    }
  }
}

export interface DashboardCardData {
  totalGrams: number
  dateLabel: string   // e.g. "March 24"
  dayNumber: number   // e.g. 3
}

export interface BatchSummary {
  batchId: string
  batchNumber: number
  totalGrams: number
  startDateISO: string | null
  endDateISO: string | null
}

export interface DayDetail {
  dayId: string
  totalGrams: number
  dateLabel: string
  dayNumber: number
  strainEntries: { strainName: string; amount: number }[]
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

/**
 * Fetch all submitted EmployeeDay entries for a given employee, including
 * the day's batch info and the associated strain name.
 */
export async function fetchEmployeePerformanceData(
  userId: string,
): Promise<EmployeeDayWithRelations[]> {
  return prisma.employeeDay.findMany({
    where: {
      employeeId: userId,
      day: { isSubmitted: true },
    },
    include: {
      day: { include: { batch: true } },
      batchStrain: { include: { strain: true } },
    },
    orderBy: { day: { batchDay: 'desc' } },
  })
}

// ---------------------------------------------------------------------------
// Pure transformation functions
// ---------------------------------------------------------------------------

/**
 * Format a batch calendar date.
 * batchDay is 1-indexed: batchDay=1 is the start date itself.
 * Returns "Day N" when startDate is null.
 */
export function formatCalendarDate(startDate: Date | null, batchDay: number): string {
  if (!startDate) return `Day ${batchDay}`
  const date = new Date(startDate.getTime() + (batchDay - 1) * 86_400_000)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
}

/**
 * Return dashboard card data for the employee's most recently submitted day.
 * "Most recent" = highest batch.number, then within that batch the highest batchDay.
 * Returns null when there are no entries.
 */
export function getLatestSubmittedDay(
  entries: EmployeeDayWithRelations[],
): DashboardCardData | null {
  if (entries.length === 0) return null

  // Find the most recent batch (highest batch.number)
  const maxBatchNumber = Math.max(...entries.map(e => e.day.batch.number))
  const latestBatchEntries = entries.filter(e => e.day.batch.number === maxBatchNumber)

  // Within that batch, find the highest batchDay
  const maxBatchDay = Math.max(...latestBatchEntries.map(e => e.day.batchDay))

  // Filter entries for that specific day
  const dayEntries = latestBatchEntries.filter(e => e.day.batchDay === maxBatchDay)
  const representativeEntry = dayEntries[0]

  const totalGrams = dayEntries.reduce((sum, e) => sum + e.amount, 0)
  const dateLabel = formatCalendarDate(
    representativeEntry.day.batch.startDate,
    representativeEntry.day.batchDay,
  )

  return {
    totalGrams,
    dateLabel,
    dayNumber: representativeEntry.day.batchDay,
  }
}

/**
 * Group entries by batch, summing totalGrams per batch.
 * Returns array sorted by batchNumber descending.
 */
export function groupByBatch(entries: EmployeeDayWithRelations[]): BatchSummary[] {
  const map = new Map<string, BatchSummary>()

  for (const entry of entries) {
    const { id: batchId, number: batchNumber, startDate, endDate } = entry.day.batch
    const existing = map.get(batchId)
    if (existing) {
      existing.totalGrams += entry.amount
    } else {
      map.set(batchId, {
        batchId,
        batchNumber,
        totalGrams: entry.amount,
        startDateISO: startDate ? startDate.toISOString() : null,
        endDateISO: endDate ? endDate.toISOString() : null,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.batchNumber - a.batchNumber)
}

/**
 * Aggregate total grams per strain name across all entries.
 * Returns Map<strainName, totalGrams>.
 */
export function groupByStrain(entries: EmployeeDayWithRelations[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const entry of entries) {
    const name = entry.batchStrain.strain.name
    map.set(name, (map.get(name) ?? 0) + entry.amount)
  }

  return map
}

/**
 * Group entries for a specific batch by dayId, returning per-day summaries
 * sorted by dayNumber descending.
 */
export function groupDaysByBatch(
  entries: EmployeeDayWithRelations[],
  batchId: string,
): DayDetail[] {
  const batchEntries = entries.filter(e => e.day.batchId === batchId)
  const map = new Map<string, DayDetail>()

  for (const entry of batchEntries) {
    const { id: dayId, batchDay } = entry.day
    const existing = map.get(dayId)
    const strainEntry = { strainName: entry.batchStrain.strain.name, amount: entry.amount }

    if (existing) {
      existing.totalGrams += entry.amount
      existing.strainEntries.push(strainEntry)
    } else {
      map.set(dayId, {
        dayId,
        totalGrams: entry.amount,
        dateLabel: formatCalendarDate(entry.day.batch.startDate, batchDay),
        dayNumber: batchDay,
        strainEntries: [strainEntry],
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.dayNumber - a.dayNumber)
}
