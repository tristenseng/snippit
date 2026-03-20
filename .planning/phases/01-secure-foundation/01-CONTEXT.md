# Phase 1: Secure Foundation - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish secure, cannabis-compliant authentication and role-based access control with mobile-responsive foundation. Users can create accounts, log in with appropriate role permissions, and access mobile-optimized interfaces that respect privacy requirements.

</domain>

<decisions>
## Implementation Decisions

### Authentication Strategy
- **Account Creation:** Hybrid approach — Admins create accounts, users set their own passwords
- **Login Method:** Email/password with optional 2FA for enhanced security
- **Password Requirements:** Standard requirements (8+ chars, mixed case, numbers)
- **Initial Admin Setup:** CLI command approach using real person's email, forced password change on first login

### Role System Design
- **Role Inheritance:** Context-based access — Admin can "act as" Manager or Employee in different contexts
- **UI Approach:** Role switcher — Toggle between "Admin view", "Manager view", "Employee view"
- **Permission Model:** Role-based only with fixed permissions per role (simple for v1)
- **Privacy Enforcement:** Database-level filtering — Queries automatically filter by user ownership
- **Default Behavior:** Admin view by default when Admin logs in, sticky preferences across sessions, explicit switch required for admin functions

### Mobile-First Design
- **Navigation Pattern:** Hamburger menu (slide-out navigation to save screen space)
- **Layout Approach:** Card-based layouts for easy scanning and touch interaction
- **Responsive Strategy:** Breakpoint strategy with specific layouts for phone/tablet/desktop
- **Main Screen:** Dashboard-first approach — overview dashboard on main screen, detailed views in menu
- **Menu Structure:** Contextual menu content that changes based on current role (Admin/Manager/Employee)
- **Workflow Division:** Weight entry on desktop/laptop, mobile optimized for performance viewing

### Technical Stack
- **Database Schema:** Hybrid approach — Normalized core data, denormalized aggregates for dashboards
- **Authentication Implementation:** Next.js Auth.js (NextAuth) for mature, well-tested auth handling
- **Database Hosting:** Managed database service (AWS RDS, Google Cloud SQL, etc.)
- **API Architecture:** Next.js API routes for integrated frontend-backend communication

### Claude's Discretion
- Session management implementation details (JWT vs server sessions)
- Exact responsive breakpoints and mobile optimizations
- Database migration strategy and schema specifics
- Error handling and validation patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements
- `.planning/PROJECT.md` — Core value proposition, industry context, commission structure, team roles
- `.planning/REQUIREMENTS.md` — Phase 1 requirements AUTH-01 to AUTH-04, UX-01, UX-02 with success criteria
- `.planning/ROADMAP.md` — Phase 1 technical foundation, success criteria, cannabis compliance requirements

### No External Specs
No external specifications — requirements fully captured in project documentation and decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Project State
- **Greenfield Project:** No existing codebase — complete technical foundation needed
- **Planning Complete:** Full project documentation and requirements established
- **Industry Focus:** Cannabis industry compliance and privacy requirements guide technical decisions

### Technology Foundation Required
- Next.js 15.x with App Router and TypeScript setup
- PostgreSQL database with Prisma ORM integration
- Tailwind CSS for mobile-first responsive design
- NextAuth.js authentication system implementation
- Role-based access control system from scratch

### Integration Points
- CLI tooling for initial admin account creation
- Database schema for users, roles, and privacy-filtered queries
- Mobile-responsive component library for card-based layouts
- Role-switching UI components for multi-role users

</code_context>

<specifics>
## Specific Ideas

- **Role Switcher Behavior:** Admin users default to Admin view but can toggle to Manager or Employee contexts, with sticky preference across sessions
- **Mobile Workflow:** Employees primarily use mobile to check performance during breaks, managers use desktop for data entry
- **Privacy First:** Database-level filtering ensures employees cannot access other employees' data at any layer
- **CLI Bootstrap:** Real manager email used for initial admin account with forced password change on first login

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-secure-foundation*
*Context gathered: 2026-03-20*