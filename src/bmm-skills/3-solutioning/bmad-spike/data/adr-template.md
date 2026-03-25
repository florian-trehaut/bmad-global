# ADR Template

Reference template for Architecture Decision Record deliverables. Based on MADR (Markdown Any Decision Record) format with structured options comparison.

## When to Use

Use ADR format when the spike investigates a **choice between architecture or technology options**. The ADR documents the decision process: what was considered, what was chosen, and why.

## Format

```markdown
# ADR: {title}

**Date:** {date}
**Status:** Accepted
**Spike:** {spike_slug}
**Deciders:** {USER_NAME}

## Context and Problem Statement

{What is the issue? What forces are at play? Why is this decision needed now?
Describe the problem in value-neutral language — do not lead toward a solution.}

## Decision Drivers

- {driver 1 — e.g., "p95 latency must remain below 200ms under current load"}
- {driver 2 — e.g., "team has no experience with technology X"}
- {driver 3 — e.g., "must integrate with existing service Y via gRPC"}
- {driver 4 — e.g., "operational cost must stay under $X/month"}

## Considered Options

### Option 1: {name}

**Description:** {what this option entails — architecture, technology, approach}

**Pros:**
- {pro with evidence — reference PoC results, benchmarks, documentation}

**Cons:**
- {con with evidence}

**Evidence:** {PoC results, benchmark data, documentation reference, URL}

### Option 2: {name}

{same structure}

### Option 3: Do Nothing / Status Quo

{Always consider this option. What happens if we don't act? Sometimes doing nothing is the right choice.}

## Decision Outcome

**Chosen option:** "{option name}"

**Justification:** {why this option was chosen — link to specific decision drivers and evidence. Each claim must reference an evidence source from the investigation.}

### Positive Consequences

- {what becomes easier or better}

### Negative Consequences

- {what becomes harder or worse — be honest}

### Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| {risk} | {HIGH/MED/LOW} | {HIGH/MED/LOW} | {specific mitigation strategy} |

## Knowledge Acceptance Criteria Status

| KAC | Status | Summary |
|-----|--------|---------|
| KAC-1 | {ANSWERED/PARTIAL} | {brief answer with evidence reference} |
| KAC-2 | {status} | {summary} |

## Follow-up Actions

- {action — linked to story if created}
```

## Quality Checklist

Before finalizing, verify:

- [ ] Context describes the problem and forces, not the solution
- [ ] At least 2 options considered (including "do nothing" if applicable)
- [ ] Each option has evidence-based pros/cons (not speculation or opinion)
- [ ] Decision outcome traces to specific evidence from the investigation
- [ ] Both positive AND negative consequences documented
- [ ] Risks identified with mitigation strategies
- [ ] All KACs addressed (even if PARTIAL)
- [ ] No "Fairy Tale" anti-pattern (only listing pros for the chosen option)
- [ ] No "Sprint" anti-pattern (only one option seriously considered)
- [ ] No "Tunnel Vision" anti-pattern (operational/maintenance consequences included)

## Anti-Patterns to Avoid

| Anti-pattern | Description | How to detect |
|--------------|-------------|---------------|
| **Fairy Tale** | Only pros listed, tautological justification | Check: does chosen option have cons? |
| **Sprint** | Single option considered, only short-term effects | Check: are there 2+ real options? Are long-term consequences discussed? |
| **Tunnel Vision** | Only local context considered, ignoring ops/maintenance/consumers | Check: are operational, security, and cross-team impacts addressed? |
| **Retroactive Fiction** | ADR written from memory, not during investigation | Check: does evidence reference actual investigation artifacts? |
