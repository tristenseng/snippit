---
phase: 02-data-management-core
plan: "02"
subsystem: api
tags: [next.js, prisma, zod, nextauth, batch-management, api-routes]

# Dependency graph
requires:
  - phase: 02-01
    provides: Prisma schema with Batch, Day, BatchStrain, Strain models and Jest infrastructure
  - phase: 01-02
    provides: NextAuth.js auth with getServerSession, authOptions, ROLE_PERMISSIONS
provides:
  - POST /api/batches — create batch with auto-increment number per location, one-active enforcement
  - GET /api/batches — list batches scoped to manager's locationId
  - GET /api/batches/[id] — batch detail with batchStrains and days
  - PATCH /api/batches/[id] — update batch status to COMPLETED
  - POST /api/batches/[id]/activate — activate INACTIVE batch, set startDate
  - GET /api/batches/[id]/days — list days for batch ordered by batchDay
  - POST /api/batches/[id]/days — create day with auto-incremented batchDay
  - GET /api/batches/[id]/days/[dayId] — day detail with employeeDays and strain info
  - PATCH /api/batches/[id]/days/[dayId] — update day notes
  - POST /api/batches/[id]/days/[dayId]/submit — idempotent day submission
  - GET /api/strains — list all strains globally ordered by name
  - POST /api/strains — create strain with name and optional description
affects: [03-employee-performance, 05-manager-ui, phase-02-data-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getServerSession(authOptions) pattern for all API route auth checks"
    - "activeRole fallback: (session.user as any).activeRole ?? session.user.role"
    - "ROLE_PERMISSIONS[activeRole].canManageBatches for permission gating"
    - "Location scoping: admin bypasses, manager filtered by user.locationId"
    - "Auto-increment via findFirst orderBy desc + (last?.field ?? 0) + 1"
    - "jest.mock('@/lib/auth', () => ({ authOptions: {} })) to avoid ESM PrismaAdapter in tests"

key-files:
  created:
    - src/app/api/batches/route.ts
    - src/app/api/batches/[id]/route.ts
    - src/app/api/batches/[id]/activate/route.ts
    - src/app/api/batches/[id]/days/route.ts
    - src/app/api/batches/[id]/days/[dayId]/route.ts
    - src/app/api/batches/[id]/days/[dayId]/submit/route.ts
    - src/app/api/strains/route.ts
  modified:
    - tests/api/batches.test.ts
    - tests/api/days.test.ts

key-decisions:
  - "Mock @/lib/auth in tests (not next-auth directly) to avoid @auth/prisma-adapter ESM export error in Jest"
  - "Strains are global (no location scope) — GET /api/strains returns all strains for all users with valid session"
  - "Day submission is idempotent — submitted days remain fully editable per CONTEXT.md cannabis compliance requirement"
  - "ADMIN role bypasses location scope checks — admins can access any location's batches and days"

patterns-established:
  - "Auth check pattern: getServerSession → 401, ROLE_PERMISSIONS[activeRole].canManageBatches → 403, location scope → 404"
  - "Auto-increment pattern: findFirst with orderBy desc, take last value, add 1, default 0 if none"
  - "ESM mock pattern: jest.mock('@/lib/auth', ...) in test files importing Next.js API routes"

requirements-completed: [DATA-01, DATA-02, DATA-04]

# Metrics
duration: 7min
completed: 2026-03-25
---

# Phase 2 Plan 2: Data Management API Routes Summary

**7 Next.js App Router API routes for batch/day/strain management with getServerSession auth, canManageBatches RBAC, locationId scoping, Zod validation, and auto-increment logic — 22 passing tests**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-25T02:25:56Z
- **Completed:** 2026-03-25T02:32:40Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- 7 API route files covering full batch/day/strain CRUD lifecycle
- Auto-increment: batch number per location, batchDay per batch (findFirst orderBy desc + increment)
- One-active-batch-per-location enforced at application layer on POST and activate routes
- 22 passing tests covering 401 unauthorized, 403 forbidden, 409 conflict, 404 not found, and success cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Batch and Strain API routes** - `a8cd3ed` (feat)
2. **Task 2: Day API routes with creation, detail, and submission** - `7857867` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/app/api/batches/route.ts` - GET list + POST create batch with auto-increment and one-active check
- `src/app/api/batches/[id]/route.ts` - GET detail + PATCH update to COMPLETED
- `src/app/api/batches/[id]/activate/route.ts` - POST activate INACTIVE batch
- `src/app/api/batches/[id]/days/route.ts` - GET list + POST create day with auto-incremented batchDay
- `src/app/api/batches/[id]/days/[dayId]/route.ts` - GET day detail with employeeDays + PATCH notes
- `src/app/api/batches/[id]/days/[dayId]/submit/route.ts` - POST idempotent day submission
- `src/app/api/strains/route.ts` - GET all strains + POST create
- `tests/api/batches.test.ts` - 10 tests: auth, permissions, conflict, auto-increment
- `tests/api/days.test.ts` - 12 tests: auth, location scope, inactive batch, auto-increment, submit

## Decisions Made
- `jest.mock('@/lib/auth', ...)` pattern required in test files that import route handlers — avoids `@auth/prisma-adapter` ESM `export` syntax error in Jest's CommonJS transform pipeline
- Strains scoped globally (no locationId) — strain catalog is shared across all locations
- Day submission is idempotent by design: no status lock, submitted days remain editable for cannabis compliance
- ADMIN role bypasses all location scope checks for cross-location management

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added jest.mock for @/lib/auth to avoid ESM parse error**
- **Found during:** Task 1 (batches test execution)
- **Issue:** Importing API route in test caused `@auth/prisma-adapter` to load — this package uses ESM `export` syntax that ts-jest cannot parse by default
- **Fix:** Added `jest.mock('@/lib/auth', () => ({ authOptions: {} }))` in both test files so `src/lib/auth.ts` (which imports PrismaAdapter) is never loaded during test execution
- **Files modified:** tests/api/batches.test.ts, tests/api/days.test.ts
- **Verification:** Both test suites pass (22 tests total)
- **Committed in:** a8cd3ed (Task 1 commit), 7857867 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Required to make tests runnable. No scope creep — this is the correct Jest isolation pattern for Next.js API route testing.

## Issues Encountered
- `@auth/prisma-adapter` uses ESM-only `export function` syntax that Jest's ts-jest transform cannot handle when transitively imported through route handlers. Resolved by mocking `@/lib/auth` at the test boundary.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 7 API route files ready for consumption by the manager UI (Plan 05)
- Auth/permission/location patterns established and tested — consistent across all routes
- Employee day entry routes (Plan 03) can follow the same auth/location patterns
