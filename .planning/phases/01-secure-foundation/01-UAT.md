---
status: resolved
phase: 01-secure-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md
started: 2026-03-20T00:00:00Z
updated: 2026-03-20T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start fresh with `npm run dev`. Server boots without errors in the terminal. Navigate to http://localhost:3000 — the app loads without a crash page.
result: pass

### 2. Login Page Renders
expected: Navigate to http://localhost:3000/login. A centered card appears with an email field, password field, and a sign-in button. All inputs and the button are visually large and easy to tap (44px+ height). No console errors.
result: pass

### 3. Invalid Credentials Error
expected: On the login page, enter a fake email (e.g. bad@test.com) and wrong password, then submit. An error message appears on the form (e.g. "Invalid credentials" or similar) without a full page crash. The form stays usable for retry.
result: pass

### 4. Unauthenticated Route Protection
expected: While logged out, navigate directly to http://localhost:3000/dashboard. You should be redirected to the login page automatically — not shown the dashboard.
result: pass

### 5. Successful Login → Dashboard
expected: Log in with a valid user account. After submitting, you are redirected to /dashboard. The dashboard page loads and shows your name or role somewhere on screen. (Requires a seeded or manually created user in the database.)
result: pass

### 6. Role-Specific Dashboard Cards
expected: On the dashboard, cards or sections are visible that match your role. An Employee sees employee-relevant options. A Manager sees additional manager options. An Admin sees all options including admin-level controls. Cards for roles above yours are not shown.
result: pass

### 7. Mobile Hamburger Navigation
expected: On a mobile viewport (or with browser devtools set to ~375px width), a hamburger icon (☰) appears in the top navigation. Tapping it opens a slide-in overlay menu with navigation links. Tapping a link or tapping outside closes the menu.
result: pass

### 8. Admin Role Switcher
expected: Log in as an Admin user. On the dashboard, a dropdown appears allowing you to switch between role views (Employee, Manager, Admin). Selecting "Employee" hides manager/admin-only content and shows only employee content. Switching back to Admin restores full access.
result: pass
note: "Fixed — dropdown now opens upward with correct z-index"

### 9. Logout
expected: Click the logout button (visible in the nav or dashboard). You are signed out and redirected to the login page (or home). Navigating back to /dashboard redirects you to login again — session is fully cleared.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

(none)
