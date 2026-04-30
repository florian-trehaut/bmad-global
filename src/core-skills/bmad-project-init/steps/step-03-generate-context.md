---
nextStepFile: './step-04-finalize.md'
---

# Step 3: Generate workflow-context.md


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
CHK-STEP-03-ENTRY PASSED — entering Step 3: Generate workflow-context.md with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Assemble all confirmed values from step 02 into `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` and write the file.

## MANDATORY SEQUENCE

### 1. Assemble Values

Gather all confirmed values from **Step 02**: project_name, issue_prefix, app_type, monorepo, package_manager, commands, user prefs, tracker config, forge config, worktree templates, comm platform config.

Note: knowledge files (`workflow-knowledge/project.md`, `domain.md`, `api.md`) are generated separately by `/bmad-knowledge-bootstrap` after this skill completes.

### 1b. Resolve Story-Spec Bifurcation Mode (v3)

If `tracker ∈ {linear, github, gitlab, jira}` (collaborative tracker), prompt the user:

> Story-spec v3 introduit le mode **bifurcation** : sections métier dans le tracker (Linear / GitHub Issues / GitLab Issues / Jira), sections techniques dans un fichier .md local versionné avec le code, drift detection on-demand.
>
> Avantage : Product Owners et stakeholders collaborent sur les BACs, DoD, scope dans leur outil habituel ; développeurs et Claude lisent les sections techniques avec le code.
>
> Voir `~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md` pour le détail.
>
> Activer le mode bifurcation pour ce projet ? **[O]ui** / **[N]on** (default: N — comportement v2 monolithic préservé)

WAIT for explicit user input in `{communication_language}`. Set `{spec_split_enabled}`:
- On `[O]ui` → `true`
- On `[N]on` (or any other input) → `false`

If `tracker == file` (file-based tracker), **skip this prompt** and set `{spec_split_enabled}` = `false` (file trackers are not collaborative; the flag is ignored anyway, but set explicitly for clarity in the generated workflow-context.md).

Log: `Resolved spec_split_enabled = {value} for tracker = {tracker_type}`.

### 2. Generate the File

Write `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` with the following structure:

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

# --- Worktree strategy ---
worktree_enabled: {worktree_enabled}   # true = use worktrees for isolation | false = work on branches in main repo
worktree_reuse_current: auto           # auto = detect + prompt on mismatch (default) | always = reuse without prompt | never = always create conventional sibling

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

# --- Architecture Decision Records ---
adr_location: "{adr_location}"  # path to ADR directory, tracker document ID, or "none"
adr_format: "{adr_format}"      # madr, nygard, custom, unknown

# --- Communication platform ---
comm_platform: {comm_platform_type}  # slack, teams, discord, none
comm_mcp_prefix: "{comm_mcp_prefix}" # MCP prefix if detected, empty if none
user_comm_handle: "{user_comm_handle}" # user's handle, empty if none

# --- Communication ---
communication_language: {language}
document_output_language: {language}
user_name: {user_name}
user_skill_level: {skill_level}

# --- Labels ---
labels:
  spec_reviewed: "{spec_reviewed_label}"
  client_prefix: "{client_prefix}"

# --- Story-spec mode (v3 bifurcation) ---
spec_split_enabled: {spec_split_enabled}  # true = bifurcation (business in tracker, technical in local), false = monolithic (all-in-one). Defaults to false. ONLY relevant when tracker ∈ {linear, github, gitlab, jira} (collaborative trackers). Ignored on file-based trackers.
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

The following knowledge files are available in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` and are loaded by all bmad-\* workflow skills via the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`. They are generated by `/bmad-knowledge-bootstrap`.

| File | Content | H2 anchors | Loaded by |
|------|---------|-----------|-----------|
| `project.md` | Tech stack, conventions, infrastructure, environments, validation tooling, review perspectives, investigation checklist, tracker patterns, communication platform | `#tech-stack`, `#conventions`, `#infrastructure`, `#environments`, `#validation-tooling`, `#test-rules`, `#review-perspectives`, `#investigation-checklist`, `#tracker-patterns`, `#communication-platform` | **All workflows (required)** |
| `domain.md` | Ubiquitous language, bounded contexts, entity relationships, domain rules | (full body) | create-story, review-story, dev-story, create-prd |
| `api.md` | API style, endpoints, request/response schemas, authentication, integrations | (full body) | dev-story, review-story, validation-\* |

## Project-Specific Skills

{Scan `{MAIN_PROJECT_ROOT}/.claude/skills/*/SKILL.md` — list found skills, or "None yet"}

## Reference Code

- **Good patterns**: {reference_services}
- **NEVER copy from**: {forbidden_services}

## Alerting

{Ask user about alerting system, or "No dedicated alerting system."}
```

### 3. Write the File

Write to `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

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

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Generate workflow-context.md
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
