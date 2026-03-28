import {
  getLatestSubmittedDay,
  groupByBatch,
  groupByStrain,
  groupDaysByBatch,
  formatCalendarDate,
  type EmployeeDayWithRelations,
} from '@/lib/performance'

// ---------------------------------------------------------------------------
// Test fixture — 2 batches, 3 days, 2 strains
// ---------------------------------------------------------------------------

const BATCH_1_START = new Date('2026-03-01T00:00:00.000Z')
const BATCH_2_START = new Date('2026-03-15T00:00:00.000Z')

const makeEntry = (
  id: string,
  amount: number,
  batchId: string,
  batchNumber: number,
  batchDay: number,
  dayId: string,
  strainName: string,
  startDate: Date | null = BATCH_1_START,
  endDate: Date | null = null,
): EmployeeDayWithRelations => ({
  id,
  amount,
  hours: null,
  dayId,
  day: {
    id: dayId,
    batchDay,
    batchId,
    batch: {
      id: batchId,
      number: batchNumber,
      startDate,
      endDate,
    },
  },
  batchStrain: {
    strain: { name: strainName },
  },
})

// Batch 1 (number: 1), 2 days
const batch1day1_strain1 = makeEntry('e1', 100, 'batch-1', 1, 1, 'day-1-1', 'OG Kush', BATCH_1_START)
const batch1day1_strain2 = makeEntry('e2', 50, 'batch-1', 1, 1, 'day-1-1', 'Blue Dream', BATCH_1_START)
const batch1day2_strain1 = makeEntry('e3', 200, 'batch-1', 1, 2, 'day-1-2', 'OG Kush', BATCH_1_START)

// Batch 2 (number: 2), 1 day
const batch2day3_strain1 = makeEntry('e4', 300, 'batch-2', 2, 3, 'day-2-3', 'OG Kush', BATCH_2_START)
const batch2day3_strain2 = makeEntry('e5', 150, 'batch-2', 2, 3, 'day-2-3', 'Blue Dream', BATCH_2_START)

const ALL_ENTRIES: EmployeeDayWithRelations[] = [
  batch1day1_strain1,
  batch1day1_strain2,
  batch1day2_strain1,
  batch2day3_strain1,
  batch2day3_strain2,
]

// ---------------------------------------------------------------------------
// getLatestSubmittedDay
// ---------------------------------------------------------------------------

describe('getLatestSubmittedDay', () => {
  it('Test 1: returns null when entries array is empty', () => {
    const result = getLatestSubmittedDay([])
    expect(result).toBeNull()
  })

  it('Test 2: returns data for most recent day (highest batchDay from highest batch.number)', () => {
    const result = getLatestSubmittedDay(ALL_ENTRIES)
    expect(result).not.toBeNull()
    // Batch 2 (number 2) > Batch 1 (number 1). Day 3 is only day in batch 2.
    expect(result!.dayNumber).toBe(3)
  })

  it('Test 3: sums amounts correctly across multiple strain entries for the same day', () => {
    const result = getLatestSubmittedDay(ALL_ENTRIES)
    // batch2day3: 300 (OG Kush) + 150 (Blue Dream) = 450
    expect(result!.totalGrams).toBe(450)
  })
})

// ---------------------------------------------------------------------------
// groupByBatch
// ---------------------------------------------------------------------------

describe('groupByBatch', () => {
  it('Test 4: groups entries by batch.id, computes totalGrams per batch, sorts by batchNumber descending', () => {
    const result = groupByBatch(ALL_ENTRIES)
    expect(result).toHaveLength(2)
    // First entry should be batch 2 (higher number)
    expect(result[0].batchNumber).toBe(2)
    expect(result[1].batchNumber).toBe(1)
  })

  it('Test 5: returns batchNumber, totalGrams, startDateISO, endDateISO for each batch', () => {
    const result = groupByBatch(ALL_ENTRIES)
    const batch2 = result.find(b => b.batchNumber === 2)!
    expect(batch2).toBeDefined()
    expect(typeof batch2.batchId).toBe('string')
    expect(typeof batch2.totalGrams).toBe('number')
    // totalGrams for batch 2: 300 + 150 = 450
    expect(batch2.totalGrams).toBe(450)
    expect(batch2.startDateISO).toBe(BATCH_2_START.toISOString())
    expect(batch2.endDateISO).toBeNull()

    const batch1 = result.find(b => b.batchNumber === 1)!
    // totalGrams for batch 1: 100 + 50 + 200 = 350
    expect(batch1.totalGrams).toBe(350)
  })
})

// ---------------------------------------------------------------------------
// groupByStrain
// ---------------------------------------------------------------------------

describe('groupByStrain', () => {
  it('Test 6: aggregates amounts per strain name across all batches, returns Map<string, number>', () => {
    const result = groupByStrain(ALL_ENTRIES)
    expect(result).toBeInstanceOf(Map)
    // OG Kush: 100 + 200 + 300 = 600
    expect(result.get('OG Kush')).toBe(600)
    // Blue Dream: 50 + 150 = 200
    expect(result.get('Blue Dream')).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// groupDaysByBatch
// ---------------------------------------------------------------------------

describe('groupDaysByBatch', () => {
  it('Test 7: groups entries by dayId within a single batch, returns sorted by batchDay descending with strainEntries', () => {
    const result = groupDaysByBatch(ALL_ENTRIES, 'batch-1')
    expect(result).toHaveLength(2)
    // Sorted descending: day 2 first
    expect(result[0].dayNumber).toBe(2)
    expect(result[1].dayNumber).toBe(1)

    // Check totals
    expect(result[0].totalGrams).toBe(200) // day 2: only OG Kush
    expect(result[1].totalGrams).toBe(150) // day 1: 100 + 50

    // Check strainEntries
    expect(result[1].strainEntries).toHaveLength(2)
    const strainNames = result[1].strainEntries.map(s => s.strainName)
    expect(strainNames).toContain('OG Kush')
    expect(strainNames).toContain('Blue Dream')
  })
})

// ---------------------------------------------------------------------------
// formatCalendarDate
// ---------------------------------------------------------------------------

describe('formatCalendarDate', () => {
  it('Test 8: batch startDate 2026-03-01 + batchDay 3 = "March 3" (1-indexed, not March 4)', () => {
    // startDate is 2026-03-01. batchDay=3 means the 3rd day of the batch.
    // Offset = (3-1) * 86400000 = 2 days from March 1 → March 3
    const result = formatCalendarDate(new Date('2026-03-01T00:00:00.000Z'), 3)
    expect(result).toBe('March 3')
  })

  it('returns "Day N" when startDate is null', () => {
    const result = formatCalendarDate(null, 5)
    expect(result).toBe('Day 5')
  })
})
