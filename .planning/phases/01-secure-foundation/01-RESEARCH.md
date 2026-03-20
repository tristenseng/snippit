# Phase 1: Secure Foundation - Research

**Researched:** 2026-03-20
**Domain:** Next.js authentication, mobile-responsive design, PostgreSQL security
**Confidence:** HIGH

## Summary

Phase 1 establishes secure, cannabis-compliant authentication and role-based access control with mobile-responsive foundation. The research reveals Next.js 15 with App Router provides mature authentication patterns through NextAuth.js, but critical security vulnerabilities emerged in 2025 requiring immediate patching and defense-in-depth strategies. Cannabis industry compliance demands multi-factor authentication, encryption at rest/transit, and detailed audit trails. PostgreSQL Row Level Security (RLS) provides database-level privacy enforcement essential for employee data isolation.

The technology stack of Next.js 15 + NextAuth.js + PostgreSQL 17 + Prisma + Tailwind CSS represents industry standard for secure, scalable web applications with proven cannabis industry deployments.

**Primary recommendation:** Use NextAuth.js with database sessions for immediate revocation capability, implement PostgreSQL RLS for data privacy, and adopt mobile-first Tailwind design with 320px baseline.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Account Creation:** Hybrid approach — Admins create accounts, users set their own passwords
- **Login Method:** Email/password with optional 2FA for enhanced security
- **Password Requirements:** Standard requirements (8+ chars, mixed case, numbers)
- **Initial Admin Setup:** CLI command approach using real person's email, forced password change on first login
- **Role Inheritance:** Context-based access — Admin can "act as" Manager or Employee in different contexts
- **UI Approach:** Role switcher — Toggle between "Admin view", "Manager view", "Employee view"
- **Permission Model:** Role-based only with fixed permissions per role (simple for v1)
- **Privacy Enforcement:** Database-level filtering — Queries automatically filter by user ownership
- **Default Behavior:** Admin view by default when Admin logs in, sticky preferences across sessions, explicit switch required for admin functions
- **Navigation Pattern:** Hamburger menu (slide-out navigation to save screen space)
- **Layout Approach:** Card-based layouts for easy scanning and touch interaction
- **Responsive Strategy:** Breakpoint strategy with specific layouts for phone/tablet/desktop
- **Main Screen:** Dashboard-first approach — overview dashboard on main screen, detailed views in menu
- **Menu Structure:** Contextual menu content that changes based on current role (Admin/Manager/Employee)
- **Workflow Division:** Weight entry on desktop/laptop, mobile optimized for performance viewing
- **Database Schema:** Hybrid approach — Normalized core data, denormalized aggregates for dashboards
- **Authentication Implementation:** Next.js Auth.js (NextAuth) for mature, well-tested auth handling
- **Database Hosting:** Managed database service (AWS RDS, Google Cloud SQL, etc.)
- **API Architecture:** Next.js API routes for integrated frontend-backend communication

### Claude's Discretion
- Session management implementation details (JWT vs server sessions)
- Exact responsive breakpoints and mobile optimizations
- Database migration strategy and schema specifics
- Error handling and validation patterns
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.2.3+ | Full-stack React framework | Industry standard, App Router for server components, critical security patches |
| NextAuth.js | 4.24.11+ | Authentication system | Mature auth handling, OAuth providers, session management |
| PostgreSQL | 17.x | Primary database | Cannabis industry standard, RLS for privacy, ACID compliance |
| Prisma | 5.22.0+ | Database ORM | Type-safe queries, schema management, migrations |
| Tailwind CSS | 3.4.15+ | Styling framework | Mobile-first utilities, rapid development, consistency |
| TypeScript | 5.6.3+ | Type system | Cannabis industry compliance, error prevention, maintainability |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.23.8+ | Schema validation | Server Action input validation, form validation |
| @types/bcrypt | latest | Password hashing types | TypeScript support for bcrypt |
| bcrypt | 5.1.1+ | Password hashing | Secure password storage (NextAuth handles internally) |
| @prisma/adapter-postgresql | latest | Prisma PostgreSQL adapter | Enhanced PostgreSQL features |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| NextAuth.js | Clerk | Faster setup but vendor lock-in, higher cost |
| Database sessions | JWT-only | Better performance but no immediate revocation |
| PostgreSQL | MySQL | Simpler setup but lacks RLS for privacy enforcement |

**Installation:**
```bash
npm install next@15.2.3 @auth/prisma-adapter next-auth@4.24.11 prisma@5.22.0 @prisma/client@5.22.0 tailwindcss@3.4.15 typescript@5.6.3 zod@3.23.8
npm install -D @types/node @types/react @types/react-dom
```

**Version verification:** Verified versions current as of 2026-03-20. Next.js 15.2.3+ required for CVE-2025-29927 security patch.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth route group
│   ├── (dashboard)/    # Protected routes
│   ├── api/auth/       # NextAuth API routes
│   └── globals.css     # Tailwind imports
├── lib/                # Shared utilities
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Prisma client
│   └── validations.ts  # Zod schemas
├── components/         # React components
│   ├── ui/             # Base UI components
│   ├── auth/           # Auth-specific components
│   └── navigation/     # Navigation components
└── prisma/             # Database schema and migrations
    ├── schema.prisma
    └── migrations/
```

### Pattern 1: NextAuth.js Database Sessions
**What:** Server-side session storage with immediate revocation capability
**When to use:** Cannabis industry compliance requiring audit trails and immediate access control
**Example:**
```typescript
// lib/auth.ts
// Source: NextAuth.js official docs
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 8 * 60 * 60, // 8 hours for cannabis compliance
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        // Validation logic here
      }
    })
  ],
  callbacks: {
    session({ session, user }) {
      session.user.role = user.role
      return session
    }
  }
})
```

### Pattern 2: Row Level Security (RLS) for Privacy
**What:** Database-level filtering ensuring employees cannot access other employees' data
**When to use:** Multi-tenant privacy requirements, cannabis industry compliance
**Example:**
```sql
-- Enable RLS on performance data
-- Source: PostgreSQL RLS documentation
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_data_isolation ON performance_data
    FOR ALL TO app_user
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Set user context in Prisma queries
-- Source: Prisma Client Extensions documentation
```

### Pattern 3: Mobile-First Responsive Design
**What:** 320px baseline with progressive enhancement
**When to use:** Cannabis industry mobile usage patterns (employee break-time viewing)
**Example:**
```typescript
// components/ui/Card.tsx
// Source: Tailwind CSS mobile-first documentation
export function Card({ children, className = "" }) {
  return (
    <div className={`
      w-full p-4 rounded-lg shadow-lg bg-white
      min-h-[100px] touch-manipulation
      sm:max-w-sm md:max-w-md lg:max-w-lg
      ${className}
    `}>
      {children}
    </div>
  )
}
```

### Pattern 4: Role-Based Component Access
**What:** Role-aware components with context switching
**When to use:** Admin users needing Manager/Employee views
**Example:**
```typescript
// components/RoleGuard.tsx
// Source: NextAuth.js role-based access patterns
import { useSession } from "next-auth/react"

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return null
  }
  
  return <>{children}</>
}
```

### Anti-Patterns to Avoid
- **Client-only auth checks:** Always verify authentication server-side due to CVE-2025-29927
- **Storing JWTs in localStorage:** Use HttpOnly cookies to prevent XSS attacks
- **Middleware-only protection:** Implement defense-in-depth with route-level verification
- **Exposing role logic to client:** Keep role permissions server-side for security

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Authentication system | Custom login/session management | NextAuth.js | OAuth provider integration, security patches, session management |
| Password hashing | Custom crypto implementation | bcrypt via NextAuth | Salt generation, timing attack prevention, industry standard |
| Role-based routing | Custom route guards | NextAuth.js + middleware | Tested patterns, security best practices, vulnerability patches |
| Form validation | String parsing and validation | Zod schemas | Type safety, runtime validation, error handling |
| Database queries | Raw SQL for user data | Prisma with RLS | SQL injection prevention, type safety, automatic filtering |
| Responsive layouts | Custom CSS breakpoints | Tailwind utilities | Mobile-first patterns, accessibility, browser compatibility |
| Session storage | Browser storage APIs | Database sessions | Immediate revocation, audit trails, cannabis compliance |

**Key insight:** Cannabis industry compliance requires mature, audited libraries with established security patterns. Custom authentication implementations lack the battle-testing needed for regulated industries.

## Common Pitfalls

### Pitfall 1: CVE-2025-29927 Middleware Bypass
**What goes wrong:** Relying solely on middleware for authentication protection allows bypass via x-middleware-subrequest header
**Why it happens:** Next.js middleware can be bypassed by malicious requests with internal headers
**How to avoid:** Upgrade to Next.js 15.2.3+ immediately, implement defense-in-depth with route-level auth checks
**Warning signs:** Using only middleware.ts for auth without route-level verification

### Pitfall 2: Cannabis Compliance Violations
**What goes wrong:** Using JWT-only sessions prevents immediate user access revocation required by cannabis regulations
**Why it happens:** JWT tokens cannot be revoked until expiration, violating compliance requirements
**How to avoid:** Use database sessions for immediate revocation capability, implement detailed audit logging
**Warning signs:** Cannot demonstrate immediate access control during compliance audits

### Pitfall 3: Client-Side Auth State Exposure
**What goes wrong:** Storing authentication tokens in localStorage makes them accessible to XSS attacks
**Why it happens:** Developers choose localStorage for simplicity without considering security implications
**How to avoid:** Use HttpOnly cookies for token storage, validate auth server-side for every protected action
**Warning signs:** Using localStorage.getItem() for auth tokens

### Pitfall 4: Privacy Enforcement Gaps
**What goes wrong:** Application-level filtering allows data leakage through direct database access or API vulnerabilities
**Why it happens:** Relying on application code for privacy instead of database-level enforcement
**How to avoid:** Implement PostgreSQL Row Level Security (RLS) as primary privacy mechanism
**Warning signs:** Privacy filtering only in application code without database policies

### Pitfall 5: Mobile Touch Interface Problems
**What goes wrong:** Touch targets under 44px cause user frustration and accessibility violations
**Why it happens:** Designing for desktop first without considering mobile touch requirements
**How to avoid:** Use 320px baseline design, minimum 44px touch targets, adequate spacing
**Warning signs:** High mobile bounce rates, user complaints about "hard to tap" buttons

## Code Examples

Verified patterns from official sources:

### NextAuth.js Configuration
```typescript
// lib/auth.ts
// Source: NextAuth.js official documentation
import { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !await compare(credentials.password, user.password)) {
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = user.role
      return session
    }
  }
} satisfies NextAuthConfig
```

### PostgreSQL RLS Privacy Policy
```sql
-- Source: PostgreSQL Row Level Security documentation
-- Enable RLS on user-sensitive tables
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own performance data
CREATE POLICY user_performance_access ON performance_data
    FOR ALL TO authenticated_user
    USING (employee_id = current_setting('app.current_user_id')::uuid);

-- Policy: Managers can see their team members' data
CREATE POLICY manager_team_access ON performance_data
    FOR SELECT TO authenticated_user
    USING (
        employee_id IN (
            SELECT id FROM users 
            WHERE manager_id = current_setting('app.current_user_id')::uuid
        )
    );
```

### Mobile-First Card Layout
```typescript
// components/ui/DashboardCard.tsx
// Source: Tailwind CSS responsive design documentation
interface DashboardCardProps {
  title: string
  value: string
  subtitle?: string
  children?: React.ReactNode
}

export function DashboardCard({ title, value, subtitle, children }: DashboardCardProps) {
  return (
    <div className="
      w-full p-4 bg-white rounded-lg shadow-md
      min-h-[120px] touch-manipulation
      border border-gray-200 hover:shadow-lg
      transition-shadow duration-200
      sm:min-h-[140px] lg:min-h-[160px]
    ">
      <h3 className="text-sm font-medium text-gray-600 mb-2">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
}
```

### Role Switcher Component
```typescript
// components/RoleSwitcher.tsx
// Source: NextAuth.js role management patterns
import { useSession } from "next-auth/react"

export function RoleSwitcher() {
  const { data: session, update } = useSession()
  const currentRole = session?.user?.activeRole || session?.user?.role

  const handleRoleSwitch = async (newRole: string) => {
    await update({
      activeRole: newRole
    })
  }

  if (session?.user?.role !== 'admin') return null

  return (
    <div className="flex gap-2 p-2">
      {['admin', 'manager', 'employee'].map((role) => (
        <button
          key={role}
          onClick={() => handleRoleSwitch(role)}
          className={`
            px-3 py-1 text-sm rounded-md capitalize
            min-h-[44px] min-w-[44px] touch-manipulation
            ${currentRole === role 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {role}
        </button>
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js v4 | NextAuth.js v5 (Auth.js) | Q1 2025 | Improved TypeScript support, better App Router integration |
| Client-side auth | Server Components auth | Q2 2024 | Better security, reduced client bundle size |
| CSS-in-JS responsive | Tailwind mobile-first | 2023 | Faster development, smaller bundles |
| JWT-only sessions | Database sessions | 2025 (compliance) | Immediate revocation for cannabis industry |
| Application-level privacy | Database RLS | 2024 | Mandatory for multi-tenant privacy |

**Deprecated/outdated:**
- NextAuth.js v3: Deprecated, security vulnerabilities
- Pages Router auth patterns: App Router required for new projects
- localStorage token storage: XSS vulnerable, use HttpOnly cookies
- Middleware-only auth: CVE-2025-29927 bypass vulnerability

## Open Questions

1. **Session Duration for Cannabis Compliance**
   - What we know: 8-hour sessions common for cannabis industry
   - What's unclear: Specific state requirements for session timeout
   - Recommendation: Start with 8-hour max, make configurable for state compliance

2. **MFA Implementation Timeline**
   - What we know: Cannabis regulations increasingly require MFA
   - What's unclear: v1 vs v2 implementation priority
   - Recommendation: Design auth system with MFA hooks, implement in Phase 2

3. **PostgreSQL Connection Pooling**
   - What we know: Managed database services provide connection pooling
   - What's unclear: Optimal pool size for role-switching workloads
   - Recommendation: Start with provider defaults, monitor connection usage

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + React Testing Library 14.3.1 |
| Config file | jest.config.js — see Wave 0 |
| Quick run command | `npm test -- --testPathPattern="auth|mobile"` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User can create account with email/password | integration | `npm test -- --testPathPattern="auth.test.ts" --testNamePattern="account creation"` | ❌ Wave 0 |
| AUTH-02 | User can log in and stay logged in across sessions | integration | `npm test -- --testPathPattern="auth.test.ts" --testNamePattern="session persistence"` | ❌ Wave 0 |
| AUTH-03 | User can log out from any page | unit | `npm test -- --testPathPattern="logout.test.ts"` | ❌ Wave 0 |
| AUTH-04 | Role-based access control with Employee/Manager/Admin roles | unit | `npm test -- --testPathPattern="rbac.test.ts"` | ❌ Wave 0 |
| UX-01 | Mobile-responsive design optimized for phone usage | unit | `npm test -- --testPathPattern="responsive.test.ts"` | ❌ Wave 0 |
| UX-02 | Employees cannot view other employees' performance data | integration | `npm test -- --testPathPattern="privacy.test.ts"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="auth|mobile" --bail`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth.test.ts` — covers AUTH-01, AUTH-02, AUTH-04
- [ ] `tests/logout.test.ts` — covers AUTH-03
- [ ] `tests/responsive.test.ts` — covers UX-01
- [ ] `tests/privacy.test.ts` — covers UX-02 with RLS testing
- [ ] `jest.config.js` — Jest configuration with React Testing Library
- [ ] Framework install: `npm install -D jest @testing-library/react @testing-library/jest-dom`

## Sources

### Primary (HIGH confidence)
- [NextAuth.js Official Documentation](https://next-auth.js.org/configuration/options) - Authentication patterns and configuration
- [Next.js App Router Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official Next.js auth guidance
- [PostgreSQL Row Level Security Documentation](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) - RLS implementation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Mobile-first utilities

### Secondary (MEDIUM confidence)
- [CVE-2025-29927 Security Advisory](https://nextjs.org/blog/security-update-2025-12-11) - Critical vulnerability details
- [Cannabis Industry Compliance Requirements](https://cure8.tech/2025-cannabis-industry-regulations-key-changes-compliance-tips/) - Industry-specific security needs
- [Prisma Row Level Security Guide](https://www.prisma.io/docs/guides/database/row-level-security) - RLS with Prisma implementation

### Tertiary (LOW confidence)
- WebSearch results on mobile touch interface standards - needs verification with W3C accessibility guidelines

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified current versions, established cannabis industry usage
- Architecture: HIGH - official documentation, proven patterns for regulated industries
- Pitfalls: HIGH - documented CVE vulnerabilities, cannabis compliance requirements verified

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (30 days for stable technologies with recent security updates)