# Feature Research

**Domain:** Employee Performance Management (Cannabis Trim Operation)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User Authentication & Role-based Access | Security and privacy are non-negotiable in cannabis industry | MEDIUM | Role hierarchy: Admin > Manager > Employee with overlapping permissions |
| Real-time Performance Data | Employees expect immediate visibility into their work output | LOW | Direct replacement for asking manager for numbers |
| Historical Performance Tracking | Workers need to see progress over time for motivation | MEDIUM | Day-to-day and batch-to-batch trending |
| Mobile-responsive Interface | Primary access is via mobile phones during breaks | MEDIUM | Touch-first design for quick check-ins |
| Basic Reporting/Analytics | Managers need team performance overview | MEDIUM | Individual privacy maintained, aggregate data visible |
| Goal/Target Setting | Workers need performance benchmarks | LOW | Strain-specific targets, production goals |
| Data Entry Forms | Manual entry must be efficient for managers | MEDIUM | Autocomplete, batch processing, strain context |
| Commission Calculation | Workers expect transparent compensation tracking | HIGH | $175/lb minus $20/hour base, projected earnings |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Strain-aware Performance Context | Meaningful comparisons within same strain type | MEDIUM | Cannabis-specific domain knowledge built-in |
| Real-time Commission Projection | Motivates during active batches, shows potential earnings | MEDIUM | Live calculation during batch progress |
| Batch Performance Analytics | Understand performance patterns across multi-day work cycles | HIGH | 4-5 day batch analysis, strain transition handling |
| Production Trend Visualization | Quick visual understanding of improvement/decline | MEDIUM | Simple charts optimized for mobile viewing |
| Privacy-first Team Metrics | Team stats without exposing individual performance | HIGH | Aggregate insights while maintaining worker privacy |
| Offline-capable Data Entry | Managers can work without cellular coverage | HIGH | Cannabis operations often in remote/indoor locations |
| Automated Performance Notifications | Workers know when new data is available | LOW | Simple status updates, no real-time push complexity |
| Performance Benchmarking | Compare against historical averages and strain norms | MEDIUM | Context-aware performance insights |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time Notifications | Seems modern and engaging | Battery drain, distraction, privacy concerns | Login-to-check approach with status indicators |
| Individual Performance Leaderboards | Gamification and competition | Creates toxic workplace culture, privacy violations | Anonymous team metrics and personal trend tracking |
| Complex Performance Scoring | Appears sophisticated | Unclear calculations reduce trust | Simple, transparent gram-based tracking with strain context |
| Native Mobile App | Feels more professional | Development complexity, app store issues | Progressive web app with mobile-first design |
| Integration with Compliance Software | Seems efficient | Privacy risks, regulatory complications | Standalone system with export capabilities |
| Automated Time Tracking | Reduces manual entry | Privacy invasion, inaccuracy in manual work | Manager-entered time with employee verification |
| Social Features (Comments, Chat) | Builds community | Workplace drama, compliance issues | Focus on individual performance and direct manager feedback |

## Feature Dependencies

```
User Authentication
    └──requires──> Role-based Access Control
                       └──requires──> Privacy Controls

Commission Calculation ──requires──> Performance Data Entry
                                         └──requires──> Strain Context

Historical Tracking ──requires──> Performance Data Storage
                                    └──requires──> Data Entry Forms

Batch Analytics ──enhances──> Historical Tracking
Performance Trends ──enhances──> Historical Tracking

Real-time Commission ──requires──> Commission Calculation
Offline Data Entry ──conflicts──> Real-time Notifications
```

### Dependency Notes

- **Commission Calculation requires Performance Data Entry:** Cannot calculate earnings without accurate production data
- **Historical Tracking requires Performance Data Storage:** Need persistent data to show trends
- **Batch Analytics enhances Historical Tracking:** Better insights when viewing 4-5 day cycles
- **Offline Data Entry conflicts with Real-time Notifications:** Cannot have both offline capability and instant updates

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] User Authentication with Role-based Access — Core security requirement for cannabis industry
- [ ] Performance Data Entry for Managers — Replace paper tracking system
- [ ] Real-time Performance Viewing for Employees — Core value proposition
- [ ] Basic Commission Calculation — Worker motivation and transparency
- [ ] Mobile-responsive Interface — Primary access method
- [ ] Strain Context for Entries — Meaningful performance comparison
- [ ] Basic Historical View — Show improvement over time

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Batch Performance Analytics — When users want deeper insights
- [ ] Performance Trend Visualization — When historical data accumulates
- [ ] Team Performance Metrics — When managers need broader oversight
- [ ] Automated Notifications — When login friction becomes an issue

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Offline Data Entry — Complex, add when remote access is critical
- [ ] Advanced Analytics/AI Insights — When basic analytics prove valuable
- [ ] Integration APIs — When connecting to other systems becomes necessary
- [ ] Performance Benchmarking — When enough data exists for meaningful comparisons

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User Authentication | HIGH | MEDIUM | P1 |
| Performance Data Entry | HIGH | MEDIUM | P1 |
| Real-time Performance View | HIGH | LOW | P1 |
| Commission Calculation | HIGH | HIGH | P1 |
| Mobile Interface | HIGH | MEDIUM | P1 |
| Strain Context | HIGH | LOW | P1 |
| Historical Tracking | MEDIUM | MEDIUM | P1 |
| Batch Analytics | MEDIUM | HIGH | P2 |
| Performance Trends | MEDIUM | MEDIUM | P2 |
| Team Metrics | MEDIUM | HIGH | P2 |
| Offline Capability | LOW | HIGH | P3 |
| Advanced Analytics | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | General Performance Mgmt | Agricultural Tracking | Our Approach |
|---------|--------------------------|----------------------|--------------|
| Performance Tracking | Annual/quarterly reviews | Daily production logging | Real-time daily gram tracking with strain context |
| Commission Calculation | Annual bonus calculations | Piece-rate pay tracking | Live commission projection with transparent formula |
| Data Entry | Self-service employee entry | Manager/supervisor entry | Manager entry with employee verification |
| Mobile Access | Basic mobile responsiveness | Offline-capable field apps | Mobile-first responsive design |
| Analytics | Complex performance dashboards | Production reports | Simple trends focused on individual improvement |
| Goal Setting | Quarterly OKRs and objectives | Daily/seasonal targets | Strain-specific production goals |

## Sources

- Performance Management Software Research (10 platforms analyzed): Betterworks, Lattice, Eletive, Quantum Workplace
- Agricultural Worker Tracking: Croptracker, FieldClock, DataTrack, PickApp
- Commission Tracking Software: Core Commissions, Performio, CaptivateIQ
- Manufacturing Production Tracking: Fuse Workforce, MES systems
- Cannabis Industry Compliance Considerations: Regulatory framework research

---
*Feature research for: Cannabis Employee Performance & Commission Tracker*
*Researched: 2026-03-19*