# Findings Summary Template

Reference template for general investigation findings — domain research, requirements discovery, regulatory analysis, or any investigation that doesn't fit ADR/Trade-off/PoC formats.

## When to Use

Use Findings Summary format when the spike is a **general investigation** that doesn't involve choosing between options (ADR), comparing on multiple criteria (trade-off), or building a prototype (PoC). Common use cases: domain research, regulatory requirement discovery, UX pattern investigation, stakeholder needs analysis.

## Format

```markdown
# Investigation Findings: {title}

**Date:** {date}
**Spike:** {spike_slug}
**Type:** {Technical | Functional | Hybrid}

## Question

{The specific question this investigation answers — same as the spike question from Step 2.}

## Investigation Scope

### What Was Investigated

- {axis 1}: {scope and approach — e.g., "Codebase analysis of auth module, 15 files read"}
- {axis 2}: {scope and approach — e.g., "Web research on GDPR data residency requirements, 8 sources consulted"}
- {axis 3}: {scope and approach}

### What Was NOT Investigated (and Why)

- {excluded area 1}: {reason — out of scope, inaccessible data source, deferred to future spike}
- {excluded area 2}: {reason}

{Being explicit about scope boundaries prevents false confidence in completeness.}

## Key Findings

### Finding 1: {title}

**Evidence:** {concrete evidence — data, file:line references, URLs, quotes from documentation, execution output}

**Impact:** {what this means for the project — decision it enables, risk it reveals, constraint it imposes}

**Confidence:** {HIGH | MEDIUM | LOW}
- HIGH = multiple independent sources confirm, or directly verified via code/execution
- MEDIUM = single reliable source, or partially verified
- LOW = inferred, single anecdotal source, or contradictory evidence exists

### Finding 2: {title}

{same structure}

### Finding 3: {title}

{same structure}

## Unknowns and Gaps

| # | Unknown | Impact | Proposed Resolution |
|---|---------|--------|---------------------|
| 1 | {what we still don't know} | {why it matters — what decision is blocked} | {specific action to resolve — not "investigate more"} |
| 2 | {unknown} | {impact} | {resolution} |

## Synthesis

{Brief narrative connecting the findings into a coherent picture.
How do the findings relate to each other? What story do they tell?
What is the overall answer to the spike question?}

## Recommendation

**Verdict:** {GO | NO-GO | GO WITH CAVEATS}

**Answer to spike question:** {direct, concise answer}

**Recommended next steps:**
1. {specific action — linked to a story if applicable}
2. {specific action}
3. {specific action}

**Risks:**
- {risk 1 — impact and mitigation}

## Knowledge Acceptance Criteria Status

| KAC | Status | Summary |
|-----|--------|---------|
| KAC-1 | {ANSWERED/PARTIAL/UNANSWERED} | {with evidence reference} |

## Sources

| # | Source | Type | Relevance |
|---|--------|------|-----------|
| 1 | {URL or file:line} | {official docs / community / code / execution} | {what it contributed to findings} |
| 2 | {source} | {type} | {relevance} |
```

## Quality Checklist

Before finalizing, verify:

- [ ] Question clearly stated (matches spike question from Step 2)
- [ ] Scope boundaries defined (what was AND was not investigated)
- [ ] Each finding has concrete evidence (not opinion or assumption)
- [ ] Confidence levels stated and justified for each finding
- [ ] Unknowns acknowledged with specific resolution proposals (not vague "needs more research")
- [ ] Synthesis connects findings into a coherent answer
- [ ] Recommendation is actionable (specific next steps, not "further investigation")
- [ ] All KACs addressed (even if UNANSWERED — with explanation)
- [ ] Sources documented for traceability

## Confidence Level Guide

| Level | Criteria | Example |
|-------|----------|---------|
| **HIGH** | Multiple independent sources confirm; directly verified via code/execution; official documentation states it explicitly | "Prisma 5.x supports composite unique constraints — verified in docs and tested in PoC" |
| **MEDIUM** | Single reliable source; partially verified; consistent with known patterns but not fully confirmed | "Provider X likely supports webhook retries based on their API docs, but not tested" |
| **LOW** | Inferred from indirect evidence; single anecdotal source; contradictory evidence exists | "Community reports suggest library Y has memory leaks above 10k connections, but only 2 GitHub issues found" |
