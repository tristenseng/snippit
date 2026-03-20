# Stack Research

**Domain:** Employee Performance Management Web Application
**Researched:** 2025-03-19
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | ^15.3.0 | Full-stack React framework | Best-in-class SSR, API routes, and React 19 support. Zero-config deployment. Created by Vercel with day-one feature support |
| TypeScript | ^5.6.0 | Type safety and developer experience | Industry standard for React apps. Prevents runtime errors, improves IDE support, essential for team development |
| PostgreSQL | ^17.0 | Primary database | ACID compliance, excellent JSON support, mature ecosystem. Superior for structured HR data with complex queries and reporting |
| Prisma ORM | ^6.0 | Database toolkit and ORM | Type-safe database access, excellent PostgreSQL integration, auto-generated client. Performance improvements in v6+ |
| Tailwind CSS | ^3.4.0 | Utility-first CSS framework | Zero runtime overhead, mobile-first responsive design, consistent design system, faster development |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Auth.js (NextAuth.js) | ^5.0.0 | Authentication and session management | Role-based access control, secure session handling, multiple provider support |
| @prisma/adapter-pg | ^6.0.0 | PostgreSQL adapter for Prisma | Better serverless performance, reduced cold starts, required for optimal PostgreSQL integration |
| Zod | ^3.24.0 | Runtime type validation and parsing | Form validation, API input validation, type-safe environment variables |
| React Hook Form | ^7.53.0 | Form management | Performance-focused forms, minimal re-renders, excellent TypeScript support |
| @tanstack/react-query | ^5.59.0 | Server state management | Background updates, caching, optimistic updates for performance data |
| date-fns | ^4.1.0 | Date manipulation | Performance period calculations, commission date ranges, lighter than moment.js |
| Recharts | ^2.12.7 | Data visualization | Performance charts and trends, React-native, responsive charts |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code linting and formatting | Use @next/eslint-config-next for Next.js specific rules |
| Prettier | Code formatting | Configure with Tailwind plugin for class sorting |
| Husky | Git hooks | Pre-commit linting and type checking |
| @prisma/client | Generated database client | Auto-generated based on schema, provides full type safety |

## Installation

```bash
# Core framework and runtime
npm install next@^15.3.0 react@^19.0.0 react-dom@^19.0.0 typescript@^5.6.0

# Database and ORM
npm install prisma@^6.0.0 @prisma/client@^6.0.0 @prisma/adapter-pg@^6.0.0 pg@^8.13.0

# Authentication
npm install next-auth@^5.0.0

# UI and styling
npm install tailwindcss@^3.4.0 autoprefixer@^10.4.20 postcss@^8.4.49

# Form handling and validation
npm install react-hook-form@^7.53.0 @hookform/resolvers@^3.10.0 zod@^3.24.0

# Data fetching and state
npm install @tanstack/react-query@^5.59.0

# Utilities
npm install date-fns@^4.1.0 clsx@^2.1.1

# Data visualization
npm install recharts@^2.12.7

# Dev dependencies
npm install -D @types/node@^22.0.0 @types/react@^19.0.0 @types/react-dom@^19.0.0 @types/pg@^8.11.10 eslint@^9.0.0 eslint-config-next@^15.3.0 prettier@^3.3.0 prettier-plugin-tailwindcss@^0.6.8 husky@^9.1.6
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| PostgreSQL | MongoDB | If performance data structure varies dramatically across roles or you need horizontal write scaling |
| Tailwind CSS | CSS-in-JS (styled-components) | If you need highly dynamic styling or existing codebase uses CSS-in-JS |
| Prisma | Drizzle ORM | If you prefer SQL-first approach or need maximum performance (closer to raw SQL) |
| Vercel | Netlify | If you need built-in PostgreSQL database support or better pricing for commercial projects |
| Auth.js | Clerk | If you need advanced RBAC features out-of-the-box or prefer managed authentication |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Middleware-based authentication | CVE-2025-29927 vulnerability allows middleware bypass | Data Access Layer pattern with Server Components |
| CSS-in-JS in 2025 | Runtime overhead, React Server Components compatibility issues | Tailwind CSS for zero-runtime styling |
| Create React App | No longer maintained, lacks modern features | Next.js with App Router |
| Moment.js | Large bundle size, no longer maintained | date-fns for smaller bundle and better tree-shaking |
| GraphQL for this domain | Adds complexity without clear benefits for simple CRUD operations | REST APIs with Next.js API routes |

## Stack Patterns by Variant

**If building MVP quickly:**
- Use Vercel for deployment (Next.js optimization)
- Use Supabase for managed PostgreSQL
- Because fastest time-to-market with minimal configuration

**If compliance is critical (cannabis industry):**
- Use self-hosted PostgreSQL with row-level security
- Use Auth.js with database sessions (not JWT)
- Because better audit trails and data control

**If team is JavaScript-heavy:**
- Stick with recommended stack
- Because TypeScript learning curve is minimal, ecosystem alignment

**If budget is constrained:**
- Use Netlify deployment (better free tier)
- Use Neon or Supabase free tier for database
- Because commercial-friendly free tiers

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.x | React 19.x | Requires React 19 for new features, backward compatible with 18.x |
| Prisma 6.x | PostgreSQL 12+ | Requires PostgreSQL 12 or higher for full feature support |
| Auth.js 5.x | Next.js 14.2.4+ | Requires newer Next.js for proper App Router support |
| Tailwind 3.4.x | PostCSS 8.x | Requires PostCSS 8 for optimal build performance |

## Sources

- [Next.js Official Docs](https://nextjs.org/docs) — Authentication patterns, App Router best practices — HIGH confidence
- [Prisma 6 Performance Blog](https://www.prisma.io/blog/prisma-6-better-performance-more-flexibility-and-type-safe-sql) — Performance improvements and TypeScript engine — HIGH confidence
- [WebSearch: Next.js Authentication Best Practices 2025](https://www.franciscomoretti.com/blog/modern-nextjs-authentication-best-practices) — CVE-2025-29927 vulnerability and Data Access Layer pattern — MEDIUM confidence
- [WebSearch: PostgreSQL vs MongoDB 2025](https://dev.to/hamzakhan/postgresql-vs-mongodb-in-2025-which-database-should-power-your-next-project-2h97) — Database choice for structured employee data — MEDIUM confidence
- [WebSearch: Tailwind vs CSS-in-JS 2025](https://medium.com/@vishalthakur2463/styling-at-scale-tailwind-css-vs-css-in-js-in-2025-0e80db15e58c) — Performance and mobile responsiveness — MEDIUM confidence
- [WebSearch: Vercel vs Netlify 2025](https://www.netlify.com/guides/netlify-vs-vercel/) — Deployment platform comparison — MEDIUM confidence

---
*Stack research for: Cannabis Employee Performance & Commission Tracker*
*Researched: 2025-03-19*