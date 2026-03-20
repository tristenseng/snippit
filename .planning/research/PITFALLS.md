# Domain Pitfalls

**Domain:** Cannabis Employee Performance Management & Commission Tracking
**Researched:** 2026-03-20

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Commission Calculation Opacity & Disputes
**What goes wrong:** Employees dispute commission calculations when they can't understand the formula or verify the math, leading to grievances, legal issues, and loss of trust in the system.
**Why it happens:** Complex commission formulas ($175/lb minus $20/hour base) without real-time transparency create black box scenarios. Manual paper-to-digital transitions often introduce calculation errors.
**Consequences:** Employee lawsuits over unpaid wages, loss of team morale, potential labor board investigations, complete system abandonment.
**Prevention:** Display exact calculation formulas in the UI, provide itemized breakdowns (hours × $20 = base pay subtraction), show running totals during batch progress, include audit trails for all calculations.
**Detection:** Employee questions about "why is my commission X?", requests for manual verification, complaints about payment discrepancies.

### Pitfall 2: Cannabis Compliance Data Exposure
**What goes wrong:** Performance data containing employee personal information, production amounts, or strain details gets exposed to unauthorized parties or stored non-compliantly, triggering regulatory violations.
**Why it happens:** Cannabis industry has strict data handling requirements that generic performance management systems don't address. Employee PII mixed with production data creates regulatory risk.
**Consequences:** Regulatory fines, license suspension/revocation, legal liability for data breaches, mandatory reporting to authorities.
**Prevention:** Implement role-based access controls, encrypt all data at rest and in transit, audit trail all data access, separate PII from production metrics, regular compliance reviews.
**Detection:** Compliance audit findings, unauthorized access logs, employees accessing other employees' data, data appearing where it shouldn't.

### Pitfall 3: Manual Data Entry Error Cascade
**What goes wrong:** Manager enters incorrect weights (typos, wrong strain, wrong employee), errors propagate through commission calculations affecting multiple payrolls before detection.
**Why it happens:** Manual entry from paper has 0.55-4% error rates. No real-time validation. Cannabis production data requires precision but relies on tired managers entering numbers at end of long days.
**Consequences:** Incorrect commission payments requiring retroactive adjustments, employee distrust, accounting reconciliation nightmares, potential wage theft claims.
**Prevention:** Input validation (reasonable weight ranges per strain), confirmation dialogs for large entries, daily/batch total sanity checks, employee review before finalization.
**Detection:** Unusual performance spikes/drops, batch totals that don't match expected yields, employee complaints about obviously wrong numbers.

## Moderate Pitfalls

### Pitfall 1: Mobile UI Information Overload
**What goes wrong:** Cramming all performance data onto small screens creates cognitive overload, making it impossible for employees to quickly find their key metrics during short breaks.
**Prevention:** Focus on 2-3 key metrics per screen (today's grams, batch progress, projected commission). Use progressive disclosure for detailed historical data. Optimize for thumb navigation and quick glances.

### Pitfall 2: Performance Comparison Gaming
**What goes wrong:** Employees figure out ways to manipulate the system (claiming better strains, gaming batch boundaries) when individual metrics become competitive rather than developmental.
**Prevention:** Focus on personal improvement trends rather than rankings. Hide absolute numbers from other employees. Emphasize batch-level team success metrics alongside individual tracking.

### Pitfall 3: Cross-Platform Data Inconsistency  
**What goes wrong:** Performance data shows differently on mobile vs desktop, or real-time updates fail to sync properly, creating confusion about actual performance.
**Prevention:** Implement single source of truth with real-time sync, consistent calculation logic across platforms, offline-first design with conflict resolution.

### Pitfall 4: Manager Feedback Avoidance
**What goes wrong:** Managers avoid entering data or having performance conversations because the system feels punitive rather than developmental, leading to sparse data and missed coaching opportunities.
**Prevention:** Design manager workflows to emphasize coaching prompts and positive reinforcement. Include fields for qualitative feedback, not just numbers. Frame as development tool, not evaluation tool.

## Minor Pitfalls

### Pitfall 1: Strain Context Loss
**What goes wrong:** Performance comparisons become meaningless when strain difficulty context is lost, making employees feel unfairly judged.
**Prevention:** Always display strain information alongside performance data. Include strain difficulty indicators or historical averages for context.

### Pitfall 2: Commission Expectation Inflation
**What goes wrong:** Showing projected commission based on early batch performance creates unrealistic expectations when pace inevitably slows toward batch end.
**Prevention:** Include disclaimers about projections, use conservative estimates, show range instead of point estimate, emphasize that projections are not guarantees.

### Pitfall 3: Access Pattern Mismatch
**What goes wrong:** System designed for extended desktop sessions when actual usage is 2-3 minute phone checks during breaks.
**Prevention:** Design for quick interactions, cache critical data for offline viewing, minimize taps to key information, optimize for poor network conditions.

### Pitfall 4: Historical Data Overwhelm
**What goes wrong:** Employees get lost in charts and graphs when they just want to know "how am I doing today?"
**Prevention:** Default to current/recent data, make historical views opt-in, focus on trends rather than absolute historical numbers.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Authentication & Role Setup | Cannabis employees often share devices/logins, breaking role-based security | Implement session timeouts, device registration, clear role indicators in UI |
| Data Entry Interface | Rush to build leads to poor validation, allowing impossible weights/times | Build validation rules first, test with actual production data ranges |
| Commission Calculations | Complex math creates black box that breeds distrust | Show calculation breakdown in UI from day one, not just final numbers |
| Mobile Responsive Design | Desktop-first design fails on actual usage pattern (quick phone checks) | Mobile-first approach mandatory, test on actual devices in workplace conditions |
| Historical Performance Views | Information architecture becomes overwhelming without clear user journeys | Start with simple "today vs yesterday" comparisons, add complexity gradually |
| Privacy Controls | Generic role permissions don't match cannabis industry hierarchy needs | Design for Admin=Manager+Employee overlaps, test actual role scenarios |

## Sources

- Web search: Employee performance management system pitfalls 2025-2026 (MEDIUM confidence)
- Web search: Cannabis industry compliance and privacy mistakes 2025 (MEDIUM confidence)  
- Web search: Commission-based pay transparency and fairness issues (HIGH confidence)
- Web search: Mobile performance tracking app design mistakes 2025 (HIGH confidence)
- Web search: Manual data entry accuracy and validation problems 2025 (HIGH confidence)