# PoC Findings Template

Reference template for feasibility validation through a functional prototype. The PoC MUST be executed and produce documented results — "it should work based on docs" is not valid evidence.

## When to Use

Use PoC Findings format when the spike **validates feasibility through a working prototype**. The PoC answers "Can it work?" with evidence from actual execution. Often combined with an ADR when the PoC results inform a technology choice.

## PoC vs Prototype vs MVP

| | PoC (this template) | Prototype | MVP |
|---|---|---|---|
| **Answers** | "Can it work?" (feasibility) | "How should it look?" (design) | "Do users want it?" (market) |
| **Audience** | Internal team, architects | Stakeholders, designers | Real users |
| **Fidelity** | Minimal — just enough to prove the point | Medium — simulates experience | High — functional product |
| **Lifespan** | Reference code (kept on branch, never merged as-is) | Iterated or discarded | Evolved into product |

## Format

```markdown
# PoC Findings: {title}

**Date:** {date}
**Spike:** {spike_slug}
**PoC Branch:** `spike/{slug}` {KEPT FOR REFERENCE / DELETED}
**Verdict:** {GO | NO-GO | GO WITH CAVEATS}

## Hypothesis

{The specific feasibility question this PoC answers — stated as a falsifiable hypothesis.
Example: "Provider X's webhook API can deliver order updates to our service with end-to-end latency < 200ms and zero data loss under normal load."}

## Success / Failure Criteria

Defined BEFORE the PoC was built (not after seeing results):

| # | Criterion | Target | Type |
|---|-----------|--------|------|
| 1 | {metric/behavior} | {threshold} | {MUST / SHOULD} |
| 2 | {metric/behavior} | {threshold} | {MUST / SHOULD} |

- **MUST** criteria: failure on any = NO-GO
- **SHOULD** criteria: failure = GO WITH CAVEATS

## What Was Built

{Description of the throwaway prototype — what it does, how it works, key components.
Keep it brief — the code is on the branch for reference.}

### Key Files

| File | Purpose |
|------|---------|
| {path} | {what it does} |
| {path} | {what it does} |

## Environment

| Component | Version/Details |
|-----------|-----------------|
| OS | {e.g., macOS 14.5, Ubuntu 24.04} |
| Runtime | {e.g., Node.js 22.1, Python 3.12} |
| Key dependencies | {e.g., express 4.18, prisma 5.x} |
| External services | {e.g., Provider X sandbox API, Redis 7.2} |
| Hardware | {relevant specs if benchmarking} |

## Methodology

{How the PoC was tested. Step-by-step to reproduce from a clean machine.}

1. {step 1 — setup}
2. {step 2 — execution}
3. {step 3 — measurement}

## Results

### Functional Results

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| {case 1} | {expected behavior/output} | {actual behavior/output} | PASS/FAIL |
| {case 2} | {expected} | {actual} | PASS/FAIL |

### Performance Results (if applicable)

| Metric | Target | Measured | Runs | Status |
|--------|--------|----------|------|--------|
| {metric} | {target} | mean={X}, p95={Y}, stddev={Z} | {N} | MET/NOT MET |

{For benchmarks: minimum 10 runs. Report mean, stddev, p95. Pin dependency versions. Provide runnable script.}

### Execution Log

```
{Captured stdout/stderr — the actual proof that the PoC ran}
```

**Command used:** `{exact command}`

### Observations and Surprises

- {observation 1 — unexpected finding during PoC execution}
- {observation 2 — edge case discovered}
- {observation 3 — integration gotcha}

## Feasibility Assessment

**Verdict:** {GO | NO-GO | GO WITH CAVEATS}

**Criteria assessment:**

| # | Criterion | Target | Result | Verdict |
|---|-----------|--------|--------|---------|
| 1 | {criterion} | {target} | {measured} | PASS/FAIL |
| 2 | {criterion} | {target} | {measured} | PASS/FAIL |

**Justification:** {linked to results above — why the verdict is what it is}

### Limitations Discovered

- {limitation 1 — impact on implementation}
- {limitation 2 — workaround available? cost?}

### Gaps Not Covered by PoC

- {gap 1 — what the PoC did NOT test and why}
- {gap 2 — risk level if this gap is not addressed}

## Recommendation

{Specific recommendation for implementation based on PoC findings.
What should the implementation story include? What should it avoid?
What patterns from the PoC should be carried forward vs. rethought?}

## Knowledge Acceptance Criteria Status

| KAC | Status | Summary |
|-----|--------|---------|
| KAC-1 | {ANSWERED/PARTIAL} | {with evidence reference} |
```

## Quality Checklist

Before finalizing, verify:

- [ ] Hypothesis stated clearly and is falsifiable
- [ ] Success/failure criteria defined BEFORE the PoC (not post-hoc)
- [ ] PoC actually executed — execution log included as evidence
- [ ] Environment documented for reproducibility
- [ ] Methodology documented step-by-step (someone else could reproduce)
- [ ] Results presented with raw data, not just "it works"
- [ ] Performance results include multiple runs with statistics (if applicable)
- [ ] Limitations and gaps explicitly acknowledged
- [ ] Verdict justified by results against pre-defined criteria
- [ ] Recommendation is actionable for implementation

## Anti-Patterns to Avoid

| Anti-pattern | Description | Consequence |
|--------------|-------------|-------------|
| **Gold plating** | Adding features beyond what the hypothesis requires | Wasted timebox, false sense of readiness |
| **PoC-to-production** | Merging PoC code as-is into production | Tech debt, "lava flow" of hardened bad code |
| **Scope creep** | Testing multiple hypotheses in one PoC | Cannot attribute results to a single variable |
| **No failure criteria** | No definition of what "fail" looks like | PoC can never fail, becomes open-ended research |
| **Stakeholder demo confusion** | Showing working PoC to non-technical stakeholders who think it's "nearly done" | Pressure to ship PoC code, unrealistic timelines |
| **Insufficient documentation** | "I looked into it" with no written output | Knowledge lost, PoC must be re-run |
