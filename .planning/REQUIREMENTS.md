# Requirements

## v1 Requirements

### Authentication & Access Control
- [ ] **AUTH-01**: User can create account with email/password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions  
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Role-based access control with Employee/Manager/Admin roles and appropriate overlaps

### Performance Tracking  
- [ ] **PERF-01**: Employee can view their daily gram production with strain context
- [ ] **PERF-02**: Employee can see historical performance trends (day-to-day, batch-to-batch)
- [ ] **PERF-03**: Employee can view projected commission earnings based on batch performance

### Data Management
- [ ] **DATA-01**: Manager can create batches with strain specification
- [ ] **DATA-02**: Manager can create daily entries within batches
- [ ] **DATA-03**: Manager can input employee weights with autocomplete search functionality
- [ ] **DATA-04**: Manager can submit completed days to notify employees of new data

### Administrative Functions
- [ ] **ADMIN-01**: Admin can add, edit, and delete employee accounts
- [ ] **ADMIN-02**: Admin and Manager can view team-wide performance statistics

### User Experience
- [ ] **UX-01**: Mobile-responsive design optimized for phone usage
- [ ] **UX-02**: Employees cannot view other employees' performance data (privacy)

## v2 Requirements (Deferred)

### Enhanced Features
- [ ] **ENH-01**: Real-time notifications for completed days
- [ ] **ENH-02**: Advanced analytics and performance insights
- [ ] **ENH-03**: Offline data entry capability
- [ ] **ENH-04**: Performance comparison tools with privacy controls

### Integration
- [ ] **INT-01**: Integration APIs for cannabis compliance software
- [ ] **INT-02**: Export functionality for payroll systems

## Out of Scope

- **Native mobile app** — Web-first approach provides universal access with faster development
- **Real-time push notifications** — Simple login-to-check approach reduces complexity for v1
- **Cannabis compliance software integration** — Standalone system initially, integration in future versions
- **Advanced AI/ML analytics** — Focus on core functionality first, enhance with intelligence later

## Commission Calculation Requirements

Based on research findings, commission calculation must be transparent and auditable:

### Commission Formula
- **Base Formula**: Commission = (Total Pounds × $175) - (Total Hours × $20)
- **Display Requirements**: Show exact calculation breakdown to employees
- **Audit Requirements**: Maintain calculation history and audit trails

### Data Privacy Requirements

Cannabis industry compliance requirements:
- Employee data must be encrypted at rest and in transit
- Strict role-based access controls prevent unauthorized data access
- Individual performance data isolated between employees
- Team metrics aggregated to prevent individual identification

## Traceability

*This section will be populated during roadmap creation to map requirements to phases*

---
*Generated: 2026-03-20 from PROJECT.md active requirements and research findings*