---
nextStepFile: './step-03-options.md'
---

# Step 2: Capture Context & Decision Drivers

## STEP GOAL:

Elicit the problem statement, forces at play, constraints, and decision drivers. Check for conflicts with existing ADRs. Determine if this ADR supersedes an existing one.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You capture the "why" — ask sharp, specific questions to draw out forces and constraints
- Context describes the problem and forces, NOT the solution — do not let the user jump to solution mode yet
- Adapt questioning depth to `{USER_SKILL_LEVEL}`

### Step-Specific Rules:

- Present C/E/Q menu — user must confirm context before proceeding
- Decision drivers must be specific and measurable where possible

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP before presenting menu
- Present C/E/Q menu — user must confirm context

---

## MANDATORY SEQUENCE

### 1. Elicit Problem Statement

Present what we understand from Step 1.

**If sub-workflow mode:** Pre-populate from the calling workflow's context and present: "Based on the calling workflow's context, here's the problem statement. Please confirm or expand."

**If standalone mode:** Ask the user to describe:
- What is the issue or need? What triggered this decision?
- What forces are at play (technical constraints, team constraints, business constraints)?
- Why is this decision needed *now*? (urgency driver)

WAIT for user input.

### 2. Codebase Context Scan

Search the main repo for relevant context:
- Grep for patterns related to the decision topic (e.g., if deciding on caching, search for existing cache usage)
- Check architecture docs if they exist (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md`, architecture files)
- Note current state of the system relevant to the decision

Present findings: "Here's what I found in the codebase relevant to this decision: {findings}"

### 3. Identify Decision-Makers

Discover who should be listed as decision-makers — do NOT default to just the current user.

**Step A — Git contributor analysis:**

```bash
git log --since="1 month ago" --format="%aN" | sort | uniq -c | sort -rn | head -10
```

This gives the active contributors over the last month, ranked by commit count.

**Step B — Scope-targeted analysis (if the decision topic maps to specific directories):**

```bash
git log --since="3 months ago" --format="%aN" -- {relevant_directories} | sort | uniq -c | sort -rn | head -5
```

This identifies domain experts for the specific area the ADR affects.

**Step C — Present and ask:**

> **Suggested decision-makers** (based on recent git activity):
>
> | Contributor | Commits (30d) | Domain relevance |
> |-------------|:---:|----------------|
> | {name 1} | {N} | {all / specific dirs} |
> | {name 2} | {N} | ... |
> | ... | ... | ... |
>
> Current user: **{USER_NAME}**
>
> Who should be listed as decision-makers for this ADR?
> Include anyone whose input or approval matters for this decision.

WAIT for user input. Store `DECISION_MAKERS` as a list.

### 4. Elicit Decision Drivers

Help the user articulate explicit criteria. Adapt to skill level:

**Expert:** "What are your decision drivers? List the criteria that matter most."

**Intermediate:** "What criteria should guide this decision? Think: performance targets, team expertise, cost constraints, integration requirements, timeline."

**Beginner:** "Let's figure out what matters most for this decision. Some common criteria:
- Performance: does it need to be fast? How fast?
- Team: does your team know this technology?
- Cost: budget constraints?
- Integration: does it need to work with existing systems?
- Timeline: how soon do you need this?

Which of these apply? What else matters?"

Each driver should be specific and measurable where possible:
- Not "must be fast" → "p95 latency below 200ms"
- Not "team knows it" → "3 of 5 engineers have production experience with it"

WAIT for input.

### 5. Existing ADR Conflict Check

Cross-reference with `EXISTING_ADRS` (loaded in step-01):

<check if="potential conflicts flagged in step-01">
  Present to user:

  > I found existing ADR(s) on a related topic:
  >
  > | ADR | Title | Status |
  > |-----|-------|--------|
  > | {number} | {title} | {status} |
  >
  > **[U]** This new ADR supersedes ADR-{N} (old one will be marked "Superseded by ADR-{NEXT}")
  > **[R]** This is a different decision — no conflict
  > **[X]** Cancel — the existing ADR already covers this

  WAIT for selection.

  - **U**: Store `SUPERSEDES_ADR = {number, title, filename}`. The old ADR will be updated in step-07.
  - **R**: Proceed — no supersession.
  - **X**: HALT — no ADR needed. If sub-workflow mode, return to caller with "Existing ADR-{N} covers this decision."
</check>

<check if="no conflicts found">
  Proceed without supersession check.
</check>

### 6. Present Context Summary

Present the structured context for validation:

> **Context captured:**
>
> **Problem:** {summary — 2-3 sentences}
>
> **Forces:**
> - {force 1}
> - {force 2}
> - ...
>
> **Decision Drivers:**
> 1. {driver 1 — with measurability note}
> 2. {driver 2}
> 3. ...
>
> **Urgency:** {why now}
>
> **Supersedes:** {ADR-N: title | none}
>
> **Decision-makers:** {DECISION_MAKERS list}
>
> **Codebase context:** {key findings}

### 7. Update WIP

Append context data to WIP file. Update `stepsCompleted: [1, 2]`.

### 8. Present Menu

> **[C]** Continue to options discovery (Step 3)
> **[E]** Edit — modify context, forces, or drivers
> **[Q]** Questions

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **E**: Ask what to edit. Apply edits. Re-present context summary. Redisplay menu.
- **Q**: Answer questions. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Problem described in value-neutral language (forces, not solution)
- Decision drivers are specific and measurable where possible
- Existing ADR conflict check performed
- Supersession handled if applicable
- Context validated by user via C selection

### FAILURE:

- Context describes the solution instead of the problem
- Decision drivers are vague ("must be good")
- Skipping conflict check with existing ADRs
- Not adapting to user skill level
- Auto-proceeding without user C selection
