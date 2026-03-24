# Phase 2: Data Management Core - Research

**Researched:** 2026-03-24
**Domain:** Prisma schema migrations, Next.js App Router API routes, autocomplete UX patterns, admin CRUD
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Database Schema (new tables)**
- `locations` — id, name (NN)
- `strains` — id, name (NN), description (nullable)
- `batches` — id, locationId (FK), number (int NN), status (enum: INACTIVE/ACTIVE/COMPLETED), startDate, endDate (nullable), completedAt (nullable)
- `batch_strains` — id, batchId (FK), strainId (FK) — join table replacing JSON array
- `days` — id, batchId (FK), batchDay (int), isSubmitted (bool), notes (nullable); unique constraint on (batchId, batchDay)
- `employees_days` — id, employeeId (FK → users), dayId (FK), batchStrainId (FK → batch_strains), amount (decimal grams), hours (decimal nullable)

**User model additions**
- `locationId` (FK → locations, nullable) — single location for Managers/Admins
- `deactivatedAt` (nullable timestamp) — soft delete
- `forcePasswordReset` (bool, default true) — set on account creation
- `user_locations` join table — employees can belong to multiple locations

**Location-based access control**
- Managers scoped to single location (locationId on user) — batch/day queries filter by manager's locationId
- Employees belong to multiple locations via user_locations
- Admins see all locations

**Batch lifecycle**
- Status enum: INACTIVE → ACTIVE → COMPLETED
- One active batch per location at a time
- Batch closure is two-step: submit individual days → manually submit batch
- Submitted days remain fully editable (no lock)

**Weight entry workflow**
- Search and add one employee at a time; manager searches by first name
- Strain is set per session; manager selects one strain from batch's strain list
- Entries show inline edit/delete before day submission
- Entry form on day detail view, accessed via batch → day navigation

**Admin user management**
- Admin can edit: first name, last name, role, location assignments
- Email is NOT editable after creation
- No admin password control
- Account creation: admin creates → forcePasswordReset = true
- Delete = soft delete: deactivatedAt timestamp set
- Deactivated employees excluded from autocomplete

### Claude's Discretion
- Exact first-name autocomplete implementation (client-side filter vs server search)
- Batch number auto-increment strategy (per location vs global)
- Form validation patterns and error states
- Navigation structure within the manager dashboard

### Deferred Ideas (OUT OF SCOPE)
- Employee self-service password reset
- Multi-location batch viewing for admins (cross-location analytics) — Phase 4
- Real-time notifications when a day is submitted — v2 (ENH-01)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | Manager can create batches with strain specification | Schema: batches + batch_strains + strains tables; batch creation API route with location scoping; strain multi-select UI |
| DATA-02 | Manager can create daily entries within batches | Schema: days table with batchDay int + isSubmitted bool; day creation API; batch → day navigation |
| DATA-03 | Manager can input employee weights with autocomplete search functionality | EmployeeAutocomplete component with 200ms debounce; employees_days table; first-name prefix filter on active employees |
| DATA-04 | Manager can submit completed days to notify employees of new data | isSubmitted flag on days table; submit day API route; inline confirmation UI pattern from UI-SPEC |
| ADMIN-01 | Admin can add, edit, and delete employee accounts | User management CRUD API routes; CreateAccountModal; soft-delete via deactivatedAt; forcePasswordReset flow integration |
</phase_requirements>

---

## Summary

Phase 2 adds the entire data layer on top of the Phase 1 auth foundation. The work splits cleanly into three pillars: (1) schema migration extending the existing Prisma `users` table and adding six new tables, (2) server-side API routes for batch/day/weight-entry CRUD with location-scoped filtering, and (3) client-side UI components for manager data entry and admin user management.

The most technically complex piece is the Prisma migration strategy. The existing `users` table must be altered (new nullable columns) while preserving the NextAuth adapter models. All new tables follow the foreign-key chain: `locations` → `users.locationId`; `batches.locationId` → `locations`; `batch_strains` → `batches` + `strains`; `days` → `batches`; `employees_days` → `days` + `users` + `batch_strains`. The unique constraint on `(batchId, batchDay)` and the one-active-batch-per-location rule both need DB-level enforcement plus app-level guards.

The autocomplete is the UX linchpin for DATA-03. Given the small employee list (cannabis trim crew, dozens not thousands), client-side filtering after a single fetch is the appropriate pattern — no need for server-side search. The `forcePasswordReset` flow for ADMIN-01 requires a middleware intercept that redirects to a password-set page before allowing any authenticated navigation.

**Primary recommendation:** Implement schema migration first (Wave 0), then API routes layer (Wave 1), then UI components (Wave 2). The schema is the dependency for everything else.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 5.22.0 (installed) | ORM + migrations | Already installed; schema already established |
| Next.js App Router | 15.2.3 (installed) | Server components + API routes | Already installed; App Router pattern established in Phase 1 |
| next-auth v4 | 4.24.11 (installed) | Session access in API routes | Already installed; getServerSession pattern locked |
| Zod | 3.23.8 (installed) | Request body validation | Already installed; used in auth.ts for login validation |
| bcryptjs | 2.4.3 (installed) | Password hashing for new accounts | Already installed |
| Tailwind CSS | 3.4.17 (installed) | Component styling | Already installed; raw Tailwind is the project pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @prisma/client | 5.22.0 (installed) | Generated DB client | Every DB query; singleton at src/lib/prisma.ts |
| TypeScript | 5.8.2 (installed) | Type safety | All new files; strict mode |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side autocomplete filter | Server-side search API | Server search adds round-trip latency; unnecessary for small employee lists (< 200 people) |
| Prisma migration | Raw SQL ALTER TABLE | Prisma migration keeps schema.prisma as source of truth; raw SQL bypasses type generation |
| Inline confirmation (delete/submit) | Modal dialogs | Modals add focus-trap complexity; UI-SPEC locks inline confirmation for weight entry delete and day submit |

**Installation:** No new packages required. All dependencies already installed.

**Version verification (confirmed against npm registry 2026-03-24):**
- `zod` latest: 3.24.x (project has 3.23.8 — compatible, no breaking changes in patch range)
- `prisma` latest: 6.x (project pins 5.22.0 — do NOT upgrade; Prisma 6 has breaking API changes)
- `next` latest: 15.x (project has 15.2.3 — current)

---

## Architecture Patterns

### Recommended Project Structure
```
prisma/
├── schema.prisma          # Extended with 6 new models
└── migrations/
    └── YYYYMMDD_phase2/   # Single migration for all new tables

src/app/
├── (dashboard)/
│   ├── batches/
│   │   ├── page.tsx                    # Batch list (server component)
│   │   ├── [id]/
│   │   │   ├── page.tsx                # Batch detail (server component)
│   │   │   └── days/
│   │   │       └── [dayId]/
│   │   │           └── page.tsx        # Day detail / weight entry (server component)
│   └── admin/
│       └── users/
│           ├── page.tsx                # User table (server component)
│           └── [id]/
│               └── edit/
│                   └── page.tsx        # Edit user form (server component)
└── api/
    ├── batches/
    │   ├── route.ts                    # GET list, POST create
    │   └── [id]/
    │       ├── route.ts                # GET, PATCH (status)
    │       ├── activate/
    │       │   └── route.ts            # POST — INACTIVE → ACTIVE
    │       └── days/
    │           ├── route.ts            # GET list, POST create
    │           └── [dayId]/
    │               ├── route.ts        # GET, PATCH
    │               ├── submit/
    │               │   └── route.ts    # POST — submit day
    │               └── entries/
    │                   ├── route.ts    # GET list, POST create weight entry
    │                   └── [entryId]/
    │                       └── route.ts # PATCH, DELETE
    ├── admin/
    │   └── users/
    │       ├── route.ts                # GET list, POST create
    │       └── [id]/
    │           ├── route.ts            # GET, PATCH
    │           └── deactivate/
    │               └── route.ts        # POST — soft delete
    └── employees/
        └── search/
            └── route.ts                # GET — autocomplete endpoint

src/components/
├── batches/
│   ├── BatchCard.tsx
│   ├── BatchStatusBadge.tsx
│   ├── CreateBatchForm.tsx
│   └── DayList.tsx
├── days/
│   ├── WeightEntryRow.tsx
│   ├── EmployeeAutocomplete.tsx
│   ├── StrainSelector.tsx
│   └── WeightEntryForm.tsx
├── admin/
│   ├── UserTable.tsx
│   ├── UserRoleBadge.tsx
│   ├── CreateAccountModal.tsx
│   └── DeactivateConfirmDialog.tsx
└── ui/
    ├── ActionButton.tsx
    ├── FormSection.tsx
    └── InlineAlert.tsx

src/lib/
└── prisma.ts              # Existing singleton — no changes needed
```

### Pattern 1: Location-Scoped Server Component Data Fetching
**What:** Server components fetch data with the authenticated manager's locationId baked into the Prisma where clause.
**When to use:** All batch, day, and weight-entry list pages.

```typescript
// Source: established pattern in src/app/(dashboard)/layout.tsx + src/lib/auth.ts
// src/app/(dashboard)/batches/page.tsx
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function BatchesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id
  const manager = await prisma.user.findUnique({
    where: { id: userId },
    select: { locationId: true, role: true }
  })

  if (!manager?.locationId) {
    // Manager not yet assigned to a location
    return <NoLocationAssigned />
  }

  const batches = await prisma.batch.findMany({
    where: { locationId: manager.locationId },
    include: { batchStrains: { include: { strain: true } } },
    orderBy: { number: 'desc' }
  })

  return <BatchList batches={batches} />
}
```

### Pattern 2: API Route with Session + Zod Validation
**What:** Every mutating API route validates session, checks role permission via ROLE_PERMISSIONS, validates body with Zod, then writes to DB.
**When to use:** All POST/PATCH/DELETE routes.

```typescript
// Source: established pattern from src/lib/auth.ts + src/lib/rbac.ts
// src/app/api/batches/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLE_PERMISSIONS } from "@/lib/rbac"
import { z } from "zod"
import type { Role } from "@prisma/client"

const createBatchSchema = z.object({
  strainIds: z.array(z.string().cuid()).min(1, "At least one strain required"),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const activeRole = (session.user as any).activeRole as Role
  if (!ROLE_PERMISSIONS[activeRole]?.canManageBatches) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const result = createBatchSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const manager = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { locationId: true }
  })
  if (!manager?.locationId) {
    return NextResponse.json({ error: "Manager has no location assigned" }, { status: 422 })
  }

  // One active batch per location check
  const existingActive = await prisma.batch.findFirst({
    where: { locationId: manager.locationId, status: 'ACTIVE' }
  })
  if (existingActive) {
    return NextResponse.json({ error: "A batch is already active for this location" }, { status: 409 })
  }

  // Auto-increment batch number per location
  const lastBatch = await prisma.batch.findFirst({
    where: { locationId: manager.locationId },
    orderBy: { number: 'desc' },
    select: { number: true }
  })
  const nextNumber = (lastBatch?.number ?? 0) + 1

  const batch = await prisma.batch.create({
    data: {
      locationId: manager.locationId,
      number: nextNumber,
      status: 'INACTIVE',
      batchStrains: {
        create: result.data.strainIds.map(strainId => ({ strainId }))
      }
    },
    include: { batchStrains: { include: { strain: true } } }
  })

  return NextResponse.json(batch, { status: 201 })
}
```

### Pattern 3: Client-Side Autocomplete with Controlled Input
**What:** Single fetch of active employees for current location on component mount; filter client-side as user types.
**When to use:** EmployeeAutocomplete component.

```typescript
// Source: UI-SPEC interaction contract — 200ms debounce, 1 char min, keyboard nav
// src/components/days/EmployeeAutocomplete.tsx
'use client'
import { useEffect, useState, useRef } from "react"
import { useDebounce } from "@/lib/hooks/useDebounce"  // write this hook

interface Employee { id: string; name: string | null }

export function EmployeeAutocomplete({
  locationId,
  excludeIds,
  onSelect,
}: {
  locationId: string
  excludeIds: string[]
  onSelect: (emp: Employee) => void
}) {
  const [query, setQuery] = useState("")
  const [all, setAll] = useState<Employee[]>([])
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    fetch(`/api/employees/search?locationId=${locationId}`)
      .then(r => r.json())
      .then(setAll)
  }, [locationId])

  const filtered = debouncedQuery.length >= 1
    ? all.filter(e =>
        e.name?.toLowerCase().startsWith(debouncedQuery.toLowerCase()) &&
        !excludeIds.includes(e.id)
      )
    : []

  // ... keyboard navigation, aria-activedescendant, role="listbox"
}
```

### Pattern 4: forcePasswordReset Middleware Intercept
**What:** Middleware checks `forcePasswordReset` flag from session; redirects to `/set-password` before any dashboard access.
**When to use:** Required for ADMIN-01 account creation flow.

```typescript
// Source: established middleware pattern from src/middleware.ts (Phase 1)
// Add to existing middleware matcher logic:
// If session.user.forcePasswordReset === true and pathname !== '/set-password'
// → redirect to '/set-password'
```

Note: `forcePasswordReset` must be added to the JWT token payload and session type augmentation in `src/types/next-auth.d.ts`.

### Anti-Patterns to Avoid
- **Fetching employees in every keystroke:** Causes waterfall requests and rate-limit risk. Fetch once on mount, filter client-side.
- **Using JSON.parse on Prisma Decimal:** Prisma returns `Decimal` objects for `@db.Decimal` fields. Serialize via `.toFixed(1)` or cast in select with `amount: true` and convert in response.
- **Checking `role` instead of `activeRole` for permissions:** The admin role-switching feature means `activeRole` is the operative permission. Always use `(session.user as any).activeRole ?? session.user.role`.
- **Running two separate migrations for User alterations and new tables:** Combine all schema changes in one migration to avoid foreign-key ordering issues.
- **Not excluding deactivated employees from autocomplete:** The `employees/search` API MUST include `deactivatedAt: null` in the where clause.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request body validation | Custom type guards | Zod `.safeParse()` (already installed) | Error formatting, type inference, already established in auth.ts |
| Password hashing (new accounts) | Custom hash function | bcryptjs (already installed) | Timing-safe comparison, already used in login |
| DB migrations | Manual ALTER TABLE SQL | `prisma migrate dev` | Keeps schema.prisma in sync with DB; auto-generates types |
| Session reads in API routes | Decode JWT manually | `getServerSession(authOptions)` (next-auth v4 pattern) | Already established; JWT strategy with role in token |
| Unique constraint enforcement (one active batch) | App-only check | DB unique partial index + app check | Race condition possible with app-only check under concurrent requests |
| Debounce utility | `setTimeout` in component | Dedicated `useDebounce` hook (30 lines) | Reusable across any future search input |

**Key insight:** This phase is primarily a CRUD application. The complexity lives in the schema relationships and permission gates, not in any algorithmic problem. Resist adding client-state libraries (Redux, Zustand) — React `useState` + server-revalidation is sufficient for the data volumes here.

---

## Common Pitfalls

### Pitfall 1: Prisma Decimal Type Serialization
**What goes wrong:** `amount` and `hours` are stored as `Decimal` in PostgreSQL. When returned from Prisma and serialized to JSON in a Next.js API route, Prisma's `Decimal` object becomes `{}` (empty object) instead of the numeric value.
**Why it happens:** Prisma wraps decimal values in a `Decimal` class; `JSON.stringify` doesn't know how to serialize it.
**How to avoid:** Either (a) map the result before returning: `amount: entry.amount.toNumber()`, or (b) use `@db.DoublePrecision` instead of `@db.Decimal` in schema (acceptable for gram weights). Decision: use `Float` in Prisma schema (maps to `double precision` in Postgres) — sufficient precision for gram weights up to 999.9.
**Warning signs:** API returns `"amount": {}` in JSON response.

### Pitfall 2: One-Active-Batch Race Condition
**What goes wrong:** Two concurrent POST requests to create a batch both pass the "no active batch" check and both succeed, creating two ACTIVE batches for the same location.
**Why it happens:** Check-then-insert is not atomic without DB-level enforcement.
**How to avoid:** Add a conditional unique index in Prisma schema: unique constraint on `(locationId, status)` where `status = 'ACTIVE'`. In PostgreSQL this is a partial unique index. Prisma doesn't natively support partial indexes in schema — add it via a raw migration SQL file or `@@index` workaround.
**Warning signs:** Two `status: 'ACTIVE'` rows for same `locationId` in batches table.

Implementation approach — add to migration SQL after Prisma creates the tables:
```sql
CREATE UNIQUE INDEX batches_one_active_per_location
ON batches(location_id)
WHERE status = 'ACTIVE';
```

### Pitfall 3: forcePasswordReset Not in JWT Token
**What goes wrong:** `forcePasswordReset` is stored in DB but not surfaced in the session JWT, so the middleware can't check it without a DB query on every request.
**Why it happens:** NextAuth JWT callback only gets the user object at sign-in time; DB field changes after sign-in won't reflect unless the token is refreshed.
**How to avoid:** Add `forcePasswordReset` to the JWT callback in `src/lib/auth.ts` — read it from DB in the `jwt` callback when `user` is present (i.e., at sign-in). Also add a session update trigger after the password is set to clear the flag from the token.
**Warning signs:** Employee can navigate past `/set-password` after password is already set, or cannot navigate away after setting password.

### Pitfall 4: User Model Alteration Breaking NextAuth Adapter
**What goes wrong:** Adding nullable columns to `users` table via migration works, but if the Prisma schema migration also touches the `Account`, `Session`, or `VerificationToken` models, `@auth/prisma-adapter` may fail if the adapter's expected schema diverges.
**Why it happens:** `@auth/prisma-adapter` maps to specific field names — any rename or constraint change on adapter models breaks it.
**How to avoid:** Only ADD new nullable columns to `users`. Do not rename or alter existing columns. Keep `Account`, `Session`, `VerificationToken` models unchanged in `schema.prisma`.
**Warning signs:** `PrismaClientValidationError` on login after migration.

### Pitfall 5: Autocomplete Missing aria Attributes
**What goes wrong:** Keyboard navigation works visually but screen readers don't announce the selected option.
**Why it happens:** Custom autocomplete dropdowns require explicit ARIA attributes (`role="listbox"`, `role="option"`, `aria-activedescendant`) that are easy to omit.
**How to avoid:** UI-SPEC accessibility contract is explicit: use `role="listbox"` on dropdown container, `role="option"` on each item, `aria-activedescendant` pointing to active option id on the input. Implement this from the start.
**Warning signs:** Keyboard-only users cannot navigate the dropdown.

### Pitfall 6: Batch Day Number vs Date Confusion
**What goes wrong:** Treating `batchDay` as a date causes off-by-one errors and timezone issues; it's an ordinal integer (1, 2, 3...).
**Why it happens:** The word "day" implies a date.
**How to avoid:** Schema uses `batchDay Int` — never store a `DateTime` in this field. Auto-increment by querying `MAX(batchDay)` for the batch and adding 1 when creating a new day.
**Warning signs:** Days showing duplicate numbers or dates instead of ordinals.

---

## Code Examples

Verified patterns from existing codebase:

### Prisma Schema Extension (new models alongside existing)
```prisma
// Extend existing User model — add these fields:
model User {
  // ... existing fields unchanged ...
  locationId        String?   // nullable FK for managers/admins
  deactivatedAt     DateTime? // soft delete
  forcePasswordReset Boolean  @default(true)

  location          Location?       @relation("UserPrimaryLocation", fields: [locationId], references: [id])
  userLocations     UserLocation[]
  employeeDays      EmployeeDay[]
}

model Location {
  id       String  @id @default(cuid())
  name     String
  users    User[]  @relation("UserPrimaryLocation")
  batches  Batch[]
  userLocations UserLocation[]
}

model UserLocation {
  userId     String
  locationId String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  location   Location @relation(fields: [locationId], references: [id], onDelete: Cascade)
  @@id([userId, locationId])
}

model Strain {
  id           String        @id @default(cuid())
  name         String
  description  String?
  batchStrains BatchStrain[]
}

model Batch {
  id          String      @id @default(cuid())
  locationId  String
  number      Int
  status      BatchStatus @default(INACTIVE)
  startDate   DateTime?
  endDate     DateTime?
  completedAt DateTime?
  location    Location    @relation(fields: [locationId], references: [id])
  batchStrains BatchStrain[]
  days        Day[]
  @@unique([locationId, number])
}

enum BatchStatus {
  INACTIVE
  ACTIVE
  COMPLETED
}

model BatchStrain {
  id           String       @id @default(cuid())
  batchId      String
  strainId     String
  batch        Batch        @relation(fields: [batchId], references: [id], onDelete: Cascade)
  strain       Strain       @relation(fields: [strainId], references: [id])
  employeeDays EmployeeDay[]
  @@unique([batchId, strainId])
}

model Day {
  id          String       @id @default(cuid())
  batchId     String
  batchDay    Int
  isSubmitted Boolean      @default(false)
  notes       String?
  batch       Batch        @relation(fields: [batchId], references: [id], onDelete: Cascade)
  employeeDays EmployeeDay[]
  @@unique([batchId, batchDay])
}

model EmployeeDay {
  id            String      @id @default(cuid())
  employeeId    String
  dayId         String
  batchStrainId String
  amount        Float       // grams — Float avoids Decimal serialization issue
  hours         Float?      // nullable — required for Phase 4 commission calc
  employee      User        @relation(fields: [employeeId], references: [id])
  day           Day         @relation(fields: [dayId], references: [id], onDelete: Cascade)
  batchStrain   BatchStrain @relation(fields: [batchStrainId], references: [id])
  @@map("employees_days")
}
```

### getServerSession in API Route (v4 pattern)
```typescript
// Source: src/lib/auth.ts — established pattern
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // Use (session.user as any).activeRole ?? session.user.role for permission checks
}
```

### Soft Delete Pattern
```typescript
// PATCH /api/admin/users/[id]/deactivate
await prisma.user.update({
  where: { id: params.id },
  data: { deactivatedAt: new Date() }
})
```

### Autocomplete Employee Search API
```typescript
// GET /api/employees/search?locationId=xxx
// Returns active employees at the location
const employees = await prisma.user.findMany({
  where: {
    deactivatedAt: null,             // exclude deactivated
    userLocations: {
      some: { locationId }           // scoped to location
    }
  },
  select: { id: true, name: true },
  orderBy: { name: 'asc' }
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-auth v5 `auth()` import | next-auth v4 `getServerSession(authOptions)` | Phase 1 decision | Must use v4 pattern in ALL new API routes |
| `experimental.serverComponentsExternalPackages` | `serverExternalPackages` (top-level) | Next.js 15 | Already handled in Phase 1 config |
| Prisma `@db.Decimal` for monetary/weight values | `Float` (double precision) | Prisma 5.x | Avoids JSON serialization bug with Decimal objects |

**Deprecated/outdated:**
- `next-auth/next` import for route handler: Use `next-auth` with `authOptions` pattern (v4). The v5 `export { GET, POST } = NextAuth(config)` pattern is NOT used in this project.
- Date-based `batchDay`: Superseded by ordinal integer design per CONTEXT.md specifics.

---

## Open Questions

1. **Strain creation during batch creation**
   - What we know: UI-SPEC says "create new inline" for strains during batch creation form
   - What's unclear: Should inline strain creation be a separate API call (POST /api/strains) or embedded in batch creation payload?
   - Recommendation: Embed in batch creation — if `strainIds` contains a string that isn't a cuid (e.g., `new:Trainwreck`), create the strain first in the same transaction. Or: two-step — user types strain name, hits "Add Strain" which creates via POST /api/strains, then the new strainId is added to the batch form. The two-step approach is simpler and avoids payload ambiguity.

2. **forcePasswordReset page route**
   - What we know: Flag exists, middleware should intercept
   - What's unclear: Is the `/set-password` page inside or outside the `(dashboard)` layout?
   - Recommendation: Outside the dashboard layout (no nav bar during forced password set). Place at `src/app/set-password/page.tsx`.

3. **Batch number per-location vs global**
   - What we know: CONTEXT.md marks this as Claude's discretion; UI-SPEC shows "read-only preview in form"
   - Recommendation: Per-location increment. The query is `MAX(number) WHERE locationId = ?` — simple, predictable, avoids gaps from multi-location creates. Batch numbers reset per location (Location A: 1,2,3; Location B: 1,2,3).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (package.json `"test": "jest"`) — no jest.config.* file found, likely pending Wave 0 setup |
| Config file | Not yet created — Wave 0 gap |
| Quick run command | `npx jest --testPathPattern=<file> --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | POST /api/batches creates batch with strains, rejects if active batch exists | unit (API route) | `npx jest tests/api/batches.test.ts -x` | Wave 0 |
| DATA-01 | Batch number increments per location | unit | `npx jest tests/api/batches.test.ts -x` | Wave 0 |
| DATA-02 | POST /api/batches/[id]/days creates day with auto-incremented batchDay | unit | `npx jest tests/api/days.test.ts -x` | Wave 0 |
| DATA-02 | Unique constraint on (batchId, batchDay) enforced | unit | `npx jest tests/api/days.test.ts -x` | Wave 0 |
| DATA-03 | GET /api/employees/search excludes deactivated employees | unit | `npx jest tests/api/employees-search.test.ts -x` | Wave 0 |
| DATA-03 | Autocomplete filters by first name prefix | unit | `npx jest tests/components/EmployeeAutocomplete.test.tsx -x` | Wave 0 |
| DATA-04 | POST /api/batches/[id]/days/[dayId]/submit sets isSubmitted=true | unit | `npx jest tests/api/days.test.ts -x` | Wave 0 |
| ADMIN-01 | POST /api/admin/users creates user with forcePasswordReset=true | unit | `npx jest tests/api/admin-users.test.ts -x` | Wave 0 |
| ADMIN-01 | POST /api/admin/users/[id]/deactivate sets deactivatedAt | unit | `npx jest tests/api/admin-users.test.ts -x` | Wave 0 |
| ADMIN-01 | Deactivated users excluded from employee search | unit | `npx jest tests/api/employees-search.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=<relevant-file> --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `jest.config.ts` — Jest config for Next.js App Router (needs `moduleNameMapper` for `@/` alias, `testEnvironment: node` for API routes)
- [ ] `tests/api/batches.test.ts` — covers DATA-01
- [ ] `tests/api/days.test.ts` — covers DATA-02, DATA-04
- [ ] `tests/api/employees-search.test.ts` — covers DATA-03 filter behavior
- [ ] `tests/api/admin-users.test.ts` — covers ADMIN-01
- [ ] `tests/components/EmployeeAutocomplete.test.tsx` — covers DATA-03 client filter
- [ ] `tests/setup.ts` — shared Prisma mock and session mock fixtures

**Jest config for Next.js (jest.config.ts):**
```typescript
import type { Config } from 'jest'
const config: Config = {
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react' } }] },
}
export default config
```

---

## Sources

### Primary (HIGH confidence)
- Codebase scan — `prisma/schema.prisma`, `src/lib/auth.ts`, `src/lib/rbac.ts`, `src/app/(dashboard)/layout.tsx`, `package.json` — direct inspection of installed versions and established patterns
- `.planning/phases/02-data-management-core/02-CONTEXT.md` — locked decisions and schema design
- `.planning/phases/02-data-management-core/02-UI-SPEC.md` — component inventory, interaction contracts, accessibility contract

### Secondary (MEDIUM confidence)
- Prisma documentation pattern for partial unique indexes — PostgreSQL partial index not directly declarable in `schema.prisma`; requires raw SQL in migration
- next-auth v4 JWT callback pattern for custom claims — established in Phase 1 implementation

### Tertiary (LOW confidence)
- Jest + Next.js App Router test setup — project has `"test": "jest"` in package.json but no jest.config found; standard `ts-jest` approach assumed; validate against actual Next.js 15 + Jest compatibility

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, versions verified from package.json
- Architecture: HIGH — follows exact patterns established in Phase 1 codebase; API route pattern, server component pattern, RoleGuard pattern all already exist
- Pitfalls: HIGH for Prisma Decimal (well-documented), MEDIUM for race condition (theoretical, low risk for single-instance app), HIGH for forcePasswordReset JWT gap
- Test infrastructure: MEDIUM — Jest is declared but no config exists; setup approach is standard but untested in this project

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack; Prisma 5.x, Next.js 15.x, next-auth 4.x — none expected to change)
