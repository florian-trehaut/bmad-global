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
- [ ] External dependencies identified (or "none" confirmed)
- [ ] Validation Metier defined (concrete production tests)
- [ ] Product DoD synthesized
- [ ] Out-of-control factors identified (or "none")

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
