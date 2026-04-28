# Story PRJ-42 — Refund Flow

## Definition of Done (product)

**Feature:** Customer can request a refund within 14 days; refund is processed within 24h.
**Non-regression:** Existing subscription cancellation flow unaffected.

## Problem

Customers cannot request refunds and rely on support tickets to do so manually.

## Proposed Solution

Add a self-service refund endpoint with eligibility check + provider integration.

## Scope

**Included:** API endpoint, eligibility validator, provider client wiring.
**Excluded:** UI for refund requests (separate story); admin UI for refunds.

## Out of Scope

| # | Non-goal | Why excluded | Where it might land |
| - | -------- | ------------ | -------------------- |
| OOS-1 | Customer UI for refund requests | UX design pending | UX backlog |
| OOS-2 | Backfill historic refunds | Operational migration, separate concern | Future story REFUND-42 |

## Business Context

### User Journey E2E

**Primary actor:** customer with active subscription.

1. Customer requests refund within 14 days.
2. System verifies eligibility against subscription.
3. Refund is queued and processed via billing provider within 24h.

### Business Acceptance Criteria

- [ ] BAC-1: Given a customer with active subscription, when they request a refund within 14 days, then the system processes the refund within 24h.
- [ ] BAC-2: Given a customer outside the 14-day window, when they request a refund, then the system rejects the request with a clear error.

### External Dependencies & Validation Gates

| Dependency | Owner | Required Action | Gate (blocking?) | Status |
| ---------- | ----- | --------------- | ---------------- | ------ |
| Billing provider API v3.2 | Vendor | Refund endpoint | Yes | OK |

## Technical Context

### Codebase Patterns

DDD; refund domain in `apps/billing/src/refund/`.

### Relevant Files

| File | Role |
| ---- | ---- |
| `apps/billing/src/refund/refund.controller.ts` | HTTP layer |

## Real-Data Findings

### Sources investigated

| Source | Type | Access Method | Sample Size | Date |
| ------ | ---- | ------------- | ----------- | ---- |
| Billing provider sandbox | provider | provider-skill | 50 records | 2026-04-25 |
| Staging DB orders table | database | db-skill | 1k rows | 2026-04-25 |

### Spec Assumptions vs Reality

| # | Story assumption | Reality | Verdict |
| - | ---------------- | ------- | ------- |
| 1 | Provider always returns ISO 8601 timestamps | Confirmed across 50 samples | VERIFIED |

## External Research

### Official Documentation

| Source | URL | Version | Relevance |
| ------ | --- | ------- | --------- |
| Billing provider API doc | https://provider.example/docs/refund | v3.2 | Refund endpoint contract |

### Best Practices

| Topic | Source | Recommendation | Applicable? |
| ----- | ------ | -------------- | ----------- |
| Idempotency keys | Stripe blog | Use UUID per request, 24h dedup | YES |

## NFR Registry

| Category | Requirement | Target | Measurement | Status |
| -------- | ----------- | ------ | ----------- | ------ |
| Performance | refund endpoint p95 | < 500ms | k6 load test | PRESENT |
| Scalability | concurrent refund requests | 100/s | k6 | PRESENT |
| Availability | endpoint uptime | 99.9% | SLI dashboard | PRESENT |
| Reliability | retry on provider failure | 3 retries with backoff | integration test | PRESENT |
| Maintainability | test coverage | >= 80% lines | coverage report | PRESENT |
| Usability | API error messages | actionable | manual review | PRESENT |

## Security Gate

**Verdict:** PASS

| Item | Verdict | Evidence / Mitigation |
| ---- | ------- | --------------------- |
| Authentication | PASS | JWT auth required (middleware) |
| Authorization | PASS | Customer can only refund own subscriptions |
| Data Exposure | PASS | response excludes provider tokens |
| Input Sanitization | PASS | DTO validators |
| Secrets Handling | PASS | provider key in secret manager |
| Audit Trail | PASS | RefundRequested logged with actor_id |
| Compliance — GDPR | PASS | refund metadata 30-day retention |

## Observability Requirements

### Structured Logs

| Event | Severity | Required Fields |
| ----- | -------- | --------------- |
| RefundRequested | INFO | trace_id, user_id, refund_id, amount, currency |
| RefundFailed | ERROR | trace_id, user_id, refund_id, error_code |

### Metrics

| Metric Name | Type | Labels | Purpose |
| ----------- | ---- | ------ | ------- |
| refund_request_total | counter | status | Volume |
| refund_request_duration_ms | histogram | endpoint | Latency |

### Alerts

| Alert | Trigger | Severity | Routing | Runbook |
| ----- | ------- | -------- | ------- | ------- |
| RefundFailureRateHigh | error_rate > 5% for 10m | page | oncall | runbook.example/refund |

## Implementation Plan

### Tasks

- [ ] Task 1: `apps/billing/src/refund/refund.controller.ts` — Add POST /refunds endpoint.
- [ ] [INFRA] Task 2: `terraform/billing.tf` — Add provider secret to secret manager.
- [ ] [OBS] Task 3: `apps/billing/src/refund/observability.ts` — Wire up RefundRequested + RefundFailed events.

### Technical Acceptance Criteria

- [ ] TAC-1 *(Ubiquitous, refs BAC-1)*: The RefundService shall enforce idempotency keys on every POST /refunds.
- [ ] TAC-2 *(Event-driven, refs BAC-1)*: When a refund request is received, the RefundService shall validate `subscription_id` against the billing provider before persisting.
- [ ] TAC-3 *(State-driven, refs BAC-2)*: While the customer is outside the 14-day window, the RefundService shall reject refund requests with HTTP 422.
- [ ] TAC-4 *(Optional, refs BAC-1)*: Where the `refund-instant` feature flag is enabled, the RefundService shall complete the refund within 5s end-to-end.
- [ ] TAC-5 *(Unwanted, refs BAC-1)*: If the refund amount exceeds the original charge, then the RefundService shall reject with 422 and log `RefundAmountExceeded` at WARN.

## Guardrails

- Do not introduce new fallback patterns — apply zero-fallback-no-false-data.
- Do not consider the story complete if migrations are missing.

## Validation Metier

- [ ] VM-1 [api] *(BAC-1)*: Place a test refund order in staging and verify the provider receives the call.
- [ ] VM-2 [e2e] *(BAC-2)*: Customer outside 14-day window receives clear rejection message with status 422.

## Boundaries (Agent Execution Constraints)

### ✅ Always Do

- Run `npm run quality` before declaring tasks complete.
- Follow conventions in `project.md#conventions`.
- Use the project's logger.

### ⚠️ Ask First

- Add a new dependency to package.json.
- Modify CI/CD pipeline files.
- Touch files outside the Code Map.

### 🚫 Never Do

- Commit secrets or credentials.
- Use `--no-verify` to skip hooks.
- Remove failing tests to make CI pass.

## Risks & Assumptions

### Risks

| ID | Description | Probability | Impact | Mitigation | Validation Method | Owner |
| -- | ----------- | ----------- | ------ | ---------- | ----------------- | ----- |
| RISK-1 | Provider rate limit during bulk migration | MED | HIGH | Throttler + backoff | Integration test with mock 429 | dev |

### Assumptions

| ID | Assumption | Source | Validation Status | Validation Method |
| -- | ---------- | ------ | ----------------- | ----------------- |
| ASSUMPTION-1 | Provider returns ISO 8601 timestamps | Provider doc v3.2 | VERIFIED | Real sample inspection (step-05) |

## INVEST Self-Check

| Criterion | Answer | Evidence |
| --------- | ------ | -------- |
| Independent | YES | No story dependency in current sprint |
| Negotiable | YES | We describe outcome, not technology choice |
| Valuable | YES | Beneficiary = refund-requesting customer; reduces support tickets |
| Estimable | YES | Similar to PRJ-31 (~5 dev-days) |
| Small | YES | Fits in 1 week |
| Testable | YES | BACs concrete with VMs; TACs in EARS |

## Test Strategy

| TAC | Pattern | Priority | Unit | Integration | Journey |
| --- | ------- | -------- | ---- | ----------- | ------- |
| TAC-1 | Ubiquitous | P0 | YES | YES | NO |
| TAC-2 | Event-driven | P0 | YES | YES | YES |
| TAC-5 | Unwanted | P0 | YES | YES | NO |

## File List

- `apps/billing/src/refund/refund.controller.ts` — new
- `apps/billing/src/refund/refund.service.ts` — new
- `terraform/billing.tf` — modify
