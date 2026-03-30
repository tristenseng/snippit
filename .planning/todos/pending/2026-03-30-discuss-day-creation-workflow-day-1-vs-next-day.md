---
created: 2026-03-30T16:56:30.228Z
title: Discuss day creation workflow - day 1 vs next day
area: ui
files:
  - src/app/(dashboard)/batches/[id]/days/route.ts
  - src/app/(dashboard)/batches/[id]/page.tsx
  - src/components/batches/DayList.tsx
---

## Problem

When a user creates a new day inside a batch, the system needs to handle an ambiguous case: is the user starting a **new Day 1** (i.e., a fresh cycle/restart within the same batch) or are they creating the **next sequential day** (continuing from where they left off)?

There is no current UX to disambiguate this intent. The user needs to be given a choice at the point of day creation so the system records the correct day number.

This requires discussion before implementation — key questions:
- What does "Day 1 again" mean in the context of the batch? Is it a sub-cycle? A reset?
- How should sequential day numbering work — auto-incremented from the last day?
- Should the UI ask every time, or only when the last day was "Day 1" already?
- What data model changes are needed (if any) to support multiple "Day 1"s in one batch?

## Solution

TBD — requires discussion with user before implementing. Do not implement until questions are clarified.
