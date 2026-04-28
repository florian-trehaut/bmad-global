# Risks & Assumptions Register Template

Reference template for Step 11 risks/assumptions register.

## Format

```markdown
### Risks Register

| ID | Description | Probability | Impact | Mitigation | Validation Method | Owner |
| -- | ----------- | ----------- | ------ | ---------- | ----------------- | ----- |
| RISK-1 | {what could go wrong, in 1 sentence}                                     | LOW / MED / HIGH | LOW / MED / HIGH | {what we do to reduce it} | {how we know mitigation worked} | {role / person} |
| RISK-2 | {e.g. provider rate limit hit during bulk migration}                     | MED              | HIGH             | Implement exponential backoff + chunking | Integration test with mock 429 | dev |

### Assumptions Register

| ID | Assumption | Source | Validation Status | Validation Method |
| -- | ---------- | ------ | ----------------- | ----------------- |
| ASSUMPTION-1 | {what we believe to be true but have not proven, in 1 sentence}        | {who said it, when, where}             | UNVERIFIED / VERIFIED / INVALIDATED | {how we plan to verify} |
| ASSUMPTION-2 | {e.g. Provider always sends UTC timestamps}                            | Provider doc v3.2, page 17             | VERIFIED                            | Real sample inspection (step-05) |

**Linkage rules:**
- Every UNVERIFIED assumption with HIGH impact-if-false → must be either VERIFIED in step-05 (real-data investigation) OR converted to a RISK
- Every HIGH-impact RISK without an executable mitigation → BLOCKER (cannot ship)
- Every INVALIDATED assumption → triggers a story re-scoping discussion
```

## Checklist

- [ ] All RISKS have probability + impact + mitigation
- [ ] All RISK mitigations have a validation method (not "we'll be careful")
- [ ] All ASSUMPTIONS have a source (not "common sense")
- [ ] All HIGH-impact assumptions are either VERIFIED or converted to RISK
- [ ] Owner assigned for each RISK (a role, not "the team")
- [ ] Linkage to step-05 real-data findings is explicit when assumption is data-related

## Guidelines

**GOOD risks:**
- "Provider returns NULL for currency on EU orders → wrong refund amount"
- "Cache rebuild may serve empty results during 30s window"
- "Migration runs in a transaction that exceeds DB lock timeout"

**BAD risks:**
- "Something might go wrong" (not specific)
- "User error" (not actionable)
- "Bug in code" (not a risk, that's just bugs)

**GOOD assumptions:**
- "Provider always sends UTC timestamps (per doc v3.2, p17)" → VERIFIABLE
- "Refund volume < 100/day (per Q2 product report)" → VERIFIABLE

**BAD assumptions:**
- "User will read the error message" (not a system assumption, this is UX)
- "It will work" (not an assumption, this is hope)

## Anti-patterns

- Hiding risks under "edge cases" / "unhappy path" / "TODO" → REJECT, name them
- Mitigations that are "monitor and alert" without a remediation plan → REJECT (reactive ≠ mitigation)
- Listing every conceivable risk to look thorough → REJECT, only list the ones that change behavior
- Assumptions without source = invented → REJECT
