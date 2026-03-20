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
| 1 | 3/4 | In Progress|  | None |
| 2 | Data Management Core | 2-3 weeks | DATA-01 to DATA-04, ADMIN-01 | Phase 1 |
| 3 | Performance Visibility | 2 weeks | PERF-01, PERF-02 | Phase 2 |
| 4 | Commission & Analytics | 2-3 weeks | PERF-03, ADMIN-02 | Phase 3 |

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

**Plans:** 3/4 plans executed

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

### Phase 3: Performance Visibility  
**Goal**: Provide employees with immediate visibility into their daily production and historical performance trends.

**Why third**: Core value delivery - employees can see their performance data instead of asking managers. Strain context ensures meaningful comparisons within cannabis operations.

**Requirements**:
- PERF-01: Employee can view their daily gram production with strain context
- PERF-02: Employee can see historical performance trends (day-to-day, batch-to-batch)

**Success Criteria**:
1. Employee sees today's gram production immediately upon login
2. Employee can view performance history by day within current and past batches
3. Performance data shows strain context for meaningful comparisons
4. Historical trends display clearly on mobile with simple charts
5. Employee can navigate between different batches to see progression

**Technical Implementation**:
- Employee dashboard with performance data queries
- Charts optimized for mobile viewing (Recharts library)
- Strain-aware performance filtering and comparison
- Historical data aggregation and trend calculation
- Mobile-optimized data visualization components

### Phase 4: Commission & Analytics
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
**Phase 3**: Employees check their performance daily instead of asking managers
**Phase 4**: Commission calculations are transparent and dispute-free

**Overall Success**: Employees have immediate visibility into performance and earnings, reducing manager interruptions and improving performance through transparency.

---
*Created: 2026-03-20 | All 14 v1 requirements mapped*