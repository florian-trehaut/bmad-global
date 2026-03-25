# Trade-off Matrix Template

Reference template for structured comparison of multiple options on weighted criteria. Based on Weighted Scoring Model with sensitivity analysis.

## When to Use

Use trade-off matrix format when the spike **compares 2+ options on multiple dimensions** and needs a defensible, transparent recommendation. Often combined with an ADR (the matrix provides the data, the ADR provides the narrative).

## Methodology

1. **Define must-haves** — binary pass/fail gates applied first to eliminate non-starters
2. **Define weighted criteria** — 5-8 criteria, each with a weight reflecting importance
3. **Score each option** — evidence-based scores on each criterion
4. **Compute weighted totals** — identify the winner
5. **Run sensitivity analysis** — verify the winner is robust to weight changes

## Format

```markdown
# Trade-off Analysis: {title}

**Date:** {date}
**Spike:** {spike_slug}
**Methodology:** Weighted Scoring Model with sensitivity analysis

## Options

| # | Option | Description |
|---|--------|-------------|
| A | {name} | {brief description — 1-2 sentences} |
| B | {name} | {brief description} |
| C | {name} | {brief description} |

## Must-Have Gates (Pass/Fail)

Apply these binary filters first. Options that fail any must-have are eliminated.

| Must-Have | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| {requirement 1} | PASS/FAIL | PASS/FAIL | PASS/FAIL |
| {requirement 2} | PASS/FAIL | PASS/FAIL | PASS/FAIL |

**Eliminated:** {list options that failed a must-have, with reason}

## Evaluation Criteria

| # | Criterion | Weight (1-5) | Definition | Source |
|---|-----------|-------------|------------|--------|
| C1 | {criterion} | {weight} | {what "good" looks like — measurable} | {KAC or decision driver} |
| C2 | {criterion} | {weight} | {definition} | {source} |
| C3 | {criterion} | {weight} | {definition} | {source} |

**Weight justification:** {brief explanation of why weights are set this way — which criteria matter most and why}

## Score Definitions

| Score | Meaning |
|-------|---------|
| 5 | Excellent — exceeds requirements with strong evidence |
| 4 | Good — meets requirements well |
| 3 | Adequate — meets minimum requirements |
| 2 | Weak — partially meets requirements |
| 1 | Poor — does not meet requirements |

## Scoring Matrix

| Criterion (weight) | Option A | Option B | Option C |
|--------------------|----------|----------|----------|
| C1: {name} ({w}) | {score}: {evidence} | {score}: {evidence} | {score}: {evidence} |
| C2: {name} ({w}) | {score}: {evidence} | {score}: {evidence} | {score}: {evidence} |
| C3: {name} ({w}) | {score}: {evidence} | {score}: {evidence} | {score}: {evidence} |
| **Weighted Total** | **{total}** | **{total}** | **{total}** |

*Weighted total = Σ(score × weight) for each option*

## Sensitivity Analysis

Does the winner change if weights shift by ±1?

| Scenario | Changed Weight | Winner |
|----------|---------------|--------|
| Baseline | (as defined) | {Option X} |
| +1 to {criterion} | {new weights} | {winner} |
| -1 to {criterion} | {new weights} | {winner} |
| +1 to {criterion} | {new weights} | {winner} |

**Robustness verdict:** {ROBUST — winner is stable / SENSITIVE — winner changes under scenario X, which means...}

## Recommendation

**Winner:** Option {X} (weighted score: {total})

**Key differentiators:** {what made the difference — the 1-2 criteria where the winner clearly outperformed}

**Key trade-off:** {what was sacrificed — the winner's weakness compared to the runner-up}

**Caveats:** {conditions under which you would choose differently}
```

## Quality Checklist

Before finalizing, verify:

- [ ] At least 2 options compared (surviving must-have gates)
- [ ] Must-haves separated from weighted criteria (binary vs. scored)
- [ ] 5-8 weighted criteria (no more, no less)
- [ ] Criteria have measurable definitions, not just labels
- [ ] Weights justified (not arbitrary)
- [ ] Every score backed by evidence from the investigation (not opinion)
- [ ] Weighted totals computed correctly
- [ ] Sensitivity analysis performed (at least 3 scenarios)
- [ ] Recommendation follows from the scoring (not contradicting it)
- [ ] Caveats documented (when would you choose differently?)

## Anti-Patterns to Avoid

| Anti-pattern | Description | Mitigation |
|--------------|-------------|------------|
| **Fake objectivity** | Precise scores (7.3 vs 7.1) creating illusion of rigor when inputs are guesses | Use integer scores 1-5, acknowledge uncertainty |
| **Criteria stuffing** | Too many minor criteria diluting important ones | Cap at 5-8 criteria, use must-haves for binary requirements |
| **Anchoring** | First option scored sets mental reference for others | Score each option independently, randomize order if multiple scorers |
| **HiPPO effect** | Scores adjusted to match senior leader's preference | Independent scoring before discussion |
| **Sunk cost** | Favoring incumbent due to existing investment | Include "switching cost" as an explicit, weighted criterion |
| **Confirmation bias** | Seeking data supporting pre-existing preference | Require evidence for every score, devil's advocate review |
