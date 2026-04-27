---
nextStepFile: './step-07-generate-claude-local.md'
---

# Step 6: Verify and Legacy Migration

## STEP GOAL:

Validate all 3 generated knowledge files exist with proper frontmatter, count TODOs, assess workflow readiness, suggest next steps. If legacy `.claude/workflows/` exists, execute migration to global skills.

## MANDATORY SEQUENCE

### 1. Verify Files Exist (3-file consolidated layout)

```bash
for file in \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-context.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md"; do
  if [ -s "$file" ]; then
    lines=$(wc -l < "$file")
    echo "OK  $file ($lines lines)"
  elif [ -f "$file" ]; then
    echo "EMPTY  $file"
  else
    echo "MISSING  $file"
  fi
done
```

**Frontmatter sanity check** for each `workflow-knowledge/*.md`:
- `generator: bmad-knowledge-bootstrap`
- `sources_used: [...]` non-empty
- `source_hash: { ... }` matches sources_used
- `content_hash: ...` non-empty (8 chars)
- `schema_version: 2`

### 1b. Verify Legacy 10-File Layout is Cleaned (post-migration)

If migration was performed in step-05, verify the 10 legacy files are no longer in `.claude/workflow-knowledge/`:

```bash
for legacy in stack.md conventions.md infrastructure.md environment-config.md validation.md review-perspectives.md investigation-checklist.md tracker.md comm-platform.md domain-glossary.md api-surface.md; do
  if [ -f "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/$legacy" ]; then
    echo "WARN: legacy file still present: $legacy"
  fi
done

# Confirm backup exists
ls -d {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge.backup-* 2>/dev/null && echo "Backup OK" || echo "WARN: no backup found"
```

### 2. Verify Required Keys in workflow-context.md

Check YAML frontmatter for required keys:

| Key | Required |
|-----|----------|
| `project_name` | YES |
| `issue_prefix` | YES |
| `tracker` | YES |
| `forge` | YES |
| `forge_project_path` | YES |
| `forge_cli` | YES |
| `package_manager` | YES |
| `install_command` | YES |
| `test_command` | YES |
| `quality_gate` | YES |
| `communication_language` | YES |
| `user_name` | YES |
| `tracker_states` | YES |
| `worktree_prefix` | YES |
| `branch_template` | YES |

### 3. Count TODOs

```bash
grep -rn "TODO" {MAIN_PROJECT_ROOT}/.claude/workflow-context.md {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/*.md 2>/dev/null
```

### 4. Assess Workflow Readiness

| Skill | Status | Requirements |
|-------|--------|-------------|
| `bmad-create-story` | {READY/NOT} | tracker + tracker_states.todo (workflow-context.md) |
| `bmad-dev-story` | {READY/NOT} | tracker + forge + forge_cli + states (todo, in_progress, in_review) |
| `bmad-code-review` | {READY/NOT} | forge + forge_cli |
| `bmad-review-story` | {READY/NOT} | tracker + tracker_states.todo |
| `bmad-validation-metier` | {READY/NOT} | project.md§"Environments" has actual URLs (no TODOs) |
| `bmad-validation-frontend` | {READY/NOT} | project.md§"Validation Tooling" has E2E or component framework detected |

### 5. Present Summary

```
============================================================
  Knowledge Bootstrap Complete — {project_name}
============================================================

Files:
  workflow-context.md              {OK/ISSUES}
  workflow-knowledge/project.md    {OK/EMPTY/MISSING}
  workflow-knowledge/domain.md     {OK/EMPTY/MISSING}
  workflow-knowledge/api.md        {OK/EMPTY/MISSING}

Sources used: {list — e.g., [planning, specs, code]}

TODOs remaining:    {count}

Migration:
  Old 10-file layout migrated:  {YES (backup at ...) / NO / N/A}

Workflow readiness:
  bmad-create-story:        {READY / NOT READY}
  bmad-dev-story:           {READY / NOT READY}
  bmad-code-review:         {READY / NOT READY}
  bmad-review-story:        {READY / NOT READY}
  bmad-validation-metier:   {READY / NOT READY}
  bmad-validation-frontend: {READY / NOT READY}
============================================================
```

### 6. Legacy Workflows Migration (CONDITIONAL)

**Run only if `LEGACY_WORKFLOWS_PRESENT=true` (set by step-01-preflight when `.claude/workflows/` directory contains files).**

#### 6a. Build Coverage Map

Inventory all legacy workflows in `{MAIN_PROJECT_ROOT}/.claude/workflows/`. Inventory all global bmad-* skills in `~/.claude/skills/`. Build mapping table:

```
Legacy workflow              | Global skill           | Status
-----------------------------|------------------------|--------
{name}                       | bmad-{name}            | MIGRATED
{name}                       | (none)                 | NOT_MIGRATED
```

HALT — present to user before proceeding.

#### 6b. Analyze NOT_MIGRATED Workflows

For each NOT_MIGRATED workflow:
1. Read the legacy instructions.md
2. Check for upstream `_bmad/` equivalent
3. If both exist: diff for legacy-only content vs upstream-only content
4. Classify:
   - **UPSTREAM_SUFFICIENT**: Upstream covers everything
   - **LEGACY_HAS_VALUE**: Project-specific additions worth preserving
   - **MERGE_NEEDED**: Both have unique value
   - **NO_UPSTREAM**: No equivalent exists

#### 6c. Present Migration Plan

Group by verdict. HALT — wait for user approval.

#### 6d. Execute Migrations

- **UPSTREAM_SUFFICIENT**: Mark legacy as safe to delete
- **LEGACY_HAS_VALUE**: Extract additions to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` or project-local skills
- **MERGE_NEEDED**: Propose merge, use /bmad-create-skill if approved
- **NO_UPSTREAM**: Create via /bmad-create-skill

#### 6e. Legacy Commands Cleanup

Classify commands in `{MAIN_PROJECT_ROOT}/.claude/commands/`: REDUNDANT or STILL_NEEDED.

HALT — ask: **[D] Delete redundant / [K] Keep all / [Q] Quit**

#### 6f. Final Migration Status

```
Before: {N} legacy workflows, {old_percentage}% coverage
After:  {remaining} legacy, {new_percentage}% coverage
```

### 7. Suggest Next Steps

1. **If TODOs > 0**: "Fill in the remaining {count} TODOs."
2. **If all READY**: "Try `/bmad-create-story`, `/bmad-dev-story`, or `/bmad-code-review`."
3. **If some NOT READY**: "To unlock {skill}, you need: {missing}."

### 8. Gitignore Reminder

"Note: `workflow-context.md` may contain tracker IDs. Consider adding to `.gitignore` or keeping committed for team consistency."

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All files verified
- Required keys checked
- Readiness assessment complete
- Legacy migration executed if applicable
- User informed of next steps

### FAILURE:

- Skipping verification
- Not running migration when legacy exists
- Auto-deleting legacy without user approval
