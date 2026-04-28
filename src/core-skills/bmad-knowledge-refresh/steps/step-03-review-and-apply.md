# Step 3: Review, Resolve Drift, and Apply


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Review, Resolve Drift, and Apply with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Resolve drift items first (BLOCK on user decision), then present each updated draft as a diff for per-file approval, then write approved files with fresh frontmatter (sources_used, source_hash per source, content_hash). Summarize changes.

If `DRIFT_AXIS1` or `DRIFT_AXIS2` was detected in step-01, those files are deferred here and handled BEFORE generation/write.

---

## SEQUENCE

### 1. Resolve Drift Axe 1 (code vs spec) — IF ANY

For each entry in `DRIFT_AXIS1` (passed from step-01):

```
⚠️  Drift detected: code diverges from spec

  spec: {spec_path}
    "{declared_value}" ({declared_location})

  code: {code_observation_summary}
    {observed_value}

  affected knowledge: {target}

What would you like to do?
  [U] Update spec to reflect code reality (suggest /bmad-create-adr for traceability)
  [F] Fix code to match spec (refresh paused, run /bmad-quick-dev or /bmad-dev-story)
  [I] Ignore — drift logged, refresh continues without regenerating affected files
  [Q] Quit refresh
```

HALT — wait for user selection.

**Menu handling:**
- **[U]**: Inform user: "Edit `{spec_path}` to update the declared value. Then strongly recommended: run `/bmad-create-adr` to document why the change happened (e.g., 'ADR-N: Migrated from {declared_value} to {observed_value} — reason: ...'). After spec + ADR updates, re-run `/bmad-knowledge-refresh`."
  Mark this drift item as `RESOLVED_USER_WILL_UPDATE_SPEC`. The affected file is NOT regenerated in this run — user must re-run after their changes.
- **[F]**: Inform user: "Run `/bmad-quick-dev` or `/bmad-dev-story` to align the code with the spec. After code changes, re-run `/bmad-knowledge-refresh`."
  Mark as `RESOLVED_USER_WILL_FIX_CODE`. The affected file is NOT regenerated in this run.
- **[I]**: Mark as `IGNORED`. Drift remains in place. Affected file is NOT regenerated (avoid baking the drift state into the knowledge file frontmatter). Add to refresh report for future visibility.
- **[Q]**: END OF WORKFLOW. No files written.

After all DRIFT_AXIS1 items resolved, drift-affected files are excluded from the regeneration set. They are listed in the final summary.

### 2. Resolve Drift Axe 2 (manual edit + source change) — IF ANY

For each entry in `DRIFT_AXIS2` (passed from step-01):

```
⚠️  Manual edits detected on knowledge file

  file: .claude/workflow-knowledge/{filename}
  content_hash mismatch: stored={stored_hash}, current={current_hash}

  Sources have also changed since last generation:
{list of changed sources}

  Manual edit summary:
{summary of likely manual additions — diff against generated baseline}

What would you like to do?
  [M] Merge — re-generate from sources, then re-apply your manual edits as 3-way diff
  [O] Overwrite — discard manual edits, re-generate from sources (auto-backup created)
  [K] Keep — keep manual edits as-is, skip refresh for this file (set manual_override: true to skip future refreshes)
  [Q] Quit
```

HALT — wait for user selection.

**Menu handling:**
- **[M]**:
  1. Generate the new draft from sources (run step-02 logic for this file)
  2. Compute 3-way diff: `current_file` (with manual edits) vs `last_generated_baseline` (reconstruct from old source_hash if possible) vs `new_generated`
  3. Present sections with conflicts to user, ask for resolution per section
  4. Build merged content
  5. Update `content_hash` to reflect the merged body
  6. Mark as APPROVED for write
- **[O]**:
  1. Backup current file: `cp {filename} {filename}.manual-backup-{timestamp}` in `.claude/workflow-knowledge.backup-{date}/`
  2. Generate new draft from sources (run step-02 logic for this file)
  3. Mark as APPROVED for write — overwrites manual edits
  4. Inform user: "Backup created at {backup_path}. Manual edits preserved in backup, knowledge file regenerated from sources."
- **[K]**:
  1. Read current frontmatter, set `manual_override: true`
  2. Update `content_hash` to current content (resync, prevents future false drift)
  3. Write only the frontmatter change (preserve body)
  4. Mark as KEPT_MANUAL. This file will be SKIPPED in all future `/bmad-knowledge-refresh` runs until user manually resets `manual_override: false`.
- **[Q]**: END OF WORKFLOW.

### 3. Present Diffs for Generation Targets (non-drift files)

For each file in `GENERATION_TARGETS` (excluding drift items already resolved above):

#### a. Show the Diff

```
## {filename} — Refresh Diff

sources_used: {old_list} → {new_list}
source_hash:
  prd: {old} → {new}
  architecture: {old} → {new}
  adrs: {old} → {new}
  specs: {old} → {new}
  code: {old} → {new}
content_hash: {old} → {new}

Sections updated:  {N}
Sections preserved: {N}

### Changes:

**{section heading}** — {what changed} (source: {prd/architecture/adrs/specs/code})
  Before: {excerpt or summary}
  After:  {updated content or summary}

...

### Preserved (no changes):
  - {section heading 1}
  - {section heading 2}
```

For large sections, show key differences. Goal: clear, scannable summary, not a raw line-level diff.

#### b. Get User Decision

> **[A]** Accept — write updated file
> **[E]** Edit — modify specific sections before writing
> **[K]** Keep current — skip this file, keep existing version unchanged

HALT — wait for user selection.

**Menu handling:**
- **A**: Mark as APPROVED. Proceed.
- **E**: Ask what to edit. Apply corrections. Re-present diff for modified sections. Loop until [A] or [K].
- **K**: Mark as KEPT_UNCHANGED. Proceed.

### 4. Handle workflow-context.md (if in TARGET_FILES)

Present as field-level diff:

```
## workflow-context.md — Proposed Updates

| Field | Current Value | Proposed Value | Reason |
|-------|---------------|----------------|--------|
| {field} | {old} | {new} | {why} |
...

[A] Accept all / [S] Select fields / [K] Keep current
```

HALT — wait for user selection.

**Menu handling:**
- **A**: Apply all proposed changes. Mark APPROVED.
- **S**: Per-field [A] / [K]. Store decisions.
- **K**: No changes.

### 5. Present Summary Before Writing

```
Knowledge Refresh — Write Summary
==================================

Drift resolution:
  DRIFT_AXIS1: {N items} — {resolved_will_update_spec / will_fix_code / ignored}
  DRIFT_AXIS2: {N files} — {merged / overwritten / kept_manual}

APPROVED for write: {N}
  - {filename}

KEPT (unchanged): {N}
  - {filename}

KEPT_MANUAL (manual_override set): {N}
  - {filename}

Ready to write {N} files to {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/
```

HALT — wait for confirmation.

### 6. Write Files

For each APPROVED knowledge file:
- Write `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename}` (complete: frontmatter + body)
- Log: `Updated: {filename} ({N} lines, sources={list}, content_hash: {old} → {new})`

For each KEPT_MANUAL file:
- Update only frontmatter (`manual_override: true`, `content_hash` synced)
- Preserve body unchanged
- Log: `Marked manual_override: {filename} (will skip future refreshes)`

For workflow-context.md (if APPROVED):
- Read current file, apply approved field changes to YAML frontmatter, preserve other content
- Write back to `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`
- Log: `Updated: workflow-context.md ({N} fields changed)`

### 7. Present Final Summary

```
Knowledge Refresh Complete
===========================

Updated:
  - {filename} (sources={list}, content_hash: {old} → {new})

Kept unchanged:
  - {filename}

Kept manual (excluded from future refreshes):
  - {filename}

Drift resolution actions for user:
  - {filename}: User to update {spec_path} OR run /bmad-create-adr
  - {filename}: User to run /bmad-quick-dev to align code

Next refresh: files will show as fresh until source files change or 30 days pass.
```

### 8. Suggest Next Actions

- If workflow-context.md was updated: "All bmad-* workflows will pick up the new configuration."
- If DRIFT_AXIS1 was resolved with [U]: "After updating the spec, run `/bmad-create-adr` to document the decision, then re-run `/bmad-knowledge-refresh`."
- If DRIFT_AXIS1 was resolved with [F]: "Run `/bmad-quick-dev` to align code, then re-run `/bmad-knowledge-refresh`."
- If some files were marked manual_override: "These files are excluded from future refreshes. To reset, edit frontmatter manually and set `manual_override: false`."

---

## END OF WORKFLOW

The bmad-knowledge-refresh workflow is complete.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Review, Resolve Drift, and Apply
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-knowledge-refresh executed end-to-end:
  steps_executed: ['01', '02', '03']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
