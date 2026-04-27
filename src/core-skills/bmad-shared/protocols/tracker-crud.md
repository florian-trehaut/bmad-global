# Tracker CRUD Protocol

**Loaded by:** Any bmad-\* workflow performing CRUD operations on the project's issue tracker (queries, issue creation, updates, comments, document storage).

**Indirection layer for** the schema section `tracker-patterns` (per `~/.claude/skills/bmad-shared/knowledge-schema.md` v1).

---

## Purpose

This protocol abstracts CRUD operations across all supported issue trackers (file-based, Linear, GitHub, GitLab, Jira). Workflows reference this protocol instead of `project.md` anchors directly — preserving decoupling between consumer workflows and the project knowledge file structure.

When the schema's anchor for tracker patterns changes, **only this protocol updates** — workflows remain stable.

---

## Resolution

The project's tracker configuration lives in:

- **`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`** — section described in `knowledge-schema.md` as `tracker-patterns` (anchor `#tracker-patterns` in schema v1). Already loaded by INITIALIZATION.
- **`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`** — YAML frontmatter fields:
  - `tracker` — type identifier (`file`, `linear`, `github`, `gitlab`, `jira`)
  - `tracker_states` — map of state name → ID/value
  - `tracker_meta_project_id` — Linear meta project (if applicable)
  - `tracker_team_id` — Linear team ID (if applicable)
  - `tracker_file`, `tracker_story_location`, `tracker_epics_file` — file-based paths
  - `forge`, `forge_cli`, `forge_project_path` — when tracker uses the forge (GitHub / GitLab)

Both files are already in the workflow's context — this protocol just describes how to combine them.

---

## Operations

### 1. Resolve the tracker type

Read `tracker` from `workflow-context.md` frontmatter. Branch on the value:

| `tracker` value | Backend | Primary tooling |
|-----------------|---------|------------------|
| `file` | YAML/Markdown files in `_bmad-output/` (or per `tracker_file`) | Read/Write tools, no external API |
| `linear` | Linear API via MCP | `tracker_mcp_prefix` (e.g., `mcp__linear__*`) |
| `github` | GitHub Issues / PRs | `forge_cli` = `gh` |
| `gitlab` | GitLab Issues / MRs | `forge_cli` = `glab` |
| `jira` | Jira API via MCP / REST | `tracker_base_url`, `tracker_project_key` |

The exact CRUD recipes are documented in `project.md` (tracker section). Read that section now to obtain the project-specific commands.

### 2. List / Query

Apply the project-specific list query. Common shapes:

- **File-based**: parse `tracker_file` (sprint-status YAML) and read story files from `tracker_story_location`.
- **Linear (MCP)**: `mcp__linear__list_issues` (or equivalent) filtered by team / state.
- **GitHub (CLI)**: `gh issue list --repo {forge_project_path} --state {state}`.
- **GitLab (CLI)**: `glab issue list --repo {forge_project_path}`.
- **Jira (MCP/REST)**: project-level JQL query.

Always apply state mapping from `tracker_states` (e.g., `in-progress` → `"In Progress"`).

### 3. Get (single issue / document)

Fetch by ID using the project's recipe. Include relations / comments when the workflow needs them.

### 4. Create

Apply the project's create operation:

- **File-based**: write a new story file under `tracker_story_location`, update `tracker_file`.
- **Linear**: `mcp__linear__create_issue` with team, project, state.
- **GitHub**: `gh issue create --repo {forge_project_path} --title … --body …`.
- **GitLab**: `glab issue create --repo {forge_project_path}`.

For documents (PRD, architecture, NFR assessment, etc.), trackers handle them differently:
- File-based: store as `.md` under planning artifacts.
- Linear: project-level documents.
- GitHub/GitLab: wiki or repo files.
- Jira: Confluence or attachments.

The exact path is documented in project.md's tracker section.

### 5. Update

State transitions: ALWAYS use the state ID/name from `tracker_states` — never hardcode state strings. Comments, label additions, and assignment changes follow the project's recipe.

### 6. Delete

Rare — most trackers prefer state changes over deletion. Apply only if the project's tracker section explicitly documents a delete operation.

---

## HALT conditions

- Tracker type is unknown / unsupported → HALT, instruct user to update `workflow-context.md`.
- MCP tool is unavailable when `tracker == linear|jira` (or similar) → HALT (no fallback to manual queries).
- A required state in `tracker_states` is absent → HALT, do not invent values.
- Tracker write operation fails → HALT, never silently retry or log+continue.

These follow the [zero-fallback rule](../no-fallback-no-false-data.md).

---

## Why this protocol exists

- **Decoupling**: workflows don't reference `project.md#tracker-patterns` directly — they call this protocol.
- **Single source of change**: when the schema's anchor for tracker patterns is renamed (or the tracker section is restructured), only this file updates.
- **Maintainability**: 100+ previous workflow refs to one anchor are now refs to one protocol file.
- **Extensibility**: a new tracker type only requires updating `bmad-knowledge-bootstrap` (to populate the new section) and this protocol — workflows remain stable.

See `~/.claude/skills/bmad-shared/knowledge-schema.md` for the full architecture rationale.
