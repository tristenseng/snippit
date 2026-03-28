---
phase: 03
slug: gap-closure-auth-data
status: complete
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-27
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x (ts-jest) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern "tests/auth\|tests/privacy\|tests/api/entries"` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern "tests/auth|tests/privacy"`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-T1a | 01 | 1 | AUTH-02 | source scan | `npx jest tests/auth.test.ts` | ✅ | ✅ green |
| 03-01-T1b | 01 | 1 | AUTH-02 | source scan | `npx jest tests/privacy.test.ts` | ✅ | ✅ green |
| 03-01-T1c | 01 | 1 | ADMIN-01 | source scan | `npx jest tests/privacy.test.ts` | ✅ | ✅ green |
| 03-01-T2a | 01 | 1 | DATA-03 | unit (API) | `npx jest tests/api/entries.test.ts` | ✅ | ✅ green |
| 03-01-T2b | 01 | 1 | DATA-03 | component | n/a — manual-only | n/a | ⚠️ manual |
| 03-01-T2c | 01 | 1 | DATA-03 | component | n/a — manual-only | n/a | ⚠️ manual |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ manual-only*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Wave 0 setup needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WeightEntryRow `onUpdated(entry\|null)` passes correct value on save/delete | DATA-03 | Jest env is `testEnvironment: 'node'` — no jsdom setup; React component rendering requires browser | Navigate to an active batch day. Click edit on an entry, change amount, click Save. Verify row stays visible with updated value. Click delete on an entry — verify it disappears from the list. |
| WeightEntryForm updates row in-place (map) vs removes on null (filter) | DATA-03 | Same as above — React component, no jsdom | Same test flow — confirm the edited entry value is reflected without a page reload, and that only deleted entries are removed. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual-only justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No Wave 0 references outstanding
- [x] No watch-mode flags
- [x] Feedback latency ~8s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-27

---

## Validation Audit 2026-03-27

| Metric | Count |
|--------|-------|
| Gaps found | 5 |
| Resolved (automated) | 3 |
| Escalated (manual-only) | 2 |
