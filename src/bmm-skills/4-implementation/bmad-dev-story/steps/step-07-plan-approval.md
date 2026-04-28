---
nextStepFile: './step-08-implement.md'
scopeCompletenessSubagent: '../subagent-workflows/scope-completeness.md'
---

# Step 7: Plan Mode — Validate Approach

## STEP GOAL:

Enter plan mode BEFORE writing any code. Draft a plan, run an impartial scope-completeness check, then request user approval. This prevents wasted effort on wrong architecture or misunderstood requirements AND catches scope oversights the plan author may have missed.

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

Save the drafted plan to the plan file (path provided by the plan-mode runtime, typically under `~/.claude/plans/`).

### 3. Scope Completeness Check (impartial subagent)

This step runs an independent, impartial subagent to verify that the drafted plan covers the story's full scope and to surface any oversights. The subagent has no shared context with this thread.

#### Gating

Skip this check ONLY when ALL of the following hold (low risk of oversight):
- Story has **fewer than 3 ACs** (BACs + TACs combined)
- Story has **fewer than 5 numbered tasks**
- Story does NOT modify cross-cutting infrastructure (workflows, shared rules, schemas)

Otherwise the check is **MANDATORY**.

If skipping, log: `Scope check skipped (story below complexity threshold)`. Otherwise proceed.

#### Invocation

Spawn the subagent per the contract `{scopeCompletenessSubagent}`. CRITICAL: the prompt MUST contain ONLY the two file paths — no summary, no excerpt, no hint about the plan's content. The subagent's value depends on its independence.

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Impartial scope-completeness audit',
  prompt: |
    Read and apply this contract IN FULL: ~/.claude/skills/bmad-dev-story/subagent-workflows/scope-completeness.md

    Inputs:
      story_path: '{ABSOLUTE_PATH_TO_STORY_FILE_OR_TRACKER_DUMP}'
      plan_path: '{ABSOLUTE_PATH_TO_PLAN_FILE}'

    Return the structured Markdown report defined in the contract. No preamble, no postamble.
)
```

#### Handling the report

Wait for the subagent's response (a structured Markdown report with sections: Coverage matrix / Oversights detected / Risks not addressed / Verdict).

**If verdict = `APPROVED`** (no BLOCKER, ≤2 MAJOR):
Append the report to the plan file under a `## Scope-completeness audit` section. Proceed to step 4.

**If verdict = `NEEDS REVISION`** (≥1 BLOCKER or >2 MAJOR):
1. Present the findings to the user verbatim
2. For each finding, propose a plan revision addressing it
3. Update the plan file
4. Append the original audit + the resolutions under `## Scope-completeness audit`
5. Re-spawn the subagent ONCE on the revised plan to confirm; loop is bounded to 2 iterations total to avoid infinite refinement
6. If still NEEDS REVISION after 2 iterations, **HALT** and ask the user how to proceed (accept remaining findings explicitly, or abandon the plan)

The user MUST see the audit before approving the plan via ExitPlanMode.

### 4. Exit Plan Mode

`ExitPlanMode` — wait for user approval.
If user requests changes, update and re-present before exiting plan mode.

### 5. Proceed

After approval, load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: User approved plan AFTER scope-completeness check (or explicit gating skip), all blockers resolved or accepted, before any code was written
### FAILURE: Writing code without plan approval, skipping plan mode, skipping scope check on a complex story, hiding audit findings from the user
