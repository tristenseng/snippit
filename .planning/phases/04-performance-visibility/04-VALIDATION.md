---
phase: 4
slug: performance-visibility
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest with ts-jest |
| **Config file** | `jest.config.ts` (project root) |
| **Quick run command** | `npx jest tests/performance.test.ts --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest tests/performance.test.ts --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | PERF-01, PERF-02 | unit | `npx jest tests/performance.test.ts --no-coverage` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 1 | PERF-01 | unit | `npx jest tests/performance.test.ts -t "dashboard production card" --no-coverage` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 1 | PERF-01 | unit | `npx jest tests/performance.test.ts -t "isSubmitted filter" --no-coverage` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 1 | PERF-01 | unit | `npx jest tests/performance.test.ts -t "strain breakdown" --no-coverage` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 2 | PERF-02 | unit | `npx jest tests/performance.test.ts -t "batch history" --no-coverage` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 2 | PERF-02 | unit | `npx jest tests/performance.test.ts -t "strain totals" --no-coverage` | ❌ W0 | ⬜ pending |
| 4-03-03 | 03 | 2 | PERF-02 | unit | `npx jest tests/performance.test.ts -t "privacy" --no-coverage` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/performance.test.ts` — stubs for PERF-01 and PERF-02 covering: dashboard production card, isSubmitted filter, strain breakdown, batch history totals, strain aggregate totals, employee privacy

*Note: Server components are not directly unit-testable. Extract pure helper functions (`groupByDay`, `groupByBatch`, `groupByStrain`, `computeTotals`) into `src/lib/performance.ts` and test those. Follows existing `src/lib/rbac.ts` pattern.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard card navigates to /performance on tap | PERF-01 | Link navigation requires browser | Load /dashboard as employee, tap production card, verify redirect to /performance |
| Day row expand/collapse shows strain breakdown | PERF-01 | DOM interaction requires browser | On /performance, tap a day row, verify strain breakdown appears; tap again, verify it collapses |
| Empty state renders correctly for new employees | PERF-01 | Requires employee with no submitted data | Log in as employee with zero submitted days, verify "No data yet" on dashboard card |
| Admin role-switched to Employee sees own data | PERF-01, PERF-02 | Role switch requires browser session | Log in as Admin, switch to Employee view, verify performance shows only that user's data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
