---
phase: quick-260330-dz7
plan: 01
subsystem: batch-management
tags: [ux, day-creation, strain, form, api, validation]
dependency_graph:
  requires: []
  provides: [editable-day-number-in-add-day-form, post-batchday-with-conflict-validation]
  affects: [DayList, POST /api/batches/[id]/days]
tech_stack:
  added: []
  patterns: [useEffect-reactive-state, zod-optional-field, prisma-findFirst-conflict-check]
key_files:
  created: []
  modified:
    - src/components/batches/DayList.tsx
    - src/app/api/batches/[id]/days/route.ts
decisions:
  - Pre-fill dayNumber via useEffect (not useMemo) so state can be independently edited by manager after strain selection
  - Reuse existing InlineAlert error path for 409 conflict — no extra client-side duplicate check needed
  - w-20 width for the number input keeps the form compact on mobile
metrics:
  duration: ~8 minutes
  completed_date: "2026-03-30"
  tasks: 2
  files_modified: 2
---

# Quick Task 260330-dz7: Day creation workflow - day 1 vs next day disambiguation - Summary

**One-liner:** Editable day number input pre-filled with per-strain next day (max+1), with 409 conflict enforcement on the POST route.

## What Was Built

### Task 1: Editable day number input in DayList add-day form
- Added `batchStrainId: string` to the `DayItem` interface so days can be filtered by strain client-side (the field is already returned by the server query — just wasn't typed)
- Added `computeNextDay(days, strainId)` helper: filters days by `batchStrainId`, takes max `batchDay`, adds 1 (defaults to 1 for no existing days)
- Added `dayNumber` state (default 1) updated via `useEffect` whenever `showForm` or `selectedStrainId` changes — this means changing the strain dropdown immediately updates the pre-filled number
- Added "Day #" label + `<input type="number" min={1}>` after the strain select in the form, styled consistently with existing controls
- Added `batchDay: dayNumber` to the POST body in `handleAddDay`
- Reset `dayNumber` to 1 on cancel

**Commit:** 11e9e2d

### Task 2: Optional batchDay in POST /api/batches/[id]/days with conflict validation
- Extended `createDaySchema` with `batchDay: z.number().int().min(1).optional()`
- When `batchDay` is provided, use it directly; when omitted, fall back to `nextDay` (auto-increment — existing behavior preserved)
- Added conflict check via `prisma.day.findFirst({ where: { batchId, batchStrainId, batchDay: requestedDay } })` before create
- Returns `{ error: "Day N already exists for this strain in this batch." }` with HTTP 409 on conflict — surfaces via existing `InlineAlert` error path in DayList

**Commit:** 175f948

## Deviations from Plan

None — plan executed exactly as written.

## Deferred Issues

- `src/app/api/batches/[id]/days/[dayId]/route.ts:42` — pre-existing TypeScript error (`batchStrain` not in `EmployeeDayInclude`) discovered but out of scope for this task. Existed before these changes.

## Self-Check

- [x] `src/components/batches/DayList.tsx` modified — confirmed
- [x] `src/app/api/batches/[id]/days/route.ts` modified — confirmed
- [x] Commit 11e9e2d exists
- [x] Commit 175f948 exists
- [x] Zero TypeScript errors in changed files (DayList.tsx, days/route.ts)

## Self-Check: PASSED
