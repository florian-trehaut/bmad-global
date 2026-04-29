---
nextStepFile: './step-08-implement.md'
---

# Step 7: Plan Mode — Validate Approach


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Plan Mode — Validate Approach with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Enter plan mode BEFORE writing any code. The user must approve the implementation approach. This prevents wasted effort on wrong architecture or misunderstood requirements.

The end-of-workflow scope-completeness check (impartial subagent) runs in step-12 against the actual implementation, not at plan time — see `step-12-traceability.md`.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teammate-mode-routing.md` §A, when TEAMMATE_MODE=true:

- Do NOT call `EnterPlanMode` / `AskUserQuestion` directly (TAC-18 unwanted-pattern HALT trigger).
- Compose the implementation plan as in standalone mode (steps 1-2 below).
- Emit a `question` SendMessage to `LEAD_NAME` with the plan as the payload `text:` and options `[A]pprove / [M]odify / [R]eject`.
- Block on `question_reply`. On `[A]` → proceed to step-08. On `[M]` → receive modifications, apply, re-emit `question`. On `[R]` → emit `blocker` and HALT.

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below as normal.

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

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Plan Mode — Validate Approach
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
