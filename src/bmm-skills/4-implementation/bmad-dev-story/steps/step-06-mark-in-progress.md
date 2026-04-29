---
nextStepFile: './step-07-plan-approval.md'
---

# Step 6: Mark In Progress & Load Test Strategy


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Mark In Progress & Load Test Strategy with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Update tracker status and load or auto-generate the test strategy from the issue description.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teammate-mode-routing.md` §B, when TEAMMATE_MODE=true and `task_contract.constraints.tracker_writes == false`:

- Do NOT update the tracker directly.
- Emit a `tracker_write_request` SendMessage with `operation: 'update_status'`, `args: {issue_id: ISSUE_ID, target_status: TRACKER_STATES.in_progress}`.
- Wait for `tracker_write_ack`. On `failed`, emit a `blocker` SendMessage and HALT.
- Test strategy parsing in §2 still happens locally (no tracker write involved).

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below as normal.

## MANDATORY SEQUENCE

### 1. Update Tracker Status

Update the issue in the tracker (using CRUD patterns from workflow-knowledge/project.md):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.in_progress}

### 2. Load Test Strategy

Parse the issue description for a test strategy section (e.g., `## Test Strategy`, `## Strategie de Test`).

<check if="test strategy section found">
  Extract the test strategy table.
  For each AC, store: priority (P0-P3), expected test levels (Unit/Integration/Journey), key scenarios.
  Store TEST_STRATEGY = parsed table.

  **Validate coherence:**
  - Every AC has at least one test level assigned
  - P0 ACs have Integration or Journey tests (not Unit-only)
  - No test level is empty for the entire story

  <check if="validation issues found">
    Display issues and apply corrections.
  </check>
</check>

<check if="no test strategy section found">
  Auto-generate minimal strategy:
  - Default priority P1 (adjust: auth/payment/security -> P0, admin/reporting -> P2)
  - Default test level: Unit + Integration

  Display generated strategy to user (do NOT halt).
</check>

Store TEST_STRATEGY for use in Steps 7-8.

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Status updated, test strategy loaded or auto-generated
### FAILURE: Skipping status update, no test strategy

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Mark In Progress & Load Test Strategy
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
