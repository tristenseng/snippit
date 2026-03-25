---
phase: 02-data-management-core
plan: 01
subsystem: database
tags: [prisma, postgresql, jest, ts-jest, migrations, schema]

# Dependency graph
requires:
  - phase: 01-secure-foundation
    provides: User model with Role enum, NextAuth adapter models, Prisma client setup
provides:
  - Prisma schema with all Phase 2 models: Location, UserLocation, Strain, Batch, BatchStrain, Day, EmployeeDay
  - BatchStatus enum (INACTIVE, ACTIVE, COMPLETED)
  - User model extended with locationId, deactivatedAt, forcePasswordReset
  - Applied database migration with partial unique index (one ACTIVE batch per location)
  - Jest test infrastructure with ts-jest, Prisma mock, session mock
  - Stub test files for all Phase 2 API route groups and EmployeeAutocomplete component
affects:
  - 02-02 (batch management API — depends on Batch, Day models)
  - 02-03 (weight entry API — depends on EmployeeDay, BatchStrain models)
  - 02-04 (employee search — depends on User, UserLocation models)
  - 02-05 (admin user management — depends on User deactivatedAt, forcePasswordReset)
  - all phase 2 plans (depend on Jest test infrastructure)

# Tech tracking
tech-stack:
  added: [ts-jest, jest, ts-node, @types/jest]
  patterns:
    - Prisma partial unique index via raw SQL migration for conditional constraint
    - Jest Prisma mock via jest.mock('@/lib/prisma') with full model shape
    - Test stub pattern: trivially-passing stubs that get replaced per feature plan

key-files:
  created:
    - prisma/migrations/20260325021909_phase2_data_management/migration.sql
    - prisma/migrations/20260325021915_add_active_batch_unique_index/migration.sql
    - jest.config.ts
    - tests/setup.ts
    - tests/api/batches.test.ts
    - tests/api/days.test.ts
    - tests/api/entries.test.ts
    - tests/api/employees-search.test.ts
    - tests/api/admin-users.test.ts
    - tests/components/EmployeeAutocomplete.test.tsx
  modified:
    - prisma/schema.prisma
    - src/types/next-auth.d.ts
    - package.json

key-decisions:
  - "Partial unique index for one-active-batch constraint added via raw SQL in separate migration (not expressible in Prisma schema DSL)"
  - "Jest config uses setupFilesAfterEnv (not setupFilesAfterSetup as in plan — plan had typo)"
  - "ts-node added as dev dependency to support TypeScript jest.config.ts file"
  - "forcePasswordReset defaults to true — new users must change password on first login"

patterns-established:
  - "Test stubs: trivially-passing describe/it blocks replaced per feature plan — keeps test suite green at all times"
  - "Prisma mock: full model shape as unknown as PrismaClient, exported from tests/setup.ts for reuse"
  - "Jest moduleNameMapper mirrors tsconfig.json @/* path alias for consistent imports"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04, ADMIN-01]

# Metrics
duration: 4min
completed: 2026-03-25
---

# Phase 2 Plan 01: Schema Extension and Test Infrastructure Summary

**Prisma schema extended with 7 Phase 2 models (Location, Strain, Batch, BatchStrain, Day, EmployeeDay, UserLocation), migration applied with partial unique active-batch constraint, and Jest infrastructure with ts-jest running 13 green stub tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-25T02:18:33Z
- **Completed:** 2026-03-25T02:22:51Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Prisma schema extended with 7 new models and 3 User field additions (locationId, deactivatedAt, forcePasswordReset)
- Two-migration strategy: main data migration + separate raw SQL migration for partial unique index (one ACTIVE batch per location)
- Jest test infrastructure with ts-jest, Prisma mock, and next-auth session mock — 13 stub tests all pass green

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Prisma schema with Phase 2 models and run migration** - `fd4a697` (feat)
2. **Task 2: Set up Jest test infrastructure with config and API route test stubs** - `ecfbf4a` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `prisma/schema.prisma` - Extended with 7 new models, BatchStatus enum, User fields
- `prisma/migrations/20260325021909_phase2_data_management/migration.sql` - Main schema migration
- `prisma/migrations/20260325021915_add_active_batch_unique_index/migration.sql` - Partial unique index via raw SQL
- `src/types/next-auth.d.ts` - Added forcePasswordReset, activeRole, and JWT module augmentation
- `jest.config.ts` - ts-jest transform with @/ path alias mapping
- `tests/setup.ts` - Shared Prisma mock and next-auth session mock fixtures
- `tests/api/batches.test.ts` - Batch API stubs
- `tests/api/days.test.ts` - Day API stubs
- `tests/api/entries.test.ts` - Weight entry API stubs
- `tests/api/employees-search.test.ts` - Employee search API stubs
- `tests/api/admin-users.test.ts` - Admin users API stubs
- `tests/components/EmployeeAutocomplete.test.tsx` - EmployeeAutocomplete component stubs

## Decisions Made

- Partial unique index for one-ACTIVE-batch-per-location added via raw SQL migration — Prisma schema DSL cannot express conditional/partial unique indexes
- Jest config uses `setupFilesAfterEnv` (plan had typo `setupFilesAfterSetup`) — auto-fixed per Rule 1
- Added `ts-node` as dev dependency since jest.config.ts is TypeScript — required by Jest to parse TypeScript config files

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed typo in jest.config.ts: setupFilesAfterSetup -> setupFilesAfterEnv**
- **Found during:** Task 2 (Jest config creation)
- **Issue:** Plan specified `setupFilesAfterSetup` which is not a valid Jest Config key; correct key is `setupFilesAfterEnv`
- **Fix:** Used `setupFilesAfterEnv` in jest.config.ts
- **Files modified:** jest.config.ts
- **Verification:** `npx jest --no-coverage` exits 0 with setup.ts loaded
- **Committed in:** ecfbf4a (Task 2 commit)

**2. [Rule 3 - Blocking] Installed ts-node to support TypeScript jest.config.ts**
- **Found during:** Task 2 (first jest run)
- **Issue:** Jest requires ts-node to parse TypeScript config files; not in package.json
- **Fix:** Ran `npm install --save-dev ts-node`
- **Files modified:** package.json, package-lock.json
- **Verification:** Jest no longer errors on config parsing
- **Committed in:** ecfbf4a (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug/typo, 1 blocking dependency)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 2 models exist in the database — batch management API (Plan 02) can begin immediately
- Test stubs are in place; each feature plan will replace stubs with real tests
- Prisma client regenerated with all new types — TypeScript will enforce correct model usage throughout
