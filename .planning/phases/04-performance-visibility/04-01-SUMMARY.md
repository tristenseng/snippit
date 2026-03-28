---
phase: 04-performance-visibility
plan: "01"
subsystem: performance-data
tags: [performance, dashboard, data-layer, prisma, tdd]
dependency_graph:
  requires: []
  provides: [performance-data-layer, dashboard-production-card]
  affects: [src/app/(dashboard)/dashboard/page.tsx, src/lib/performance.ts]
tech_stack:
  added: []
  patterns: [pure-function-data-layer, tdd-red-green, server-component-data-fetch]
key_files:
  created:
    - src/lib/performance.ts
    - tests/performance.test.ts
  modified:
    - src/app/(dashboard)/dashboard/page.tsx
    - src/app/api/admin/users/[id]/deactivate/route.ts
    - src/app/api/admin/users/[id]/reactivate/route.ts
    - src/app/api/admin/users/[id]/route.ts
    - src/app/api/batches/[id]/route.ts
    - src/app/api/batches/[id]/days/route.ts
    - src/app/api/batches/[id]/activate/route.ts
    - src/app/api/batches/[id]/days/[dayId]/route.ts
    - src/app/api/batches/[id]/days/[dayId]/submit/route.ts
    - src/app/api/batches/[id]/days/[dayId]/entries/route.ts
    - src/app/api/batches/[id]/days/[dayId]/entries/[entryId]/route.ts
decisions:
  - "Pure data layer in performance.ts: all transformation functions are side-effect-free, enabling plan 02 to reuse them without modification"
  - "formatCalendarDate uses timeZone: UTC to prevent DST/timezone shifts in date offset arithmetic"
  - "getLatestSubmittedDay selects by highest batch.number then highest batchDay — aligns with business concept of most recent work"
  - "Dashboard role gate uses activeRole (not session.user.role) to respect admin context-switching"
metrics:
  duration: 6min
  completed: "2026-03-28"
  tasks_completed: 2
  files_changed: 13
---

# Phase 04 Plan 01: Performance Data Layer + Dashboard Card Summary

**One-liner:** Prisma-backed performance data layer with 9 unit-tested pure functions and a wired dashboard production card showing real gram totals per employee.

## What Was Built

### src/lib/performance.ts

Five exported pure functions and one async data-fetching function:

- `fetchEmployeePerformanceData(userId)` — Prisma query with `isSubmitted: true` and `employeeId` filters, full batch/strain includes
- `getLatestSubmittedDay(entries)` — Returns dashboard card data (totalGrams, dateLabel, dayNumber) for the highest batch.number + highest batchDay day; null if no entries
- `groupByBatch(entries)` — Groups and sums by batch, sorted by batchNumber descending; returns BatchSummary[]
- `groupByStrain(entries)` — Aggregates total grams per strain name; returns Map<string, number>
- `groupDaysByBatch(entries, batchId)` — Groups entries by dayId within a batch, sorts by dayNumber descending; returns DayDetail[]
- `formatCalendarDate(startDate, batchDay)` — Date offset arithmetic with UTC timezone; returns "March 3" or "Day N"

### tests/performance.test.ts

9 unit tests covering all behaviors specified in the plan:
- Empty array null return
- Multi-batch recency selection (highest batch.number)
- Amount summing across strains
- groupByBatch structure and sorting
- groupByBatch field contracts (batchNumber, totalGrams, startDateISO, endDateISO)
- groupByStrain cross-batch aggregation
- groupDaysByBatch sorting and strainEntries
- Date calculation: batchDay=3, startDate=March 1 → "March 3" (1-indexed, not 4)

### src/app/(dashboard)/dashboard/page.tsx

- Imports `Link` from next/link and both performance functions
- Role-gated fetch: `activeRole === Role.EMPLOYEE` guard before DB query
- Production card replaced with `<Link href="/performance">` wrapper
- Conditional render: gram total + date + day number OR "No data yet" empty state
- Projected earnings card untouched (Phase 5)
- Typography updated to `font-bold` per UI-SPEC (font-semibold removed)

## Decisions Made

1. **Pure function data layer:** All transformation logic is stateless and importable by Plan 02 without coupling.
2. **UTC timezone in formatCalendarDate:** `toLocaleDateString` with `timeZone: 'UTC'` prevents DST-induced date shifts when doing millisecond arithmetic on UTC-stored dates.
3. **activeRole for role gate:** Uses `activeRole || role` pattern, consistent with the rest of the codebase's admin context-switching support.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Next.js 15 async params type on 8 route files**

- **Found during:** Task 2 — `npx next build` verification
- **Issue:** Build was already failing (pre-existing) with: `Type "{ params: { id: string; }; }" is not a valid type for the function's second argument` across multiple route files. In Next.js 15, dynamic route `params` must be typed as `Promise<{ id: string }>` and awaited before use.
- **Files modified:** deactivate/route.ts, reactivate/route.ts, users/[id]/route.ts, batches/[id]/route.ts, batches/[id]/days/route.ts, batches/[id]/activate/route.ts, days/[dayId]/route.ts, days/[dayId]/submit/route.ts, days/[dayId]/entries/route.ts, days/[dayId]/entries/[entryId]/route.ts
- **Fix:** Changed all `{ params: { id: string } }` signatures to `{ params: Promise<{ id: string }> }` and added `const { id } = await params` at the top of each handler
- **Commit:** d279a10

## Self-Check: PASSED

- src/lib/performance.ts: FOUND
- tests/performance.test.ts: FOUND
- commit 55625f7: FOUND
- commit d279a10: FOUND
