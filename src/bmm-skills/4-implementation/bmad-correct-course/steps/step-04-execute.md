# Step 4: Execute Approved Changes


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Execute Approved Changes with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Apply all approved corrective actions in the issue tracker: create new issues, update modified issues, cancel removed issues, and add traceability comments. Present a final summary with next steps based on scope classification.

## RULES

- Only execute changes that were explicitly approved in step 3
- Add a traceability comment on every modified or canceled issue explaining the course correction
- For new issues, assign them to the correct project and set appropriate status
- If any tracker operation fails, report the error and continue with remaining operations
- Do NOT modify document content directly — document updates are noted for manual action

## SEQUENCE

### 1. Confirm execution

Ask {USER_NAME}:

> Ready to apply the approved changes to the tracker? This will create, modify, and cancel issues as specified in the plan.
>
> 1. **Execute** — apply all changes now
> 2. **Reference only** — keep the plan as documentation, do not modify the tracker

WAIT for user choice.

If **reference only**: skip to section 5 (final report) with a note that no tracker changes were made.

### 2. Create new issues

For each approved new story, create the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create issue
- Title: {title}
- Description: {description} with Acceptance Criteria section
- Team: {TRACKER_TEAM_ID}
- Project: {target_project_id}

Record each created issue identifier.

### 3. Update modified issues

For each approved modification, update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: {issue_id}
- Description: {updated_description}

Add a traceability comment on each modified issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: {issue_id}
- Body: Course correction: {change_reason} — Related change: {CHANGE_DESCRIPTION_SUMMARY}

### 4. Cancel issues

For each approved cancellation, update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: {issue_id}
- Status: {TRACKER_STATES.canceled}

Add a traceability comment (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: {issue_id}
- Body: Canceled via course correction: {cancellation_reason} — Related change: {CHANGE_DESCRIPTION_SUMMARY}

### 5. Final report

Present the completion summary to {USER_NAME}:

```
## Course Correction Complete

- **Scope:** {SCOPE_CLASSIFICATION}
- **Issues created:** {count} ({list identifiers})
- **Issues modified:** {count} ({list identifiers})
- **Issues canceled:** {count} ({list identifiers})
- **Document updates noted:** {count}

### Next Steps

{based on SCOPE_CLASSIFICATION:}

**Minor:** Continue development with the updated backlog.

**Moderate:** Review the reorganized backlog in the tracker. Consider running sprint status to reassess capacity.

**Major:** Schedule a replanning session. Review PRD and Architecture documents before resuming development.
```

---

## END OF WORKFLOW

The bmad-correct-course workflow is complete.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Execute Approved Changes
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-correct-course executed end-to-end:
  steps_executed: ['01', '02', '03', '04']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
