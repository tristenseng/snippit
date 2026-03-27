---
phase: 01
slug: secure-foundation
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-20
updated: 2026-03-26
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (jest@30 + ts-jest) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npx jest --testPathPatterns="foundation\|config\|rbac\|privacy\|auth"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01, UX-01 | unit | `npx jest tests/foundation.test.ts` | ✅ | ✅ green |
| 01-01-02 | 01 | 1 | AUTH-01, UX-01 | unit | `npx jest tests/config.test.ts` | ✅ | ✅ green |
| 01-04-01 | 04 | 2 | AUTH-02, UX-02 | manual | see Manual-Only | — | ⚠️ manual |
| 01-04-02 | 04 | 2 | AUTH-02, UX-02 | unit | `npx jest tests/privacy.test.ts` | ✅ | ✅ green |
| 01-02-01 | 02 | 3 | AUTH-02, AUTH-03 | unit | `npx jest tests/auth.test.ts` | ✅ | ✅ green |
| 01-02-02 | 02 | 3 | AUTH-02, AUTH-03 | manual | see Manual-Only | — | ⚠️ manual |
| 01-03-01 | 03 | 4 | AUTH-04 | unit | `npx jest tests/rbac.test.ts` | ✅ | ✅ green |
| 01-03-02 | 03 | 4 | UX-01 | manual | see Manual-Only | — | ⚠️ manual |
| 01-03-03 | 03 | 4 | AUTH-04, UX-02 | unit | `npx jest tests/privacy.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ manual*

---

## Wave 0 Requirements

- [x] `tests/foundation.test.ts` — Next.js + TypeScript setup tests (12 tests, green)
- [x] `tests/config.test.ts` — Tailwind CSS mobile config tests (3 tests, green)
- [ ] `tests/database.test.ts` — Prisma connection and migration tests (requires live DB — manual-only)
- [x] `tests/privacy.test.ts` — Middleware matcher + RLS SQL file existence (5 tests, green; live RLS behavior is manual-only)
- [x] `tests/auth.test.ts` — NextAuth.js authOptions shape and auth() helper (9 tests, green)
- [x] `tests/rbac.test.ts` — Role-based access control tests (28 tests, green)
- [ ] `tests/mobile.test.ts` — Mobile navigation and responsive tests (visual/touch — manual-only)
- [ ] `vitest.config.ts` — Not applicable; project uses Jest (jest.config.ts exists)
- [ ] `playwright.config.ts` — E2E test configuration (not yet created)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile touch targets | UX-01 | Touch precision varies by device | 1. Open login on 320px viewport 2. Verify all buttons ≥44px 3. Test tap accuracy |
| Role switcher UX | AUTH-04 | Context switching workflow | 1. Login as Admin 2. Switch between Admin/Manager/Employee views 3. Verify appropriate feature visibility |
| Login e2e flow | AUTH-02, AUTH-03 | No Playwright setup | 1. Navigate to /login 2. Enter valid credentials 3. Verify redirect to /dashboard with correct session |
| Mobile nav e2e | UX-01 | No Playwright setup | 1. Open at 375px viewport 2. Tap hamburger 3. Verify overlay opens/closes |
| Prisma DB connection | AUTH-02, UX-02 | Requires live PostgreSQL | Run `npx prisma db pull` against real DATABASE_URL |
| RLS policy enforcement | AUTH-02, UX-02 | Requires live PostgreSQL | Apply `prisma/rls-policies.sql`, verify cross-user isolation queries |

---

## Validation Sign-Off

- [x] All tasks have automated verify or manual-only justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all automatable gaps
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-03-26

---

## Validation Audit 2026-03-26

| Metric | Count |
|--------|-------|
| Gaps found | 9 |
| Resolved (automated) | 5 |
| Escalated to manual-only | 4 |
| Total tests written | 57 |
| Test suite result | ✅ 52/52 green |