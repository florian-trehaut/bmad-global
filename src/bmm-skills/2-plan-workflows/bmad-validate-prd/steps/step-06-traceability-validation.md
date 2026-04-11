---
nextStepFile: './step-07-implementation-leakage-validation.md'
---

# Step 6: Traceability Validation

## STEP GOAL

Validate the traceability chain from Executive Summary to Success Criteria to User Journeys to Functional Requirements is intact, ensuring every requirement traces back to a user need or business objective.

## RULES

- Focus ONLY on traceability chain validation
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Identify orphan requirements (FRs with no traceable source)
- Build traceability matrix as evidence

## SEQUENCE

### 1. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform traceability validation on this PRD:

1. Extract content from Executive Summary (vision, goals)
2. Extract Success Criteria
3. Extract User Journeys (user types, flows, outcomes)
4. Extract Functional Requirements (FRs)
5. Extract Product Scope (in-scope items)

**Validate chains:**
- Executive Summary to Success Criteria: Does vision align with defined success?
- Success Criteria to User Journeys: Are success criteria supported by user journeys?
- User Journeys to Functional Requirements: Does each FR trace back to a user journey?
- Scope to FRs: Do MVP scope FRs align with in-scope items?

**Identify orphans:**
- FRs not traceable to any user journey or business objective
- Success criteria not supported by user journeys
- User journeys without supporting FRs

Build traceability matrix and identify broken chains and orphan FRs.

Return structured findings with chain status and orphan list."

### 2. Direct Analysis (if Task tool unavailable)

If Task tool unavailable, perform analysis directly:

**Extract key elements:**
- Executive Summary: Note vision, goals, objectives
- Success Criteria: List all criteria
- User Journeys: List user types and their flows
- Functional Requirements: List all FRs
- Product Scope: List in-scope items

**Validate Executive Summary to Success Criteria:**
- Does Executive Summary mention the success dimensions?
- Are Success Criteria aligned with vision?
- Note any misalignment

**Validate Success Criteria to User Journeys:**
- For each success criterion, is there a user journey that achieves it?
- Note success criteria without supporting journeys

**Validate User Journeys to FRs:**
- For each user journey/flow, are there FRs that enable it?
- List FRs with no clear user journey origin
- Note orphan FRs (requirements without traceable source)

**Validate Scope to FR Alignment:**
- Does MVP scope align with essential FRs?
- Are in-scope items supported by FRs?
- Note misalignments

**Build traceability matrix:**
- Map each FR to its source (journey or business objective)
- Note orphan FRs
- Identify broken chains

### 3. Tally Traceability Issues

**Broken chains:**
- Executive Summary to Success Criteria gaps: count
- Success Criteria to User Journeys gaps: count
- User Journeys to FRs gaps: count
- Scope to FR misalignments: count

**Orphan elements:**
- Orphan FRs (no traceable source): count
- Unsupported success criteria: count
- User journeys without FRs: count

**Total issues:** Sum of all broken chains and orphans

### 4. Report Traceability Findings to Validation Report

Append to validation report:

```markdown
## Traceability Validation

### Chain Validation

**Executive Summary to Success Criteria:** [Intact/Gaps Identified]
{If gaps: List specific misalignments}

**Success Criteria to User Journeys:** [Intact/Gaps Identified]
{If gaps: List unsupported success criteria}

**User Journeys to Functional Requirements:** [Intact/Gaps Identified]
{If gaps: List journeys without supporting FRs}

**Scope to FR Alignment:** [Intact/Misaligned]
{If misaligned: List specific issues}

### Orphan Elements

**Orphan Functional Requirements:** {count}
{List orphan FRs with numbers}

**Unsupported Success Criteria:** {count}
{List unsupported criteria}

**User Journeys Without FRs:** {count}
{List journeys without FRs}

### Traceability Matrix

{Summary table showing traceability coverage}

**Total Traceability Issues:** {total}

**Severity:** [Critical if orphan FRs exist, Warning if gaps, Pass if intact]

**Recommendation:**
[If Critical] "Orphan requirements exist - every FR must trace back to a user need or business objective."
[If Warning] "Traceability gaps identified - strengthen chains to ensure all requirements are justified."
[If Pass] "Traceability chain is intact - all requirements trace to user needs or business objectives."
```

### 5. Display Progress and Auto-Proceed

Display: "**Traceability Validation Complete**

Total Issues: {count} ({severity})

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}
