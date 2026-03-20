# Architecture Research

**Domain:** Employee Performance Management & Commission Tracking
**Researched:** 2026-03-20
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Employee │  │ Manager │  │  Admin  │  │  Auth   │        │
│  │Dashboard│  │Dashboard│  │Dashboard│  │ Guard   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                       API Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │             Business Logic Services                  │    │
│  │   Auth • Performance • Commission • Batch Mgmt     │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Users   │  │  Batches │  │ Daily    │                   │
│  │  & Roles │  │ & Strains│  │ Entries  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Employee Dashboard | Display performance data, trends, commission projections | React/Vue components with charts |
| Manager Dashboard | Input daily weights, view team performance, batch management | Form-heavy UI with data tables |
| Admin Dashboard | User management, system configuration, reporting | CRUD interfaces with role management |
| Auth Guard | Role-based access control, session management | JWT + middleware patterns |
| Performance Service | Calculate metrics, generate trends, data aggregation | Business logic layer with caching |
| Commission Service | Calculate earnings, project future payments | Financial calculation engine |
| Batch Service | Manage work periods, strain tracking, status updates | Workflow state management |

## Recommended Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── charts/          # Performance visualization components
│   ├── forms/           # Data entry forms for managers
│   └── dashboard/       # Role-specific dashboard layouts
├── pages/               # Route-level components
│   ├── employee/        # Employee-specific views
│   ├── manager/         # Manager-specific views
│   └── admin/           # Admin-specific views
├── services/            # Business logic and API calls
│   ├── auth.ts          # Authentication & authorization
│   ├── performance.ts   # Performance calculations
│   ├── commission.ts    # Commission calculations
│   └── batches.ts       # Batch management
├── stores/              # State management
│   ├── auth.ts          # User session and roles
│   ├── performance.ts   # Performance data cache
│   └── batches.ts       # Current batch state
├── utils/               # Shared utilities
│   ├── calculations.ts  # Performance and commission math
│   ├── validators.ts    # Input validation
│   └── formatters.ts    # Data display formatting
└── types/               # TypeScript definitions
    ├── user.ts          # User and role types
    ├── performance.ts   # Performance data types
    └── batch.ts         # Batch and strain types
```

### Structure Rationale

- **components/:** Organized by function type (charts, forms, dashboards) for reusability across roles
- **pages/:** Role-based organization matches access control boundaries and simplifies routing
- **services/:** Business logic separation enables testing and potential backend extraction
- **stores/:** Domain-driven state organization aligns with component needs and data flow

## Architectural Patterns

### Pattern 1: Role-Based Component Composition

**What:** Components that render different content based on user roles without conditional logic sprawl
**When to use:** Multi-role dashboards where functionality overlaps but access differs
**Trade-offs:** Cleaner code but requires careful prop typing and role validation

**Example:**
```typescript
const PerformanceChart = ({ userRole, employeeId }: Props) => {
  const canViewDetails = hasPermission(userRole, 'view:performance:details');
  const data = usePerformanceData(employeeId, canViewDetails);
  
  return (
    <Chart data={data}>
      {canViewDetails && <DetailView />}
      {userRole === 'manager' && <EditControls />}
    </Chart>
  );
};
```

### Pattern 2: Commission Calculation Pipeline

**What:** Immutable data flow for calculating commissions with audit trails
**When to use:** Financial calculations requiring accuracy and traceability
**Trade-offs:** More complex than direct calculation but provides confidence and debugging capability

**Example:**
```typescript
const calculateCommission = (entries: DailyEntry[]) => 
  pipe(
    entries,
    groupByBatch,
    calculateTotalWeight,
    applyCommissionRate,
    subtractHourlyPay,
    auditCalculation
  );
```

### Pattern 3: Hierarchical Permission System

**What:** Role inheritance where Admins get Manager permissions, Managers get Employee permissions
**When to use:** Small teams with overlapping responsibilities
**Trade-offs:** Simpler role management but less granular control

**Example:**
```typescript
const permissions = {
  employee: ['view:own:performance', 'view:own:commission'],
  manager: [...permissions.employee, 'create:batch', 'input:weights'],
  admin: [...permissions.manager, 'manage:users', 'view:all:performance']
};
```

## Data Flow

### Request Flow

```
[User Action]
    ↓
[Dashboard Component] → [Service Layer] → [API Route] → [Database]
    ↓                      ↓                 ↓            ↓
[State Update] ← [Transform Data] ← [Query Result] ← [Raw Data]
```

### State Management

```
[Performance Store]
    ↓ (subscribe)
[Dashboard Components] ←→ [Actions] → [Service Calls] → [API Updates]
    ↑                                        ↓
[Real-time Updates] ←← [WebSocket/Polling] ←← [Database Changes]
```

### Key Data Flows

1. **Daily Entry Flow:** Manager inputs weights → validation → batch association → commission recalculation → employee notification
2. **Performance View Flow:** Employee requests data → role check → filtered query → cached aggregation → chart rendering
3. **Commission Calculation:** Batch completion → weight totals → rate application → hourly deduction → final earnings

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 users | Single database, client-side calculations, simple auth |
| 50-500 users | Database indexing, server-side aggregations, role-based caching |
| 500+ users | Read replicas, pre-calculated metrics, real-time updates via WebSocket |

### Scaling Priorities

1. **First bottleneck:** Database queries for historical performance data — add indexes on employee_id + date
2. **Second bottleneck:** Commission calculations on large batches — pre-calculate and cache results
3. **Third bottleneck:** Dashboard rendering with many data points — implement virtualization and pagination

## Anti-Patterns

### Anti-Pattern 1: Client-Side Role Enforcement Only

**What people do:** Hide UI elements based on roles but don't validate server-side
**Why it's wrong:** Security through obscurity, easily bypassed by API calls
**Do this instead:** Validate permissions on every API endpoint, UI hiding is UX enhancement only

### Anti-Pattern 2: Overly Granular Permissions

**What people do:** Create specific permissions for every possible action
**Why it's wrong:** Management overhead outweighs benefits in small teams
**Do this instead:** Use role inheritance with sensible defaults, add granular permissions only when needed

### Anti-Pattern 3: Real-Time Everything

**What people do:** WebSocket connections for all data updates
**Why it's wrong:** Unnecessary complexity for data that changes infrequently
**Do this instead:** Use polling for daily entries, real-time only for urgent notifications

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Authentication Provider | OAuth/OIDC or simple JWT | Consider compliance requirements |
| Email Notifications | Queue-based sending | For batch completion alerts |
| Backup Storage | Scheduled exports | Cannabis compliance often requires data retention |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend ↔ API | REST with JWT auth | Standard web app pattern |
| Services ↔ Database | ORM/Query Builder | Prefer type-safe database access |
| Calculation ↔ Data | Immutable data flow | Ensure calculation reproducibility |

## Build Order Dependencies

### Phase 1: Core Foundation
1. **User Authentication** (blocking everything else)
2. **Database Schema** (users, roles, batches, daily_entries)
3. **Basic RBAC System** (required for all subsequent features)

### Phase 2: Basic Functionality
4. **Employee Dashboard** (depends on auth + RBAC)
5. **Performance Data Display** (depends on dashboard framework)
6. **Manager Data Entry** (depends on auth + database)

### Phase 3: Advanced Features
7. **Commission Calculations** (depends on performance data)
8. **Historical Trends** (depends on data accumulation)
9. **Admin User Management** (depends on RBAC foundation)

### Phase 4: Optimization
10. **Performance Optimizations** (caching, indexing)
11. **Real-time Updates** (WebSocket integration)
12. **Advanced Analytics** (depends on data volume)

### Critical Dependencies
- **RBAC must be built first** — affects every subsequent component
- **Database schema stability** — changes become expensive after data entry begins
- **Commission calculation logic** — needs validation before production use
- **Mobile responsiveness** — primary access method, not an afterthought

## Sources

- [Microsoft Azure Multi-tenant Architecture Guide](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview) - Role-based access patterns
- [Real-time Dashboard Architecture Patterns](https://www.tinybird.co/blog/real-time-dashboard-step-by-step) - Performance optimization strategies
- [RBAC Best Practices 2025](https://www.osohq.com/learn/rbac-best-practices) - Security and permission management
- [Performance Management System Components](https://ensaantech.com/blog/top-components-of-performance-management-system/) - Domain-specific architectural requirements

---
*Architecture research for: Cannabis Employee Performance & Commission Tracker*
*Researched: 2026-03-20*