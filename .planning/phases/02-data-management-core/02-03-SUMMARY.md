---
phase: 02-data-management-core
plan: 03
subsystem: api
tags: [prisma, next.js, zod, jest, weight-entries, employee-search, debounce]

# Dependency graph
requires:
  - phase: 02-01
    provides: Prisma schema with EmployeeDay, BatchStrain, Day, UserLocation models
provides:
  - GET/POST /api/batches/[id]/days/[dayId]/entries — weight entry list and create
  - PATCH/DELETE /api/batches/[id]/days/[dayId]/entries/[entryId] — weight entry update and delete
  - GET /api/employees/search?locationId=xxx — active employee autocomplete endpoint
  - src/lib/hooks/useDebounce.ts — reusable debounce hook for autocomplete inputs
affects:
  - 02-05-ui-weight-entry-form

# Tech tracking
tech-stack:
  added: []
  patterns:
    - verifyDayBelongsToBatch helper function for location-scoped day ownership checks
    - verifyEntryOwnership helper for chained entry → day → batch → location ownership validation
    - Zod positive().max() chained validation for weight amount bounds
    - batchStrain.findFirst with batchId filter to validate strain-batch membership

key-files:
  created:
    - src/app/api/batches/[id]/days/[dayId]/entries/route.ts
    - src/app/api/batches/[id]/days/[dayId]/entries/[entryId]/route.ts
    - src/app/api/employees/search/route.ts
    - src/lib/hooks/useDebounce.ts
  modified:
    - tests/api/entries.test.ts
    - tests/api/employees-search.test.ts

key-decisions:
  - "Employee search requires only session auth (no canManageBatches) — returned data is non-sensitive id+name"
  - "verifyEntryOwnership chains entry → day → batch → locationId to prevent cross-location access"
  - "batchStrain.findFirst({ where: { id, batchId } }) validates strain belongs to batch before creating entry"

patterns-established:
  - "Location-scoped ownership chain: entry owns dayId, day owns batchId, batch owns locationId — validate the full chain"
  - "Prisma findFirst with compound where for existence + membership checks"

requirements-completed: [DATA-03]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 02 Plan 03: Weight Entry CRUD and Employee Search Summary

**Weight entry CRUD (GET/POST/PATCH/DELETE) with strain-batch validation, employee search with deactivation filtering and location scoping, and useDebounce hook — 26 passing tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T00:38:14Z
- **Completed:** 2026-03-24T00:41:01Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Weight entry CRUD routes enforce location scoping via day → batch → locationId ownership chain
- POST validates strain belongs to batch before creating entry (prevents cross-batch data corruption)
- Employee search excludes deactivated employees and filters by userLocations join table
- useDebounce hook ready for Plan 05 autocomplete component

## Task Commits

Each task was committed atomically:

1. **Task 1: Weight entry CRUD API routes** - `21394ff` (feat)
2. **Task 2: Employee search API and useDebounce hook** - `50162ac` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/api/batches/[id]/days/[dayId]/entries/route.ts` - GET list + POST create weight entry
- `src/app/api/batches/[id]/days/[dayId]/entries/[entryId]/route.ts` - PATCH update + DELETE weight entry
- `src/app/api/employees/search/route.ts` - GET employee autocomplete search by locationId
- `src/lib/hooks/useDebounce.ts` - Reusable debounce hook with useState/useEffect
- `tests/api/entries.test.ts` - 18 tests covering CRUD, validation, auth
- `tests/api/employees-search.test.ts` - 8 tests covering deactivation filtering, location scoping, auth

## Decisions Made
- Employee search endpoint uses session auth only (no canManageBatches) — the data returned (id + name) is non-sensitive and needed by managers for weight entry. Consistent with the plan spec.
- The `verifyEntryOwnership` helper chains entry → day → batch → locationId for complete ownership verification on PATCH/DELETE, preventing cross-location data access.
- Used `batchStrain.findFirst({ where: { id: batchStrainId, batchId: params.id } })` to validate strain-batch membership with a single Prisma query.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Weight entry CRUD routes ready for Plan 05 UI integration
- Employee search endpoint ready for autocomplete component in Plan 05
- useDebounce hook exported and ready for import
- All 26 tests passing

---
*Phase: 02-data-management-core*
*Completed: 2026-03-24*
