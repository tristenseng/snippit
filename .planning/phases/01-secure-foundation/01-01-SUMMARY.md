---
phase: 01-secure-foundation
plan: "01"
subsystem: infra
tags: [next.js, typescript, tailwind, prisma, next-auth, bcryptjs, zod, mobile-first]

# Dependency graph
requires: []
provides:
  - "Next.js 15.2.3 App Router project with TypeScript"
  - "Tailwind CSS mobile-first configuration with 320px baseline and 44px touch targets"
  - "next-auth@4.24.11, prisma@5.22.0, bcryptjs@2.4.3, zod@3.23.8 installed"
  - "Root layout with mobile viewport meta tag"
  - "PostCSS configuration for Tailwind"
affects: [02-database-auth, 03-core-features, 04-production-deploy]

# Tech tracking
tech-stack:
  added:
    - "next@15.2.3"
    - "react@19.2.4"
    - "typescript@5.8.2"
    - "tailwindcss@3.4.17"
    - "next-auth@4.24.11"
    - "@auth/prisma-adapter@2.11.1"
    - "prisma@5.22.0"
    - "@prisma/client@5.22.0"
    - "bcryptjs@2.4.3"
    - "zod@3.23.8"
  patterns:
    - "App Router with src/ directory structure"
    - "Mobile-first responsive design from xs:320px baseline"
    - "serverExternalPackages for Prisma and bcryptjs (not experimental)"
    - "touch-action:manipulation globally for touch responsiveness"

key-files:
  created:
    - "package.json"
    - "next.config.js"
    - "tailwind.config.js"
    - "tsconfig.json"
    - "postcss.config.js"
    - "src/app/globals.css"
    - "src/app/layout.tsx"
    - "src/app/page.tsx"
  modified: []

key-decisions:
  - "Used serverExternalPackages (not experimental.serverComponentsExternalPackages) — correct key in Next.js 15"
  - "Pinned next-auth@4.24.11 (v4 not v5/Auth.js) — v5 API is different, v4 is stable with @auth/prisma-adapter"
  - "Mobile-first Tailwind with xs:320px custom breakpoint — baseline for cannabis employee mobile usage"
  - "Global touch-action:manipulation — eliminates 300ms click delay on mobile devices"

patterns-established:
  - "All Tailwind content scanning from src/**/*.{js,ts,jsx,tsx,mdx}"
  - "Root layout imports globals.css directly — CSS import chain established"
  - "Min touch target size via minHeight.touch: 44px Tailwind utility"

requirements-completed: [AUTH-01, UX-01, UX-02]

# Metrics
duration: 3min
completed: 2026-03-20
---

# Phase 01 Plan 01: Next.js Foundation Summary

**Next.js 15.2.3 App Router with Tailwind xs:320px mobile-first config, next-auth@4.24.11, Prisma@5.22.0, bcryptjs, and zod installed as cannabis compliance foundation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-20T14:35:37Z
- **Completed:** 2026-03-20T14:39:29Z
- **Tasks:** 1 of 1
- **Files modified:** 9

## Accomplishments

- Next.js 15.2.3 project bootstrapped manually (create-next-app rejected "Snippit" due to capital letters in name)
- All cannabis compliance dependencies installed: next-auth, prisma, bcryptjs, zod, @auth/prisma-adapter
- Mobile-first Tailwind configured with 320px baseline breakpoint and 44px minimum touch target utility
- Root layout with mobile viewport meta tag and touch-action:manipulation for smooth mobile interaction
- Project builds cleanly with no TypeScript errors or warnings

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js project with cannabis compliance dependencies** - `4d0c8d9` (feat)

**Plan metadata:** (following this commit)

## Files Created/Modified

- `package.json` - Next.js project manifest with all compliance dependencies
- `next.config.js` - Server external packages for Prisma/bcryptjs, NEXTAUTH env vars
- `tailwind.config.js` - Mobile-first config with xs:320px breakpoint and min-h-touch:44px
- `tsconfig.json` - TypeScript strict mode with @/* path alias to src/
- `postcss.config.js` - Tailwind and autoprefixer PostCSS plugins
- `src/app/globals.css` - Tailwind directives with touch-action:manipulation and 16px base font
- `src/app/layout.tsx` - Root layout with mobile viewport meta, min-h-screen bg-gray-50
- `src/app/page.tsx` - Placeholder home page with card-based layout
- `package-lock.json` - Lockfile for reproducible installs

## Decisions Made

- Used `serverExternalPackages` (top-level) not `experimental.serverComponentsExternalPackages` — the experimental key was deprecated in Next.js 15 and caused a build warning
- Bootstrapped manually instead of create-next-app due to uppercase "S" in "Snippit" directory name being rejected by npm naming rules
- Kept next-auth@4.24.11 (v4) as specified in research — v5 (Auth.js) has a different API surface and the plan explicitly calls for v4 with @auth/prisma-adapter

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed deprecated next.config.js key**
- **Found during:** Task 1 (next.config.js configuration)
- **Issue:** Plan specified `experimental.serverComponentsExternalPackages` but Next.js 15 moved this to `serverExternalPackages` at the top level — caused build warning
- **Fix:** Changed to `serverExternalPackages: ["@prisma/client", "bcryptjs"]` at top level
- **Files modified:** `next.config.js`
- **Verification:** Build passes with zero warnings
- **Committed in:** `4d0c8d9` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 deprecated config key)
**Impact on plan:** Required for clean build. No scope creep.

## Issues Encountered

- `create-next-app` rejected the "Snippit" project name due to npm naming restrictions (capital letters not allowed). Resolved by manually creating the project structure and installing dependencies directly.

## User Setup Required

None - no external service configuration required for this plan. Database connection and auth secrets configured in plan 02.

## Next Phase Readiness

- Next.js foundation complete and building cleanly
- All authentication and database dependencies installed and ready to use
- Prisma schema and RLS policies already committed (from planning phase) — ready for database migration in plan 02
- `.env.example` committed with required environment variable names — user needs to create `.env.local` with real values before running plan 02

## Self-Check: PASSED

All created files exist on disk. Task commit 4d0c8d9 verified in git log.

---
*Phase: 01-secure-foundation*
*Completed: 2026-03-20*
