# Step 3: Review and Apply

## STEP GOAL

Present each updated draft to the user as a diff against the current file. Get per-file approval. Write approved files with fresh staleness-tracking frontmatter. Summarize changes.

---

## SEQUENCE

### 1. Present Diffs for Review

Present ONE file at a time, in dependency order (Tier 0 before Tier 1).

For each file in TARGET_FILES:

#### a. Show the Diff

Present a structured diff view highlighting what changed:

```
## {filename} — Refresh Diff

Source hash: {old_hash} → {new_hash}
Sections updated:  {N}
Sections preserved: {N}

### Changes:

**{section heading}** — {what changed}
  Before: {relevant excerpt or summary}
  After:  {updated content or summary}

**{section heading}** — {what changed}
  ...

### Preserved (no changes):
  - {section heading 1}
  - {section heading 2}
  - ...
```

For large sections, show the key differences rather than the full before/after text. The goal is a clear, scannable summary — not a raw line-level diff.

#### b. Get User Decision

> **[A]** Accept — write updated file
> **[E]** Edit — modify specific sections before writing
> **[K]** Keep current — skip this file, keep existing version unchanged

HALT — wait for user selection.

**Menu handling:**
- **A**: Mark as APPROVED. Proceed to next file.
- **E**: Ask what to edit. Apply corrections to the draft. Re-present the diff for the modified sections. Loop until user selects [A] or [K].
- **K**: Mark as KEPT. File remains unchanged. Proceed to next file.

### 2. Handle workflow-context.md (if in TARGET_FILES)

Present as a field-level diff:

```
## workflow-context.md — Proposed Updates

| Field | Current Value | Proposed Value | Reason |
|-------|---------------|----------------|--------|
| {field} | {old} | {new} | {why} |
| ... | ... | ... | ... |

[A] Accept all / [S] Select fields / [K] Keep current
```

HALT — wait for user selection.

**Menu handling:**
- **A**: Apply all proposed field changes. Mark as APPROVED.
- **S**: Present each field individually. For each: [A] Accept / [K] Keep. Store per-field decisions.
- **K**: No changes to workflow-context.md.

### 3. Present Summary Before Writing

After all files reviewed:

```
Knowledge Refresh — Write Summary
===================================

APPROVED: {N}
  - {filename}
  - ...

KEPT (unchanged): {N}
  - {filename}
  - ...

Ready to write {N} files to {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/
```

HALT — wait for confirmation to write.

### 4. Write Approved Files

For each APPROVED knowledge file:
- Write to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename}` (complete file: frontmatter + body)
- Log: `Updated: {filename} ({N} lines, hash: {old_hash} → {new_hash})`

For workflow-context.md (if APPROVED):
- Read the current file
- Apply only the approved field changes to the YAML frontmatter
- Preserve all other content unchanged
- Write back to `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`
- Log: `Updated: workflow-context.md ({N} fields changed)`

### 5. Present Final Summary

```
Knowledge Refresh Complete
===========================

Updated:
  - {filename} ({N} lines, hash: {old_hash} → {new_hash})
  - ...

Kept (unchanged):
  - {filename}
  - ...

Next refresh: files will show as fresh until source files change or 7 days pass.
```

### 6. Suggest Next Actions

- If workflow-context.md was updated: "All bmad-* workflows will pick up the new configuration."
- If some files were KEPT despite hash mismatches: "Note: {N} files still have stale hashes. Run `/bmad-knowledge-refresh` again after addressing them."
- If refreshed files are consumed by specific workflows: "Updated knowledge will be used by: {list relevant workflows from the Knowledge Files table in workflow-context.md}."

---

## END OF WORKFLOW

The bmad-knowledge-refresh workflow is complete.
