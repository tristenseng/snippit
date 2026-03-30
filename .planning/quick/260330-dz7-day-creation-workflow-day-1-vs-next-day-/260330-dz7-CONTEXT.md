# Quick Task 260330-dz7: Day creation workflow - day 1 vs next day disambiguation - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Task Boundary

When a manager adds a day to a batch, the system silently auto-increments the batchDay number. The manager doesn't see what day number will be created until after the fact. The fix is to show the computed next day number in an editable input field — the manager can override it if needed before confirming.

</domain>

<decisions>
## Implementation Decisions

### Business rules (confirmed)
- Day numbers are sequential per (batch, strain). Day 1 cannot repeat for the same batch+strain — no two rows can share the same (batchId, batchStrainId, batchDay).
- Multiple strains in a batch can be on different day numbers (e.g., Strain A on Day 4, Strain B on Day 1). This is normal and expected.

### UX pattern
- Editable field: show the computed next day number in an editable `<input type="number">` pre-filled with `max(existing batchDays for selected strain) + 1`.
- The manager can override the value before submitting.
- Validate client-side (and server-side) that the entered day number doesn't already exist for that (batch, strain).

### Day number computation
- Compute client-side from the `days` prop already passed to DayList — filter by selectedStrainId, find max batchDay, add 1. No extra API call needed.
- If the strain has no days yet, default to 1.

### Server-side change
- The POST /api/batches/[id]/days endpoint should accept an optional `batchDay` in the request body.
- If provided, use it instead of auto-incrementing. Validate it doesn't conflict with an existing (batchId, batchStrainId, batchDay) row.
- If not provided, fall back to current auto-increment behavior (backwards compatible).

### Claude's Discretion
- Error message wording for duplicate day number conflict
- Whether to use an inline error below the input or reuse the existing InlineAlert for validation feedback

</decisions>

<specifics>
## Specific Ideas

- In DayList.tsx, when `showForm` is true, compute `nextDayNumber` reactively on `selectedStrainId` change using the `days` prop.
- The editable input should have `min={1}` and display inline next to the strain selector.
- Server validation: check `prisma.day.findFirst({ where: { batchId, batchStrainId, batchDay: requestedDay } })` — if exists, return 409 conflict.

</specifics>
