---
phase: 03-gap-closure-auth-data
plan: 01
subsystem: auth
tags: [next-auth, middleware, react, security, weight-entry]

# Dependency graph
requires:
  - phase: 02-data-management-core
    provides: auth.ts authorize callback, WeightEntryRow/Form components, EditUserForm, middleware.ts
provides:
  - Deactivated-user login blocked at authorize level with distinct client error
  - Middleware matcher covers all actual API routes (/api/admin, /api/batches, /api/strains, /api/employees)
  - Weight entry edit updates row in-place instead of removing it
  - EditUserForm deactivation banner directs admin to user list for reactivation
affects: [04-employee-features, 05-reporting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Re-throw specific errors through try/catch: catch checks instanceof Error and rethrows named errors (AccountDeactivated)"
    - "onUpdated(entry | null) callback pattern: null signals deletion, object signals update in-place"

key-files:
  created: []
  modified:
    - src/lib/auth.ts
    - src/components/auth/LoginForm.tsx
    - src/middleware.ts
    - src/components/days/WeightEntryRow.tsx
    - src/components/days/WeightEntryForm.tsx
    - src/app/(dashboard)/admin/users/[id]/edit/EditUserForm.tsx

key-decisions:
  - "NextAuth v4 authorize re-throw pattern: throw AccountDeactivated inside try block, catch re-throws only that specific error to propagate to client"
  - "WeightEntryRow.tsx batchStrainId added to local EmployeeDayEntry interface to match PATCH API response shape"

patterns-established:
  - "Named error propagation through NextAuth: throw new Error('NAME') + catch rethrows by name"
  - "Update-or-remove callback: (item | null) => void where null = deletion, object = update-in-place"

requirements-completed: [AUTH-02, ADMIN-01, DATA-03]

# Metrics
duration: 8min
completed: 2026-03-26
---

# Phase 3 Plan 01: Gap Closure Auth and Data Summary

**Deactivated-user login blocked via named error re-throw in NextAuth authorize, middleware API routes hardened, weight-entry edit now updates in-place, EditUserForm reactivation message corrected**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-26T00:00:00Z
- **Completed:** 2026-03-26T00:08:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Deactivated users are blocked at the authorize level with a distinct "This account has been deactivated" error in the login form
- Middleware config.matcher now covers /api/admin/:path*, /api/batches/:path*, /api/strains/:path*, /api/employees/:path* — removing the dead /api/protected/:path* pattern
- WeightEntryRow onUpdated callback now passes updated entry data (or null for deletion) so WeightEntryForm can update the row in-place instead of removing it
- EditUserForm deactivation banner now says "Return to the user list and use the Reactivate button" instead of the misleading "not yet supported"

## Task Commits

Each task was committed atomically:

1. **Task 1: Block deactivated-user login and harden middleware API coverage** - `f439de2` (fix)
2. **Task 2: Fix weight-entry edit to update in-place and correct EditUserForm deactivation message** - `0e93493` (fix)

## Files Created/Modified
- `src/lib/auth.ts` - Added deactivatedAt check after password validation; re-throws AccountDeactivated error past outer catch
- `src/components/auth/LoginForm.tsx` - Distinguishes AccountDeactivated error from generic invalid credentials
- `src/middleware.ts` - Replaced /api/protected/:path* with /api/admin/:path*, /api/batches/:path*, /api/strains/:path*, /api/employees/:path*
- `src/components/days/WeightEntryRow.tsx` - onUpdated signature updated to (EmployeeDayEntry | null) => void; handleSave passes parsed JSON; handleDelete passes null; batchStrainId added to local interface
- `src/components/days/WeightEntryForm.tsx` - onUpdated callback branches on null (filter) vs object (map/replace in-place)
- `src/app/(dashboard)/admin/users/[id]/edit/EditUserForm.tsx` - Deactivation banner corrected to direct admin to user list for reactivation

## Decisions Made
- **Named error re-throw pattern:** NextAuth v4's authorize try/catch swallows all errors and returns null. The fix is to re-throw only the named error (`AccountDeactivated`) in the catch block so it propagates to the client. Generic errors still return null.
- **batchStrainId in WeightEntryRow interface:** The local EmployeeDayEntry in WeightEntryRow.tsx was missing batchStrainId relative to the parent form's interface. Adding it ensures TypeScript structural compatibility when passing the API response back via onUpdated.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added batchStrainId to WeightEntryRow local EmployeeDayEntry interface**
- **Found during:** Task 2 (weight-entry edit fix)
- **Issue:** TypeScript error TS2345 — WeightEntryRow's local EmployeeDayEntry lacked batchStrainId field, causing type incompatibility when passing updated entry to WeightEntryForm's setState
- **Fix:** Added batchStrainId: string to the local interface in WeightEntryRow.tsx to match the PATCH API response shape and WeightEntryForm's interface
- **Files modified:** src/components/days/WeightEntryRow.tsx
- **Verification:** npx tsc --noEmit exits 0
- **Committed in:** 0e93493 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type mismatch bug)
**Impact on plan:** Required for TypeScript correctness. No scope creep.

## Issues Encountered
- NextAuth v4 authorize's outer try/catch suppresses thrown errors — needed the re-throw pattern to propagate AccountDeactivated to the client rather than silently returning null.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All v1.0 milestone audit gaps closed
- Auth foundation is hardened: deactivated users blocked, API routes protected by middleware
- Weight entry edit UX is correct: in-place updates work as expected
- Phase 4 (employee-facing features) can build on this corrected foundation without carrying forward these defects

---
*Phase: 03-gap-closure-auth-data*
*Completed: 2026-03-26*
