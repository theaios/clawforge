# SHARED PROTOCOL — Inter-Agent Communication & Handoff Standards

## PURPOSE
This document defines how all three agents communicate with each other, hand off work, escalate issues, and maintain shared awareness. Every agent must follow these standards.

---

## 1. MESSAGE FORMAT STANDARDS

### Standard Inter-Agent Message
```
FROM: [AGENT-ID]
TO: [AGENT-ID or ORCHESTRATOR]
TYPE: [Request / Handoff / Escalation / Status Update / FYI / Collaboration Request]
PRIORITY: [CRITICAL / HIGH / MEDIUM / LOW]
SUBJECT: [One-line summary]

BODY:
[Detailed message content]

ACTION REQUIRED:
[What the receiving agent needs to do, or "None — informational only"]

DEADLINE: [Date/time or "No deadline"]
```

### Escalation Message (to Orchestrator or Human)
```
ESCALATION
FROM: [AGENT-ID]
SEVERITY: [SEV-1 Critical / SEV-2 High / SEV-3 Medium]
SUBJECT: [One-line summary]

SITUATION: [What happened]
IMPACT: [Who/what is affected]
ACTIONS TAKEN: [What you've already done]
OPTIONS: [Proposed next steps, if any]
RECOMMENDATION: [What you think should happen]
URGENCY: [Why this can't wait]
```

---

## 2. HANDOFF PROTOCOLS

### CEO → COO: New Client Handoff (Post-Close)
Required data package CEO must provide:
- Client name and primary contact (name, email, phone)
- Agreed service tier and pricing
- Contract start date and billing cycle
- Specific scope of work and deliverables
- Timeline commitments made during sales
- Any special promises, discounts, or customizations agreed to
- Client's stated goals and success criteria
- Relevant notes from sales conversations (pain points, personality, communication preferences)

COO acknowledges receipt and begins onboarding within 4 hours.

### COO → CTO: Technical Support Escalation
Required data package COO must provide:
- Client name and account ID
- Issue description (client's words + COO's assessment)
- Severity level: Critical (service down), High (degraded), Medium (inconvenience), Low (cosmetic)
- Steps COO has already taken to resolve
- Client's urgency level and any deadlines
- Screenshots, logs, or error messages if available
- Client's preferred communication channel for updates

CTO acknowledges receipt within 1 hour for Critical/High, 4 hours for Medium/Low.

### CTO → COO: Deployment/Fix Completion
Required data package CTO must provide:
- What was built, fixed, or changed
- Client impact: what they'll notice, what's different
- Any action required by the client
- Updated documentation (if applicable)
- Client-friendly explanation COO can use in communication
- Any known limitations or follow-up items

COO communicates to client within 2 hours of receiving handoff.

### CEO → CTO: Feature/Build Request
Required data package CEO must provide:
- Business case: why this is needed (client demand, competitive, strategic)
- Desired outcome: what it should do from the user's perspective
- Priority level relative to other requests
- Any deadline drivers (client commitment, market window)
- Budget constraints if applicable

CTO responds within 24 hours with: feasibility assessment, effort estimate, proposed approach, timeline.

---

## 3. STATUS REPORTING

### Daily Agent Status Report (Submitted to Orchestrator)
Each agent submits at end of day:
```
DAILY STATUS — [AGENT-ID] — [Date]

COMPLETED TODAY:
- [Task 1: brief description]
- [Task 2: brief description]

IN PROGRESS:
- [Task: status, expected completion]

BLOCKED:
- [Task: what's blocking, what I need]

METRICS:
- [2-3 key metrics for your domain]

TOMORROW'S PRIORITIES:
- [Priority 1]
- [Priority 2]
- [Priority 3]

FLAGS/CONCERNS:
- [Anything the team should know]
```

### Weekly Summary (Compiled by Orchestrator)
Orchestrator compiles from all three agents:
- Revenue update (CEO)
- Client health snapshot (COO)
- System health and development progress (CTO)
- Cross-team blockers or dependencies
- Upcoming week priorities
- Decisions made and rationale

---

## 4. SHARED DEFINITIONS

### Priority Levels
- **CRITICAL**: Revenue at risk, system down, security breach, or client threatening to leave. Drop everything.
- **HIGH**: Important deadline approaching, significant client request, or blocking other work. Handle today.
- **MEDIUM**: Standard business operations. Handle within 48 hours.
- **LOW**: Nice to have, improvements, non-urgent. Handle within one week.

### Severity Levels (Technical)
- **SEV-1**: Complete service outage or data breach. All hands. Target resolution: 1 hour.
- **SEV-2**: Major feature broken or significant performance degradation. Target resolution: 4 hours.
- **SEV-3**: Minor feature issue or cosmetic problem. Target resolution: 24 hours.
- **SEV-4**: Enhancement request or low-impact bug. Target resolution: 1 week.

### Client Health Scores
- **GREEN (Healthy)**: Active, engaged, paying on time, no open issues. Score: 80-100.
- **YELLOW (Watch)**: Declining engagement, minor complaints, delayed payments. Score: 50-79.
- **RED (At Risk)**: Unresponsive, escalated complaints, overdue payments, churn signals. Score: 0-49.

---

## 5. COLLABORATION SESSIONS

When two or more agents need to work together on something complex:

1. **Request**: Any agent can request a collaboration session via Orchestrator.
2. **Approval**: Orchestrator approves and sets parameters.
3. **Structure**:
   - Maximum duration: 30 minutes
   - Must have a defined deliverable (document, decision, plan)
   - One agent leads, others support
   - Session notes recorded for Orchestrator
4. **Output**: Lead agent submits session summary to Orchestrator within 1 hour.

### Common Collaboration Scenarios:
- CEO + CTO: New feature scoping
- CEO + COO: Client retention strategy for at-risk account
- COO + CTO: Onboarding workflow automation
- All Three: Quarterly planning, major incident response, pricing restructure

---

## 6. CONFLICT RESOLUTION

If two agents disagree:
1. Each agent states their position and reasoning in writing.
2. Both positions are submitted to Orchestrator.
3. Orchestrator evaluates against the Priority Stack.
4. Orchestrator makes a binding decision.
5. Decision is documented with reasoning.
6. Both agents execute on the decision regardless of personal position.

**Rule**: No agent can block another agent's work by withholding collaboration. If an agent needs input from another agent to proceed, the receiving agent must respond within the SLA for that priority level, even if they disagree with the request.

---

## 7. EMERGENCY PROTOCOL

If any agent detects a critical situation (system down, security breach, client emergency):
1. Immediately send ESCALATION message to Orchestrator with SEV-1.
2. Begin containment actions within your domain without waiting for approval.
3. Notify other agents that may be impacted.
4. Orchestrator coordinates response and escalates to human if LEVEL 4 criteria are met.
5. Post-incident: Lead agent writes incident report within 24 hours.

Incident Report Template:
```
INCIDENT REPORT — [Date]
Detected by: [AGENT-ID]
Severity: [SEV Level]
Duration: [Start time — Resolution time]
Impact: [What/who was affected]
Root Cause: [What caused it]
Resolution: [What fixed it]
Prevention: [What we're doing to prevent recurrence]
```
