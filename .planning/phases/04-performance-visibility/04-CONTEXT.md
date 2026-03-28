# Phase 4: Performance Visibility - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide employees with immediate visibility into their own daily gram production and historical performance trends. Commission calculation and team analytics are Phase 5. Employees can only see their own data — privacy enforced at query level.

</domain>

<decisions>
## Implementation Decisions

### Daily production card (dashboard)
- The existing "Today's production — —" placeholder card on the dashboard gets real data
- Shows the most recently submitted day (most recent Day where isSubmitted = true for this employee)
- Card displays: **total grams** for that day (sum across all strains) + **calendar date + day context** (e.g., "March 24 · Day 3")
- Multi-strain days: total grams only on the card — no strain breakdown at this level
- Tapping/clicking the card navigates to `/my-performance` for full history
- Empty state: simple "No data yet" text when no submitted days exist for this employee

### /my-performance page
- Dedicated route at `/my-performance` reached from the dashboard card
- Page is structured in three sections (top to bottom):
  1. **Recent batch** — current or most recent batch's days listed (all days of that batch shown before "View all")
  2. **Batch history cards** — one card per batch showing batch number, date range, and total grams
  3. **Strain totals section** — aggregate grams per strain across all batches (bottom of page)
- Day rows in the recent batch list: show `total grams · calendar date · Day N` per row
- Day rows are expandable (tap/click) to reveal per-strain breakdown: `Blue Dream: 142g, OG Kush: 89g`

### History and trends
- Raw numbers only — no day-over-day delta calculations or percentage comparisons
- Batch-to-batch comparison is implicit: employees read the batch history cards and see totals side by side
- No charting library needed — all data presented as lists and cards

### Data visibility gate
- Employees only see days where `Day.isSubmitted = true`
- Unsubmitted day data is never shown to employees — managers control visibility by submitting days

### Role switcher behavior
- When an Admin or Manager switches to Employee view via the role switcher, the performance pages show **their own** EmployeeDay entries
- Consistent with how the role switcher works — you see what an employee with your account would see

### Claude's Discretion
- Exact Tailwind styling, spacing, and typography for the /my-performance page
- Pagination/load-more strategy for very long batch histories
- Expand/collapse animation for strain breakdown rows
- Mobile touch targets and tap affordances

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value proposition, commission formula, privacy constraints, team context
- `.planning/REQUIREMENTS.md` — PERF-01 (daily gram production with strain context), PERF-02 (historical trends day-to-day and batch-to-batch)
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, dependency on Phase 2 data

### Prior Phase Context
- `.planning/phases/01-secure-foundation/01-CONTEXT.md` — Card-based layouts, mobile-first, dashboard-first, role switcher behavior
- `.planning/phases/02-data-management-core/02-CONTEXT.md` — Data schema decisions (EmployeeDay, Day.isSubmitted, BatchStrain, batch lifecycle), location scoping, privacy patterns

### Existing Code (key files)
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard with existing placeholder cards for "Today's production" and "Projected earnings" — Phase 4 fills the production card
- `prisma/schema.prisma` — EmployeeDay (amount, hours, employeeId, dayId, batchStrainId), Day (isSubmitted, batchDay), Batch (number, startDate, status), BatchStrain → Strain
- `src/lib/rbac.ts` — ROLE_PERMISSIONS, canManageBatches, role hierarchy
- `src/lib/auth.ts` — auth() helper, activeRole session pattern
- `prisma/rls-policies.sql` — RLS patterns for employee data isolation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/ActionButton.tsx` — Reusable button for navigation actions
- `src/components/auth/RoleGuard.tsx` — Role-based content gating (use to show employee sections only to employees/role-switched users)
- `src/components/batches/BatchCard.tsx` — Card pattern (stone-200 border, rounded-xl, hover shadow) — reuse this visual pattern for batch history cards
- Dashboard card pattern (bg-white rounded-xl border border-stone-200 p-5) — established card layout

### Established Patterns
- Server components fetch data directly via Prisma; mutations use API routes
- `auth()` helper + `activeRole ?? role` pattern for role-aware queries
- Mobile-first card-based layouts with stone/emerald color scheme
- `RoleGuard` wraps role-specific sections on the same page
- No client-side charting library installed — keep history as lists/cards (no new deps)
- Inline expand pattern established in Phase 2 (WeightEntryRow inline edit) — use same approach for strain breakdown expand

### Integration Points
- Dashboard `page.tsx` — The EMPLOYEE `RoleGuard` section already has placeholder cards; replace `—` with real data
- New route: `src/app/(dashboard)/my-performance/page.tsx`
- Navigation: add "My Performance" link to employee nav (check `src/components/navigation/MobileNav.tsx`)
- Data queries must filter by `session.user.id` as `employeeId` AND `Day.isSubmitted = true`
- `activeRole` determines which view to render — employees (and role-switched admins/managers) see their own data

</code_context>

<specifics>
## Specific Ideas

- Dashboard card shows: total grams for last submitted day + "March 24 · Day 3" format
- /my-performance sections order: recent batch days → batch history cards → strain totals
- "Recent batch" means the most recently active/completed batch — show all its days before any "View all"
- Day row expand reveals per-strain gram breakdown inline (like WeightEntryRow pattern)
- Aggregate strain totals section at bottom: "Blue Dream: 1,240g total across all batches"

</specifics>

<deferred>
## Deferred Ideas

- Projected commission earnings on dashboard — Phase 5 fills the existing "Projected earnings $—" card
- Team-wide performance statistics for managers/admins — Phase 5 (ADMIN-02)
- Real-time notifications when a day is submitted — explicitly v2 (ENH-01 in REQUIREMENTS.md)
- Personal best highlight or day-over-day delta indicators — could be added later if users want it

</deferred>

---

*Phase: 04-performance-visibility*
*Context gathered: 2026-03-27*
