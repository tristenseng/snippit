# Project Roadmap

**Project**: Cannabis Employee Performance & Commission Tracker
**Version**: v1.0 Core Performance Visibility
**Created**: 2026-03-20
**Requirements Coverage**: 14/14 v1 requirements mapped (100%)

## Overview

This roadmap delivers the foundational cannabis employee performance tracking system through 4 progressive phases, prioritizing cannabis compliance, commission transparency, and mobile-first user experience based on research findings.

## Phase Structure

| # | Phase | Duration | Requirements | Dependencies |
|---|-------|----------|--------------|--------------|
| 1 | Secure Foundation | Complete | AUTH-01..04, UX-01..02 | None |
| 2 | Data Management Core | Complete | DATA-01..04, ADMIN-01 | Phase 1 |
| 3 | 1/1 | Complete   | 2026-03-27 | Phase 2 |
| 4 | 1/2 | In Progress|  | Phase 3 |
| 5 | Commission & Analytics | 2-3 weeks | PERF-03, ADMIN-02 | Phase 4 |

**Total estimated duration:** 8-11 weeks

## Phase Details

### Phase 1: Secure Foundation
**Goal**: Establish secure, cannabis-compliant authentication and role-based access control with mobile-responsive foundation.

**Why first**: Cannabis industry compliance and secure access control must be bulletproof before any sensitive data enters the system. Mobile responsiveness is critical since employees primarily access via phones during breaks.

**Requirements**:
- AUTH-01: User can create account with email/password
- AUTH-02: User can log in and stay logged in across sessions
- AUTH-03: User can log out from any page
- AUTH-04: Role-based access control with Employee/Manager/Admin roles and appropriate overlaps
- UX-01: Mobile-responsive design optimized for phone usage
- UX-02: Employees cannot view other employees' performance data (privacy)

**Success Criteria**:
1. Employee can log in on mobile device and see role-appropriate dashboard
2. Manager can log in and see manager-specific features plus employee access
3. Admin can log in and see all system features including admin functions
4. Employee cannot access other employees' data or manager functions
5. All pages render correctly on mobile devices (320px min width)

**Technical Foundation**:
- Next.js 15.x with App Router and TypeScript
- PostgreSQL 17.x database setup with Prisma ORM
- Tailwind CSS for mobile-first responsive design
- Authentication system with role-based access control
- Basic database schema for users and roles

**Plans:** 4/4 plans complete

Plans:
- [ ] 01-01-PLAN.md — Project foundation with Next.js, PostgreSQL, and mobile-first setup
- [ ] 01-02-PLAN.md — NextAuth.js authentication system with database sessions
- [ ] 01-03-PLAN.md — Role-based access control, mobile navigation, and test suite

### Phase 2: Data Management Core
**Goal**: Enable managers to create batches, daily entries, and input employee weight data with efficient search functionality.

**Why second**: Data entry capabilities must be solid before performance viewing features, as they depend on quality data input. Manager workflow efficiency directly impacts system adoption.

**Requirements**:
- DATA-01: Manager can create batches with strain specification
- DATA-02: Manager can create daily entries within batches
- DATA-03: Manager can input employee weights with autocomplete search functionality
- DATA-04: Manager can submit completed days to notify employees of new data
- ADMIN-01: Admin can add, edit, and delete employee accounts

**Success Criteria**:
1. Manager can create new batch with strain name and expected duration
2. Manager can add daily entries to active batch with date selection
3. Manager can search and select employees quickly when entering weight data
4. Manager can input gram weights for multiple employees in single session
5. Admin can manage employee accounts (add, edit, delete) through admin interface

**Technical Implementation**:
- Database schema for batches, daily entries, and weight records
- Manager dashboard with batch management interface
- Employee autocomplete search with fuzzy matching
- Batch and daily entry workflow with validation
- Admin panel for user management

### Phase 3: Gap Closure — Auth & Data Fixes
**Goal**: Close all gaps identified in the v1.0 milestone audit — block deactivated-user login, fix weight-entry edit UX, harden middleware coverage, and correct misleading UI messaging.

**Why third**: These are security and correctness fixes that must land before Phase 4 delivers employee-facing features on top of this foundation.

**Gap Closure**: Closes gaps from v1.0 milestone audit

**Requirements**:
- AUTH-02: Login must reject deactivated accounts
- ADMIN-01: Deactivation must fully revoke access (including login gate)
- DATA-03: Manager can edit existing weight entries (UI reflects saved state)

**Success Criteria**:
1. A deactivated user's password is rejected at login with a clear error
2. An edited weight entry row remains visible and updated in the UI after saving
3. Middleware matcher covers `/api/admin/*`, `/api/batches/*`, `/api/strains/*`, `/api/employees/*`
4. EditUserForm on a deactivated account directs admin to user table for reactivation

**Technical Implementation**:
- Add `deactivatedAt` check in `CredentialsProvider.authorize` in `src/lib/auth.ts`
- Fix `onUpdated` callback in `WeightEntryForm` to update row state instead of removing it
- Extend `config.matcher` in `src/middleware.ts` to cover actual API surface
- Update misleading message in `EditUserForm.tsx`

**Plans:** 1/1 plans complete

Plans:
- [ ] 03-01-PLAN.md — Auth hardening, middleware coverage, weight-entry edit fix, UI message correction

### Phase 4: Performance Visibility
**Goal**: Provide employees with immediate visibility into their daily production and historical performance trends.

**Why fourth**: Core value delivery - employees can see their performance data instead of asking managers. Strain context ensures meaningful comparisons within cannabis operations.

**Requirements**:
- PERF-01: Employee can view their daily gram production with strain context
- PERF-02: Employee can see historical performance trends (day-to-day, batch-to-batch)

**Success Criteria**:
1. Employee sees today's gram production immediately upon login
2. Employee can view performance history by day within current and past batches
3. Performance data shows strain context for meaningful comparisons
4. Historical trends display clearly on mobile with lists and cards
5. Employee can navigate between different batches to see progression

**Technical Implementation**:
- Employee dashboard with performance data queries
- Lists and cards (no charting library) optimized for mobile viewing
- Strain-aware performance filtering and comparison
- Historical data aggregation and trend calculation
- Mobile-optimized data visualization components

**Plans:** 1/2 plans executed

Plans:
- [ ] 04-01-PLAN.md — Performance data helpers + dashboard production card with real data
- [ ] 04-02-PLAN.md — /performance page with batch history, strain breakdown, and loading skeleton

### Phase 5: Commission & Analytics
**Goal**: Deliver transparent commission calculations and team analytics while maintaining individual privacy.

**Why last**: Commission transparency is critical but requires solid data foundation. Team analytics provide management value while being privacy-compliant.

**Requirements**:
- PERF-03: Employee can view projected commission earnings based on batch performance
- ADMIN-02: Admin and Manager can view team-wide performance statistics

**Success Criteria**:
1. Employee sees real-time commission projection during active batch
2. Commission calculation shows transparent breakdown: (lbs × $175) - (hours × $20)
3. Employee can view commission history for completed batches
4. Manager sees team performance averages without individual identification
5. Admin can view comprehensive team statistics with privacy controls

**Technical Implementation**:
- Commission calculation service with audit trail
- Real-time commission projection based on batch progress
- Team analytics with privacy-preserving aggregation
- Manager dashboard with team performance metrics
- Commission history and breakdown display

## Risk Mitigation

Based on research findings, key risks and mitigations:

**Commission Calculation Disputes** (HIGH risk)
- Mitigation: Transparent calculation display from Phase 4 launch
- Show exact formula and breakdown to employees
- Maintain audit trail for all calculations

**Cannabis Compliance Issues** (HIGH risk)
- Mitigation: Privacy controls enforced from Phase 1
- Role-based access prevents unauthorized data access
- Data encryption and secure authentication

**Mobile UX Failures** (MEDIUM risk)
- Mitigation: Mobile-first design in every phase
- Test on actual devices during development
- Progressive disclosure to avoid information overload

**Manual Entry Errors** (MEDIUM risk)
- Mitigation: Input validation and confirmation dialogs in Phase 2
- Autocomplete reduces typing errors
- Manager review workflow before data finalization

## Success Metrics

**Phase 1**: Authentication and mobile access working for all roles
**Phase 2**: Managers can efficiently enter daily weight data
**Phase 3**: All v1.0 audit gaps closed — deactivated login blocked, weight edit UX correct, middleware hardened
**Phase 4**: Employees check their performance daily instead of asking managers
**Phase 5**: Commission calculations are transparent and dispute-free

**Overall Success**: Employees have immediate visibility into performance and earnings, reducing manager interruptions and improving performance through transparency.

---
*Created: 2026-03-20 | All 14 v1 requirements mapped*
