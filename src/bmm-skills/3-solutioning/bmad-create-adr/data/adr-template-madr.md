# ADR Template — MADR Format

Based on MADR 4.0 (Markdown Any Decision Record). Used when `adr_format` is `madr` or `unknown` (default).

Reference: <https://adr.github.io/madr/>

---

## Template

```markdown
---
status: {proposed | accepted | deprecated | superseded by ADR-NNNN}
date: {YYYY-MM-DD}
decision-makers: [{USER_NAME}]
---

# {NEXT_ADR_NUMBER}. {title}

## Context and Problem Statement

{problem_statement — describe the situation in value-neutral language. Do not lead toward a solution. Can include a question form. Link to issue tracker if relevant.}

{If SUPERSEDES_ADR:}
> This ADR supersedes ADR-{N}: {old_title}. {reason for supersession}.

## Decision Drivers

- {driver 1 — quality attribute, constraint, or concern with measurable target}
- {driver 2}
- ...

## Considered Options

- {Option 1 name}
- {Option 2 name}
- {Do Nothing / Status Quo}

## Decision Outcome

Chosen option: "{option_name}", because {justification connecting to decision drivers and evidence}.

### Consequences

- Good, because {positive consequence with evidence reference}
- Bad, because {negative consequence with evidence reference}

### Confirmation

{How compliance will be verified: code reviews, tests, fitness functions, or manual checks.}

## Pros and Cons of the Options

### {Option 1 name}

{Brief description — what this option entails.}

- Good, because {argument} — Evidence: {source}
- Neutral, because {argument}
- Bad, because {argument} — Evidence: {source}

### {Option 2 name}

{Same structure — comparable depth to Option 1.}

### Do Nothing (Status Quo)

{What happens if we don't act? What is the current state and its trajectory? Always consider this option seriously.}

- Good, because {argument}
- Bad, because {argument}

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| {risk} | {HIGH/MEDIUM/LOW} | {HIGH/MEDIUM/LOW} | {specific, actionable mitigation} |

## More Information

{Links to related ADRs, investigation artifacts, PoC repositories, team discussions, or implementation notes. Include a revisit schedule if the decision has a known expiration.}
```

---

## Quality Checklist

Before finalizing, verify:

- [ ] Context describes the problem and forces, not the solution
- [ ] At least 3 options considered (including "do nothing" if applicable)
- [ ] Each option has evidence-based pros/cons (not speculation or opinion)
- [ ] Decision outcome traces to specific evidence
- [ ] Both positive AND negative consequences documented
- [ ] Risks identified with mitigation strategies
- [ ] No Fairy Tale anti-pattern (only listing pros for the chosen option)
- [ ] No Sprint anti-pattern (only one option seriously considered)
- [ ] No Tunnel Vision anti-pattern (operational/maintenance consequences included)
- [ ] No Retroactive Fiction anti-pattern (evidence gathered during investigation, not from memory)
