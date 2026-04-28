# Step 6: Persist Daily Log


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
CHK-STEP-07-ENTRY PASSED — entering Step 6: Persist Daily Log with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Save today's planning data to a local daily-log file for velocity tracking. This file will be read by future executions of this workflow to calculate velocity and update completion data.

## RULES

- Create `{MAIN_PROJECT_ROOT}/.claude/daily-log/` at the project root if it does not exist
- File name is `{TODAY}.md` (ISO date format)
- If a file for today already exists (workflow run twice in one day), overwrite it with the latest plan
- The file format must match `../data/daily-log-format.md` exactly
- `completed_issues` and `velocity_actual` are left empty — they will be populated by tomorrow's step-01

## SEQUENCE

### 1. Ensure directory exists

Check if `{MAIN_PROJECT_ROOT}/.claude/daily-log/` exists at the project root. If not, create it.

### 2. Build the daily-log content

Using the format from `../data/daily-log-format.md`:

```yaml
---
date: "{TODAY}"
budget_points: {TODAY_BUDGET}
planned_issues:
{for each issue in TODAY_ISSUES:}
  - id: "{issue.id}"
    title: "{issue.title}"
    points: {issue.points or null}
    status_at_plan: "{issue.status}"
{end for}
completed_issues: []
velocity_actual: null
velocity_planned: {TODAY_BUDGET}
notes: ""
---
```

### 3. Write the file

Write to `{MAIN_PROJECT_ROOT}/.claude/daily-log/{TODAY}.md` at the project root.

### 4. Confirm persistence

```
Daily log saved: {MAIN_PROJECT_ROOT}/.claude/daily-log/{TODAY}.md
  Planned: {count} issues, {total_points} pts budget
  Velocity tracking: {HISTORY_DAYS + 1} days logged
```

### 5. Add to .gitignore (first run only)

If this is the first daily-log file (directory was just created), check if `{MAIN_PROJECT_ROOT}/.claude/daily-log/` is in `.gitignore`. If not, suggest adding it:

"Consider adding `{MAIN_PROJECT_ROOT}/.claude/daily-log/` to `.gitignore` — these are personal planning files, not project artifacts."

---

## END OF WORKFLOW

The bmad-daily-planning workflow is complete.

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 6: Persist Daily Log
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-daily-planning executed end-to-end:
  steps_executed: ['01', '01b', '02', '03', '04', '05', '06', '07']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '01b', '02', '03', '04', '05', '06', '07'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
