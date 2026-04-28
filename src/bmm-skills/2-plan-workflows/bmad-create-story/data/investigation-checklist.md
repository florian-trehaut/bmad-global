# Investigation Checklist — Generic Framework (create-story edition)

This is the generic investigation framework applicable to any project. It covers the fundamental investigation axes that apply regardless of tech stack, domain, or architecture.

It is loaded by `bmad-create-story` step-05-real-data-investigation. The same checklist is also used by `bmad-review-story` for adversarial post-spec review — the rigour is identical at spec-creation time and at spec-review time.

**For project-specific domain checklists** (provider-specific, service-specific, infra-specific), load `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` from the project root. The project-specific checklist extends this generic one — apply both.

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

- [ ] **Access verified** — can we actually reach this system? (credentials, network, firewall) — confirmed in Step 4 access-verification
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

## Cross-Service Impact Analysis (always execute when story modifies existing code)

For EACH function, type, or interface that the story modifies:

- [ ] **Inventory modifications** — list every function, method, type, interface that changes
- [ ] **Trace all callers** — search the ENTIRE codebase, not just the modified service
- [ ] **Verify compatibility** of each caller with the new behavior
- [ ] **Identify existing tests** that assert the old behavior (they must be updated)
- [ ] **Shared contracts** — if a shared package or API contract changes, verify ALL consumers
- [ ] **Data consumers (indirect impact)** — if the story changes what is WRITTEN to a data store (new column populated, format changed, new status value), find ALL readers of that data — even without a direct function call
- [ ] **Verdict per caller/consumer** — COMPATIBLE / NEEDS_UPDATE / BREAKING with justification

If an impact requires changes not covered in the story scope, the spec must either expand the scope OR record the impact as a Risk (Step 11).

## Volumetry and Performance Assessment (when applicable)

- [ ] **Current data volume** — how much data exists today? (row counts, file sizes, request rates)
- [ ] **Growth trajectory** — how fast is it growing? What is the projected volume in 6-12 months?
- [ ] **Batch size** — if the operation processes data in batches, is the batch size appropriate?
- [ ] **Memory footprint** — does the operation load all data into memory? Is streaming needed?
- [ ] **Database queries** — are queries efficient? Do they use indices? Will they degrade at scale?
- [ ] **Timeout risk** — could the operation exceed function/container timeout limits?
- [ ] **Concurrent access** — are there race conditions with parallel executions?

These findings inform NFR Performance + Scalability registry (Step 9).

## Security Boundary Check (when applicable)

- [ ] **Authentication** — is the entry point properly authenticated?
- [ ] **Authorization** — does the operation verify the caller has permission?
- [ ] **Data exposure** — does the response leak sensitive data? (PII, internal IDs, stack traces)
- [ ] **Input sanitization** — is user input sanitized before use? (SQL injection, XSS, path traversal)
- [ ] **Secrets management** — are secrets properly stored and accessed? (not hardcoded, not in env defaults)
- [ ] **Audit trail** — are sensitive operations logged for compliance?

These findings inform Security Gate (Step 9).

## Spec Assumptions vs Reality (always execute — produces direct input for Step 11 Risks register)

For every UNVERIFIED assumption noted in Step 2 (Discovery / Enrichment):

- [ ] **Reality check** — query the real system to confirm or invalidate the assumption
- [ ] **Verdict** — VERIFIED / INVALIDATED / INCONCLUSIVE
- [ ] **If INVALIDATED** — record in Spec Assumptions vs Reality table; trigger story scope revision
- [ ] **If INCONCLUSIVE** — convert to RISK with mitigation plan (carried into Step 11 Risks register)

## Output

Findings produced by this checklist feed directly into:

- Step 7 (code investigation) — patterns and conventions
- Step 8 (data model + API + infra) — schema delta, mapping, contracts
- Step 9 (NFR + security gate + observability) — perf budget, threat model, log/metric requirements
- Step 10 (audit) — deployment chain, AC viability, runtime continuity
- Step 11 (plan) — Risks register, Assumptions register, INVEST self-check evidence
