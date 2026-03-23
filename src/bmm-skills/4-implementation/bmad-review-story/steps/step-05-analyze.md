# Step 5: Analyze

## STEP GOAL

Extract hypotheses from the story, verify each against real data gathered in Steps 3-4, identify edge cases and gaps, synthesize findings with severity levels and executable proposed actions.

## RULES

- NEVER mark a hypothesis as "CONFIRMED" without concrete evidence
- If you cannot verify a hypothesis, mark it "UNVERIFIABLE" and explain why
- Every finding MUST propose an EXECUTABLE action — "Decide X" or "Resolve question Y" is NEVER acceptable
- Severity must reflect real impact, not theoretical concern
- Apply the zero-fallback rules: any fallback or "best-effort" mapping in the story must be challenged

## SEQUENCE

### 1. Extract hypotheses from the story

Read the story description carefully. For each AC, task, and description paragraph, extract:

- **Data assumptions** — what does the story ASSUME about the data? (format, values, volume, availability)
- **System assumptions** — what does the story ASSUME about the current system? (existing behavior, data model, infra)
- **Capability assumptions** — what does the story ASSUME about existing capabilities? (adapters, templates, packages, endpoints, secrets, schedulers, triggers)
- **Implicit requirements** — what is NOT mentioned but implicitly required? (error handling, edge cases, rollback, monitoring)
- **Data migration assumptions** — if the story involves data migrations (UPDATE/DELETE on existing data), what does it ASSUME about the data in each environment? Names, slugs, and IDs often differ between dev, staging, and production. A WHERE clause that matches in production may silently match zero rows in staging (or vice versa). If DB access is available, query real data in all target environments to verify. A migration that silently updates 0 rows in any environment is a BLOCKER finding.
- **Business context coverage** — does the story have a business context section? If yes, verify: user journey makes sense E2E, BACs are realistic and verifiable, external dependencies are identified, Validation Metier checklist is concrete and executable. If NO business context section: create a MAJOR finding proposing to add one.
- **Validation Metier quality** — if the story has a "Validation Metier" section, verify each item is concrete, executable by a human in production, and from the business perspective (not "check logs"). Vague items like "verify it works" become MINOR findings.

List ALL hypotheses — explicit AND implicit.

### 2. The production chain hypothesis

**"Works in production" is the hypothesis that matters most.** For each AC, the story implicitly assumes that every link in the production chain exists and is active:

trigger/entry point --> processing --> observable result

Verify this chain end-to-end. A feature that passes all tests but cannot function in production is a BLOCKER. Common blind spots:

- Story says "existing" (template, adapter, endpoint, secret) --> GO VERIFY in the codebase. "Existing" is a hypothesis, not a fact.
- Story assumes a scheduler/trigger will invoke the code --> does it exist? Is it active?
- Story assumes an adapter/client exists for an external service --> is there a real implementation or just a test stub?
- Story assumes config/secrets are available --> are they in the secret manager AND the deployment config?
- Story assumes a downstream service supports the expected call --> does the endpoint/template/event exist?

For each broken link: BLOCKER finding with concrete task to fix it.

### 3. Verify each hypothesis

For EACH hypothesis, check against the evidence gathered in Steps 3 and 4:

```yaml
hypothesis_verification:
  - hypothesis: "{what the story assumes}"
    source: "{where in the story this comes from}"
    evidence: "{what the real data/code/docs show}"
    verdict: "CONFIRMED | CONTRADICTED | UNVERIFIABLE | PARTIALLY_TRUE"
    details: "{specific evidence with data/file:line references}"
```

### 4. Edge cases and volumetry

From the real data examined in Step 3:

- What edge cases exist in the real data that the story does not cover?
- What is the actual data volume? Does the story account for scale?
- Are there NULL values, unexpected formats, or outliers?
- What happens when the source data is unavailable or malformed?
- Are there timing/ordering concerns (race conditions, out-of-order events)?

### 5. Synthesize findings

For each gap found, create a structured finding:

```yaml
findings:
  - id: F-001
    severity: BLOCKER | MAJOR | MINOR | INFO
    category: hypothesis_contradiction | missing_edge_case | wrong_assumption | missing_ac | volumetry_risk | best_practice_violation | missing_business_context
    title: "{short description}"
    story_says: "{what the story states or implies}"
    reality: "{what the real data/code/docs show}"
    evidence: "{concrete proof — query result, file:line, API response, doc link}"
    proposed_action: "{EXECUTABLE change to the story — exact text to add/modify/remove}"
```

**Severity guide:**

- **BLOCKER**: The story is fundamentally wrong or will cause data loss/corruption/security issue. A production chain link is missing.
- **MAJOR**: Important gap that will cause the implementation to fail or produce incorrect results. Missing business context. Unverified critical assumption.
- **MINOR**: Missing edge case or improvement that should be addressed but will not block implementation. Vague VM items.
- **INFO**: Observation or best practice suggestion, no immediate impact.

**proposed_action MUST be executable.** Bad examples:
- "Resolve the question of the price mapping"
- "Decide whether to use X or Y"
- "Consider adding error handling"

Good examples:
- "Add to Task 14: the webhook handler must call the inventory API to retrieve purchasePriceExclTax before building the DTO, same pattern as booking.service.ts:1059-1068"
- "Add AC: Given an order with status PARTIALLY_SHIPPED, When the status sync runs, Then the order status must be set to a new PARTIALLY_SHIPPED enum value (extend OrderStatus), not mapped to SHIPPED"
- "Add error handling AC: Given the provider SFTP is unreachable, When the polling job runs, Then it must alert via the alerting port with severity 'error' and skip the batch (not crash the service)"

If you cannot determine the right action from evidence, state your best recommendation with the evidence that supports it — do NOT defer the decision to the story.

### 6. Append findings to intermediate file

Update the intermediate file with all findings.

### 7. Proceed

Load and execute `./steps/step-06-interactive-review.md`.
