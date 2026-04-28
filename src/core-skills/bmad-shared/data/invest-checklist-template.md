# INVEST Checklist Template

Reference template for Step 11 INVEST self-check (story quality gate).

## What is INVEST

INVEST is a 6-criterion check that a user story is well-formed:

- **I**ndependent — can be implemented without depending on another story in the same sprint
- **N**egotiable — captures intent, not implementation details
- **V**aluable — delivers value to a user / stakeholder
- **E**stimable — team can size the work
- **S**mall — fits in one sprint (or one developer-week, project-dependent)
- **T**estable — has concrete, verifiable acceptance criteria

## Format

```markdown
### INVEST Self-Check

| Criterion | Question | Answer | Evidence |
| --------- | -------- | ------ | -------- |
| Independent | Can this story be implemented and shipped without waiting on another story in the current iteration? | YES / NO | {if NO: name the dependency, justify why it cannot be inverted or merged} |
| Negotiable  | Does the story capture the intent (the WHY) without prescribing implementation details (the HOW)?     | YES / NO | {if NO: rewrite to remove implementation prescription, OR justify why the HOW is mandatory (e.g. ADR, security)} |
| Valuable    | Is the value to a user or stakeholder articulated in the Business Context section?                    | YES / NO | {1-line value statement, name the beneficiary} |
| Estimable   | Does the team have enough information (tech context, AC, real-data findings) to size the work?       | YES / NO | {if NO: name the missing input, add a research / spike task} |
| Small       | Can this story be completed within {project's iteration target, e.g. 1 week / 2 weeks}?              | YES / NO | {if NO: split the story; document the split in step-13-output} |
| Testable    | Are the BACs and TACs concrete enough to verify (real data + automated test + manual VM)?            | YES / NO | {if NO: rewrite vague ACs} |

**Verdict:**

- All YES → story passes INVEST gate
- ANY NO → story FAILS the gate; either fix the failing criterion or split / re-scope
```

## Checklist

- [ ] All 6 questions answered (no blanks, no "?")
- [ ] Each NO has a concrete remediation action (not "will think about it")
- [ ] Independent: dependencies on other stories named (or "none")
- [ ] Negotiable: implementation prescription removed (OR justification cited)
- [ ] Valuable: beneficiary named explicitly
- [ ] Estimable: blockers to estimation listed (or "none")
- [ ] Small: time estimate is calibrated to the project's iteration definition
- [ ] Testable: BACs and TACs cross-referenced

## Guidelines

**GOOD INVEST answers:**
- "Independent: YES — billing provider client already exists, no waiting on infra"
- "Negotiable: YES — we describe the refund flow outcome, leaving the queue technology choice to implementation"
- "Valuable: YES — beneficiary = customer requesting refund; reduces support tickets by N% per month"
- "Small: YES — fits in 5 dev-days based on similar stories ABC-12, DEF-34"

**BAD INVEST answers:**
- "Independent: probably" → REJECT, name the dependencies
- "Negotiable: yes (uses Redis)" → contradiction, Redis is implementation
- "Valuable: improves UX" → REJECT, who benefits, how do we know
- "Small: a few days" → REJECT, calibrate to project (1 week target?)
- "Testable: there are ACs" → REJECT, are they concrete enough to verify with real data

## Anti-patterns

- Answering all YES without thinking → REJECT, the gate is meaningless
- "Independent: NO but we'll figure it out" → REJECT, fix the dependency or split
- Marking Small: YES on a 4-week story → REJECT, split or push back
- Marking Testable: YES because tests exist somewhere (not for THIS story's ACs) → REJECT
