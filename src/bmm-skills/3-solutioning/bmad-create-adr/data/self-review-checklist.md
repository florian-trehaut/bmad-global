# ADR Self-Review Checklist

Lightweight quality gate applied before publication. Adapted from bmad-adr-review evaluation criteria. This is NOT a full review — it catches structural issues and anti-patterns before the ADR is committed.

Used by step-06-compose.md to validate the draft ADR.

---

## Quality Checks

### 1. Context Quality

- [ ] Context describes the problem and forces, not the solution
- [ ] Urgency / trigger is stated (why now?)
- [ ] Constraints are explicit

### 2. Options Completeness

- [ ] At least 3 options documented (including "do nothing" / status quo)
- [ ] All options described with comparable depth (no one-liners vs. paragraphs)
- [ ] "Do nothing" seriously evaluated (not perfunctorily dismissed)

### 3. Evidence Quality

- [ ] Every pro/con has a verifiable evidence source
- [ ] Evidence sources are concrete (URLs, file:line, benchmarks, PoC output)
- [ ] No "we believe" or "in our experience" without specific references
- [ ] Evidence is current (not outdated references)

### 4. Decision Logic

- [ ] Justification references specific decision drivers and evidence
- [ ] Justification is not tautological ("X is best because X is the best option")
- [ ] Rejected options are dismissed with evidence, not hand-waving

### 5. Consequences Completeness

- [ ] Both positive AND negative consequences listed
- [ ] At least 1 negative consequence for the chosen option
- [ ] Consequences are specific (not vague platitudes)
- [ ] Operational, cross-team, and security dimensions addressed

### 6. Risk Quality

- [ ] Risks identified with impact and likelihood
- [ ] Mitigations are specific and actionable
- [ ] No "we'll handle it later" mitigations

### 7. Anti-Pattern Scan

- [ ] No Fairy Tale (chosen option has cons; rejected options have pros)
- [ ] No Sprint (multiple options seriously evaluated)
- [ ] No Tunnel Vision (non-functional dimensions addressed)
- [ ] No Retroactive Fiction (evidence gathered during process, not from memory)

---

## Scoring

| Result | Criteria | Action |
|--------|----------|--------|
| **PASS** | All checks satisfied | Proceed to publication |
| **CONCERN** | 1-3 checks failed | Address before publication (step-06 offers edit) |
| **FAIL** | 4+ checks failed | Return to earlier steps to strengthen the ADR |
