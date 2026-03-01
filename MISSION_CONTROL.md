# Mission Control (OpenClaw)

## Goal
Operate like an orchestrator: one command center, multiple specialist agents, strict execution gating.

## Operating Model
- **Command Center topic** = intake + orchestration only
- **Project topics** = execution context (no cross-topic mixing)
- **Kanban board** = source of truth for status
- **Sub-agents** = deep work workers; main agent supervises

## Agent Roster (v1)
1. **Planner Agent**
   - Turns goals into scoped tasks with milestones
   - Creates acceptance criteria and dependencies

2. **Research Agent**
   - Gathers references, options, risks, and recommendations
   - Returns concise decision memos

3. **Builder Agent**
   - Implements changes (code/docs/config)
   - Produces commit-ready outputs and rollback notes

4. **QA/Review Agent**
   - Validates requirements, checks edge cases, confirms done criteria

5. **Ops Reporter Agent**
   - Summarizes status every 4h for active tasks

## Routing Rules
- Anything in **Backlog / To Do** => planning only.
- Move to **In Progress** => execution can start.
- Sensitive actions => plan + risk + rollback + explicit approval.

## Standard Task Packet
Each active task must include:
- Owner
- Current blocker
- Next milestone
- ETA to next checkpoint
- Risk level

## Command Shortcuts
- "plan <task>" -> Planner Agent
- "research <question>" -> Research Agent
- "build <deliverable>" -> Builder Agent
- "review <task>" -> QA/Review Agent
- "status" -> Ops Reporter format

## Sub-Agent Use Pattern
1. Main agent receives task in topic
2. Main agent spawns specialist sub-agent
3. Sub-agent returns deliverable
4. Main agent posts summary + updates board status

## Initial Rollout Checklist
- [ ] Add server-backed persistence to kanban board
- [ ] Enable drag/drop cards
- [ ] Add card metadata (priority, due date, assignee, tags)
- [ ] Add subtasks + progress (done)
- [ ] Add card activity timeline
- [ ] Add topic-specific daily/weekly digest templates

## Notes
YouTube transcript was unavailable via captions endpoint; implementation based on mission-control pattern + OpenClaw native orchestration capabilities.
