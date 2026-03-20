# Project Research Summary

**Project:** Cannabis Employee Performance & Commission Tracker
**Domain:** Employee Performance Management (Cannabis Trim Operation)
**Researched:** 2026-03-20
**Confidence:** HIGH

## Executive Summary

This is a specialized employee performance and commission tracking system for cannabis trim operations, requiring mobile-first design and cannabis industry compliance. Experts recommend building this as a Next.js web application with role-based access (Admin > Manager > Employee) using PostgreSQL for ACID compliance and audit trails. The primary challenge is transparent commission calculations ($175/lb minus $20/hour base) that employees can understand and verify, combined with strict cannabis industry data privacy requirements.

The recommended approach prioritizes commission calculation transparency and mobile-responsive performance viewing, as employees primarily access the system via phones during breaks for quick performance checks. The main risk is commission calculation disputes leading to legal issues, which must be mitigated through real-time calculation breakdowns and audit trails from day one.

Key success factors include mobile-first design (primary access pattern), transparent financial calculations (trust and legal compliance), and cannabis-specific role-based access controls that handle overlapping manager/admin responsibilities while maintaining strict employee data privacy.

## Key Findings

### Recommended Stack

Research strongly favors Next.js with TypeScript and PostgreSQL for cannabis industry compliance and mobile performance. The stack emphasizes audit trails, role-based security, and mobile-responsive performance while avoiding common cannabis industry pitfalls around data handling.

**Core technologies:**
- Next.js 15.x: Full-stack React framework — best SSR performance and mobile responsiveness with zero-config deployment
- PostgreSQL 17.x: Primary database — ACID compliance essential for commission calculations and cannabis industry audit requirements  
- TypeScript 5.6+: Type safety — prevents runtime errors in financial calculations, essential for team development and error reduction
- Tailwind CSS 3.4+: Mobile-first styling — zero runtime overhead, optimized for phone-based employee access patterns
- Prisma ORM 6.x: Database toolkit — type-safe access with audit trails, performance improvements for mobile responsiveness

### Expected Features

Research identifies mobile-responsive performance viewing and transparent commission tracking as core user expectations, with strain-aware performance context as the primary differentiator for cannabis operations.

**Must have (table stakes):**
- User Authentication & Role-based Access — security non-negotiable in cannabis industry
- Real-time Performance Data — employees expect immediate visibility into work output  
- Commission Calculation with transparency — workers expect clear compensation tracking
- Mobile-responsive Interface — primary access is via mobile phones during breaks
- Strain Context for meaningful comparisons — cannabis-specific domain knowledge required

**Should have (competitive):**
- Real-time Commission Projection — motivates during active batches, shows potential earnings
- Batch Performance Analytics — understand patterns across 4-5 day work cycles
- Privacy-first Team Metrics — team insights while maintaining individual privacy
- Performance Trend Visualization — simple charts optimized for mobile viewing

**Defer (v2+):**
- Offline Data Entry — complex implementation, add when remote access becomes critical
- Advanced Analytics/AI — when basic analytics prove valuable and sufficient data exists
- Integration APIs — when connecting to other systems becomes necessary

### Architecture Approach

Standard three-layer architecture with role-based component composition and hierarchical permissions. The architecture emphasizes mobile-first design, transparent commission calculations, and cannabis compliance requirements. Key pattern is role inheritance where Admins get Manager permissions and Managers get Employee permissions, simplifying small team management while maintaining security.

**Major components:**
1. Employee Dashboard — display performance data, trends, commission projections with mobile-first charts
2. Manager Dashboard — input daily weights, batch management with efficient data entry forms  
3. Commission Service — transparent calculations with audit trails and real-time breakdowns
4. Auth Guard — role-based access control with cannabis industry privacy compliance

### Critical Pitfalls

Research identified commission calculation opacity as the highest risk, potentially leading to legal issues and system abandonment. Cannabis compliance and mobile UX issues follow as major concerns.

1. **Commission Calculation Opacity & Disputes** — show exact formulas in UI, provide itemized breakdowns, include audit trails for all calculations
2. **Cannabis Compliance Data Exposure** — implement strict RBAC, encrypt all data, separate PII from production metrics, regular compliance reviews  
3. **Manual Data Entry Error Cascade** — input validation with reasonable ranges, confirmation dialogs, employee review before finalization
4. **Mobile UI Information Overload** — focus on 2-3 key metrics per screen, progressive disclosure for details, optimize for quick glances
5. **Performance Comparison Gaming** — focus on personal improvement trends rather than rankings, hide individual numbers between employees

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Secure Foundation
**Rationale:** Cannabis compliance and role-based access must be bulletproof before any data entry begins. Commission calculation transparency is critical from launch to prevent trust issues.
**Delivers:** User authentication, role-based access control, basic performance data entry and viewing
**Addresses:** User Authentication, Role-based Access, Real-time Performance Data, Mobile Interface
**Avoids:** Commission calculation opacity, cannabis compliance exposure

### Phase 2: Commission Transparency  
**Rationale:** Commission calculation disputes are the highest identified risk. Must be implemented with full transparency before production use to establish trust.
**Delivers:** Complete commission calculation system with real-time breakdowns and audit trails
**Uses:** PostgreSQL for ACID compliance, Prisma for type-safe calculations
**Implements:** Commission Service with pipeline pattern for auditability
**Avoids:** Commission calculation opacity, manual data entry cascade errors

### Phase 3: Cannabis-Aware Performance  
**Rationale:** Strain context and batch analytics differentiate this from generic performance systems. Required for meaningful performance comparisons in cannabis operations.
**Delivers:** Strain-aware performance tracking, batch analytics, historical trending
**Uses:** Recharts for mobile-optimized data visualization
**Implements:** Performance Service with caching for mobile responsiveness
**Avoids:** Performance comparison gaming, strain context loss

### Phase 4: Team Management & Optimization
**Rationale:** Once individual tracking is stable, add team oversight tools for managers while maintaining privacy controls.
**Delivers:** Manager dashboards, team metrics with privacy controls, performance optimization features
**Uses:** React Query for server state management, advanced caching strategies
**Implements:** Privacy-first team analytics, manager workflow optimization

### Phase Ordering Rationale

- **Security first approach:** Cannabis industry requires bulletproof compliance before any production data enters the system
- **Trust before features:** Commission transparency must be established early to prevent adoption failures and legal issues  
- **Mobile-responsive throughout:** Primary access pattern is phone-based, so each phase must be mobile-optimized
- **Strain-aware differentiation:** Cannabis-specific features are what distinguish this from generic performance tools

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Commission calculation logic — complex math with legal implications, needs domain expert validation
- **Phase 3:** Cannabis compliance requirements — regulatory landscape may require specialized legal research

Phases with standard patterns (skip research-phase):
- **Phase 1:** Authentication and RBAC — well-documented Next.js patterns with Auth.js
- **Phase 4:** Team dashboards and analytics — standard performance management patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Extensive documentation, proven patterns for cannabis compliance apps |
| Features | HIGH | Clear user needs identified, cannabis-specific requirements well-researched |
| Architecture | HIGH | Standard patterns with domain-specific adaptations, clear dependencies |
| Pitfalls | HIGH | Cannabis industry issues well-documented, mobile UX patterns established |

**Overall confidence:** HIGH

### Gaps to Address

Areas where research was conclusive but may need validation during implementation:

- Cannabis regulatory compliance: State-specific requirements may vary, validate local regulations during Phase 1 planning
- Commission calculation edge cases: Research covered standard scenarios, complex batch scenarios may need validation with actual users
- Mobile performance on actual devices: Research covered patterns, real-world performance on older phones may need testing

## Sources

### Primary (HIGH confidence)
- Next.js Official Docs — Authentication patterns, App Router best practices
- Prisma 6 Performance Blog — Database optimization and TypeScript improvements
- Microsoft Azure Multi-tenant Architecture Guide — Role-based access patterns

### Secondary (MEDIUM confidence)  
- Cannabis industry compliance and privacy research — Data handling requirements and regulatory patterns
- Commission-based pay transparency research — Financial calculation UI patterns and legal requirements
- Mobile performance tracking app design patterns — Quick-access UI optimization and responsive design

### Tertiary (LOW confidence)
- Agricultural worker tracking system analysis — Related domain patterns for validation
- Manufacturing production tracking comparisons — Adjacent system architecture patterns

---
*Research completed: 2026-03-20*
*Ready for roadmap: yes*