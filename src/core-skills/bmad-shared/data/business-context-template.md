# Business Context Template

Reference template for Step 2b business context assessment.

## Format

```markdown
### User Journey E2E

**Primary actor:** {beneficiary / client / admin / system}

1. {Step 1 -- what the user sees or does}
2. {Step 2}
...
N. {Expected final outcome for the user}

### Business Acceptance Criteria

- [ ] BAC-1: Given {user context}, when {user action}, then {observable result}
- [ ] BAC-2: Given {context}, when {action}, then {result}

### External Dependencies & Validation Gates

| Dependency | Owner | Required Action | Gate (blocking?) | Status |
| ---------- | ----- | --------------- | ---------------- | ------ |

### Validation Metier (production tests)

Tests to execute in production after deployment:

- [ ] VM-1 *(BAC-X,Y)*: {concrete business test, expected result}
- [ ] VM-2 *(BAC-Z)*: {concrete business test, expected result}

### Definition of Done (product)

This story is "Done" when:
1. {observable business criterion}
2. All Validation Metier tests have passed
3. {if applicable: external confirmation obtained}
```

## Checklist

- [ ] User journey E2E documented (user perspective, not code)
- [ ] Business ACs in Given/When/Then (observable by a human)
- [ ] **Format enforcement** — BACs use Given/When/Then; TACs (in Implementation Plan section) use EARS — see `ac-format-rule.md`
- [ ] External dependencies identified (or "none" confirmed)
- [ ] Validation Metier defined (concrete production tests)
- [ ] Product DoD synthesized
- [ ] Out-of-control factors identified (or "none")
- [ ] INVEST self-check completed (see `invest-checklist-template.md`) — Independent / Negotiable / Valuable / Estimable / Small / Testable

## Guidelines for Validation Metier

Validation Metier items must be:

**GOOD:**
- "Place a test order via the frontend and verify the provider receives the flow"
- "Verify the beneficiary receives the confirmation email with the correct amount"
- "Confirm with the provider that the sent format is accepted"
- "A beneficiary with 0 points cannot access the catalog"

**BAD:**
- "Check the logs" (technical, not business)
- "Test that it works" (not concrete)
- "Check the database" (technical)
- "Verify the HTTP return code" (technical)

## Acceptance Criteria Format Enforcement

This template covers BACs only (business). TACs (technical) live in the Implementation Plan section and use EARS.

**BACs — Given/When/Then (this template)** — readable by PM and validation-metier executors:

```markdown
- [ ] BAC-1: Given a customer with active subscription, when they request a refund within 14 days, then the system processes the refund within 24 hours.
```

**TACs — EARS (in Implementation Plan section, see `ears-acceptance-criteria-template.md`)** — used by dev-story / code-review / tea-atdd:

```markdown
- [ ] TAC-1 *(Event-driven, refs BAC-1)*: When a refund request is received, the RefundService shall validate `subscription_id` against the billing provider before persisting.
```

Mixing formats inside a section → MAJOR finding. See `ac-format-rule.md` for the canonical rule and `ears-acceptance-criteria-template.md` for the 5 EARS patterns.

## Cross-references

- `invest-checklist-template.md` — INVEST self-check
- `ac-format-rule.md` — BAC vs TAC format rule
- `ears-acceptance-criteria-template.md` — EARS 5 patterns for TACs
- `out-of-scope-template.md` — out-of-scope register (paired with this section)
- `risks-assumptions-register-template.md` — risks paired with assumptions about the business context
