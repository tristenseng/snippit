# Cannabis Employee Performance & Commission Tracker

## What This Is

A web application that replaces paper-based tracking of cannabis trim employee performance, giving workers real-time visibility into their daily production, historical trends, and projected commission earnings. Managers can efficiently input daily weights and track team performance while employees can see their improvement over time.

## Core Value

Employees can see their daily performance and commission progress immediately instead of having to ask managers, driving performance improvement through visibility and enabling better management decisions.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Employees can log in and view their daily gram production with strain context
- [ ] Employees can see historical performance trends (day-to-day, batch-to-batch)
- [ ] Employees can view projected commission earnings based on batch performance
- [ ] Managers can create batches and daily entries with strain specification
- [ ] Managers can input employee weights with autocomplete search functionality
- [ ] Managers can submit completed days to notify employees of new data
- [ ] Admins can add, edit, and delete employee accounts
- [ ] Role-based access (Employee/Manager/Admin with appropriate overlaps)
- [ ] Team-wide performance statistics for managers and admins
- [ ] Mobile-responsive design for phone usage

### Out of Scope

- Native mobile app — Web-first approach, mobile app later
- Real-time notifications — Simple login-to-check approach for v1
- Integration with existing cannabis compliance software — Standalone system initially

## Context

**Industry:** Cannabis cultivation/trimming operation
**Current Process:** Trim manager manually records daily weights on paper; employees must ask to see their numbers and have no historical visibility
**Commission Structure:** $175/lb with $20/hour base pay; commission = (lbs × $175) - (hours × $20)
**Batch Structure:** 4-5 consecutive workdays per batch, mostly single strain with occasional overlap during transitions
**Team Size:** Small cannabis trim team with overlapping roles (Admins are always Managers+Employees, Managers can be Employees)

## Constraints

- **Compliance**: Cannabis industry regulatory environment
- **Privacy**: Employees cannot see each other's performance data
- **Access Pattern**: Primarily mobile phone usage during breaks
- **Data Source**: Manual entry replacing current paper system

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-first over native mobile | Faster development, universal access | — Pending |
| Raw gram comparisons with strain context | Meaningful within strain periods, simpler calculations | — Pending |
| Projected commission display | Motivates employees during active batches | — Pending |

---
*Last updated: 2025-03-19 after initialization*