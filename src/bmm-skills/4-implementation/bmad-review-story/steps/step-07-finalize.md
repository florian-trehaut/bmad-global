# Step 7: Finalize


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
CHK-STEP-07-ENTRY PASSED — entering Step 7: Finalize with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Apply accepted modifications to the tracker issue description, add the spec-reviewed label, cleanup the investigation worktree.

## RULES

- NEVER modify the story without explicit user confirmation (obtained in Steps 6 and 6b)
- Preserve the original story structure — insert modifications in-place, do not restructure
- The review summary section is appended at the end, not inserted in the middle
- Wait for final user confirmation before pushing to the tracker

## SEQUENCE

### 1. Prepare the updated story description

Take the current story description from the tracker (stored in `ISSUE_DESCRIPTION`).

Apply all ACCEPTED and MODIFIED modifications from Steps 6 and 6b:
- Modified ACs
- Added edge cases
- Corrected assumptions
- Added missing information
- Updated technical details
- Updated DoD, BACs, and Validation Metier sections

### 2. Add a review summary section

Append at the end of the story description:

```markdown
---

## Spec Review ({date})

**Reviewed by:** {USER_NAME}
**Findings:** {total_count} ({blockers} BLOCKERs, {majors} MAJORs, {minors} MINORs, {infos} INFOs)
**Accepted:** {accepted_count} | **Rejected:** {rejected_count} | **Skipped:** {skipped_count}

<details>
<summary>Review details</summary>

{For each accepted finding: brief description of what was changed and why}

</details>
```

### 3. Implementation-readiness gate

Before presenting to the user, verify the ENTIRE updated story (original + all review modifications) against this checklist. This is not optional — every item must pass.

**Actionable — no open questions:**
- [ ] Every task has a specific file path and a concrete action (not "investigate" or "decide")
- [ ] No "TBD", "à déterminer", "à voir", "ou" offering a choice, "vérifier si" deferring a decision
- [ ] Every finding that was ACCEPTED has been translated into a concrete task modification, BAC, TAC, or VM — not just mentioned in the review summary
- [ ] No question marks in tasks, ACs, or VM items

**Logical — dependency order:**
- [ ] Tasks are ordered so that dependencies come first (entity changes before use-case changes, migrations before code that uses new tables)
- [ ] No circular references between tasks

**Testable — Given/When/Then:**
- [ ] All BACs follow Given/When/Then with observable outcomes
- [ ] All TACs follow Given/When/Then with verifiable outcomes
- [ ] Every TAC traces to at least one BAC
- [ ] Every BAC is covered by at least one VM item

**Complete — no placeholders:**
- [ ] All investigation results are inlined in the story — a fresh dev agent can implement without needing to re-investigate
- [ ] SFTP patterns, API responses, DB states, file formats — all documented with real examples from the investigation
- [ ] No references to "see investigation" or "as discovered" without the actual data

**Self-contained:**
- [ ] A dev who reads only this story description has everything needed to implement — no tribal knowledge required
- [ ] Technical context section has all relevant files, patterns, and decisions

**Validation Metier — executable by a human in production:**
- [ ] Every VM item describes a concrete action + expected observable result
- [ ] No VM items like "check logs", "verify in DB", "look at the code"
- [ ] VM items cover both feature validation and non-regression

**Story points estimate:**
- [ ] The issue has a story point estimate set in the tracker (Fibonacci: 1, 2, 3, 5, 8, 13)
- [ ] If missing: estimate autonomously based on scope, uncertainty, and risk, then update the tracker issue estimate field. Do NOT ask the user.

**If any item fails:** fix it in the story description BEFORE presenting to the user. Do NOT present a story that fails this gate — the purpose of the review is to produce an implementation-ready story, not a partially-improved one.

### 4. Present to user

Present the complete updated description.
Highlight the changes (what was added/modified).
Report the implementation-readiness gate result (all items should pass at this point).

Ask: "Here is the updated story. Push the modifications to the tracker?"

WAIT for explicit user confirmation.

### 5. Push to tracker (if confirmed)

Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Description: {updated_description}

### 6. Add spec-reviewed label

Check if the label `{LABELS.spec_reviewed}` exists in the team.

If the label does not exist, create it via the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create label
- Team: {TRACKER_TEAM_ID}
- Name: {LABELS.spec_reviewed}
- Color: #10B981

Add the label to the issue.

### 7. Worktree retention

**NEVER auto-remove the investigation worktree.** The user may continue investigating after the review is "complete" (new alerts, follow-up questions, deeper analysis). The worktree is cheap to keep and expensive to recreate.

Ask: "Want me to remove the worktree `{WORKTREE_PATH}`?" — WAIT for explicit confirmation. If the user says nothing or moves on, **keep the worktree**.

### 8. Update intermediate file

Update the intermediate file frontmatter: `status: COMPLETE`
Append the final summary.

### 9. Handle decline

If the user declines in step 4:

- Keep worktree and intermediate file for future reference
- Update intermediate file: `status: PAUSED`
- "Story not modified. The worktree and report are kept for reference."

### 10. Completion

"Review complete."

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Finalize
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-review-story executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '06b', '07']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '06b', '07'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
