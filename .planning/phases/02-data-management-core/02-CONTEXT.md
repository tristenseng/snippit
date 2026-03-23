# Phase 2: Data Management Core - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable managers to create batches, record daily weight entries per employee, and submit completed days. Admins can manage employee accounts (add, edit, deactivate). Performance viewing and commission calculations are out of scope — those are Phases 3 and 4.

</domain>

<decisions>
## Implementation Decisions

### Database Schema (new tables)

Full schema to be built in this phase alongside the existing User model:

**`locations`**
- `id`, `name` (string, NN)

**`strains`**
- `id`, `name` (string, NN), `description` (string, nullable)

**`batches`**
- `id`, `locationId` (FK → locations), `number` (int, NN), `status` (enum: INACTIVE / ACTIVE / COMPLETED), `startDate`, `endDate` (nullable), `completedAt` (nullable timestamp)
- Unique constraint: one ACTIVE batch per location (enforced at DB + app level)

**`batch_strains`** (join table — replaces JSON array on batches)
- `id`, `batchId` (FK → batches), `strainId` (FK → strains)

**`days`**
- `id`, `batchId` (FK → batches), `batchDay` (int — 1, 2, 3...), `isSubmitted` (bool), `notes` (string, nullable)
- Unique constraint on (batchId, batchDay)

**`employees_days`** (join table — employee work entry per day per strain)
- `id`, `employeeId` (FK → users), `dayId` (FK → days), `batchStrainId` (FK → batch_strains), `amount` (decimal — grams), `hours` (decimal, nullable)

### Existing User model additions
- `locationId` (FK → locations, nullable) — single location for Managers/Admins
- `deactivatedAt` (nullable timestamp) — soft delete flag
- `forcePasswordReset` (bool, default true) — set on account creation; employee sets password on first login

**`user_locations`** (new join table — employees can belong to multiple locations)
- `userId` (FK → users), `locationId` (FK → locations)

### Location-based access control
- Managers are scoped to a single location (`locationId` on user) — they can only see batches and day entries for their location
- Employees belong to multiple locations via `user_locations` join table
- Admins see all locations (no scoping restriction)
- All batch/day queries filter by the authenticated manager's `locationId`

### Batch lifecycle
- Status enum: `INACTIVE` → `ACTIVE` → `COMPLETED`
- One active batch per location at a time — creating a new batch requires the previous one to be completed first
- Batch closure is two-step: manager submits individual days → once all days are submitted, manager reviews and manually submits the batch → status flips to COMPLETED and `completedAt` is set
- Submitted days remain fully editable (no lock)

### Weight entry workflow
- Search & add one employee at a time — manager searches by first name (autocomplete), enters grams, adds to list
- Strain is set per session — manager selects one strain from the batch's strain list, enters all employees for that strain, then can start a new strain session for the same day
- Entries show inline edit and delete controls before day submission
- Entry form is on the day detail view, accessed via batch → day navigation

### Admin user management
- Admin can edit: first name, last name, role (EMPLOYEE / MANAGER / ADMIN), location assignments
- Email is not editable after account creation
- No admin password control — employees own and manage their own passwords
- Account creation: admin creates account → `forcePasswordReset = true` → employee is prompted to set password on first login
- Delete = soft delete: `deactivatedAt` timestamp set, account deactivated, all historical weight/day data preserved
- Deactivated employees do not appear in autocomplete search during weight entry

### Claude's Discretion
- Exact first-name autocomplete implementation (client-side filter vs server search)
- Batch number auto-increment strategy (per location vs global)
- Form validation patterns and error states
- Navigation structure within the manager dashboard

</decisions>

<specifics>
## Specific Ideas

- `batch_day` is an integer (1, 2, 3...), not a date — allows multiple strain sessions on the same day number without collision
- `employees_days.batchStrainId` FK ensures recorded strains are validated against what was registered for that batch — no off-batch strains possible
- `hours` on `employees_days` is nullable — employees will see gram data regardless, but commission breakdown (Phase 4) requires hours to be entered
- Manager workflow is desktop-primary for data entry; mobile is employee-facing (from Phase 1 context)

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Commission formula ($175/lb base, $20/hr deduction), team structure, industry context
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-04, ADMIN-01 with success criteria
- `.planning/ROADMAP.md` — Phase 2 technical implementation notes and success criteria

### Prior Phase Context
- `.planning/phases/01-secure-foundation/01-CONTEXT.md` — Auth decisions, role system, mobile-first patterns, session strategy, activeRole switching

### Existing Code
- `src/lib/rbac.ts` — ROLE_PERMISSIONS (canManageBatches already defined), ROLE_HIERARCHY
- `src/lib/auth.ts` — Auth helper wrapping getServerSession
- `prisma/schema.prisma` — Existing User, Session, Account models to extend
- `prisma/rls-policies.sql` — Existing RLS patterns for privacy filtering

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/auth/RoleGuard.tsx` — Wrap manager/admin routes to enforce access
- `src/lib/rbac.ts` — `ROLE_PERMISSIONS.canManageBatches` already set for MANAGER and ADMIN; use this for all batch-related guards
- `src/lib/auth.ts` — `auth()` helper for server component session access

### Established Patterns
- App Router with server components — data fetching happens in server components, mutations via API routes (`src/app/api/`)
- next-auth v4 pattern: `authOptions` + `getServerSession` — do not use v5 Auth.js API
- Prisma client via `src/lib/prisma.ts` singleton
- Mobile-first card-based layouts with Tailwind `xs:320px` breakpoint
- Role switching via `activeRole` in session — respect this in all permission checks

### Integration Points
- Location filtering must be applied at the query layer using the authenticated user's `locationId` — mirror the RLS pattern already established in `prisma/rls-policies.sql`
- `forcePasswordReset` flow on first login must integrate with the existing NextAuth credentials callback in `src/lib/auth.ts`
- Deactivated employees (`deactivatedAt != null`) must be excluded from all autocomplete and listing queries

</code_context>

<deferred>
## Deferred Ideas

- Employee self-service password reset — no email infrastructure in v1; out of scope
- Multi-location batch viewing for admins (cross-location analytics) — Phase 4
- Real-time notifications when a day is submitted — explicitly deferred to v2 (ENH-01 in REQUIREMENTS.md)

</deferred>

---

*Phase: 02-data-management-core*
*Context gathered: 2026-03-23*
