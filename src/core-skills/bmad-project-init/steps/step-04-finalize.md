# Step 4: Finalize and Suggest Next Step

## STEP GOAL:

Verify `workflow-context.md` is complete and consistent, surface any legacy artifacts that need migration, and suggest the appropriate next step based on detected sources (planning artifacts, code, knowledge files).

## MANDATORY SEQUENCE

### 1. Verify workflow-context.md

```bash
test -s "{MAIN_PROJECT_ROOT}/.claude/workflow-context.md" && echo "OK" || echo "MISSING_OR_EMPTY"
```

Read frontmatter and check required keys:

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

Count any remaining `TODO` markers in the file:

```bash
grep -c "TODO" "{MAIN_PROJECT_ROOT}/.claude/workflow-context.md" 2>/dev/null
```

### 2. Detect Sources for Knowledge Generation (informational)

This is informational — `/bmad-knowledge-bootstrap` will perform full source detection. Here we just preview what's available so the suggestion in section 5 is accurate.

**Planning artifacts** (resolve `{planning_artifacts}` from workflow-context.md):

```bash
ls "{planning_artifacts}/prd.md" "{planning_artifacts}/architecture.md" "{planning_artifacts}/product-brief.md" 2>/dev/null
```

Also check ADRs at `{adr_location}` from workflow-context.md (if not "none"):

```bash
ls "{adr_location}/"*.md 2>/dev/null | head -5
```

Also check phase 4 specs in `{tracker_story_location}` (if file-based tracker) or `_bmad-output/implementation-artifacts/`:

```bash
ls "_bmad-output/implementation-artifacts/spec-"*.md 2>/dev/null | head -5
```

**Code presence** (any project manifest):

```bash
ls package.json Cargo.toml pyproject.toml go.mod requirements.txt Gemfile mix.exs 2>/dev/null | head -1
```

**Knowledge files state** (already detected in step-01):

- Old 10-file layout (`stack.md`, `conventions.md`, etc.) → user may want to run `/bmad-knowledge-bootstrap` to migrate to 3-file consolidated layout
- New 3-file layout (`project.md`, `domain.md`, `api.md`) → user may want `/bmad-knowledge-refresh` to update

Categorize project state:

| Category | Sources | Suggested next |
|---|---|---|
| **Init only (no sources yet)** | none | Phase 1-3 workflows (e.g. `/bmad-prfaq`, `/bmad-create-prd`) OR phase 4 (e.g. `/bmad-create-story`) OR add code |
| **Planning artifacts present** | PRD/Architecture/ADRs found | `/bmad-knowledge-bootstrap` to derive knowledge from planning |
| **Specs present** | spec-*.md found | `/bmad-knowledge-bootstrap` to derive knowledge from specs (most common case) |
| **Code present, no planning/specs** | manifest detected | `/bmad-knowledge-bootstrap` (brownfield import — derives from code) |
| **Mixed (planning + specs + code)** | multiple sources | `/bmad-knowledge-bootstrap` (full SDD pyramid merge) |
| **Knowledge already exists, old layout** | old 10-file detected | `/bmad-knowledge-bootstrap` to migrate to 3-file consolidated layout |
| **Knowledge already exists, new layout** | new 3-file detected | `/bmad-knowledge-refresh` to update |

### 3. Surface Legacy Artifacts (if applicable)

If `.claude/workflows/` legacy directory still present:

```
⚠️  Legacy workflows detected at {MAIN_PROJECT_ROOT}/.claude/workflows/
    These are leftover from older BMAD installations.
    `/bmad-knowledge-bootstrap` will offer to migrate them when you run it.
```

If `_bmad/` legacy directory still present:

```
ℹ️  Legacy `_bmad/` directory detected at project root.
    Defaults were extracted into workflow-context.md (if applicable).
    You may delete `_bmad/` once you're satisfied with workflow-context.md.
```

### 4. Present Summary

```
============================================================
  Project Init Complete — {project_name}
============================================================

workflow-context.md:
  Status:           {OK / N TODOs remaining / MISSING}
  Required keys:    {N/N present}

Detected sources for knowledge generation:
  Planning artifacts: {YES (list) / NO}
  Phase 4 specs:      {YES (count) / NO}
  Codebase:           {YES ({manifest}) / NO (greenfield)}
  Existing knowledge: {NEW 3-file / OLD 10-file / NONE}

Project category: {category from table in section 2}

Legacy artifacts:
  .claude/workflows/  {present / clean}
  _bmad/              {present / clean}
============================================================
```

### 5. Suggest Next Step

Based on category:

- **Init only (no sources)** :
  ```
  Next steps:
    • Run /bmad-prfaq, /bmad-create-prd, or /bmad-create-architecture to start planning
    • Or write phase 4 specs with /bmad-create-story
    • Or simply start coding — /bmad-knowledge-bootstrap will work once you have at least one source
  ```

- **Planning / Specs / Code present (any combination)** :
  ```
  Next step:
    • Run /bmad-knowledge-bootstrap to generate workflow-knowledge files (project.md, domain.md, api.md)
      from your detected sources: {sources_list}
  ```

- **Knowledge already exists (old layout)** :
  ```
  Next step:
    • Run /bmad-knowledge-bootstrap to migrate from old 10-file layout to consolidated 3-file layout
  ```

- **Knowledge already exists (new layout)** :
  ```
  Next step:
    • Run /bmad-knowledge-refresh to update knowledge files with recent changes
  ```

### 6. Gitignore Reminder

```
ℹ️  Note: workflow-context.md may contain tracker IDs and forge tokens.
    Consider adding `.claude/workflow-context.md` to .gitignore for sensitive projects,
    or keep it committed for team consistency.
```

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All required keys verified
- Sources for knowledge generation surveyed
- User informed of next step appropriate to project state
- Legacy artifacts flagged if present

### FAILURE:

- Missing required keys not surfaced
- No next step suggested
- Legacy artifacts silently ignored
