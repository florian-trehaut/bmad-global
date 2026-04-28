---
nextStepFile: './step-06-verify.md'
---

# Step 5: Review and Write


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
CHK-STEP-05-ENTRY PASSED — entering Step 5: Review and Write with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Present each generated knowledge file draft to the user for Accept/Edit/Reject, then write approved files to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`. If migration mode (old 10-file layout detected), also present the diff against legacy files and handle deletion of legacy files post-write.

## MANDATORY SEQUENCE

### 1. Present Drafts for Review

Present ONE file at a time, in this order:

1. `project.md` (consolidated config — tech stack, conventions, infra, tooling, validation, review, investigation, tracker, comm)
2. `domain.md` (ubiquitous language, bounded contexts)
3. `api.md` (endpoints, schemas, integrations)

For each file, present the COMPLETE content (frontmatter + body), then:

> **[A]** Accept — write as-is
> **[E]** Edit — modify specific sections
> **[R]** Reject — skip this file (log reason)

**Menu handling:**

- **A**: Mark as APPROVED
- **E**: Ask user what to edit. Apply corrections. Re-present for confirmation. Loop until accepted.
- **R**: Mark as REJECTED. Ask for brief reason. Log reason.

### 2. Migration Mode — Present Diff (if OLD_LAYOUT_DETECTED)

If `OLD_LAYOUT_DETECTED=true` (set by step-01-preflight), present a clear summary of the migration BEFORE writing:

```
Migration: 10-file layout → 3-file layout

Old files (will be backed up + deleted after successful write):
  .claude/workflow-knowledge/stack.md           ({N} lines)
  .claude/workflow-knowledge/conventions.md     ({N} lines)
  .claude/workflow-knowledge/infrastructure.md  ({N} lines)
  .claude/workflow-knowledge/environment-config.md  ({N} lines)
  .claude/workflow-knowledge/validation.md      ({N} lines)
  .claude/workflow-knowledge/review-perspectives.md ({N} lines)
  .claude/workflow-knowledge/investigation-checklist.md ({N} lines)
  .claude/workflow-knowledge/tracker.md         ({N} lines)
  .claude/workflow-knowledge/comm-platform.md   ({N} lines)
  .claude/workflow-knowledge/domain-glossary.md ({N} lines)
  .claude/workflow-knowledge/api-surface.md     ({N} lines)

New files (will be written):
  .claude/workflow-knowledge/project.md   ({N} lines)
  .claude/workflow-knowledge/domain.md    ({N} lines)
  .claude/workflow-knowledge/api.md       ({N} lines)

Backup location: .claude/workflow-knowledge.backup-{YYYY-MM-DD-HHMM}/
```

HALT — confirm migration: "[M] Migrate (backup + replace) / [C] Cancel migration / [Q] Quit"

### 3. Present Summary Before Writing

After all files reviewed:

```
Knowledge files:
  APPROVED: {N} of 3 — {list}
  REJECTED: {N} of 3 — {list with reasons}

Migration: {YES (will backup + delete 10 legacy) / NO}

Ready to write {N} files to {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/
```

HALT — wait for confirmation to write.

### 4. Migration Backup (if migration confirmed)

If migration mode and user confirmed [M]:

```bash
BACKUP_DIR="{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge.backup-$(date +%Y-%m-%d-%H%M)"
mkdir -p "$BACKUP_DIR"
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/conventions.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/infrastructure.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/environment-config.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/validation.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/investigation-checklist.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/tracker.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/comm-platform.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain-glossary.md "$BACKUP_DIR/" 2>/dev/null
mv {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api-surface.md "$BACKUP_DIR/" 2>/dev/null
echo "Backup: $BACKUP_DIR"
```

Log: "Backed up {N} legacy files to $BACKUP_DIR"

### 5. Write Approved Files

```bash
mkdir -p {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge
```

For each APPROVED file:
- Write to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename}` (frontmatter + body)
- Log: "Written: {filename} ({N} lines, sources_used: {list}, content_hash: {hash})"

### 6. Present Write Summary

```
Knowledge Bootstrap — Files Written

Written:
- {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md ({N} lines, sources={list})
- {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md  ({N} lines, sources={list})
- {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md     ({N} lines, sources={list})

Rejected (not written):
- {filename}: {reason}

Migration:
- Backup: {backup_path or "n/a"}
- Legacy files deleted: {count or "0"}

Total knowledge files: {count in {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/}
```

### 7. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Every draft presented individually for review
- User explicitly approved each file
- Only APPROVED files written
- Migration handled with backup if applicable
- Write confirmation with sources_used and content_hash logged

### FAILURE:

- Batch-approving without per-file review
- Writing REJECTED files
- Deleting legacy files without backup
- Migrating without explicit user confirmation

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Review and Write
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
