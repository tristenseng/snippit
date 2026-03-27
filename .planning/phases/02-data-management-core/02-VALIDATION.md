---
phase: 2
slug: data-management-core
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
audited: 2026-03-26
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (declared in package.json `"test": "jest"`) |
| **Config file** | `jest.config.ts` — Wave 0 creates this |
| **Quick run command** | `npx jest --testPathPattern=<file> --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=<relevant-file> --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-W0-01 | Wave 0 | 0 | infra | setup | `npx jest --no-coverage` | ✅ | ✅ green |
| 2-01-01 | schema | 1 | DATA-01 | unit | `npx jest tests/api/batches.test.ts -x` | ✅ | ✅ green |
| 2-01-02 | schema | 1 | DATA-02 | unit | `npx jest tests/api/days.test.ts -x` | ✅ | ✅ green |
| 2-02-01 | api | 2 | DATA-01 | unit | `npx jest tests/api/batches.test.ts -x` | ✅ | ✅ green |
| 2-02-02 | api | 2 | DATA-02 | unit | `npx jest tests/api/days.test.ts -x` | ✅ | ✅ green |
| 2-02-03 | api | 2 | DATA-03 | unit | `npx jest tests/api/employees-search.test.ts -x` | ✅ | ✅ green |
| 2-02-04 | api | 2 | DATA-04 | unit | `npx jest tests/api/days.test.ts -x` | ✅ | ✅ green |
| 2-02-05 | api | 2 | ADMIN-01 | unit | `npx jest tests/api/admin-users.test.ts -x` | ✅ | ✅ green |
| 2-03-01 | ui | 3 | DATA-03 | unit | `npx jest tests/components/EmployeeAutocomplete.test.tsx -x` | ✅ | ✅ green (act() warnings, non-failing) |
| 2-03-02 | ui | 3 | DATA-01–04 | manual | see Manual-Only | n/a | ⬜ pending |
| 2-03-03 | ui | 3 | ADMIN-01 | manual | see Manual-Only | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `jest.config.ts` — Jest config for Next.js App Router (`moduleNameMapper` for `@/` alias, `testEnvironment: node`)
- [x] `tests/setup.ts` — shared Prisma mock and session mock fixtures
- [x] `tests/api/batches.test.ts` — stubs for DATA-01
- [x] `tests/api/days.test.ts` — stubs for DATA-02, DATA-04
- [x] `tests/api/employees-search.test.ts` — stubs for DATA-03 filter behavior
- [x] `tests/api/admin-users.test.ts` — stubs for ADMIN-01
- [x] `tests/components/EmployeeAutocomplete.test.tsx` — stubs for DATA-03 client filter

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Batch creation form — strain autocomplete and submission | DATA-01 | Full browser interaction flow | 1. Login as manager. 2. Navigate to batches. 3. Create batch, search and add strains. 4. Submit. 5. Verify batch appears in list with ACTIVE status. |
| Daily entry workflow — navigate batch → add day → add weights | DATA-02, DATA-03 | Multi-step UI flow across pages | 1. Open active batch. 2. Add new day. 3. Search employee by first name. 4. Enter gram weight. 5. Submit entry. 6. Verify entry appears in day table. |
| Day submission notification | DATA-04 | Notification delivery requires manual check | 1. Add entries to a day. 2. Click "Submit Day". 3. Verify `isSubmitted=true` in DB and employee sees notification. |
| Admin user management CRUD | ADMIN-01 | Full admin panel flow | 1. Login as admin. 2. Create user → verify forcePasswordReset=true. 3. Edit user name/role/location. 4. Deactivate user → verify excluded from employee search. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s (suite runs in ~0.8s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-03-26 — 137 tests passing, 11 suites, 0 failures

---

## Validation Audit 2026-03-26

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Tests total | 137 |
| Suites total | 11 |
| Phase-2 relevant | 67 (5 suites) |
