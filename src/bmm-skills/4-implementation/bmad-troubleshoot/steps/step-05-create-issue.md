# Step 5: Create Tracker Issue


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
CHK-STEP-05-ENTRY PASSED — entering Step 5: Create Tracker Issue with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Create a tracker issue with the full diagnosis, acceptance criteria, fix plan, and validation metier checklist. If an existing issue was found in step 1, link to it instead.

## RULES

- Use the diagnosis report template for the issue description
- HALT on tracker API failure — no silent fallback to local file
- The issue state is set to `in_progress` — we are about to fix it
- NEVER set state to 'Done' — that requires validation metier to pass

## SEQUENCE

### 1. Load report template

Read `../templates/diagnosis-report-template.md`.

### 2. Decide: create or link

**If `EXISTING_ISSUE_ID` was found in step 1:**

Ask user:
> I found existing issue {EXISTING_ISSUE_ID}. Options:
> **[L]** Link — add diagnosis as a comment on the existing issue
> **[N]** New — create a fresh bug issue

WAIT for user choice.

- **IF L:** add a comment with the diagnosis to the existing issue, set `ISSUE_ID = EXISTING_ISSUE_ID`
- **IF N:** proceed to create new issue (step 3)

**If no existing issue:** proceed to create new issue.

### 3. Compose issue description

Fill the diagnosis report template with all accumulated data:
- Root cause, causal chain, evidence trail from step 4
- Acceptance criteria (BAC + TAC) from step 4
- Fix plan with tasks from step 4
- Validation metier items from step 4

**CRITICAL ordering:** Definition of Done (product) is the FIRST section. Technical context goes inside a `<details>` block.

### 4. Create the issue

Create the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create issue
- Title: fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}
- Team: {TRACKER_TEAM}
- Description: {composed_description}
- Priority: 2
- Labels: Bug
- Status: {TRACKER_STATES.in_progress}

Store `ISSUE_ID` and `ISSUE_IDENTIFIER`.

**If creation fails:** HALT — report error.

### 5. Auto-proceed

Issue created. Proceed to implementation.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Create Tracker Issue
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-06-fix.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
