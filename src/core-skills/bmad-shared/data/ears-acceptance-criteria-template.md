# EARS Acceptance Criteria Template (TACs)

Reference template for Technical Acceptance Criteria using EARS (Easy Approach to Requirements Syntax).

## Why EARS for TACs

EARS solves three failure modes that Given/When/Then handles poorly:

1. **Ubiquitous behaviour** — system behaviour that is always active (no trigger). G/W/T forces a fake "Given any state" precondition.
2. **State-driven behaviour** — behaviour active *while* the system is in a state. G/W/T conflates state with event.
3. **Unwanted behaviour** — behaviour the system MUST NOT exhibit. G/W/T struggles with negative assertions.

For business-facing acceptance criteria (BACs), continue using Given/When/Then (more readable for non-engineers). EARS is for technical acceptance criteria (TACs).

## The 5 EARS Patterns

### 1. Ubiquitous (always active, no trigger)

> **The {system} shall {action}.**

Examples:
- The system shall log every refund request with `trace_id` and `actor_id`.
- The RefundService shall enforce idempotency on every POST to /refunds.

### 2. Event-driven (When ... shall ...)

> **When {trigger}, the {system} shall {action}.**

Examples:
- When a refund request is received, the RefundService shall validate the subscription status against the billing provider before persisting.
- When the cron job fires at 02:00 UTC, the ReconciliationWorker shall fetch yesterday's transactions from the provider.

### 3. State-driven (While ... shall ...)

> **While {state}, the {system} shall {action}.**

Examples:
- While the cache is rebuilding, the system shall serve stale data from the read replica.
- While the user session is unauthenticated, the API shall reject all /admin/* requests with 401.

### 4. Optional (Where ... shall ...)

> **Where {feature is enabled}, the {system} shall {action}.**

Examples:
- Where the `refund-v2` feature flag is enabled, the system shall route refund requests to the new ProviderClient.
- Where the customer is on the Enterprise plan, the system shall expose the bulk-export endpoint.

### 5. Unwanted (If ... then ... shall ...)

> **If {undesired condition}, then the {system} shall {action to prevent / handle it}.**

Examples:
- If the refund amount exceeds the original charge, then the RefundService shall reject the request with 422.
- If a request is unauthenticated, then the API shall NOT expose user emails in responses.

## Format

```markdown
### Technical Acceptance Criteria (TACs)

- [ ] TAC-1 *(Ubiquitous, refs BAC-1)*: The RefundService shall enforce idempotency keys on every POST /refunds.
- [ ] TAC-2 *(Event-driven, refs BAC-1)*: When a refund request is received, the RefundService shall validate `subscription_id` against the billing provider before persisting.
- [ ] TAC-3 *(State-driven, refs BAC-2)*: While the billing provider is in degraded mode (circuit breaker open), the RefundService shall queue refund requests and reply 202 with retry_after.
- [ ] TAC-4 *(Optional, refs BAC-3)*: Where the `refund-instant` feature flag is enabled, the RefundService shall complete the refund within 5s end-to-end.
- [ ] TAC-5 *(Unwanted, refs BAC-1)*: If the refund amount exceeds the original charge, then the RefundService shall reject with 422 and log `RefundAmountExceeded` at WARN.
```

## Checklist

- [ ] Every TAC matches one of the 5 EARS patterns (no free-form prose)
- [ ] Pattern label in italic next to TAC ID: `*(Pattern, refs BAC-N)*`
- [ ] Every TAC references one or more BAC (traceability)
- [ ] Subject is a system or component, not "the user" (use BACs for user perspective)
- [ ] Action uses `shall` (modal verb, not "should" or "will")
- [ ] Negative behaviours use Pattern 5 (Unwanted)
- [ ] Permanent behaviours use Pattern 1 (Ubiquitous), not Pattern 2 with "Given any state"
- [ ] State-conditional behaviours use Pattern 3 (State-driven), not Pattern 2 (Event-driven)

## Anti-patterns

- "TAC-1: The system should be fast" → REJECT, no pattern, not measurable
- "TAC-2: When the user clicks X, the button shall turn green" → use BAC (G/W/T) for UI behaviour from user perspective
- Mixing Given/When/Then prefix with EARS body → REJECT, pick one
- Multiple actions in a single TAC ("shall do X and Y and Z") → split into separate TACs
- "shall handle errors" → REJECT, specify which errors (use Pattern 5)
