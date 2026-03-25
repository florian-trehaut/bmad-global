# ADR Review Report Template

Output template for published review reports. Loaded by step-07-publish.md.

---

## Template

```markdown
# ADR Review: {adr_title}

**Date:** {date}
**Reviewer:** {USER_NAME}
**Source:** {source_type} ({source_reference})
**Verdict:** {APPROVE | IMPROVE | REJECT} (Confidence: {HIGH | MEDIUM | LOW})

---

## Summary

{One-paragraph summary of the review — what the ADR proposes, key findings, and verdict justification.}

---

## Findings Overview

| Severity | Count |
|----------|-------|
| BLOCKER | {N} |
| MAJOR | {N} |
| MINOR | {N} |
| INFO | {N} |

### Findings by Category

| Category | Findings | Highest Severity |
|----------|----------|-----------------|
| Fact Check | {N} | {severity} |
| Reasoning | {N} | {severity} |
| Alternatives | {N} | {severity} |
| Coherence | {N} | {severity} |
| Consequences | {N} | {severity} |
| Evidence | {N} | {severity} |
| NFR Readiness | {N} | {severity} |

---

## Detailed Findings

{For each finding, ordered by severity (BLOCKERs first):}

### F-{N}: {title}

- **Category:** {category}
- **Severity:** {severity}
- **ADR Section:** {adr_section}
- **Detail:** {detail}
- **Evidence:** {evidence}
- **Proposed Action:** {proposed_action}
- **Status:** {ACCEPTED | REJECTED | MODIFIED} by reviewer

---

## Anti-Pattern Detection

| Anti-pattern | Detected | Evidence |
|--------------|----------|----------|
| Fairy Tale | {YES/NO} | {brief evidence or "—"} |
| Sprint | {YES/NO} | {brief evidence or "—"} |
| Tunnel Vision | {YES/NO} | {brief evidence or "—"} |
| Retroactive Fiction | {YES/NO} | {brief evidence or "—"} |

---

## Alternative Analysis

{If proactive alternative research was performed (Step 4):}

### Alternatives Explored by Reviewer

| # | Alternative | Relevance | Pros vs. Chosen | Cons vs. Chosen |
|---|------------|-----------|-----------------|-----------------|
| 1 | {name} | {HIGH/MEDIUM/LOW} | {brief} | {brief} |

{Or: "No additional relevant alternatives identified. Justification: {reason}."}

---

## NFR Readiness Scan

**Categories scanned:** {list}

| Category | Gaps | Key Concern |
|----------|------|-------------|
| {name} | {N} | {concern or "—"} |

{If gaps found:} For comprehensive NFR evaluation, use `bmad-nfr-assess`.

---

## Verdict

**Decision:** {APPROVE | IMPROVE | REJECT}
**Confidence:** {HIGH | MEDIUM | LOW}

**Justification:** {Why this verdict — referencing key findings by ID.}

{If IMPROVE:}
### Conditions for Approval

{Numbered list of conditions that must be addressed before the ADR can be approved:}

1. {condition — referencing finding F-{N}}
2. {condition}

{If REJECT:}
### Blocking Issues

{Numbered list of blockers that must be resolved:}

1. {blocker — referencing finding F-{N}}
2. {blocker}
```
