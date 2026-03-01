# 3-PERSON AUTONOMOUS COMPANY — OpenClaw Deployment Guide

## WHAT'S IN THIS PACKAGE

This is a complete, production-ready agent configuration for running a 3-person autonomous company through OpenClaw. Each file is designed to be fed directly into the orchestrator system as agent prompts/role definitions.

### File Manifest

| File | Purpose | Feeds Into |
|------|---------|------------|
| `orchestrator.md` | Master control system — routes tasks, resolves conflicts, manages the daily cycle | OpenClaw Orchestrator |
| `agent-ceo.md` | CEO / Visionary & Sales Lead — full role definition, authority levels, daily tasks | Agent Slot 1 |
| `agent-coo.md` | COO / Operations & Client Success — full role definition, authority levels, daily tasks | Agent Slot 2 |
| `agent-cto.md` | CTO / Builder & Systems Architect — full role definition, authority levels, daily tasks | Agent Slot 3 |
| `shared-protocol.md` | Communication standards, handoff formats, escalation procedures, emergency protocol | Shared context for all agents |
| `company-knowledge-base.md` | Company profile, products, pricing, brand guidelines, tools, policies, goals | Shared context for all agents |

## DEPLOYMENT ORDER

1. **Fill in `company-knowledge-base.md` first.** This is the company-specific data all agents need. Replace all bracketed placeholders with your actual company information.

2. **Load `orchestrator.md`** into your OpenClaw orchestrator. This is the brain that manages everything.

3. **Load `shared-protocol.md`** as shared context accessible to all agents and the orchestrator.

4. **Load `company-knowledge-base.md`** as shared context accessible to all agents and the orchestrator.

5. **Load each agent file** into its respective agent slot:
   - `agent-ceo.md` → Agent Slot 1
   - `agent-coo.md` → Agent Slot 2
   - `agent-cto.md` → Agent Slot 3

## CUSTOMIZATION CHECKLIST

Before going live, customize these elements:

- [ ] Company profile in knowledge base (name, mission, location, website)
- [ ] Products/services and pricing tiers
- [ ] Brand voice and messaging guidelines
- [ ] Target customer profile
- [ ] Tools and platforms (CRM, project management, etc.)
- [ ] SLA commitments and communication hours
- [ ] Refund and data policies
- [ ] Quarterly goals
- [ ] Competitive landscape notes
- [ ] Decision authority dollar thresholds (adjust $500/$200/$100 limits to match your business)

## HOW IT WORKS

```
                    ┌─────────────────┐
                    │   ORCHESTRATOR   │
                    │  Routes, Syncs,  │
                    │  Resolves, Logs  │
                    └───────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐
       │  AGENT-CEO  │ │ AGENT-COO  │ │  AGENT-CTO  │
       │  Strategy   │ │ Operations │ │  Technical   │
       │  Sales      │ │ Clients    │ │  Building    │
       │  Brand      │ │ Process    │ │  Security    │
       └─────────────┘ └────────────┘ └─────────────┘
```

**Flow:**
- Tasks enter through the Orchestrator
- Orchestrator routes to the right agent based on domain
- Agents execute within their authority levels
- Cross-domain work follows handoff protocols
- Escalations flow up through defined severity levels
- Daily status reports keep everyone aligned

## AUTHORITY LEVEL QUICK REFERENCE

| Level | Who Decides | Examples |
|-------|-------------|----------|
| 1 — Autonomous | Agent alone | Routine domain tasks |
| 2 — Notify | Agent decides, tells others | Cross-domain impact |
| 3 — Orchestrator | Orchestrator approves | High-impact decisions |
| 4 — Human | Founder/owner approves | Financial, legal, security |

## TIPS FOR BEST RESULTS

1. **Start with the knowledge base.** The more complete your company context, the better every agent performs.
2. **Let the orchestrator do its job.** Don't bypass routing — it exists to prevent chaos.
3. **Adjust authority thresholds.** The dollar amounts and approval levels are starting points. Tune them to your risk tolerance.
4. **Review daily summaries.** The end-of-day reports are your window into what's happening. Read them.
5. **Add to the knowledge base over time.** As the company evolves, update the shared context. Better context = better agent decisions.
