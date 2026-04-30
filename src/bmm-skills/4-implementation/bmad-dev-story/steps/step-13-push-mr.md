---
nextStepFile: './step-14-complete.md'
---

# Step 13: Push & Merge Request


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-13-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-13-ENTRY PASSED — entering Step 13: Push & Merge Request with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Push the branch and create or update the forge Merge Request.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` §B, when TEAMMATE_MODE=true:

- Push the branch from `WORKTREE_PATH` directly (the orchestrator owns the worktree, not the tracker — push is a code-level operation, not a tracker write).
- Do NOT create the MR/PR via the forge CLI directly. Emit a `tracker_write_request` SendMessage with `operation: 'create_mr'`, `args: {branch: BRANCH_NAME, title: MR_TITLE, body: MR_BODY, target: 'main'}`.
- Wait for `tracker_write_ack` containing the MR_IID and MR_URL. On `failed`, emit a `blocker` and HALT.
- Store the returned `MR_IID` for the final report (step-14).

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below as normal.

## MANDATORY SEQUENCE

### 1. Push Branch

```bash
cd {WORKTREE_PATH}
git push -u origin {BRANCH_NAME}
```

### 2. Fact-Check MR Description Against Code

**CRITICAL — every claim in the MR description must be verifiable in the code.**

Before creating/updating the MR, verify the description draft:

1. **API names and function names** — grep the codebase for every function, method, class, or API name mentioned. If a name doesn't exist in the code, fix the description.
2. **Numeric claims** — "handles N cases", "reduces X by Y%", "70+ tests" — verify the exact count. Use precise numbers, not approximations.
3. **Behavioral claims** — "does X when Y happens" — trace the code path to confirm.
4. **Comments in code** — verify that code comments referenced in the description accurately describe what the code does.
5. **Performance claims** — if the description claims latency, throughput, or size improvements, these must be backed by measurements (see performance measurement step if applicable).

If any claim is false or misleading, fix it before publishing. A MR description that contradicts the code destroys reviewer trust.

### 3. Create or Update MR

<check if="MR_IID is null (no existing MR)">
  Create MR:

```bash
{FORGE_MR_CREATE} \
  --source-branch {BRANCH_NAME} \
  --target-branch main \
  --title "{ISSUE_IDENTIFIER}: {ISSUE_TITLE}" \
  --description "## Summary

Implements {ISSUE_IDENTIFIER} — {ISSUE_TITLE}

Tracker: {ISSUE_IDENTIFIER}

## Changes

{file_list}

## Test Plan

All acceptance criteria tested via TDD.

## Traceability

{traceability_table}"
```

  Store MR_IID and MR_URL.
</check>

<check if="MR_IID exists (MR already open)">
  Push updates the existing MR automatically.
  Log: "MR !{MR_IID} updated with latest changes"
</check>

### 4. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Branch pushed, MR created/updated
### FAILURE: Force pushing, pushing to main

---

## STEP EXIT (CHK-STEP-13-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-13-EXIT PASSED — completed Step 13: Push & Merge Request
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
