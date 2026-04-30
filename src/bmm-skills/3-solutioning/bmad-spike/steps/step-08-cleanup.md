---
---

# Step 8: Cleanup & Summary


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-08-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-08-ENTRY PASSED — entering Step 8: Cleanup & Summary with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Clean up the worktree, let the user choose whether to keep the PoC branch for reference, delete the WIP file, and present a complete summary with traceability links.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- This is the wrap-up — be concise and provide clear next steps
- The summary should give the user everything they need to act on the spike results

### Step-Specific Rules:

- Worktree removal is non-critical — warn but do not HALT on failure
- Branch preservation is the user's choice (default: keep)
- WIP file must be deleted
- Summary must include full traceability chain

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- This is the final step

---

## MANDATORY SEQUENCE

### 1. Branch Decision

Ask the user about the PoC branch:

> The spike branch `spike/{slug}` contains the PoC code from this investigation.
>
> **[K]** Keep the branch (default) — serves as reference during implementation
> **[D]** Delete the branch — deliverable documentation is sufficient

WAIT for input. Default to **K** if user just presses enter or says "keep".

### 2. Remove Worktree

**Apply §3 Cleanup from `bmad-shared/lifecycle/worktree-lifecycle.md`.**

<check if="REUSED_CURRENT_WORKTREE == true">
  The workflow reused the user's current worktree. Do NOT remove it — log "Worktree reused — cleanup skipped (user's worktree)." and skip branch deletion below (the user owns the branch lifecycle).
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == true">

```bash
cd {MAIN_PROJECT_ROOT}
git worktree remove {SPIKE_WORKTREE_PATH} --force
git worktree prune
```

  **If removal fails:** Warn but do NOT HALT. The worktree can be cleaned up manually.
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == false">
  No worktree to remove — skip this step.
</check>

### 3. Handle Branch

**If K (keep):**

Log: "Branch `spike/{slug}` preserved for reference."

**If D (delete):**

```bash
git branch -D spike/{slug} 2>/dev/null || true
```

Log: "Branch `spike/{slug}` deleted. PoC findings are documented in the deliverable."

### 4. Delete WIP File

Delete `{wip_file}`.

### 5. Present Summary

```markdown
## Spike Complete

### Investigation
- **Question:** {spike_question}
- **Type:** {spike_type}
- **Timebox:** {sessions_used} / {sessions_planned} sessions
- **Verdict:** {GO / NO-GO / GO WITH CAVEATS}

### Answer
{recommendation_summary — 2-3 sentences}

### Deliverable
- **Document:** Spike: {title} (tracker Document)
- **Spike Issue:** {SPIKE_ISSUE_IDENTIFIER} — Done

### Stories Created
{for each: - **{ISSUE_IDENTIFIER}** — {title} (Backlog)}

{if none: No stories created.}

### PoC Branch
{if kept: Branch `spike/{slug}` available for reference}
{if deleted: Branch deleted — see deliverable for documented results}

### What Happens Next

The informed stories are in the backlog:
1. **Prioritize** — schedule stories for an upcoming sprint
2. **Specify** — use `create-story` to write full implementation specs for each story
3. **Implement** — use `dev-story` for TDD implementation

The spike deliverable document is available in the tracker for reference
during specification and implementation.
```

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- User chose branch disposition (keep/delete)
- Worktree removed (or warned)
- WIP file deleted
- Summary presented with full traceability (question, verdict, document, issue, stories, branch)
- Clear next steps provided

### FAILURE:

- Not asking about branch disposition
- Not deleting WIP file
- Summary missing traceability links
- Not presenting next steps

---

## STEP EXIT (CHK-STEP-08-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Cleanup & Summary
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-spike executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '07', '08']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '07', '08'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
