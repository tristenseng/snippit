---
phase: 01
slug: secure-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:unit`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01, UX-01 | unit | `npm run test -- foundation` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-01, UX-01 | unit | `npm run test -- config` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | AUTH-02, UX-02 | integration | `npm run test -- database` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 2 | AUTH-02, UX-02 | unit | `npm run test -- rls` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 3 | AUTH-02, AUTH-03 | integration | `npm run test -- auth` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 3 | AUTH-02, AUTH-03 | e2e | `npm run test:e2e -- login` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 4 | AUTH-04 | integration | `npm run test -- rbac` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 4 | UX-01 | e2e | `npm run test:e2e -- mobile` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 4 | AUTH-04, UX-02 | integration | `npm run test -- privacy` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/foundation.test.ts` — Next.js + TypeScript setup tests
- [ ] `tests/config.test.ts` — Tailwind CSS mobile config tests
- [ ] `tests/database.test.ts` — Prisma connection and migration tests
- [ ] `tests/rls.test.ts` — Row Level Security policy tests
- [ ] `tests/auth.test.ts` — NextAuth.js session management tests
- [ ] `tests/rbac.test.ts` — Role-based access control tests
- [ ] `tests/privacy.test.ts` — Cross-employee data isolation tests
- [ ] `tests/mobile.test.ts` — Mobile navigation and responsive tests
- [ ] `vitest.config.ts` — Test framework configuration
- [ ] `playwright.config.ts` — E2E test configuration

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile touch targets | UX-01 | Touch precision varies by device | 1. Open login on 320px viewport 2. Verify all buttons ≥44px 3. Test tap accuracy |
| Role switcher UX | AUTH-04 | Context switching workflow | 1. Login as Admin 2. Switch between Admin/Manager/Employee views 3. Verify appropriate feature visibility |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending