# Investigation Checklist — Generic Framework

This is the generic investigation framework applicable to any project. It covers the fundamental investigation axes that apply regardless of tech stack, domain, or architecture.

**For project-specific domain checklists** (provider-specific, service-specific, infra-specific), load `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/investigation-checklist.md` from the project root. The project-specific checklist extends this generic one — apply both.

---

## Data Flow Tracing (always execute)

For every data flow the story touches, trace the complete chain:

- [ ] **Entry point** — how does data enter? (HTTP endpoint, scheduled job, event handler, file poll, webhook, queue consumer)
- [ ] **Input validation** — what validation exists at the boundary? What happens with invalid input?
- [ ] **Parsing / transformation** — how is raw data transformed into domain objects? Are there lossy conversions?
- [ ] **Business logic** — what domain rules are applied? What conditions/branches exist?
- [ ] **Persistence** — where and how is data stored? (tables, columns, indices, constraints)
- [ ] **Output / side effects** — what downstream effects does this produce? (API responses, events emitted, notifications sent, files written)
- [ ] **Error path** — what happens when any step fails? Is the error surfaced or silently swallowed?

## External Dependency Verification (always execute)

For every external system the story interacts with:

- [ ] **Access verified** — can we actually reach this system? (credentials, network, firewall)
- [ ] **Contract verified** — does the external system expose the API/fields/format the story assumes?
- [ ] **Real data examined** — have we seen actual responses/files from this system? (not just what our code expects)
- [ ] **Error behavior** — what happens when this system is down, slow, or returns unexpected data?
- [ ] **Rate limits / quotas** — are there usage limits that could affect our implementation?

## Error Handling Path Analysis (always execute)

- [ ] **Every async boundary** has error handling (not just try/catch — proper alerting and state management)
- [ ] **Failed entities** are marked with error status, not silently skipped
- [ ] **Alerts are real alerts** — going to a monitored channel (not just logger.warn)
- [ ] **Partial failures** are handled — if a batch of 100 items has 1 failure, what happens to the other 99?
- [ ] **Retry behavior** is defined — is retry safe (idempotent)? How many retries? Backoff?
- [ ] **Rollback** — if the operation partially completes and then fails, is the system in a consistent state?

## Cross-Service Impact Analysis (always execute)

For EACH function, type, or interface that the story modifies:

- [ ] **Inventory modifications** — list every function, method, type, interface that changes
- [ ] **Trace all callers** — search the ENTIRE codebase, not just the modified service
- [ ] **Verify compatibility** of each caller with the new behavior
- [ ] **Identify existing tests** that assert the old behavior (they must be updated)
- [ ] **Shared contracts** — if a shared package or API contract changes, verify ALL consumers
- [ ] **Data consumers (indirect impact)** — if the story changes what is WRITTEN to a data store (new column populated, format changed, new status value), find ALL readers of that data — even without a direct function call
- [ ] **Verdict per caller/consumer** — COMPATIBLE / NEEDS_UPDATE / BREAKING with justification

If an impact requires changes not covered in the story, this becomes a MAJOR or BLOCKER finding.

## Volumetry and Performance Assessment (when applicable)

- [ ] **Current data volume** — how much data exists today? (row counts, file sizes, request rates)
- [ ] **Growth trajectory** — how fast is it growing? What is the projected volume in 6-12 months?
- [ ] **Batch size** — if the operation processes data in batches, is the batch size appropriate?
- [ ] **Memory footprint** — does the operation load all data into memory? Is streaming needed?
- [ ] **Database queries** — are queries efficient? Do they use indices? Will they degrade at scale?
- [ ] **Timeout risk** — could the operation exceed function/container timeout limits?
- [ ] **Concurrent access** — are there race conditions with parallel executions?

## Security Boundary Check (when applicable)

- [ ] **Authentication** — is the entry point properly authenticated?
- [ ] **Authorization** — does the operation verify the caller has permission?
- [ ] **Data exposure** — does the response leak sensitive data? (PII, internal IDs, stack traces)
- [ ] **Input sanitization** — is user input sanitized before use? (SQL injection, XSS, path traversal)
- [ ] **Secrets management** — are secrets properly stored and accessed? (not hardcoded, not in env defaults)
- [ ] **Audit trail** — are sensitive operations logged for compliance?

## Story Completeness (always execute)

- [ ] **ACs are testable** — each AC has a clear pass/fail criterion, not vague language
- [ ] **Edge cases covered** — the story addresses NULL values, empty inputs, maximum lengths, boundary conditions
- [ ] **Error cases specified** — the story defines what happens when things go wrong, not just the happy path
- [ ] **Dependencies identified** — all upstream/downstream dependencies are listed
- [ ] **Migrations listed** — if the story changes the data model, migration steps are specified
- [ ] **Multi-tenant impact** — if applicable, the story considers impact across different clients/tenants
- [ ] **Rollback plan** — the story considers what happens if the deployment needs to be reverted
- [ ] **Business context** — the story has a "why" (user journey, business value), not just a "what"
- [ ] **Validation Metier** — concrete, executable verification items from the business perspective
