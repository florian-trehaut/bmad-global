---
nextStepFile: './step-03-generate-context.md'
---

# Step 2: Detect Project Identity, Tracker, and Forge

## STEP GOAL:

Auto-detect project metadata (name, monorepo, package manager, commands), issue tracker configuration, and source code forge. All three detections run in one step to minimize user interaction rounds.

## MANDATORY SEQUENCE

### 1. Detect Project Identity

Refer to `../data/detection-patterns.md` for lookup tables.

**Package manifest:**
```bash
cat package.json 2>/dev/null   # JS/TS
cat Cargo.toml 2>/dev/null     # Rust
cat go.mod 2>/dev/null         # Go
cat pyproject.toml 2>/dev/null # Python
```

Extract: project name, version, scripts, workspace config.

**Monorepo detection:**
```bash
ls pnpm-workspace.yaml turbo.json nx.json lerna.json rush.json 2>/dev/null
ls -d apps/ packages/ libs/ services/ modules/ 2>/dev/null
```

**Package manager** (check lock files in priority order):
`pnpm-lock.yaml` > `yarn.lock` > `package-lock.json` > `bun.lockb` > `Cargo.lock` > `poetry.lock` > `go.sum`

**Infer commands** from package manifest scripts:
install, build, test, lint, format, format_fix, typecheck, quality_gate.

**Application type** (priority: desktop > cli > web > library):
- Desktop: Electron, Tauri, Rust GUI (gpui/iced/egui), Flutter, Swift
- CLI: Cargo `[[bin]]`, Go binary
- Library: Cargo `[lib]` without `[[bin]]`
- Web: Next, Nuxt, NestJS, Vite, etc.

### 2. Detect Issue Tracker

Scan for ALL tracker signals simultaneously:

**File-based:**
```bash
find . -maxdepth 4 -name "sprint-status.yaml" -not -path "*/node_modules/*" -not -path "*/_bmad/bmm/workflows/*" 2>/dev/null
```

**MCP-based trackers:** Probe available MCP tools for tracker-like signatures:

| Signature pattern | Tracker type |
|---|---|
| `*list_teams*` | Linear |
| `*jira*search*` | Jira (MCP) |

For each match, extract the MCP prefix (everything before the method name). For example, if `mcp__linear__list_teams` is found, the prefix is `mcp__linear__`.

**CLI-based trackers:**
- GitHub Issues: Check `gh` CLI + auth + GitHub remote
- GitLab Issues: Check `glab` CLI + auth + GitLab remote

If multiple trackers detected, present all and ask user to pick the active one. If single, auto-select.

**Configure based on detected tracker:**

For each tracker type, discover the concept mapping, states, and CRUD operations that will populate `workflow-knowledge/project.md`:

- **MCP-based (e.g., Linear)**: Use discovered MCP prefix to call team listing, status listing, and project listing methods. Map states (Backlog→backlog, Todo→todo, In Progress→in_progress, In Review→in_review, To Test→to_test, Done→done, Canceled→canceled). Discover meta project if available.
- **CLI-based (GitHub)**: States: todo/in_progress="open", done="closed". Ask about workflow labels.
- **CLI-based (GitLab)**: Similar to GitHub with boards.
- **MCP or Web-based (Jira)**: Ask base URL + project key. Manual state mapping.
- **File-based**: Read sprint-status.yaml to extract states, story_location, project_key.

Ask about labels: spec_reviewed, client_prefix.

### 2b. Detect Communication Platform

Probe for communication platform MCP tools:

| Signature pattern | Platform type |
|---|---|
| `*channels_list*` | Slack |
| `*teams*chat*` | Microsoft Teams |

For each match, extract the MCP prefix.

If no communication platform MCP detected, ask user: "Do you use a team communication platform (Slack, Teams, Discord)? If so, is an MCP server configured for it?"

Accept `none` — communication platform is optional. Workflows skip comm-related steps when `comm_platform: none`.

If detected or confirmed, ask for the user's handle on the platform (e.g., `@florian`).

### 3. Detect Source Code Forge

```bash
git remote get-url origin 2>/dev/null
```

Parse URL → forge type (GitLab/GitHub/Bitbucket), project path, URL-encoded path.

```bash
which glab 2>/dev/null && glab auth status 2>/dev/null
which gh 2>/dev/null && gh auth status 2>/dev/null
```

Set forge commands — **CRITICAL: all commands must include `--repo {project_path}`**:
- GitHub: `gh pr create --repo org/repo`, `gh pr list --repo org/repo`
- GitLab: `glab mr create --repo org/repo`, `glab mr list --repo org/repo`

Generate worktree templates:
```yaml
worktree_templates:
  dev: "../{ProjectName}-{issue_number}-{short_description}"
  review: "../{ProjectName}-review-{mr_iid}"
  spec_review: "../{ProjectName}-review-spec-{issue_number}"
  validation: "../{ProjectName}-validation-{issue_number}"
  quick_spec: "../{ProjectName}-spec-{slug}"
  spike: "../{ProjectName}-spike-{slug}"
branch_template: "feat/{issue_number}-{short_description}"
```

**Worktree strategy:**

Ask user: "Does this project use git worktrees for branch isolation?
- **[Y]** Yes — each feature/review/spec gets its own worktree (recommended for team projects)
- **[N]** No — I work directly on branches in the main repo (solo projects, simple workflows)"

Store `worktree_enabled` = `true` (Y) or `false` (N). Default: `true`.

If `worktree_enabled: false`, worktree templates are still generated (for documentation and potential future use) but will not be used by workflows.

### 4. Ask User for Non-Inferrable Values

- **user_name**: ask
- **communication_language**: ask (default: English)
- **user_skill_level**: ask (beginner/intermediate/expert)
- **issue_prefix**: suggest uppercase abbreviation of project name

### 5. Present Combined Summary

```
Project:          {project_name} ({app_type})
Issue prefix:     {issue_prefix}
Monorepo:         {yes/no}
Package manager:  {pm}
Commands:         install={cmd} test={cmd} lint={cmd} ...
Tracker:          {type} (team: {team}, states: {N} mapped)
Forge:            {type} ({project_path}, CLI: {cli})
Worktrees:        {enabled/disabled}
Comm platform:    {type} (handle: {handle}) or none
User:             {user_name} ({skill_level}, {language})
```

HALT — ask: "Does this look correct? Any corrections?"

Store all confirmed values for step 04 (context generation).

### 6. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All 4 detections complete (project + tracker + forge + comm platform)
- User confirmed values
- Forge commands include --repo flag

### FAILURE:

- Skipping tracker detection
- Forge commands without --repo
- Not presenting for user confirmation
