---
nextStepFile: './step-06-mark-in-progress.md'
---

# Step 5: Load Project Context


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Load Project Context with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Load the project context (source of truth for dev standards) and check for cross-session recovery.

## MANDATORY SEQUENCE

### 1. Load Issue Description

The issue description (loaded from tracker in Step 2) IS the story — it contains tasks, AC, guardrails.

### 2. Load Project Context

1. **Primary (tracker):** If `{TRACKER_META_PROJECT_ID}` is set, list documents in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) to find "Project Context" document, then load its content by ID.
2. **Fallback (local):** Search for `**/project-context.md` in the project.

### 3. Load Dev Standards

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing) for tech stack context, forbidden patterns, test rules, and reference code pointers.

### 3b. Load Contribution Conventions

Search for and load contribution guidelines that constrain how code is submitted:

```bash
cd {WORKTREE_PATH}
ls CONTRIBUTING.md CONTRIBUTING.rst .github/CONTRIBUTING.md .github/pull_request_template.md .github/PULL_REQUEST_TEMPLATE.md docs/CONTRIBUTING.md 2>/dev/null
ls .github/PULL_REQUEST_TEMPLATE/ dangerfile.js dangerfile.ts Dangerfile .cla* CLA* 2>/dev/null
```

For each file found, read and extract:
- **PR requirements** — title format, description template, required sections
- **CI linter rules** — Danger.js checks, commit message rules, CLA requirements
- **Review criteria** — what reviewers expect, required approvals
- **Code style gates** — linting, formatting, type-checking thresholds

Store as `CONTRIBUTION_CONVENTIONS`. These rules apply to step-13 (push/MR creation).

### 4. Load Architecture Decision Records (if available)

Check `adr_location` from workflow-context.md.

<check if="adr_location is set and not 'none'">
  Load all ADRs from the configured location. When multiple ADRs on the same topic, the most recent takes precedence.
  Store as `PROJECT_ADRS` — the plan (step-07) must not violate active ADRs, and the self-review (step-11) must verify conformity.
</check>

### 5. Check for Progress Recovery

```bash
ls {WORKTREE_PATH}/agent-progress.md 2>/dev/null && cat {WORKTREE_PATH}/agent-progress.md
```

<check if="agent-progress.md exists AND current_step > 5">
  Recovery mode — read progress file.
  Log: "Resuming from Step {current_step} — steps 1-{current_step-1} already completed"
  Skip ahead to the step indicated by current_step.
</check>

### 6. Check for Review Continuation

Check issue comments for "Action Items" or "Review Findings" from a previous code review.

<check if="review action items found with unchecked items">
  This is a review continuation — address action items first.
  Log: "Resuming after code review — addressing action items"
</check>

### 7. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Context loaded, recovery checked, standards available
### FAILURE: Skipping context load, ignoring recovery state

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Load Project Context
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
