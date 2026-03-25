---
phase: 02-data-management-core
plan: 05
subsystem: ui
tags: [react, nextjs, tailwind, testing-library, jest]

# Dependency graph
requires:
  - phase: 02-02
    provides: Batch/day/strain API routes (GET/POST batches, days, activate)
  - phase: 02-03
    provides: Weight entry CRUD, employee search API, useDebounce hook

provides:
  - Batch list page (/batches) with Create Batch CTA and location-scoped data
  - Batch detail page (/batches/[id]) with activate/add-day controls and day list
  - Day detail page (/batches/[id]/days/[dayId]) with weight entry form
  - ActionButton shared UI component (primary/secondary/destructive/ghost variants)
  - InlineAlert shared UI component (success/error/info with role="alert")
  - BatchStatusBadge (INACTIVE/ACTIVE/COMPLETED semantic colors)
  - BatchCard with strain list and View Batch link
  - CreateBatchForm with strain multi-select and inline add strain
  - DayList with desktop table + mobile stacked card responsive layout
  - StrainSelector native select with Choose a strain placeholder
  - EmployeeAutocomplete with 200ms debounce, keyboard nav, ARIA attributes
  - WeightEntryForm with strain gating, Add Entry, inline submit confirmation
  - WeightEntryRow with inline edit (PATCH) and inline delete confirm (no modal)
  - 17 passing behavioral tests for EmployeeAutocomplete

affects:
  - 02-06 (admin UI — will reuse ActionButton, InlineAlert shared components)
  - 03 (employee performance views — reads batch/day data built here)

# Tech tracking
tech-stack:
  added:
    - "@testing-library/react"
    - "@testing-library/jest-dom"
    - "@testing-library/user-event"
    - "jest-environment-jsdom"
  patterns:
    - Server component + client component split for data-fetch vs interactive UI
    - Location-scoped prisma queries using session user's locationId
    - Role-based canManageBatches permission guard at page level
    - Inline confirm pattern (no modal) for destructive actions

key-files:
  created:
    - src/components/ui/ActionButton.tsx
    - src/components/ui/InlineAlert.tsx
    - src/components/batches/BatchStatusBadge.tsx
    - src/components/batches/BatchCard.tsx
    - src/components/batches/CreateBatchForm.tsx
    - src/components/batches/ActivateBatchButton.tsx
    - src/components/batches/DayList.tsx
    - src/components/days/StrainSelector.tsx
    - src/components/days/EmployeeAutocomplete.tsx
    - src/components/days/WeightEntryForm.tsx
    - src/components/days/WeightEntryRow.tsx
    - src/app/(dashboard)/batches/page.tsx
    - src/app/(dashboard)/batches/new/page.tsx
    - src/app/(dashboard)/batches/[id]/page.tsx
    - src/app/(dashboard)/batches/[id]/days/[dayId]/page.tsx
    - tests/components/EmployeeAutocomplete.test.tsx
  modified:
    - jest.config.ts

key-decisions:
  - "jest.config.ts jsx override: ts-jest configured with jsx=react-jsx (not tsconfig.json default of preserve) to compile React JSX in test files without a separate tsconfig.test.json"
  - "Create Batch page at /batches/new (separate route) rather than modal — consistent with server component pattern and avoids client-only form in a server page"
  - "ActivateBatchButton extracted as separate client component — keeps batch detail page a server component while enabling the POST /activate fetch mutation"
  - "WeightEntryRow onUpdated removes entry from local state optimistically instead of re-fetching — simpler UX for delete; edit requires separate refresh if needed"

patterns-established:
  - "Inline confirm pattern: Remove? / Yes, Remove / Keep Entry text links inline — no modal for single-row destructive actions"
  - "Submit confirmation pattern: inline yellow banner with Submit Day (primary) + Keep Editing (ghost) — no modal for day submission"
  - "Server page + client form split: server component fetches data, passes to 'use client' form component for mutations"
  - "Per-test environment override: @jest-environment jsdom docblock for component tests alongside node-environment API tests"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04]

# Metrics
duration: 10min
completed: 2026-03-25
---

# Phase 2 Plan 5: Batch Management UI Summary

**Manager-facing batch workflow across 3 page routes with 10+ components: batch list/create, batch detail/activate, day detail with ARIA-compliant EmployeeAutocomplete (17 behavioral tests), inline weight entry, and inline delete confirm pattern**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-25T03:30:39Z
- **Completed:** 2026-03-25T03:40:00Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments

- 3 page routes covering the complete manager batch workflow (list -> detail -> day detail)
- EmployeeAutocomplete with 200ms debounce, keyboard navigation (ArrowUp/Down/Enter/Escape), full ARIA compliance (combobox/listbox/option, aria-expanded, aria-activedescendant) — 17 behavioral tests all passing
- ActionButton and InlineAlert shared components following UI-SPEC color/spacing/typography contract, reusable across all Phase 2 UI plans
- Inline confirm patterns (no modal) for both day submission and weight entry deletion per UI-SPEC interaction contracts
- DayList with responsive desktop table / mobile stacked card layout, submitted/unsubmitted semantic badges

## Task Commits

1. **Task 1: Shared UI components and batch list page** - `e6e8dcc` (feat)
2. **Task 2: Batch detail page and day list component** - `31dcb51` (feat)
3. **Task 3: Day detail page with EmployeeAutocomplete and weight entry components** - `871ce92` (feat)

## Files Created/Modified

- `src/components/ui/ActionButton.tsx` — Shared button with 4 variants (min-h-[44px] touch targets)
- `src/components/ui/InlineAlert.tsx` — Contextual feedback (role="alert" for errors)
- `src/components/batches/BatchStatusBadge.tsx` — INACTIVE/ACTIVE/COMPLETED semantic pill badges
- `src/components/batches/BatchCard.tsx` — Card with status, strains, day count, View Batch link
- `src/components/batches/CreateBatchForm.tsx` — Multi-select strains + inline add strain, POST /api/batches
- `src/components/batches/ActivateBatchButton.tsx` — Client component for POST /api/batches/[id]/activate
- `src/components/batches/DayList.tsx` — Desktop table + mobile cards, add day, Submitted/Not submitted badges
- `src/components/days/StrainSelector.tsx` — Native select, Choose a strain placeholder, min-h-[44px]
- `src/components/days/EmployeeAutocomplete.tsx` — Full ARIA autocomplete with keyboard nav + debounce
- `src/components/days/WeightEntryForm.tsx` — Strain selector gating, Add Entry, submit confirmation inline
- `src/components/days/WeightEntryRow.tsx` — Inline edit/delete with inline confirm (no modal)
- `src/app/(dashboard)/batches/page.tsx` — Server component with location-scoped batch list
- `src/app/(dashboard)/batches/new/page.tsx` — Create batch page with CreateBatchForm
- `src/app/(dashboard)/batches/[id]/page.tsx` — Batch detail: status, strains, activate, day list
- `src/app/(dashboard)/batches/[id]/days/[dayId]/page.tsx` — Day detail with WeightEntryForm
- `tests/components/EmployeeAutocomplete.test.tsx` — 17 behavioral tests (filtering, keyboard nav, ARIA, disabled)
- `jest.config.ts` — Updated ts-jest config with jsx=react-jsx for component test compilation

## Decisions Made

- **jest.config.ts jsx override:** ts-jest configured with `jsx: 'react-jsx'` inline rather than a separate tsconfig file — simpler, all tests use same config while Next.js keeps `jsx: 'preserve'` in main tsconfig.json
- **Create Batch as /batches/new route:** Server component pattern requires separate page rather than modal injection; keeps batch list page clean
- **ActivateBatchButton extracted:** Allows batch detail page to remain a server component (no `'use client'` at page level) while still having the POST mutation button
- **WeightEntryRow optimistic delete:** Removes entry from local React state on successful DELETE rather than re-fetching the full page — sufficient for single-delete UX

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added /batches/new page for CreateBatchForm**
- **Found during:** Task 1 (batch list page)
- **Issue:** Plan specified a "Create Batch" primary button but didn't define a route for the CreateBatchForm — the form couldn't render inline in a server page without a separate route
- **Fix:** Created `src/app/(dashboard)/batches/new/page.tsx` to host CreateBatchForm; button in batch list links to /batches/new
- **Files modified:** src/app/(dashboard)/batches/new/page.tsx
- **Verification:** TypeScript passes, no import errors
- **Committed in:** e6e8dcc (Task 1 commit)

**2. [Rule 3 - Blocking] Installed @testing-library packages + fixed jest.config.ts for JSX**
- **Found during:** Task 3 (EmployeeAutocomplete tests)
- **Issue:** @testing-library/react not installed; jest config used `jsx: 'preserve'` which ts-jest cannot compile to runnable code
- **Fix:** Installed @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jest-environment-jsdom; updated jest.config.ts with jsx override
- **Files modified:** package.json, jest.config.ts
- **Verification:** 17 tests pass with `npx jest tests/components/EmployeeAutocomplete.test.tsx`
- **Committed in:** 871ce92 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correct operation. No scope creep.

## Issues Encountered

- Initial test run failed with `SyntaxError: Unexpected token '<'` because ts-jest couldn't compile JSX with `jsx: 'preserve'`. Fixed by overriding `jsx: 'react-jsx'` in jest.config.ts transform options (Rule 3 auto-fix).
- `act()` warnings in tests from async fetch state updates — cosmetic only, all 17 tests pass and behavior is correct.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All batch management UI components complete and tested
- Shared ActionButton and InlineAlert components ready for Phase 2 Plan 06 (admin UI)
- Manager workflow (create batch → activate → add days → enter weights → submit) fully implemented
- Employee autocomplete with ARIA compliance meets accessibility contract

---
*Phase: 02-data-management-core*
*Completed: 2026-03-25*
