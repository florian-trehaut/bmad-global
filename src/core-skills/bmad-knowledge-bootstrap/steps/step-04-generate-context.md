---
nextStepFile: './step-05-research-scan.md'
---

# Step 4: Generate workflow-context.md

## STEP GOAL:

Assemble all confirmed values from steps 02-03 into `.claude/workflow-context.md` and write the file.

## MANDATORY SEQUENCE

### 1. Assemble Values

Gather all confirmed values:
- **Step 02**: project_name, issue_prefix, app_type, monorepo, package_manager, commands, user prefs, tracker config, forge config, worktree templates
- **Step 03**: (used in steps 05-07 for knowledge files, not directly in context)

### 2. Generate the File

Write `.claude/workflow-context.md` with the following structure:

**YAML frontmatter:**

```yaml
---
# --- Project identity ---
project_name: {project_name}
issue_prefix: {issue_prefix}

# --- Issue tracker ---
tracker: {tracker_type}
{tracker_config_block}  # See tracker-specific blocks below

# --- Source control forge ---
forge: {forge_type}
forge_project_path: "{project_path}"
forge_project_path_encoded: "{encoded_path}"
forge_cli: {cli}
forge_mr_create: "{mr_create_cmd}"   # MUST include --repo
forge_mr_list: "{mr_list_cmd}"       # MUST include --repo
forge_mr_approve: "{mr_approve_cmd}" # MUST include --repo
forge_api_base: "{api_base_cmd}"

# --- Worktree naming ---
worktree_prefix: {project_name}
worktree_templates:
  dev: "../{project_name}-{issue_number}-{short_description}"
  review: "../{project_name}-review-{mr_iid}"
  spec_review: "../{project_name}-review-spec-{issue_number}"
  validation: "../{project_name}-validation-{issue_number}"
  quick_spec: "../{project_name}-spec-{slug}"
  spike: "../{project_name}-spike-{slug}"
branch_template: "feat/{issue_number}-{short_description}"

# --- Application type ---
app_type: "{app_type}"

# --- Build tooling & commands ---
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
```

**Tracker-specific config blocks** (insert based on tracker type):

- **Linear**: tracker_mcp_prefix, tracker_team, tracker_team_id, tracker_meta_project, tracker_meta_project_id, tracker_states (backlog/todo/in_progress/in_review/to_test/done/canceled)
- **GitHub**: tracker_states (todo="open", in_progress="open", done="closed"), tracker_labels
- **GitLab**: tracker_states (todo="opened", in_progress="opened", done="closed"), tracker_labels
- **Jira**: tracker_base_url, tracker_project_key, tracker_states
- **File-based**: tracker_file, tracker_story_location, tracker_epics_file, tracker_states

**Markdown body:**

```markdown
# {project_name} Workflow Context

## Knowledge Files

The following knowledge files are available in `.claude/workflow-knowledge/` and should be loaded JIT:

| File | Content | Loaded by |
|------|---------|-----------|
| `tracker.md` | Tracker-specific API patterns, state machines | All tracker workflows |
| `stack.md` | Tech stack, frameworks, forbidden patterns, test rules | dev-story, code-review, review-story, quick-spec |
| `infrastructure.md` | Cloud infra, CI/CD, deployment, IaC | dev-story, code-review, review-story |
| `environment-config.md` | Environment URLs, DB proxy config | validation-metier, review-story |
| `investigation-checklist.md` | Domain-specific investigation guides | review-story |
| `review-perspectives.md` | Code review perspectives, severity rules | code-review |
| `conventions.md` | Commit format, branch strategy, code style | dev-story, code-review |
| `domain-glossary.md` | Ubiquitous language, bounded contexts | review-story, quick-spec |
| `api-surface.md` | Endpoints, schemas, auth, integrations | review-story, dev-story |

## Project-Specific Skills

{Scan `.claude/skills/*/SKILL.md` — list found skills, or "None yet"}

## Reference Code

- **Good patterns**: {reference_services}
- **NEVER copy from**: {forbidden_services}

## Alerting

{Ask user about alerting system, or "No dedicated alerting system."}
```

### 3. Write the File

Write to `.claude/workflow-context.md`.

### 4. Present for Review

Show the full generated file.

HALT — ask: "Please review:
1. Are all values correct?
2. Any alerting system to document?
3. Any project-specific skills missing?
4. Should this file be in .gitignore?"

Apply corrections.

### 5. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All required YAML keys present
- Tracker config block matches detected tracker type
- Forge commands include --repo flag
- User reviewed before proceeding

### FAILURE:

- Missing required keys
- Forge commands without --repo
- Writing without user review
