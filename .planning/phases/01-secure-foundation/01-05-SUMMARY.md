---
phase: 01-secure-foundation
plan: 05
subsystem: ui
tags: [tailwind, mobile, rbac, dropdown, role-switcher]

# Dependency graph
requires:
  - phase: 01-secure-foundation
    provides: RBAC with Admin context switching and RoleSwitcher component
provides:
  - RoleSwitcher dropdown opens upward on mobile, all 3 role options fully visible
  - MobileNav footer allows dropdown to escape overflow clipping
affects: [ui, mobile-nav, admin-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "bottom-full mb-2 for upward-opening dropdowns in bottom-flush containers"
    - "z-[60] for dropdowns that must render above z-50 overlays"
    - "overflow-visible on parent to allow absolutely-positioned children to escape"

key-files:
  created: []
  modified:
    - src/components/auth/RoleSwitcher.tsx
    - src/components/navigation/MobileNav.tsx

key-decisions:
  - "Use bottom-full mb-2 instead of mt-2 — dropdown must open upward because it lives in a bottom-flush footer panel"
  - "z-[60] on dropdown to beat MobileNav overlay at z-50"
  - "overflow-visible on footer div so absolutely-positioned dropdown is not clipped"

patterns-established:
  - "Upward dropdown pattern: bottom-full mb-2 + z-[60] for footer-mounted popovers"

requirements-completed:
  - AUTH-04

# Metrics
duration: 1min
completed: 2026-03-22
---

# Phase 01 Plan 05: Admin RoleSwitcher Mobile Dropdown Fix Summary

**RoleSwitcher dropdown repositioned to open upward with z-[60], footer overflow-visible — all 3 role views now fully on-screen on mobile**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-22T19:39:25Z
- **Completed:** 2026-03-22T19:40:12Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Fixed dropdown direction from downward (mt-2) to upward (bottom-full mb-2) — prevents viewport overflow
- Raised z-index from z-10 to z-[60] so dropdown renders above the z-50 MobileNav overlay
- Added rotate-180 + transition-transform to chevron SVG for contextual visual feedback (points up when open)
- Added `overflow-visible relative` to the MobileNav footer container so the absolutely-positioned dropdown escapes parent clipping

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix RoleSwitcher dropdown to open upward with correct z-index** - `4edd3b3` (fix)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `src/components/auth/RoleSwitcher.tsx` - Dropdown changed to bottom-full mb-2, z-[60], chevron flips on open
- `src/components/navigation/MobileNav.tsx` - Footer container gains `relative overflow-visible`

## Decisions Made
- `bottom-full mb-2` chosen over alternatives (portal/fixed positioning) — simpler and correct for this use-case since the footer already has `relative` positioning
- `z-[60]` rather than `z-50` — must beat MobileNav overlay which uses `z-50`
- No changes to the overlay's own z-index to avoid disrupting existing stacking context

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- UAT Test 8 (Admin RoleSwitcher visibility) is ready for re-test — all 3 role options (Employee, Manager, Admin) should now render above the trigger button, fully within the 375px viewport
- Phase 01-secure-foundation complete pending final UAT verification sign-off

## Self-Check: PASSED

- RoleSwitcher.tsx: FOUND
- MobileNav.tsx: FOUND
- 01-05-SUMMARY.md: FOUND
- commit 4edd3b3: FOUND

---
*Phase: 01-secure-foundation*
*Completed: 2026-03-22*
