---
nextStepFile: './step-08-implement.md'
---

# Step 7: Plan Mode — Validate Approach

## STEP GOAL:

Enter plan mode BEFORE writing any code. The user must approve the implementation approach. This prevents wasted effort on wrong architecture or misunderstood requirements.

The end-of-workflow scope-completeness check (impartial subagent) runs in step-12 against the actual implementation, not at plan time — see `step-12-traceability.md`.

## MANDATORY SEQUENCE

### 1. Enter Plan Mode

`EnterPlanMode`

### 2. Draft Implementation Plan

Draft implementation plan covering:
- For each AC: which files to create/modify, which patterns to apply, which test levels (from TEST_STRATEGY)
- Key architectural decisions (new module? new domain entity? new DB migration?)
- Guardrails from the issue description
- **Data integrity check**: for every data mapping (source -> target), confirm source field is semantically correct — no fallbacks to different fields. Apply the zero-fallback rules loaded at initialization.
- Risks or open questions
- **ADR conformity check** (if `PROJECT_ADRS` is loaded): for each architectural decision in the plan, verify it doesn't violate an active ADR. If the plan introduces a new service, integration pattern, data store, or deviates from established architecture:

  **HALT.** Present the menu:

  > This plan introduces **{description}** which should be recorded as an Architecture Decision Record.
  >
  > **[A]** Create ADR now (invoke `bmad-create-adr`)
  > **[S]** Skip — will create ADR later
  > **[N]** Not needed — this doesn't warrant an ADR

  WAIT for user selection.

  - **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume plan approval.
  - **IF S or N:** Log the user's choice and proceed.

  **NEVER** silently document an ADR need as a "note" or "recommendation". The HALT forces an explicit decision.

Present:

```
## Implementation Plan — {ISSUE_IDENTIFIER}

### Approach per AC

#### {ac_id}: {ac_text}
- **Files:** {files_to_modify}
- **Pattern:** {pattern_applied}
- **Tests:** {test_levels} ({priority})

### Architectural Decisions
{architectural_decisions}

### Risks / Open Questions
{risks_and_questions}
```

### 3. Exit Plan Mode

`ExitPlanMode` — wait for user approval.
If user requests changes, update and re-present before exiting plan mode.

### 4. Proceed

After approval, load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: User approved plan before any code was written
### FAILURE: Writing code without plan approval, skipping plan mode
