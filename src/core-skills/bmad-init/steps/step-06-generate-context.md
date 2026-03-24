# Step 06 — Generate workflow-context.md

**Goal:** Assemble all confirmed values from steps 01-05 into the `.claude/workflow-context.md` file.

---

## 1. Assemble Values

Gather all confirmed values from previous steps:

- **Step 01**: project_name, issue_prefix, package_manager, commands, node_version, monorepo info, user prefs
- **Step 02**: tracker type, team, states, meta project, labels
- **Step 03**: forge type, project path, CLI, worktree templates
- **Step 04**: (used in step-07 for stack.md, not directly in context)
- **Step 05**: (used in step-07 for infrastructure.md, not directly in context)

## 2. Generate the File

Write `.claude/workflow-context.md` with the following structure.

### Template

```markdown
---
# ============================================================
# WORKFLOW CONTEXT — {project_name}
# ============================================================
# This file is the project-specific contract loaded by all
# global bmad-* workflow skills (~/.claude/skills/bmad-*/).
# It provides tracker IDs, forge config, stack info, and
# pointers to knowledge files that workflows load JIT.
#
# Format: YAML frontmatter + markdown body.
# Workflows read this file at initialization and extract
# values from the frontmatter for dynamic behavior.
# ============================================================

# --- Project identity ---
project_name: {project_name}
issue_prefix: {issue_prefix}

# --- Issue tracker ---
tracker: {tracker_type}
{tracker_config_block}

# --- Source control forge ---
forge: {forge_type}
forge_project_path: "{project_path}"
forge_project_path_encoded: "{encoded_path}"
forge_cli: {cli}
forge_mr_create: "{mr_create_cmd}"
forge_mr_list: "{mr_list_cmd}"
forge_mr_approve: "{mr_approve_cmd}"
forge_api_base: "{api_base_cmd}"

# --- Worktree naming ---
worktree_prefix: {project_name}
worktree_templates:
  dev: "../{project_name}-{issue_number}-{short_description}"
  review: "../{project_name}-review-{mr_iid}"
  spec_review: "../{project_name}-review-spec-{issue_number}"
  validation: "../{project_name}-validation-{issue_number}"
  quick_spec: "../{project_name}-spec-{slug}"
branch_template: "feat/{issue_number}-{short_description}"

# --- Application type ---
app_type: "{app_type}"  # web, desktop, cli, library

# --- Desktop-specific (only if app_type = desktop) ---
# app_binary_path: "{app_binary_path}"
# app_log_dir: "{app_log_dir}"
# app_platforms: [{app_platforms}]

# --- Package manager & commands ---
package_manager: {package_manager}
install_command: "{install_command}"
build_command: "{build_command}"
test_command: "{test_command}"
lint_command: "{lint_command}"
format_command: "{format_command}"
format_fix_command: "{format_fix_command}"
typecheck_command: "{typecheck_command}"
quality_gate: "{quality_gate}"

# --- Communication ---
communication_language: {language}
document_output_language: {language}
user_name: {user_name}
user_skill_level: {skill_level}

# --- Labels ---
labels:
  spec_reviewed: "{spec_reviewed_label}"
  client_prefix: "{client_prefix}"
---

# {project_name} Workflow Context

## Knowledge Files

The following knowledge files are available in `.claude/workflow-knowledge/` and should be loaded JIT (just-in-time) when a workflow step needs them:

| File | Content | Loaded by |
|------|---------|-----------|
| `tracker.md` | {tracker_type}-specific API patterns, MCP tool usage, document conventions, storage adapter | All workflows that interact with {tracker_type} |
| `stack.md` | Tech stack, frameworks, ORMs, forbidden patterns, test rules | dev-story, code-review, review-story, quick-spec |
| `infrastructure.md` | Cloud infra, CI/CD, deployment, IaC, database management | dev-story, code-review, review-story, validation-metier |
| `environment-config.md` | Environment URLs, DB proxy config, credentials discovery | validation-metier, review-story |
| `investigation-checklist.md` | Domain-specific investigation guides | review-story |
| `review-perspectives.md` | Code review perspectives, checklists, severity rules | code-review |

## Project-Specific Skills

{List any skills found in `.claude/skills/` at the project level. If none, write "None yet — add project-specific skills as needed."}

## Reference Code

- **Good patterns**: {reference_services}
- **NEVER copy from**: {forbidden_services}

## Alerting

{Ask user: "Does your project have an alerting system (Slack, PagerDuty, etc.)? If so, what is it and how is it invoked in code?"}

{If no alerting system: "No dedicated alerting system configured. Consider adding one."}
```

### Tracker Config Block

Generate the tracker-specific YAML block based on tracker type:

**Linear:**
```yaml
tracker_mcp_prefix: "mcp__linear-server__"
tracker_team: {team_name}
tracker_team_id: "{team_id}"
tracker_meta_project: "{meta_project_name}"
tracker_meta_project_id: "{meta_project_id}"
tracker_states:
  backlog: "{id}"
  todo: "{id}"
  in_progress: "{id}"
  in_review: "{id}"
  to_test: "{id}"
  done: "{id}"
  canceled: "{id}"
```

**GitHub:**
```yaml
tracker_states:
  todo: "open"
  in_progress: "open"
  done: "closed"
tracker_labels:
  in_progress: "{label}"
  in_review: "{label}"
  to_test: "{label}"
```

**GitLab:**
```yaml
tracker_states:
  todo: "opened"
  in_progress: "opened"
  done: "closed"
tracker_labels:
  in_progress: "{label}"
  in_review: "{label}"
  to_test: "{label}"
```

**Jira:**
```yaml
tracker_base_url: "{url}"
tracker_project_key: "{key}"
tracker_states:
  backlog: "{id}"
  todo: "{id}"
  in_progress: "{id}"
  in_review: "{id}"
  done: "{id}"
```

**File-based:**
```yaml
tracker_file: "{detected path to sprint-status.yaml}"
tracker_story_location: "{detected story directory}"
tracker_epics_file: "{detected epics.md path, if found}"
tracker_states:
  backlog: "{detected or default: backlog}"
  ready_for_dev: "{detected or default: ready-for-dev}"
  in_progress: "{detected or default: in-progress}"
  review: "{detected or default: review}"
  done: "{detected or default: done}"
```

## 3. Scan for Existing Project Skills

```bash
ls .claude/skills/*/SKILL.md 2>/dev/null
ls .claude/skills/*/skill.md 2>/dev/null
```

List each found skill with its name and a 1-line description (read the SKILL.md).

## 4. Write the File

Write the assembled content to `.claude/workflow-context.md`.

## 5. Present for Review

Show the full generated file to the user.

---

## CHECKPOINT

Ask user: "Here is the generated workflow-context.md. Please review:
1. Are all values correct?
2. Any alerting system to document?
3. Any project-specific skills missing from the list?
4. Should this file be in .gitignore (it may contain sensitive IDs)?"

Apply any corrections.

---

**Next:** Read and follow `./steps/step-07-generate-knowledge.md`
