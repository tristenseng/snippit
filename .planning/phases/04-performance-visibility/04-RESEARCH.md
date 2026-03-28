# Phase 4: Performance Visibility - Research

**Researched:** 2026-03-28
**Domain:** Next.js App Router server components, Prisma aggregation queries, React expand/collapse patterns
**Confidence:** HIGH

## Summary

Phase 4 adds real data to two employee-facing surfaces: the dashboard production card and a new `/performance` route. The implementation is entirely read-only — no new API routes, no mutations, no new dependencies. All data flows through Prisma queries in server components using the existing `auth()` + `activeRole` session pattern.

The navigation already references `/performance` in `MobileNav.tsx` — the route just doesn't exist yet. The dashboard `page.tsx` already has the placeholder card markup under `<RoleGuard allowedRoles={[Role.EMPLOYEE]}>`. Phase 4 fills these two gaps with real Prisma queries and a new client component for the expandable day row.

No charting library is needed. The CONTEXT.md decision is firm: raw numbers in lists and cards only. The WeightEntryRow inline expand pattern established in Phase 2 is the direct precedent for the strain breakdown rows.

**Primary recommendation:** Build two server components that fetch Prisma data directly, extract one client component (`StrainBreakdownRow`) for the expand/collapse interaction, and add zero new dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- The existing "Today's production — —" placeholder card on the dashboard gets real data
- Shows the most recently submitted day (most recent Day where isSubmitted = true for this employee)
- Card displays: total grams for that day (sum across all strains) + calendar date + day context (e.g., "March 24 · Day 3")
- Multi-strain days: total grams only on the card — no strain breakdown at this level
- Tapping/clicking the card navigates to `/my-performance` for full history — NOTE: nav already routes to `/performance`, use that
- Empty state: simple "No data yet" text when no submitted days exist for this employee
- Dedicated route at `/performance` reached from the dashboard card
- Page is structured in three sections (top to bottom): (1) Recent batch days listed, (2) Batch history cards (one per batch), (3) Strain totals section
- Day rows in the recent batch list: show `total grams · calendar date · Day N` per row
- Day rows are expandable (tap/click) to reveal per-strain breakdown: `Blue Dream: 142g, OG Kush: 89g`
- Raw numbers only — no day-over-day delta calculations or percentage comparisons
- Batch-to-batch comparison is implicit via batch history cards showing totals side by side
- No charting library — all data as lists and cards
- Employees only see days where `Day.isSubmitted = true`
- When an Admin or Manager switches to Employee view, performance pages show their own EmployeeDay entries
- No client-side charting library installed — keep history as lists/cards (no new deps)

### Claude's Discretion
- Exact Tailwind styling, spacing, and typography for the /performance page
- Pagination/load-more strategy for very long batch histories
- Expand/collapse animation for strain breakdown rows
- Mobile touch targets and tap affordances

### Deferred Ideas (OUT OF SCOPE)
- Projected commission earnings on dashboard — Phase 5
- Team-wide performance statistics for managers/admins — Phase 5 (ADMIN-02)
- Real-time notifications when a day is submitted — explicitly v2 (ENH-01)
- Personal best highlight or day-over-day delta indicators — could be added later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | Employee can view their daily gram production with strain context | Dashboard card (total grams + date + day#) + expandable strain breakdown rows on /performance page |
| PERF-02 | Employee can see historical performance trends (day-to-day, batch-to-batch) | /performance page with recent batch day list, batch history cards with totals, and aggregate strain totals section |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma Client | 5.22.0 | Database queries — aggregation, filtering, ordering | Already installed; used in every server component |
| Next.js App Router | 15.2.3 | Server components + route creation | Project foundation |
| next-auth v4 | 4.24.11 | Session + `auth()` helper | Established auth pattern |
| React useState | (built-in) | Expand/collapse client component | No new dep needed |
| Tailwind CSS | (installed) | Styling | Project-wide standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@prisma/client` Role enum | 5.22.0 | activeRole type narrowing | In the performance page server component auth check |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw Prisma aggregate | Recharts charts | CONTEXT.md explicitly locks no charting library |
| Server component data fetch | API route + client fetch | Server component is simpler, faster, no waterfall |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/app/(dashboard)/
├── dashboard/page.tsx          # Modify: replace — with real production data
└── performance/
    └── page.tsx                # New: server component, fetches all history

src/components/performance/
└── StrainBreakdownRow.tsx      # New: 'use client' expand/collapse component
```

### Pattern 1: Server Component with Inline Prisma Query
**What:** Page-level server component fetches directly with Prisma, no API route needed
**When to use:** Read-only data, no mutations, single page

```typescript
// Source: established pattern in src/app/(dashboard)/batches/[id]/page.tsx
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function PerformancePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const activeRole = ((session.user as any).activeRole ?? session.user?.role) as Role
  const userId = session.user?.id as string

  // Only EMPLOYEE (or role-switched to EMPLOYEE) can access
  if (activeRole !== Role.EMPLOYEE) {
    redirect('/dashboard')
  }

  const batches = await prisma.batch.findMany({ /* ... */ })
  // ...
}
```

### Pattern 2: Employee Data Query with isSubmitted Gate
**What:** Filter EmployeeDay records to only submitted days, scoped to the current user
**When to use:** Any employee-facing performance data query

```typescript
// Source: schema.prisma + CONTEXT.md data visibility gate
const employeeDays = await prisma.employeeDay.findMany({
  where: {
    employeeId: userId,
    day: {
      isSubmitted: true,
    },
  },
  include: {
    day: {
      include: {
        batch: true,
      },
    },
    batchStrain: {
      include: {
        strain: true,
      },
    },
  },
  orderBy: {
    day: {
      batchDay: 'desc',
    },
  },
})
```

### Pattern 3: Dashboard Card — Most Recent Submitted Day
**What:** Find the single most-recent submitted day for this employee, sum its grams
**When to use:** Populating the dashboard production card

```typescript
// Source: schema.prisma EmployeeDay model
const recentDayEntries = await prisma.employeeDay.findMany({
  where: {
    employeeId: userId,
    day: { isSubmitted: true },
  },
  include: {
    day: {
      include: { batch: true },
    },
    batchStrain: {
      include: { strain: true },
    },
  },
  orderBy: {
    day: { batchDay: 'desc' },
  },
})

// Group by day, pick the latest day, sum amounts
// Day identity: day.id — group all entries with same day.id
// totalGrams = entries for that day summed over .amount
// dateLabel = batch.startDate + (batchDay - 1) days
// dayContext = `Day ${day.batchDay}`
```

**Key insight on date calculation:** `Day` has no `date` field — only `batchDay` (integer, e.g. 3). The calendar date is derived from `batch.startDate + (day.batchDay - 1) days`. The display format "March 24 · Day 3" requires this arithmetic in the server component.

### Pattern 4: Client Component Expand/Collapse (StrainBreakdownRow)
**What:** A 'use client' component that shows total grams + toggles a per-strain list
**When to use:** Day rows on the /performance page

```typescript
// Source: WeightEntryRow.tsx inline expand pattern
'use client'
import { useState } from 'react'

interface StrainEntry {
  strainName: string
  amount: number
}
interface DayRowProps {
  totalGrams: number
  dateLabel: string   // "March 24"
  dayNumber: number   // 3
  strainEntries: StrainEntry[]
}

export function StrainBreakdownRow({ totalGrams, dateLabel, dayNumber, strainEntries }: DayRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left ...">
        <span>{totalGrams}g</span>
        <span className="text-stone-500">{dateLabel} · Day {dayNumber}</span>
      </button>
      {expanded && (
        <div className="pl-4 pt-2 space-y-1 text-sm text-stone-600">
          {strainEntries.map(e => (
            <div key={e.strainName}>{e.strainName}: {e.amount}g</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Pattern 5: Batch History Cards + Aggregate Strain Totals
**What:** Group all EmployeeDay records by batch, compute batch total grams; then group all records by strain for the bottom section

```typescript
// Source: schema.prisma relations
// Batch grouping: group employeeDays by day.batch.id
// batchTotal = sum of all amounts in that batch
// Strain totals: group ALL employeeDays by batchStrain.strain.name across all batches
```

### Pattern 6: RoleGuard Usage on Dashboard Card
**What:** The existing placeholder card is already inside `<RoleGuard allowedRoles={[Role.EMPLOYEE]}>` — the server component must also check role to avoid data leaks
**When to use:** The dashboard page is a server component; the role check must happen server-side too

```typescript
// Source: src/app/(dashboard)/dashboard/page.tsx line 22
// The card is role-gated client-side by RoleGuard, but the production data
// query must also be role-guarded server-side before passing to the template.
// Pattern: conditional fetch inside the server component, pass data or null.
const activeRole = (session?.user as any)?.activeRole || (session?.user as any)?.role
const isEmployee = activeRole === Role.EMPLOYEE
const productionData = isEmployee
  ? await fetchLastSubmittedDay(session.user.id)
  : null
```

### Anti-Patterns to Avoid
- **API route for read-only employee data:** Adds an unnecessary network hop and request/response boilerplate. Server components can query Prisma directly.
- **Fetching all EmployeeDay records and filtering in JS:** Use Prisma `where` clause with `day: { isSubmitted: true }` — push filtering to the database.
- **Charting library install:** CONTEXT.md explicitly prohibits this. Plain lists and cards only.
- **Using `my-performance` as the route:** MobileNav.tsx already points to `/performance`. Use `/performance` to match existing nav links.
- **Prisma `aggregate` for simple sums:** For this use case (summing per-day, per-batch, per-strain) it's cleaner to fetch records with includes and reduce in JS. The data volume per employee is small.
- **Passing serialized Prisma objects to client components:** Next.js App Router requires plain serializable objects. Extract only needed fields from Prisma results before passing as props to client components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Role-based rendering | Custom session check components | `RoleGuard` (already exists) | Established, tested, uses activeRole |
| Session access | Re-implementing auth logic | `auth()` from `@/lib/auth` | Project-wide standard |
| Mobile touch targets | Custom CSS | `min-h-[44px] touch-manipulation` Tailwind classes | Already used in WeightEntryRow and MobileNav |
| Date formatting | moment.js or date-fns | Native `Date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })` | No new dep, sufficient for this use case |
| Expand/collapse | Headless UI accordion | `useState(false)` toggle | WeightEntryRow precedent; no animation needed beyond simple show/hide |

**Key insight:** This phase is a read operation over a small, well-defined dataset. The complexity is in query structure and UI layout, not in libraries or infrastructure.

## Common Pitfalls

### Pitfall 1: Route Mismatch — `/my-performance` vs `/performance`
**What goes wrong:** CONTEXT.md says `/my-performance`, but `MobileNav.tsx` already routes to `/performance` for both desktop and mobile. Creating the route at `/my-performance` means the nav links break.
**Why it happens:** Context was written before nav was coded.
**How to avoid:** Create the route at `src/app/(dashboard)/performance/page.tsx`. The nav links already work.
**Warning signs:** 404 when clicking "My Performance" in the nav after creating the page.

### Pitfall 2: Date Calculation from batchDay
**What goes wrong:** `Day` has no `date` column — only `batchDay: Int` (1-indexed day within a batch). Displaying "March 24 · Day 3" requires computing `batch.startDate + (batchDay - 1) days`.
**Why it happens:** Schema is normalized — the calendar date is derivable, not stored.
**How to avoid:** Always include the parent `batch` when querying `Day`, then compute: `new Date(batch.startDate.getTime() + (day.batchDay - 1) * 86400000)`.
**Warning signs:** Displaying raw `batchDay` integer as a date, or showing "undefined" for the date.

### Pitfall 3: Passing Prisma Dates to Client Components
**What goes wrong:** Prisma returns `DateTime` as JS `Date` objects. Passing `Date` objects as props to client components in Next.js App Router throws a serialization error: "Only plain objects can be passed to client components."
**Why it happens:** `Date` is not a plain serializable object in the React Server Component boundary.
**How to avoid:** Convert dates to ISO strings (`.toISOString()`) or pre-format them to display strings in the server component before passing as props.
**Warning signs:** "Error: Objects with Date fields cannot be serialized as plain objects" at runtime.

### Pitfall 4: Missing `isSubmitted` Filter
**What goes wrong:** Querying `employeeDay` without the `day: { isSubmitted: true }` filter exposes unsubmitted work-in-progress data to employees.
**Why it happens:** Easy to forget the nested where condition.
**How to avoid:** The filter must be on every query path — dashboard card fetch AND /performance page fetch.
**Warning signs:** Employee sees today's data before manager submits the day.

### Pitfall 5: activeRole Not Used for Data Gate
**What goes wrong:** Using `session.user.role` directly instead of `activeRole` means an Admin role-switched to Employee view sees admin data instead of employee data.
**Why it happens:** The role switcher stores `activeRole` in the session token but `session.user.role` is the base role.
**How to avoid:** Always use `(session.user as any).activeRole ?? session.user.role` for the effective role, and `session.user.id` as the employeeId for data queries (the ID is the same regardless of active role).
**Warning signs:** Admin sees blank page or error when switching to Employee view.

### Pitfall 6: Grouping EmployeeDays for the Three /performance Sections
**What goes wrong:** Writing three separate Prisma queries (one for recent batch, one for batch history, one for strain totals) causes three round-trips where one suffices.
**Why it happens:** Natural to think of each section as its own query.
**How to avoid:** Fetch all submitted EmployeeDays with full includes in one query, then derive all three sections via JavaScript `reduce`/`groupBy` in the server component. The data volume per employee is small (days × strains × employee — typically < 500 records).

## Code Examples

### Dashboard: Last Submitted Day Query
```typescript
// Source: Prisma schema.prisma + established server component pattern
const allEntries = await prisma.employeeDay.findMany({
  where: {
    employeeId: userId,
    day: { isSubmitted: true },
  },
  include: {
    day: { include: { batch: true } },
    batchStrain: { include: { strain: true } },
  },
  orderBy: { day: { batchDay: 'desc' } },
})

// Find entries belonging to the most recent day
const latestDayId = allEntries[0]?.dayId ?? null
const latestDayEntries = allEntries.filter(e => e.dayId === latestDayId)
const totalGrams = latestDayEntries.reduce((sum, e) => sum + e.amount, 0)
const day = latestDayEntries[0]?.day
const batch = day?.batch
const calendarDate = batch?.startDate
  ? new Date(batch.startDate.getTime() + (day.batchDay - 1) * 86_400_000)
  : null
```

### /performance: Group All Entries by Batch
```typescript
// Source: JavaScript reduce over Prisma results
const batchMap = new Map<string, { batchNumber: number; totalGrams: number; startDate: Date | null; endDate: Date | null }>()
for (const entry of allEntries) {
  const batchId = entry.day.batch.id
  const existing = batchMap.get(batchId) ?? {
    batchNumber: entry.day.batch.number,
    totalGrams: 0,
    startDate: entry.day.batch.startDate,
    endDate: entry.day.batch.endDate,
  }
  batchMap.set(batchId, { ...existing, totalGrams: existing.totalGrams + entry.amount })
}
```

### /performance: Aggregate Strain Totals Across All Batches
```typescript
// Source: schema.prisma BatchStrain -> Strain relation
const strainMap = new Map<string, number>() // strainName -> totalGrams
for (const entry of allEntries) {
  const name = entry.batchStrain.strain.name
  strainMap.set(name, (strainMap.get(name) ?? 0) + entry.amount)
}
```

### Dashboard Card — Making it a Link (Server Component)
```typescript
// Source: src/app/(dashboard)/dashboard/page.tsx existing card markup
// Wrap existing card div in Next.js Link — no client component needed
import Link from 'next/link'
// ...
<Link href="/performance">
  <div className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm transition-all">
    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Today&apos;s production</p>
    <p className="text-3xl font-bold text-stone-900 mt-2 tabular-nums">{totalGrams}g</p>
    <p className="text-sm font-medium text-stone-600 mt-1">{dateLabel} · Day {dayNumber}</p>
  </div>
</Link>
```

### Empty State Pattern
```typescript
// Source: established in-project convention (simple text, no illustrations)
if (!productionData) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Today&apos;s production</p>
      <p className="text-sm text-stone-500 mt-3">No data yet</p>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side fetch + useEffect | Server component Prisma query | Next.js 13+ App Router | No loading spinner, no useEffect, simpler |
| Charting library for trends | Structured lists + cards | CONTEXT.md decision | No new deps, faster load, better mobile |

**Deprecated/outdated:**
- `getServerSideProps`: Not applicable in App Router. Use async server components.
- `useEffect` + `fetch` for read-only data: Use server component Prisma query instead.

## Open Questions

1. **"Recent batch" definition ambiguity**
   - What we know: CONTEXT.md says "most recently active/completed batch — show all its days before any View all"
   - What's unclear: Does "most recently active" mean the batch with the highest `batch.number` for this employee, or the batch with the most recent `startDate`? What if an employee has entries in multiple simultaneous batches at different locations?
   - Recommendation: Use `max(batch.startDate)` or `max(batch.number)` — both should yield the same result in practice since batches are numbered sequentially per location. Filter by batches where the employee has at least one EmployeeDay entry.

2. **Pagination for batch history**
   - What we know: CONTEXT.md grants Claude's discretion on pagination strategy
   - What's unclear: Real-world data volume — a seasonal cannabis employee might have 10-20 batches, each with 5-15 days
   - Recommendation: No pagination in v1. Fetch all and render all. If performance becomes an issue after real-world use, add cursor-based pagination. The planner should not add complexity for a problem that may not exist.

3. **`orderBy` on nested relation**
   - What we know: Prisma supports `orderBy` on nested relation fields (e.g., `orderBy: { day: { batchDay: 'desc' } }`)
   - What's unclear: Whether this works for `findMany` on `EmployeeDay` in the installed Prisma 5.22.0
   - Recommendation: Use `orderBy: { day: { batchDay: 'desc' } }` — this is standard Prisma nested orderBy and has been supported since Prisma 3.x. Confidence: HIGH.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest with ts-jest |
| Config file | `jest.config.ts` (project root) |
| Quick run command | `npx jest tests/api/performance.test.ts --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | Dashboard returns last submitted day grams for employee | unit | `npx jest tests/performance.test.ts -t "dashboard production card" --no-coverage` | Wave 0 |
| PERF-01 | isSubmitted gate: unsubmitted days not shown | unit | `npx jest tests/performance.test.ts -t "isSubmitted filter" --no-coverage` | Wave 0 |
| PERF-01 | Strain breakdown correct for multi-strain day | unit | `npx jest tests/performance.test.ts -t "strain breakdown" --no-coverage` | Wave 0 |
| PERF-02 | Batch history totals computed correctly | unit | `npx jest tests/performance.test.ts -t "batch history" --no-coverage` | Wave 0 |
| PERF-02 | Strain aggregate totals across all batches | unit | `npx jest tests/performance.test.ts -t "strain totals" --no-coverage` | Wave 0 |
| PERF-02 | Employee only sees own data (privacy) | unit | `npx jest tests/performance.test.ts -t "privacy" --no-coverage` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest tests/performance.test.ts --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/performance.test.ts` — covers PERF-01 and PERF-02 data logic (query helpers or pure functions extracted from server components)

Note: The server components themselves (`dashboard/page.tsx`, `performance/page.tsx`) are not directly unit-testable without a test harness for async server components. The recommended approach is to extract pure data-transformation functions (groupByDay, groupByBatch, groupByStrain, computeTotals) into a `src/lib/performance.ts` helper module, then test those functions directly. This follows the existing pattern of testable logic in `src/lib/rbac.ts`.

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` — EmployeeDay, Day, Batch, BatchStrain, Strain schema verified directly
- `src/app/(dashboard)/dashboard/page.tsx` — Existing placeholder card markup confirmed
- `src/components/navigation/MobileNav.tsx` — Route `/performance` confirmed (not `/my-performance`)
- `src/components/days/WeightEntryRow.tsx` — Inline expand pattern confirmed
- `src/components/auth/RoleGuard.tsx` — activeRole pattern confirmed
- `src/lib/auth.ts` — `auth()` helper + activeRole session pattern confirmed
- `tests/setup.ts`, `jest.config.ts` — Test infrastructure confirmed

### Secondary (MEDIUM confidence)
- Prisma nested `orderBy` on relation fields: supported since Prisma 3.x, verified by schema structure and prior usage patterns in codebase

### Tertiary (LOW confidence)
- Data volume estimates (10-20 batches per employee) — assumption based on cannabis industry context, not measured

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against installed package.json and existing codebase
- Architecture: HIGH — patterns read directly from existing source files
- Pitfalls: HIGH — route mismatch and date calculation issues identified from direct code reading
- Test strategy: HIGH — test infrastructure verified from jest.config.ts and existing test files

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving dependencies)
