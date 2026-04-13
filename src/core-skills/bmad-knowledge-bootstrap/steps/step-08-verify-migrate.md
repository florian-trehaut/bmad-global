---
nextStepFile: './step-09-generate-claude-local.md'
---

# Step 8: Verify and Migrate

## STEP GOAL:

Validate all generated files, count TODOs, assess workflow readiness, suggest next steps. If legacy artifacts exist, execute migration.

## MANDATORY SEQUENCE

### 1. Verify Files Exist

```bash
for file in \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-context.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/tracker.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/infrastructure.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/environment-config.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/investigation-checklist.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/conventions.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain-glossary.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api-surface.md" \
  "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/validation.md"; do
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
| `bmad-create-story` | {READY/NOT} | tracker + tracker_states.todo |
| `bmad-dev-story` | {READY/NOT} | tracker + forge + forge_cli + states (todo, in_progress, in_review) |
| `bmad-code-review` | {READY/NOT} | forge + forge_cli |
| `bmad-review-story` | {READY/NOT} | tracker + tracker_states.todo |
| `bmad-validation-metier` | {READY/NOT} | environment-config has actual URLs (no TODOs) |
| `bmad-validation-frontend` | {READY/NOT} | validation.md has E2E or component framework detected |

### 5. Present Summary

```
============================================================
  Knowledge Bootstrap Complete — {project_name}
============================================================

Files:
  workflow-context.md              {OK/ISSUES}
  workflow-knowledge/ files:       {N OK} / {N MISSING} / {N EMPTY}

TODOs remaining:    {count}

Workflow readiness:
  bmad-create-story:      {READY / NOT READY}
  bmad-dev-story:         {READY / NOT READY}
  bmad-code-review:       {READY / NOT READY}
  bmad-review-story:      {READY / NOT READY}
  bmad-validation-metier: {READY / NOT READY}
  bmad-validation-frontend: {READY / NOT READY}
============================================================
```

### 6. Legacy Migration (CONDITIONAL)

**Run only if project state from step 01 was MIGRATION_IN_PROGRESS.**

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
