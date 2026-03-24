# Step 08 — Verify and Summary

**Goal:** Validate all generated files, count TODOs, report workflow readiness, and suggest next steps.

---

## 1. Verify All Files Exist and Are Non-Empty

Check each required file:

```bash
for file in \
  ".claude/workflow-context.md" \
  ".claude/workflow-knowledge/tracker.md" \
  ".claude/workflow-knowledge/stack.md" \
  ".claude/workflow-knowledge/infrastructure.md" \
  ".claude/workflow-knowledge/environment-config.md" \
  ".claude/workflow-knowledge/investigation-checklist.md" \
  ".claude/workflow-knowledge/review-perspectives.md"; do
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

If any file is MISSING or EMPTY: report and offer to regenerate.

## 2. Verify Required Keys in workflow-context.md

Read `.claude/workflow-context.md` and verify these keys are present in the YAML frontmatter:

| Key | Required | Notes |
|-----|----------|-------|
| `project_name` | YES | |
| `issue_prefix` | YES | |
| `tracker` | YES | linear, github, gitlab, jira, file |
| `forge` | YES | gitlab, github, bitbucket |
| `forge_project_path` | YES | |
| `forge_cli` | YES | |
| `package_manager` | YES | pnpm, yarn, npm, bun |
| `install_command` | YES | |
| `build_command` | YES | |
| `test_command` | YES | |
| `quality_gate` | YES | |
| `communication_language` | YES | |
| `user_name` | YES | |
| `tracker_states` | YES | At least: todo, in_progress, done |
| `worktree_prefix` | YES | |
| `branch_template` | YES | |

Report any missing keys.

## 3. Count TODOs

```bash
todo_count=$(grep -rc "TODO" .claude/workflow-context.md .claude/workflow-knowledge/*.md 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
echo "Total TODOs: $todo_count"

# Show each TODO with file and line
grep -rn "TODO" .claude/workflow-context.md .claude/workflow-knowledge/*.md 2>/dev/null
```

Report the total count and list each TODO with its location.

## 4. Verify Knowledge File Content is Current

For each knowledge file, verify the content reflects the **current** state of the project — not just that the file exists.

### stack.md
- List all directories in `apps/` → verify each service appears in stack.md
- Check `packages/` and `libs/` → verify all are listed
- Check ORM versions (Prisma, Drizzle) match what's in package.json files
- Check test framework matches (Vitest vs Jest per service)
- Flag any service present in `apps/` but missing from stack.md as STALE

### tracker.md
- Verify the MCP tool prefix matches what's actually available in the current session
- Check that all tracker states listed in workflow-context.md are documented
- Verify document conventions are still accurate

### infrastructure.md
- Check `terraform/` or IaC directories still match what's documented
- Verify CI config file (`.gitlab-ci.yml`, `.github/workflows/`) is referenced
- Check Docker compose / Makefile targets match documented commands

### environment-config.md
- Verify environment URLs are real values, not TODO placeholders
- Check Cloud SQL proxy ports and instance names
- Verify credential discovery commands

### investigation-checklist.md
- Cross-reference domain areas with actual code: are there new domains not covered?
- Check that external data sources (SFTP, FTP, APIs) are listed

### review-perspectives.md
- Verify it references the project's actual alerting system, test rules, and patterns
- Check that excluded directories match current repo structure

Report findings:
```
Knowledge file content audit:
  stack.md:               {CURRENT / STALE — N services missing}
  tracker.md:             {CURRENT / STALE — reason}
  infrastructure.md:      {CURRENT / STALE — reason}
  environment-config.md:  {CURRENT / INCOMPLETE — N placeholders}
  investigation-checklist.md: {CURRENT / STALE — N domains missing}
  review-perspectives.md: {CURRENT / STALE — reason}
```

If any file is STALE: offer to regenerate or update the specific sections.

## 5. Assess Workflow Readiness

Based on the generated configuration, assess which bmad-* skills are ready to use:

| Skill | Status | Requirements | Missing |
|-------|--------|-------------|---------|
| `bmad-quick-spec` | {READY/NOT READY} | tracker configured | {missing items} |
| `bmad-dev-story` | {READY/NOT READY} | tracker + forge configured | {missing items} |
| `bmad-code-review` | {READY/NOT READY} | forge configured | {missing items} |
| `bmad-review-story` | {READY/NOT READY} | tracker configured | {missing items} |
| `bmad-validation-metier` | {READY/NOT READY} | environment-config has URLs (no TODOs on URLs) | {missing items} |

### Readiness Rules

- **bmad-quick-spec**: READY if `tracker` is set and `tracker_states` has at least `todo`
- **bmad-dev-story**: READY if `tracker` + `forge` + `forge_cli` are set, and `tracker_states` has `todo`, `in_progress`, `in_review`
- **bmad-code-review**: READY if `forge` + `forge_cli` are set
- **bmad-review-story**: READY if `tracker` is set and `tracker_states` has `todo`
- **bmad-validation-metier**: READY if `environment-config.md` has at least one environment with actual URLs (not TODO placeholders)

## 6. Present Final Summary

```
============================================================
  BMAD Init Complete — {project_name}
============================================================

Files created:
  .claude/workflow-context.md              {OK/ISSUES}
  .claude/workflow-knowledge/tracker.md    {OK/ISSUES}
  .claude/workflow-knowledge/stack.md      {OK/ISSUES}
  .claude/workflow-knowledge/infrastructure.md  {OK/ISSUES}
  .claude/workflow-knowledge/environment-config.md  {OK/ISSUES}
  .claude/workflow-knowledge/investigation-checklist.md  {OK/ISSUES}
  .claude/workflow-knowledge/review-perspectives.md  {OK/ISSUES}

Configuration:
  Tracker:          {type} ({team})
  Forge:            {type} ({path})
  Package manager:  {pm}
  Stack:            {frameworks}

TODOs remaining:    {count}

Workflow readiness:
  bmad-quick-spec:       {READY / NOT READY}
  bmad-dev-story:        {READY / NOT READY}
  bmad-code-review:      {READY / NOT READY}
  bmad-review-story:     {READY / NOT READY}
  bmad-validation-metier: {READY / NOT READY}
============================================================
```

## 7. Suggest Next Steps

Based on the current state:

1. **If TODOs > 0**: "Fill in the remaining {count} TODOs in the knowledge files. Key ones: {list most important TODOs}."
2. **If all READY**: "Your project is fully configured. Try one of these to get started:
   - `/bmad-quick-spec` — Create your first spec from a business requirement
   - `/bmad-dev-story` — Pick up and implement a story from your tracker
   - `/bmad-code-review` — Review an open MR"
3. **If some NOT READY**: "To unlock {skill_name}, you need: {missing_config}."

## 8. Gitignore Reminder

"Note: `workflow-context.md` may contain tracker IDs and project paths. Consider:
- Adding `.claude/workflow-context.md` to `.gitignore` if these are sensitive
- Or keeping it committed for team-wide consistency (recommended if IDs are not secret)"

---

## CHECKPOINT

If the project state is **MIGRATION_IN_PROGRESS**: proceed to step-09 (legacy migration).

Otherwise: END OF WORKFLOW.

**Next (if applicable):** Read and follow `./steps/step-09-migrate-legacy.md`
