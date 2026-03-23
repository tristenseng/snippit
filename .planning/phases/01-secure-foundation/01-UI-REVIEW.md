# Phase 01 — UI Review

**Audited:** 2026-03-23
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md for this phase)
**Screenshots:** Not captured (no dev server running)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | CTAs are specific and functional; one generic catch-all error message and raw "--" placeholder values in dashboard cards |
| 2. Visuals | 3/4 | Clear hierarchy and card structure; hamburger button missing visible label text on desktop; RoleGuard loading spinner is an unstyled plain-text "Loading..." |
| 3. Color | 3/4 | No hardcoded hex values; accent colors (blue, red, green, purple, orange) are applied to 5 distinct semantic contexts without overuse |
| 4. Typography | 3/4 | 6 distinct font sizes in use — one over the 4-size informal guideline; 3 weights used is acceptable; overall scale is coherent |
| 5. Spacing | 3/4 | Standard Tailwind scale used throughout; `min-h-[44px]` and `min-w-[44px]` arbitrary values are intentional mobile-touch targets, not misuse |
| 6. Experience Design | 2/4 | Login has proper loading/disabled/error states; RoleGuard loading state is bare unstyled text; no loading/error/empty states on dashboard cards; no error boundary at layout level |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **RoleGuard renders bare "Loading..." text** — Users who open the mobile nav or dashboard before the session resolves see an unstyled flash of plain text in place of nav links and cards. Replace `<div>Loading...</div>` in `src/components/auth/RoleGuard.tsx` line 17 with a visually matched skeleton: `<div className="h-10 bg-gray-100 rounded-md animate-pulse" aria-hidden="true" />`.

2. **Dashboard cards have no loading, error, or empty states** — All stat values display "--" indefinitely because they are hard-coded placeholders with no state management. Users cannot tell whether data failed to load or simply has not loaded yet. Add a `loading` prop or skeleton variant to each card and an explicit "No data yet" message for the zero-data case. Target file: `src/app/(dashboard)/dashboard/page.tsx`.

3. **Generic catch-all error copy in LoginForm** — The `catch` block at `src/components/auth/LoginForm.tsx` line 33 shows "An error occurred. Please try again." This is a fallback for network-level failures, which is valid, but it is identical copy to what a server error would produce. Change to something specific like "Connection error — check your internet and try again" to distinguish it from the credential-error message on line 27.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Passing:**
- CTA on login form is "Sign in" (line 87 of LoginForm.tsx) — specific, action-oriented, correct.
- Loading state label is "Signing in..." (line 87) — gives progressive feedback without being generic.
- Credential error message is "Invalid email or password" (line 27) — appropriately vague for security (does not confirm whether email exists).
- Nav link labels are descriptive: "Dashboard", "My Performance", "Batch Management", "Admin Panel" (MobileNav.tsx lines 62–96).
- Logout button says "Sign out" consistently in both variants (LogoutButton.tsx lines 22, 34).
- Auth layout heading is "Cannabis Performance Tracker" (auth/layout.tsx line 9) — clearly branded.

**Issues:**
- `src/components/auth/LoginForm.tsx` line 33: Generic catch-all error "An error occurred. Please try again." is indistinguishable from a bad server response. Consider differentiating network vs. auth errors.
- `src/app/(dashboard)/dashboard/page.tsx` lines 26, 33, 46, 53, 64: Placeholder values "--" and "--%" and "$--" have no accompanying status text. Users see data-less cards with no explanation. These are appropriate for a foundation phase but should be replaced before any real user-facing testing.
- `src/app/page.tsx` line 13: "Authentication and dashboard coming soon." is placeholder copy left in the root page — acceptable for foundation but should be removed or replaced with a redirect once auth is complete.
- `src/components/auth/RoleGuard.tsx` line 17: "Loading..." is bare, unstyled, and contextually inappropriate as visible user copy (see Visuals finding).

**Score rationale:** CTAs and interaction labels are well-crafted. Deducted 1 point for the bare "Loading..." user-visible text and the generic catch-all error.

---

### Pillar 2: Visuals (3/4)

**Passing:**
- Auth page has a clear focal point: centered card with branded heading and single form below (auth/layout.tsx). Visual hierarchy is H1 title → H2 sub-heading (login/page.tsx line 5 in plan template) → form fields → CTA.
- Dashboard cards use consistent `bg-white shadow rounded-lg` structure with a clear H3 card title, large stat value, and supporting caption. Size differentiation (text-3xl for stats, text-lg for card titles, text-sm for captions) creates readable hierarchy.
- Hamburger trigger button has `aria-label="Open menu"` (MobileNav.tsx line 26) so icon-only button is accessible.
- Close button has `aria-label="Close menu"` (MobileNav.tsx line 47).
- RoleSwitcher chevron flips on open (`rotate-180` when `isOpen`, RoleSwitcher.tsx line 38) — good interactive affordance.
- Dashboard nav bar has a clear structure: app name left, user greeting + hamburger right.

**Issues:**
- `src/components/auth/RoleGuard.tsx` line 17: `<div>Loading...</div>` renders as unstyled black text with no visual treatment. When multiple RoleGuards are on screen simultaneously (dashboard page has 3), the loading flash is visually jarring — plain text at body size surrounded by white card structure.
- `src/app/(dashboard)/dashboard/page.tsx`: The "Viewing as: employee" sub-label (line 14) is lowercase because of `capitalize` + `userRole?.toLowerCase()`. The CSS `capitalize` class capitalizes only the first letter, so "employee" renders as "Employee". This is correct, but the pattern is brittle — if `activeRole` is ever undefined, the label shows "Viewing as:" with no value and no fallback text.
- The hamburger button has no desktop equivalent — `lg:hidden` hides it, but there is no desktop nav sidebar or top-level navigation links on desktop screens. The dashboard content is accessible but navigation is absent for lg+ viewports. This is an intentional foundation-phase decision (mobile-first) but will need addressing.

**Score rationale:** Visual hierarchy and structure are solid for a foundation phase. Deducted 1 point for the visually disruptive unstyled loading state and absence of desktop navigation.

---

### Pillar 3: Color (3/4)

**Passing:**
- Zero hardcoded hex or rgb values across all 13 audited files — all color via Tailwind semantic classes.
- No `text-primary` / `bg-primary` usage — 0 hits. Color is applied through descriptive Tailwind classes (blue, gray, red, green, purple, orange).
- Color usage is contextually coherent:
  - `bg-blue-600` / `focus:ring-blue-500` — primary action (login button, performance stat)
  - `bg-red-600` — logout button (danger/exit action) and System Users stat (admin)
  - `text-green-600` — commission / earnings (positive financial metric)
  - `text-purple-600` — active batches (manager-specific)
  - `text-orange-600` — team efficiency (manager-specific, secondary metric)
- The gray scale is used consistently: `gray-900` headings, `gray-700` body, `gray-600` secondary, `gray-500` captions, `gray-50` backgrounds.

**Issues:**
- Five semantic accent colors (blue, red, green, purple, orange) are in use across the dashboard. This is within acceptable range for a multi-role application where each role has a distinct color treatment. However, it means there is no single brand accent — the color palette is purely functional. This is not a problem for a foundation phase but should be documented as a design decision before Phase 2 adds more cards.
- `text-blue-600` appears on the Employee "My Performance" stat value (dashboard/page.tsx line 26) as well as on the login button. These two usages — a data metric and a primary CTA — sharing an accent color is fine in isolation but may create confusion as the design scales.

**Score rationale:** No hardcoded colors, consistent semantic mapping, well-restrained palette. Minor note on the multi-accent approach. No deduction warranted.

---

### Pillar 4: Typography (3/4)

**Font sizes in use (across all .tsx files):**
| Size | Count | Primary usage |
|------|-------|---------------|
| text-sm | 18 | Labels, captions, button text, nav links |
| text-base | 6 | Mobile input fields, nav link text |
| text-lg | 6 | Card headings (H3), menu heading |
| text-3xl | 6 | Dashboard stat values |
| text-2xl | 3 | Page headings (Dashboard H2, login page H2) |
| text-xl | 1 | Nav bar app name |

Six distinct sizes are in use — one over the informal 4-size guideline. The full set is: sm, base, lg, 2xl, 3xl, xl.

**Font weights in use:**
| Weight | Count | Primary usage |
|--------|-------|---------------|
| font-medium | 15 | Button labels, nav links, input labels |
| font-bold | 9 | Headings, stat values |
| font-semibold | 2 | Menu H2, nav bar title |

Three weights is acceptable. The distinction between `font-bold` and `font-semibold` is minor but intentional — semibold for branded titles, bold for data headings.

**Issues:**
- `text-xl` appears only once (`src/app/(dashboard)/layout.tsx` line 25 — the nav bar "Performance Tracker" title). This is a singleton size that could be replaced with `text-lg font-semibold` to reduce the scale by one step without visual impact.
- `text-3xl` is used exclusively for placeholder stat values ("--", "$--", "--%"). Once these are replaced with real numbers, the 3xl size may be appropriate or may need reconsideration depending on number length.
- `text-base sm:text-sm` on input fields (LoginForm.tsx lines 53, 70) is correct mobile-first practice — base size prevents iOS auto-zoom on focus, sm on larger screens. This is not a typography error.

**Score rationale:** Scale is coherent and intentional. One singleton size (text-xl) inflates the count. Deducted 1 point for being one step over the 4-size guideline.

---

### Pillar 5: Spacing (3/4)

**Top spacing patterns (by frequency):**
- `py-2`, `px-4`, `px-3`, `p-6` — core Tailwind scale (2, 3, 4, 6)
- `px-6`, `px-8` — used in layout containers
- `py-6` — main content padding
- `p-4`, `py-4` — card internals and panel padding
- `space-y-6`, `space-y-2`, `space-y-4` — form field and nav link stacking

**Arbitrary values in use:**
All 13 instances of `min-h-[44px]` and `min-w-[44px]` are deliberate: they enforce the 44px minimum touch target required by the mobile-first cannabis employee context. These are not misuse of arbitrary values — they are a documented design requirement (tailwind.config.js defines `minHeight.touch: 44px` but the components use the `[44px]` syntax directly instead of the `min-h-touch` utility).

**Issues:**
- The custom `min-h-touch` Tailwind utility defined in `tailwind.config.js` (`minHeight: { touch: '44px' }`) is never used. All 13 touch target instances use the literal `min-h-[44px]` arbitrary class instead of `min-h-touch`. This is a consistency issue — the purpose of the custom utility is to centralise the value, and bypassing it means changing the touch target size later requires editing 13+ individual locations instead of one config value. Recommend replacing all `min-h-[44px]` with `min-h-touch` in the 5 component files.
- `space-x-4` on the nav bar right section (dashboard/layout.tsx line 30) is the only horizontal space utility — consistent with use of `gap-6` on the dashboard grid.

**Score rationale:** Spacing scale is consistent and standard. No arbitrary spacing outside the intentional touch-target pattern. Deducted 1 point for the unused `min-h-touch` utility creating a future maintenance inconsistency.

---

### Pillar 6: Experience Design (2/4)

**State coverage inventory:**

| State | LoginForm | RoleGuard | Dashboard Cards | MobileNav |
|-------|-----------|-----------|-----------------|-----------|
| Loading | Yes (disabled + "Signing in...") | Bare text only | None | N/A |
| Error | Yes (inline alert with role="alert") | None | None | None |
| Empty | N/A | N/A | Placeholder "--" only | N/A |
| Disabled | Yes (button disabled during submit) | N/A | N/A | N/A |
| Success | Yes (router.push to /dashboard) | N/A | N/A | N/A |

**Passing:**
- `src/components/auth/LoginForm.tsx`: Excellent state coverage for its scope. Loading: button disabled + label changes. Error: inline `role="alert"` div with red text. Disabled: `disabled:bg-blue-400 disabled:cursor-not-allowed`. Success: redirect to dashboard. This is the best-implemented component in the phase.
- `src/components/auth/RoleGuard.tsx`: Handles loading, unauthenticated, and missing role states — logic is correct.
- `src/app/(dashboard)/layout.tsx`: Server-side redirect on missing session (`if (!session) redirect('/login')`) — correct protection pattern.
- `src/middleware.ts`: Route-level protection for /dashboard and /admin paths.

**Issues:**
- `src/components/auth/RoleGuard.tsx` line 17: The loading state renders `<div>Loading...</div>` — no spinner, no skeleton, no minimum height. Every RoleGuard-wrapped element flashes this text on session load. On the dashboard page, 3 RoleGuards render simultaneously, each showing "Loading..." in sequence or together. A minimal skeleton element would prevent this CLS (content layout shift) and visual noise.
- `src/app/(dashboard)/dashboard/page.tsx`: Dashboard stat cards have no loading state, no error state, and no empty state. The "--" placeholder is hard-coded — it does not differentiate between "data is loading", "data failed to fetch", or "no data exists yet". This is expected for a foundation phase but creates a confusing first impression for any user who logs in before Phase 2 data is wired up.
- No `ErrorBoundary` component exists anywhere in the codebase. If a client component throws during render (e.g., `useSession` throws, `RoleGuard` crashes), the error will propagate to the nearest Next.js error boundary (which shows the Next.js default error page). An `<ErrorBoundary>` around the dashboard layout would contain failures gracefully.
- `src/components/auth/RoleGuard.tsx`: When `status === 'loading'`, the loading div renders regardless of whether `fallback` is provided. If a component only renders for admins and fallback is `null`, the loading state still shows "Loading..." text momentarily. The loading return should use `fallback` or render nothing: `return <>{fallback}</>` instead of a bare loading div, unless a skeleton is provided.

**Score rationale:** LoginForm state handling is excellent. The rest of the interactive surface (RoleGuard, dashboard cards) lacks proper loading/error/empty state treatment. Deducted 2 points — this is the most impactful gap for real users.

---

## Files Audited

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — viewport meta, global CSS import |
| `src/app/globals.css` | Global styles — Tailwind directives, touch-action |
| `src/app/page.tsx` | Root placeholder page |
| `src/app/(auth)/layout.tsx` | Auth page shell — centered card container |
| `src/app/(auth)/login/page.tsx` | Login page — imports LoginForm |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell — nav bar, session guard, SessionProvider |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard — role-specific stat cards |
| `src/components/auth/LoginForm.tsx` | Email/password form with full state management |
| `src/components/auth/LogoutButton.tsx` | Logout button — default and text variants |
| `src/components/auth/RoleGuard.tsx` | Client-side role-conditional renderer |
| `src/components/auth/RoleSwitcher.tsx` | Admin role context dropdown — upward-opening |
| `src/components/navigation/MobileNav.tsx` | Hamburger slide-in nav with role-gated links |
| `src/components/providers/SessionProviderWrapper.tsx` | SessionProvider client wrapper |
