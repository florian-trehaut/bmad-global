# Step 1: Initialize and Inventory

## STEP GOAL

Load project context, inventory existing knowledge files, detect staleness, and let the user choose what to generate.

## RULES

- Do NOT generate or modify any knowledge files in this step
- Present ALL knowledge file types — not just missing ones
- Staleness is determined by frontmatter `generated` date (> 7 days = stale) or missing `source_hash`

## SEQUENCE

### 1. Load Project Context

Read `.claude/workflow-context.md` from the project root.

**HALT if not found:** "No `.claude/workflow-context.md` found. Run `bmad-init` first to configure the project."

Extract `{PROJECT_NAME}` and `{COMMUNICATION_LANGUAGE}`.

### 2. Inventory Existing Knowledge Files

List all files in `.claude/workflow-knowledge/`:

```bash
ls -la .claude/workflow-knowledge/*.md 2>/dev/null
```

### 3. Check Each Knowledge Type

For each of the 9 knowledge file types, determine status:

| Knowledge File | Template | Status |
|---------------|----------|--------|
| `stack.md` | `stack-template.md` | {FOUND_FRESH / FOUND_STALE / MISSING} |
| `infrastructure.md` | `infrastructure-template.md` | {status} |
| `review-perspectives.md` | `review-perspectives-template.md` | {status} |
| `tracker.md` | `tracker-template.md` | {status} |
| `environment-config.md` | `environment-config-template.md` | {status} |
| `investigation-checklist.md` | `investigation-checklist-template.md` | {status} |
| `conventions.md` | `conventions-template.md` | {status} |
| `domain-glossary.md` | `domain-glossary-template.md` | {status} |
| `api-surface.md` | `api-surface-template.md` | {status} |

**Status logic:**
- File missing → `MISSING`
- File exists, no `generated` frontmatter → `FOUND_STALE` (legacy, no tracking)
- File exists, `generated` date > 7 days ago → `FOUND_STALE`
- File exists, `generated` date ≤ 7 days → `FOUND_FRESH`

### 4. CHECKPOINT — Present Inventory

```
## Knowledge File Inventory — {PROJECT_NAME}

| File | Status | Last Generated |
|------|--------|---------------|
| stack.md | FOUND_FRESH | 2026-03-20 |
| infrastructure.md | MISSING | — |
| ... | ... | ... |

Summary: {N} found fresh, {N} found stale, {N} missing
```

Present choices:
- **[A] Generate all** — regenerate missing + stale, skip fresh
- **[F] Force all** — regenerate everything including fresh
- **[S] Select** — choose which files to generate
- **[N] Skip** — exit workflow

WAIT for user selection.

If **[S]**: present numbered list, let user pick by number. Store selection as `SELECTED_FILES`.

If **[N]**: exit workflow.

Store the list of files to generate as `TARGET_FILES`.

---

**Next:** Read fully and follow `./step-02-detect.md`
