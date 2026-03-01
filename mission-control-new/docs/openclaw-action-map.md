# OpenClaw Action Map (Scoped Pages)

## Scope
This artifact maps concrete UI actions to intended OpenClaw operations for the following screens only:
- Boards (`/boards`)
- Agent Army / Org Chart (`/army`)
- Configurator / Add Agent (`/configurator`)
- System: Security (`/security`)
- System: Integrations (`/integrations`)
- System: Cost & Usage (`/costs`)
- System: Settings (`/settings`)

---

## Conventions
- **Operation** names below are implementation-facing intents. Many resolve to OpenClaw tool calls (`exec`, `nodes.invoke`, `message.send`, `browser`, etc.) via backend adapters.
- **Success state** should update UI state + emit toast/event (`action.success`).
- **Error state** should preserve user input when possible + emit actionable message (`action.error`).
- For destructive operations, require explicit confirmation and include `requestId` for idempotency.

---

## 1) Boards (`/boards`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Create card | `+ Add card` in a column, then `Create Card` | `oc.board.card.create` | `boardId`, `columnId`, `title`, `description`, `priority`, `agentId`, `labels[]`, `dueDate?`, `requestId` | New card appears in target column; modal closes; persisted | Modal remains open; inline validation/API error shown |
| Open card details | Click card title | `oc.board.card.get` | `boardId`, `cardId` | Drawer opens with latest data | Drawer shows load error + retry |
| Update card fields | Edit in drawer (description, priority, labels, due, comments) | `oc.board.card.update` | `boardId`, `cardId`, `patch`, `requestId` | Drawer + board reflect new values | Revert optimistic update; show failed field |
| Toggle checklist item | Checklist checkbox (card or drawer) | `oc.board.card.checklist.toggle` | `boardId`, `cardId`, `itemIndex`, `done`, `requestId` | Item toggles; progress recalculates | Toggle rolls back; error toast |
| Add checklist item | `Add` next to checklist input | `oc.board.card.checklist.add` | `boardId`, `cardId`, `text`, `requestId` | Item appended | Input retained; validation error |
| Remove checklist item | `✕` on checklist row | `oc.board.card.checklist.remove` | `boardId`, `cardId`, `itemIndex`, `requestId` | Item removed | Item restored on failure |
| Toggle subtask | Subtask checkbox | `oc.board.card.subtask.toggle` | `boardId`, `cardId`, `itemIndex`, `done`, `requestId` | Subtask state updates | Rollback + toast |
| Add subtask | `Add` next to subtask input | `oc.board.card.subtask.add` | `boardId`, `cardId`, `text`, `requestId` | Subtask added | Input/error retained |
| Remove subtask | `✕` on subtask row | `oc.board.card.subtask.remove` | `boardId`, `cardId`, `itemIndex`, `requestId` | Subtask removed | Rollback + error |
| Add comment/activity | `Send` in activity input | `oc.board.card.comment.add` | `boardId`, `cardId`, `author`, `text`, `requestId` | Comment appears in activity timeline | Input retained; error toast |
| Add attachment | `+ Attach` then `Add` | `oc.board.card.attachment.add` | `boardId`, `cardId`, `name`, `size?`, `type?`, `url?`, `requestId` | Attachment chip appears | Validation/API error |
| Remove attachment | `✕` on attachment | `oc.board.card.attachment.remove` | `boardId`, `cardId`, `attachmentIndex`, `requestId` | Attachment removed | Rollback + error |
| Move card by drag/drop | Drag card to column/position | `oc.board.card.move` | `boardId`, `cardId`, `fromColumnId`, `toColumnId`, `toIndex`, `requestId` | Card reorders/moves and persists | Card snaps back + error |
| Start run | Drawer `Start Run` | `oc.run.start.fromCard` | `boardId`, `cardId`, `agentId`, `priority`, `context`, `requestId` | Card moved to In Progress + run badge | Card unchanged; run-start error |
| Pause run | Drawer `Pause` | `oc.run.pause` | `runId?`, `cardId`, `reason?`, `requestId` | Card moved to Ready + paused status | State unchanged + error |
| Request approval | Drawer `Request Approval` | `oc.approval.request` | `cardId`, `runId?`, `summary`, `riskLevel`, `approvers[]`, `requestId` | Card moves to Review; approval badge shown | Approval panel shows failure |
| Complete run | Drawer `Complete` | `oc.run.complete` | `runId?`, `cardId`, `resultSummary?`, `artifacts[]?`, `requestId` | Card moves to Done; completion event logged | State unchanged + error |
| Add column | `+ Add Column` then `Create Column` | `oc.board.column.create` | `boardId`, `name`, `accent`, `wipLimit?`, `requestId` | New column appears with empty list | Modal error; no column created |
| Rename column | Header rename (double-click / menu) | `oc.board.column.update` | `boardId`, `columnId`, `name`, `requestId` | Column name updates | Name reverts + error |
| Delete column | Column menu `Delete Column` | `oc.board.column.delete` | `boardId`, `columnId`, `strategy` (`blockIfNotEmpty`/`moveCardsTo`), `requestId` | Column removed per strategy | Confirmation stays open with reason |
| Collapse/expand column | Collapse button | `oc.board.column.toggleCollapse` | `boardId`, `columnId`, `collapsed`, `requestId` | Column visual state updated and saved | UI reverts |
| Filter/search board | Top search / filter controls | `oc.board.view.setFilters` | `boardId`, `search`, `priority?`, `agent?` | Filtered result set shown | Fallback to previous filters |

---

## 2) Agent Army / Org Chart (`/army`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Toggle view mode | `Org Chart` / `Grid` switch | `oc.agentArmy.viewMode.set` | `viewMode` (`org`/`grid`) | Layout updates and persists | Prior mode restored |
| Open agent detail | Click node/card | `oc.agent.get` | `agentId` | Detail panel shows live agent profile | Panel shows failed load |
| Deploy agent | `+ Deploy Agent` | `oc.agent.deploy` | `templateId?`, `name`, `role`, `parentAgentId?`, `modelRoute`, `tools[]`, `guardrails[]`, `limits`, `requestId` | Agent appears online/pending bootstrap | Deployment error with diagnostics |
| Configure agent | Detail panel `Configure` | `oc.agent.config.open` (route/intent) | `agentId` | Navigates to configurator preloaded | Route error toast |
| Message agent | Detail panel `Message` | `oc.agent.message.send` | `agentId`, `message`, `channel` (`internal`/`slack`/etc), `requestId` | Message appears in activity/logs | Message failure + retry |
| Pause agent | Detail panel `Pause` | `oc.agent.state.set` | `agentId`, `state: paused`, `reason?`, `requestId` | Status dot/label change; queue halts | State unchanged |
| Activate agent | Detail panel `Activate` | `oc.agent.state.set` | `agentId`, `state: active`, `requestId` | Agent resumes; status online | State unchanged |

---

## 3) Configurator / Add Agent (`/configurator`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Navigate step | Step sidebar click / next/previous buttons | `oc.agentConfig.step.set` | `draftId`, `stepIndex` | Requested step renders | Invalid step blocked |
| Save draft | Top bar `Save Draft` | `oc.agentConfig.draft.save` | `draftId?`, `identity`, `scope`, `tools`, `modelRouting`, `guardrails`, `limits`, `requestId` | Draft saved timestamp and toast | Save error + unsaved indicator |
| Update identity | Inputs in Step 1 | `oc.agentConfig.identity.update` | `draftId`, `name`, `roleTitle`, `systemPrompt`, `reportsTo`, `avatarColor`, `requestId` | Preview/state updates | Field-level validation errors |
| Update scope permissions | Toggles in Step 2 | `oc.agentConfig.scope.update` | `draftId`, `permissions[]`, `requestId` | Permission chips/state updated | Toggle reverts if policy blocked |
| Update tool access | Tool cards/chips in Step 3 | `oc.agentConfig.tools.update` | `draftId`, `toolIds[]`, `requestId` | Selected tool list updates | Blocked high-risk tool with reason |
| Add/edit model route | Routing table + `+ Add routing rule` | `oc.agentConfig.modelRouting.update` | `draftId`, `routes[]`, `requestId` | Routing matrix updates | Route conflict/validation message |
| Toggle guardrail | Guardrail switch in Step 5 | `oc.agentConfig.guardrails.update` | `draftId`, `guardrailId`, `enabled`, `requestId` | Guardrail status updates | Critical guardrails reject disable |
| Update limits | Inputs in Step 6 | `oc.agentConfig.limits.update` | `draftId`, `maxDailySpend`, `maxTokens`, `maxApiCallsPerHour`, `maxConcurrentTasks`, `approvalThreshold`, `sessionTimeout`, `requestId` | Limit values saved/validated | Invalid bounds highlighted |
| Run test prompt | `Run Test Prompt` | `oc.agentConfig.test.prompt` | `draftId`, `prompt`, `testMode`, `requestId` | Test output + model/cost telemetry shown | Test failure and logs shown |
| Simulate task | `Simulate Task` | `oc.agentConfig.test.simulation` | `draftId`, `scenarioId|scenarioPayload`, `requestId` | Simulation timeline + guardrail pass/fail | Simulation error details |
| Deploy configured agent | Final `🚀 Deploy Agent` | `oc.agent.deploy.fromDraft` | `draftId`, `environment`, `requestId` | Agent created; route to Agent Army/details | Deployment blocked/failure details |

---

## 4) System: Security (`/security`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Trigger incident response | `🚨 Incident Response` | `oc.security.incident.start` | `incidentType?`, `scope`, `severity`, `initiator`, `requestId` | Incident state active; playbook started | Incident creation failure |
| Generate security report | `📊 Security Report` | `oc.security.report.generate` | `period`, `format`, `includeAudit`, `requestId` | Report artifact available/downloadable | Report generation failed |
| Upgrade OpenClaw | `Upgrade OpenClaw` on status card | `oc.system.openclaw.upgrade` (backend likely `exec`) | `targetVersion`, `maintenanceWindow?`, `autoRestart`, `requestId` | Version status updates; success event | Upgrade failed with rollback status |
| Expand/collapse threat alert | Click alert item | `oc.security.alert.view` | `alertId` | Details panel expanded | No-op on missing alert |
| Alert action: Block IP | Alert action button | `oc.security.network.blockIp` | `alertId`, `ipOrCidr`, `duration?`, `reason`, `requestId` | Alert status updates to mitigating/resolved | Block action error |
| Alert action: View Logs | Alert action button | `oc.security.logs.open` | `alertId`, `query`, `timeRange` | Log viewer opens scoped query | Log fetch failure |
| Alert action: Dismiss | Alert action button | `oc.security.alert.dismiss` | `alertId`, `comment?`, `requestId` | Alert moved to dismissed/resolved | Dismiss denied/failed |
| Alert action: Renew Now | SSL warning action | `oc.security.tls.renew` | `domain`, `provider`, `requestId` | Renew job starts; alert updated | Renewal failed |
| Review permissions matrix | `Review All` | `oc.security.permissions.review` | `scope` (`allAgents`), `requestId` | Permissions review task/report opens | Failure toast |

---

## 5) System: Integrations (`/integrations`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Filter integrations by category | Category chips | `oc.integrations.filter.set` | `category` | Grid filtered | Revert to previous filter |
| Open integration details | Click integration card | `oc.integration.get` | `integrationId|name` | Config drawer opens with live metrics | Drawer error state |
| Add integration | `+ Add Integration` | `oc.integration.catalog.open` | `source?` | Connect flow modal opens | Modal launch failure |
| Connect available integration | `+ Connect` / `+ Connect {name}` | `oc.integration.connect` | `integrationId`, `authType`, `credentials|oauthCode`, `scopes[]`, `requestId` | Status -> connected; health checks start | Auth/config error details |
| Configure integration | Drawer `⚙ Configure` | `oc.integration.configure` | `integrationId`, `settingsPatch`, `requestId` | Updated config rendered | Validation/API error |
| Re-sync integration | Drawer `🔄 Re-sync` | `oc.integration.sync` | `integrationId`, `mode` (`full`/`delta`), `requestId` | Last sync timestamp updates | Sync failed with reason |
| Disconnect integration | Drawer `Disconnect` | `oc.integration.disconnect` | `integrationId`, `revokeTokens`, `requestId` | Status -> available/disconnected | Disconnect failure/blocked dependency |

---

## 6) System: Cost & Usage (`/costs`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Open budget settings | `⚙ Budget Settings` | `oc.costs.budget.open` | `scope` (`workspace`) | Budget editor/modal opens | Open failure |
| Export cost report | `📄 Export` | `oc.costs.export` | `timeRange`, `format` (`csv`/`json`/`pdf`), `includeBreakdowns`, `requestId` | File download/ready state | Export error |
| Change chart mode | `daily` / `cumulative` tabs | `oc.costs.viewMode.set` | `mode` | Chart rerenders | Prior mode retained |
| Apply budget updates | (from settings modal) | `oc.costs.budget.update` | `monthlyBudget`, `alertThresholdPct`, `hardLimitEnabled`, `requestId` | Budget bar/alerts recalc | Validation error; no apply |
| Apply optimization recommendation | (tip action, if implemented) | `oc.costs.optimization.apply` | `recommendationId`, `dryRun?`, `requestId` | New routing rule / savings estimate logged | Recommendation application failed |

---

## 7) System: Settings (`/settings`)

| Action | UI trigger | Intended OpenClaw operation | Payload fields | Success state | Error state |
|---|---|---|---|---|---|
| Switch settings tab | Left settings nav item | `oc.settings.tab.set` | `tabKey` | Tab content changes | No-op on invalid tab |
| Edit profile | `Edit Profile` | `oc.settings.profile.update` | `name`, `email`, `businessName`, `website`, `location`, `timezone`, `requestId` | Profile block updates | Field validation/API error |
| Upload logo | `Upload` | `oc.settings.branding.logo.upload` | `file`, `mimeType`, `requestId` | Logo preview updates | Upload/format error |
| Toggle notification channel/type | Toggles in Notifications | `oc.settings.notifications.update` | `channelOrType`, `enabled`, `requestId` | Toggle persists | Toggle rollback + error |
| Update global AI settings | AI tab controls | `oc.settings.ai.update` | `costOptimizationEnabled`, `fallbackModel`, `maxRetries`, `temperature`, `requestId` | Settings persist + confirmation | Validation/policy error |
| View invoices | `View Invoice History` | `oc.billing.invoices.list` | `page`, `pageSize` | Invoice list/portal opens | Retrieval error |
| Update payment method | `Update Payment Method` | `oc.billing.paymentMethod.update.start` | `customerId`, `requestId` | Hosted billing flow opens | Billing portal error |
| Invite member | `+ Invite Member` | `oc.settings.team.invite` | `email`, `role`, `requestId` | Pending invite appears | Invite error |
| Edit member role | `Edit` on member | `oc.settings.team.member.update` | `memberId`, `role`, `requestId` | Role badge updates | Update failed |
| Show/rotate API key | `Show` / `Rotate` | `oc.settings.apiKey.show` / `oc.settings.apiKey.rotate` | `keyId`, `requestId` | Mask reveal or new key issued | Permission/rotation error |
| Export all data | `📦 Export All Data` | `oc.settings.data.exportAll` | `format`, `includeAudit`, `requestId` | Export job accepted/download | Export failure |
| Delete all agents | `Delete All` (danger zone) | `oc.agent.bulkDelete` | `confirmText`, `includeHistory`, `requestId` | Agents removed; irreversible banner | Confirmation mismatch or backend refusal |
| Close account | `Close Account` | `oc.account.close` | `confirmText`, `reason?`, `requestId` | Account closure workflow starts/completes | Blocked due to dependencies/unpaid invoices |

---

## Error Handling Baseline (all scoped screens)
- Always include `requestId` for write operations to support idempotent retries.
- Distinguish validation errors (`4xx`) from execution/runtime errors (`5xx`/timeouts).
- For optimistic UI actions, define rollback behavior explicitly.
- For operations involving external systems (billing, integrations, infra), return:
  - `userMessage` (friendly)
  - `debugCode` (support-facing)
  - `retryable` (boolean)
  - `nextAction` (e.g., `reauth`, `retry`, `contact-support`).
