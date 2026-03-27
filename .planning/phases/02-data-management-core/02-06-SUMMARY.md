---
phase: 02-data-management-core
plan: 06
subsystem: ui
tags: [react, nextjs, tailwind, admin, user-management]

# Dependency graph
requires:
  - phase: 02-04
    provides: Admin user CRUD API routes (GET/POST/PATCH /api/admin/users, POST /api/admin/users/[id]/deactivate)
  - phase: 02-05
    provides: ActionButton and InlineAlert shared UI components

provides:
  - Admin user management page at /admin/users (server component with Prisma queries)
  - UserTable responsive component (desktop table + mobile stacked cards)
  - UserRoleBadge role pill with ADMIN/MANAGER/EMPLOYEE semantic colors
  - CreateAccountModal with focus trap, form validation, success/error feedback
  - DeactivateConfirmDialog with destructive/ghost buttons and focus management
  - Edit user page at /admin/users/[id]/edit with read-only email, editable name/role/locations
  - FormSection fieldset/legend presentational wrapper

affects: [03-employee-dashboard, future-admin-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component fetches data, passes to 'use client' wrapper for interactive state
    - Modal focus trap: save triggerRef on open, restore on close, Escape key to dismiss
    - Inline client form component at same route path as server page for co-location

key-files:
  created:
    - src/app/(dashboard)/admin/users/page.tsx
    - src/app/(dashboard)/admin/users/UsersPageClient.tsx
    - src/app/(dashboard)/admin/users/[id]/edit/page.tsx
    - src/app/(dashboard)/admin/users/[id]/edit/EditUserForm.tsx
    - src/components/admin/UserTable.tsx
    - src/components/admin/UserRoleBadge.tsx
    - src/components/admin/CreateAccountModal.tsx
    - src/components/admin/DeactivateConfirmDialog.tsx
    - src/components/ui/FormSection.tsx
  modified: []

key-decisions:
  - "EditUserForm extracted as separate 'use client' file (not inline) — server component page.tsx cannot contain 'use client' directive; client components must be in separate files in Next.js App Router"
  - "DeactivateConfirmDialog uses native <button> with ref for focus management instead of ActionButton (which lacks forwardRef) — preserves focus trap without modifying shared component"
  - "Admin page header title passed as prop from server page to client component — enables server component to own page metadata while client component renders interactive UI"

patterns-established:
  - "Pattern: Server component renders client wrapper — page.tsx (server) fetches data, UsersPageClient.tsx ('use client') manages modal/dialog state and router.refresh()"
  - "Pattern: Responsive table — hidden sm:block desktop table + sm:hidden mobile stacked cards for data-heavy admin views"
  - "Pattern: Modal accessibility — fixed inset-0 z-50 overlay, triggerRef for focus return, Escape keydown listener with useEffect cleanup"

requirements-completed: [ADMIN-01]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 02 Plan 06: Admin User Management UI Summary

**Admin user table with role badges, create account modal, edit page with read-only email, and deactivate dialog using focus-trapped modals and server-component-to-client-wrapper architecture**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T03:42:39Z
- **Completed:** 2026-03-25T03:47:37Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Admin /admin/users page renders all users with role badges, location info, and active/deactivated status — defense-in-depth admin check beyond middleware
- CreateAccountModal handles focus trap, Escape to dismiss, role-conditional location UI (multi-select checkboxes for EMPLOYEE, single dropdown for MANAGER/ADMIN), 2-second success feedback before close
- Edit page shows read-only email with `bg-gray-100 cursor-not-allowed` styling, pre-fills all fields, PATCH submit with success redirect
- DeactivateConfirmDialog shows exact copywriting contract text, calls POST /api/admin/users/[id]/deactivate, refreshes list via router.refresh()

## Task Commits

Each task was committed atomically:

1. **Task 1: User table page with role badges and create account modal** - `c63b7c5` (feat)
2. **Task 2: Edit user page and deactivate confirmation dialog** - `e5e1412` (feat)

**Plan metadata:** `0c941ef` (docs: complete admin user management UI plan)

## Files Created/Modified
- `src/app/(dashboard)/admin/users/page.tsx` — Server component: auth guard, prisma.user.findMany + location fetch, renders UsersPageClient
- `src/app/(dashboard)/admin/users/UsersPageClient.tsx` — Client wrapper: modal open/close state, deactivate target state, router.refresh() on actions
- `src/app/(dashboard)/admin/users/[id]/edit/page.tsx` — Server component: auth guard, prisma.user.findUnique, notFound() guard, renders EditUserForm
- `src/app/(dashboard)/admin/users/[id]/edit/EditUserForm.tsx` — Client form: read-only email, editable name/role/locations, PATCH submit, success redirect
- `src/components/admin/UserTable.tsx` — Responsive: desktop table + mobile stacked cards, empty state, deactivated row muting
- `src/components/admin/UserRoleBadge.tsx` — ADMIN purple / MANAGER blue / EMPLOYEE gray role pills
- `src/components/admin/CreateAccountModal.tsx` — Focus-trapped modal with form validation, API POST, 2s success then close
- `src/components/admin/DeactivateConfirmDialog.tsx` — Focus-trapped confirmation dialog, destructive/ghost buttons, POST deactivate API
- `src/components/ui/FormSection.tsx` — Fieldset/legend presentational wrapper

## Decisions Made
- EditUserForm extracted as separate 'use client' file rather than inline — Next.js App Router requires 'use client' components to be in separate files from server components
- Used native `<button>` with ref for focus management in DeactivateConfirmDialog instead of ActionButton (lacks forwardRef) — avoids modifying shared component
- Admin page title "Admin Panel" passed as prop from server page to client component to keep server component as data owner

## Deviations from Plan

None - plan executed exactly as written. The "inline 'use client' component or separate file" language in the plan explicitly permitted the separate-file approach chosen.

## Issues Encountered
None — TypeScript compiled clean on first run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin user management UI complete; ADMIN-01 requirement fully satisfied
- Deactivated accounts remain in table with gray status badge per soft-delete design
- Ready for Phase 3 employee dashboard which will display performance data to employees

## Self-Check: PASSED

All 9 files created and verified on disk. Commits c63b7c5, e5e1412, 0c941ef exist in git history. TypeScript compiled clean with zero errors on all new files.
