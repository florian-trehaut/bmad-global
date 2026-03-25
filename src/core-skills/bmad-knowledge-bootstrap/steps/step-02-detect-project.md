---
nextStepFile: './step-03-detect-stack.md'
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

**Linear:** Check if `mcp__linear-server__list_teams` is available.

**GitHub Issues:** Check `gh` CLI + auth + GitHub remote.

**GitLab Issues:** Check `glab` CLI + auth + GitLab remote.

If multiple trackers detected, present all and ask user to pick the active one. If single, auto-select.

**Configure based on tracker type:**

- **Linear**: Call `list_teams`, `list_issue_statuses`, `list_projects`. Map states (Backlog→backlog, Todo→todo, In Progress→in_progress, In Review→in_review, To Test→to_test, Done→done, Canceled→canceled). Discover Meta project.
- **GitHub**: States: todo/in_progress="open", done="closed". Ask about workflow labels.
- **GitLab**: Similar to GitHub with boards.
- **Jira**: Ask base URL + project key. Manual state mapping.
- **File-based**: Read sprint-status.yaml to extract states, story_location, project_key.

Ask about labels: spec_reviewed, client_prefix.

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
User:             {user_name} ({skill_level}, {language})
```

HALT — ask: "Does this look correct? Any corrections?"

Store all confirmed values for step 04 (context generation).

### 6. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All 3 detections complete (project + tracker + forge)
- User confirmed values
- Forge commands include --repo flag

### FAILURE:

- Skipping tracker detection
- Forge commands without --repo
- Not presenting for user confirmation
