# Tracker CRUD Protocol

**Loaded by:** Any bmad-\* workflow performing CRUD operations on the project's issue tracker (queries, issue creation, updates, comments, document storage).

**Indirection layer for** the schema section `tracker-patterns` (per `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` v1).

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

## Observability — structured CLI echoes (Task 22, story-spec v3)

Every tracker call (operations 2-8 below) MUST emit a **structured echo** to the user-visible CLI output before AND after the call. This makes tracker interactions visible and traceable in the conversation transcript.

**Format:**

```
tracker call: {tracker_type}.{operation} {target_id|n/a} → starting
tracker call: {tracker_type}.{operation} {target_id|n/a} → {status} ({duration_ms}ms{, error: <msg>})
```

| Field | Format | Example |
|-------|--------|---------|
| `tracker_type` | from `workflow-context.md` `tracker` field | `linear`, `github`, `gitlab`, `jira`, `file` |
| `operation` | one of: `list_issues`, `get_issue`, `create_issue`, `update_issue`, `update_issue_preserve`, `get_issue_updated_at`, `create_comment` | as listed |
| `target_id` | issue identifier when applicable | `BMAD-123`, `n/a` for list operations |
| `status` | `OK` (2xx) or `FAIL <code>` (non-2xx) | `OK`, `FAIL 401`, `FAIL 5xx` |
| `duration_ms` | wall-clock duration since "starting" line | `342` |
| `error` | only on FAIL, verbatim tracker reason | `auth token expired` |

These echoes are **mandatory** for any workflow consuming this protocol — they implement the per-tracker-call observability requirement from the v3 schema. They are visible to the user in real time, traceable in the conversation transcript, and never replaced by silent execution.

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

### 7. Update issue description preserving non-managed sections

**Added in v1.2 (story-spec v3 bifurcation).** Used by `spec-bifurcation.md` operation 5 to refresh BMAD-managed sections in a tracker issue without clobbering sections added manually by the PO.

**Contract:**

1. Fetch current description via operation 3 (`get_issue`).
2. Parse the description by H2 headings.
3. Identify which H2 headings correspond to BMAD-managed sections — the **canonical business sections** declared in `spec-completeness-rule.md` v3 section→location mapping (DoD, Problem, Solution, Scope, OOS, Business Context, Validation Metier).
4. Compose the new description:
   - For each managed heading present in the new local content: replace the tracker's heading + body with the new content.
   - For each managed heading present in the tracker but not in the new local content: leave it as-is (defensive — never delete).
   - For each non-managed heading (custom additions by the PO): preserve verbatim in original order.
5. Apply size pre-check (per `spec-bifurcation.md` Size Limits section) — HALT if exceeds tracker limit.
6. Write the composed description via the tracker-specific update recipe.

**Per-tracker recipes:**

- **Linear (MCP)**: `mcp__linear__update_issue { id, description: <composed> }`
- **GitHub (CLI)**: `gh issue edit {issue_number} --repo {forge_project_path} --body-file <(echo "$composed")`
- **GitLab (CLI)**: `glab issue update {issue_iid} --repo {forge_project_path} --description "$composed"`
- **Jira (MCP)**: project-specific update_issue recipe

**Why preserve non-managed sections:** PO-added sections (additional context, screenshots, decisions made post-creation) are part of the collaborative artifact. BMAD's role is to refresh its managed sections, not to be authoritative over the entire tracker description.

### 8. Get issue updatedAt only (lightweight drift check)

**Added in v1.2 (story-spec v3 bifurcation).** Used by `spec-bifurcation.md` operation 3 (drift check). Fetches **only** the `updatedAt` / `updated_at` / `updated` field — NOT the full description. This is a performance optimization: drift checks happen frequently (start of every review/validation/dev step in bifurcation mode) and the full description is large.

**Per-tracker recipes:**

- **Linear (MCP)**: `mcp__linear__get_issue { id, fields: ["updatedAt"] }` — request only the timestamp field via field-selection.
- **GitHub (CLI)**: `gh api repos/{owner}/{repo}/issues/{number} --jq '.updated_at'` — JMESPath projection extracts only the timestamp.
- **GitLab (CLI)**: `glab api projects/{id}/issues/{iid} | jq -r '.updated_at'`
- **Jira (MCP)**: REST `GET /rest/api/3/issue/{key}?fields=updated`

**Field name normalization:**

| Tracker | Field |
|---------|-------|
| Linear | `updatedAt` (camelCase, ISO 8601) |
| GitHub | `updated_at` (snake_case, ISO 8601) |
| GitLab | `updated_at` (snake_case, ISO 8601) |
| Jira | `fields.updated` (nested, ISO 8601) |

The protocol consumer (`spec-bifurcation.md`) normalizes these into a single ISO 8601 string for comparison with `business_synced_at`.

**Output contract:**

Returns a string formatted as ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`). If the API response is missing the field or returns a malformed timestamp, HALT (zero-fallback) with: `Tracker response missing required field: updatedAt`.

---

## HALT contract for bifurcation operations

**Added in v1.2 (story-spec v3 bifurcation).** Reaffirms the universal zero-fallback rule for the new tracker operations introduced for bifurcation mode (and existing operations consumed by bifurcation workflows).

All of the following failures MUST trigger immediate HALT — never silent fallback to local file, never log+continue, never retry-loop:

- **4xx (auth / permission / not found)**: HALT with `Tracker authentication or authorization failed: {tracker_reason}`. The fix is for the user to re-authenticate (`gh auth login`, refresh Linear MCP token, etc.) — no silent fallback can make this work.
- **5xx (server error)**: HALT with `Tracker server error: {tracker_reason} — try again later`. The user decides when to retry.
- **Network failure (timeout, DNS, connection refused)**: HALT with `Tracker network failure: {error_message}`.
- **Missing required field on response** (`description`, `updatedAt`, `id`, `url`): HALT with `Tracker response missing required field: {field_name}`. Indicates an API contract change or a malformed issue — the user must investigate.
- **Description size exceeds tracker limit** (per `spec-bifurcation.md` Size Limits): HALT with the size + limit + recommendation. Never silently truncate.
- **MCP tool absent** when `tracker == linear|jira`: HALT with `Linear MCP / Jira MCP not configured. Run /linear-tools:setup or equivalent.`

The principle: BMAD never invents tracker state, never falls back to a known-incomplete local mirror, never proceeds on a partial fetch. The user is the HALT surface — they decide whether to retry, abandon, or escalate.

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

See `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` for the full architecture rationale.
