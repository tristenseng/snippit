---
phase: 02-data-management-core
plan: 04
subsystem: auth
tags: [next-auth, jwt, bcryptjs, admin, rbac, forcePasswordReset, prisma]

# Dependency graph
requires:
  - phase: 02-01
    provides: "Prisma schema with User model (forcePasswordReset field), UserLocation join table, migrations"
  - phase: 01-02
    provides: "NextAuth.js v4 credentials auth, JWT callbacks, TypeScript type augmentation"
provides:
  - "Admin user CRUD API (create, read, edit, deactivate) with RBAC enforcement"
  - "forcePasswordReset first-login flow: JWT reads flag at sign-in, middleware redirects, set-password page clears it"
  - "POST /api/admin/users — create user with hashed password and forcePasswordReset=true"
  - "GET/PATCH /api/admin/users/[id] — read/edit user, email NOT editable"
  - "POST /api/admin/users/[id]/deactivate — soft-delete via deactivatedAt"
  - "POST /api/auth/set-password — hash new password and clear forcePasswordReset"
  - "src/app/set-password — standalone page outside dashboard nav"
affects: [admin-ui, employee-ui, phase-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "canManageUsers RBAC gate on all admin user routes"
    - "bcryptjs hash(password, 12) for password creation/reset"
    - "prisma.$transaction for user create + userLocations createMany atomically"
    - "Zod schema deliberately excludes email to enforce no-edit policy"
    - "JWT callback DB read at sign-in for forcePasswordReset flag"
    - "session update({ forcePasswordReset: false }) triggers JWT update trigger"

key-files:
  created:
    - src/app/api/admin/users/route.ts
    - src/app/api/admin/users/[id]/route.ts
    - src/app/api/admin/users/[id]/deactivate/route.ts
    - src/app/api/auth/set-password/route.ts
    - src/app/set-password/page.tsx
    - src/app/set-password/layout.tsx
    - tests/api/admin-users.test.ts
  modified:
    - src/lib/auth.ts
    - src/middleware.ts

key-decisions:
  - "Email is NOT editable after account creation — Zod schema for PATCH excludes email field entirely"
  - "Employee role uses UserLocation join table (multi-location), Manager/Admin use locationId (single primary)"
  - "forcePasswordReset read from DB in JWT callback (not from authorize return) to ensure fresh DB state"
  - "authorize() now returns forcePasswordReset to satisfy User type augmentation in next-auth.d.ts"
  - "Middleware redirect to /set-password happens before admin role check to ensure password reset takes priority"

patterns-established:
  - "Admin routes always: getServerSession -> canManageUsers check -> business logic"
  - "Password fields always stripped from API responses via destructuring: const { password: _pw, ...sanitized } = user"
  - "Transaction pattern: tx.user.create + tx.userLocation.createMany for atomic user creation with locations"

requirements-completed: [ADMIN-01]

# Metrics
duration: 12min
completed: 2026-03-24
---

# Phase 02 Plan 04: Admin User Management + forcePasswordReset Flow Summary

**Admin CRUD API for user accounts (create with bcrypt hash, edit without email, soft-delete) and end-to-end forcePasswordReset first-login flow via JWT callback, middleware redirect, and set-password page**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-24T07:00:00Z
- **Completed:** 2026-03-24T07:12:00Z
- **Tasks:** 2 completed
- **Files modified:** 9 (6 created, 3 modified)

## Accomplishments

- 3 admin user API routes (list/create, detail/update, deactivate) enforcing canManageUsers RBAC
- forcePasswordReset flag flows from DB to JWT at sign-in, middleware redirects to /set-password before any dashboard access
- set-password page (standalone layout, no nav) lets users set their own password on first login
- POST /api/auth/set-password hashes new password and clears flag in DB
- 20 passing tests covering auth gates (401/403), validation (400/409), and business rules

## Task Commits

1. **Task 1: Admin user CRUD API routes** - `4a10abe` (feat)
2. **Task 2: forcePasswordReset JWT integration, middleware redirect, set-password page** - `a7236e1` (feat)

## Files Created/Modified

- `src/app/api/admin/users/route.ts` - GET list + POST create user with bcrypt hash and forcePasswordReset=true
- `src/app/api/admin/users/[id]/route.ts` - GET detail + PATCH update (email excluded from schema)
- `src/app/api/admin/users/[id]/deactivate/route.ts` - POST soft-delete via deactivatedAt timestamp
- `src/app/api/auth/set-password/route.ts` - POST hash new password, clear forcePasswordReset in DB
- `src/app/set-password/page.tsx` - Client form with password/confirm fields, session.update on success
- `src/app/set-password/layout.tsx` - Standalone layout (min-h-screen bg-gray-50, no dashboard nav)
- `tests/api/admin-users.test.ts` - 20 tests replacing stubs
- `src/lib/auth.ts` - JWT callback reads forcePasswordReset from DB, propagates to session; authorize returns forcePasswordReset
- `src/middleware.ts` - forcePasswordReset redirect before admin check; updated matcher includes /set-password and /batches/:path*

## Decisions Made

- **Email not editable:** PATCH Zod schema deliberately omits `email` field — no way for it to slip through even if passed in request body
- **Employee vs. Manager location model:** Employee uses UserLocation join table (many locations), Manager/Admin uses `locationId` (single primary) — matches schema structure from Plan 02-01
- **forcePasswordReset in authorize():** Added `forcePasswordReset: user.forcePasswordReset` to satisfy TypeScript User type augmentation (`src/types/next-auth.d.ts` requires it). The JWT callback still reads it fresh from DB for authoritative value.
- **Middleware priority:** forcePasswordReset redirect runs BEFORE admin role check to prevent leaking admin access during first-login

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript authorize() return type mismatch**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** `src/types/next-auth.d.ts` declares `forcePasswordReset: boolean` as required on User interface, but authorize() returned object without it — TypeScript error TS2322
- **Fix:** Added `forcePasswordReset: user.forcePasswordReset` to the return value in authorize()
- **Files modified:** src/lib/auth.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** a7236e1 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required fix for TypeScript compliance. forcePasswordReset is still correctly sourced from DB in JWT callback; the authorize return just satisfies the type contract.

## Issues Encountered

None beyond the auto-fixed TypeScript issue above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Admin user management API is complete and tested — ready for admin UI (Plan 02-05 or Phase 03)
- forcePasswordReset flow is end-to-end: DB flag → JWT → middleware → set-password page → DB clear
- All admin routes enforce ADMIN-only access via canManageUsers
- Password hashing pattern (bcrypt, 12 rounds) established for both create and reset

---
*Phase: 02-data-management-core*
*Completed: 2026-03-24*
