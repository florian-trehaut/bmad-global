# Step 02 — Detect Issue Tracker

**Goal:** Auto-detect the issue tracker, its configuration, and all workflow state IDs.

---

## 1. Detect Tracker Type

Scan for ALL tracker signals. A project may have MULTIPLE trackers (e.g., started file-based then migrated to Linear, or uses both). Detect all present, then let the user choose if more than one is found.

### File-Based (BMAD native)

Scan for local BMAD tracking artifacts:

```bash
# Primary signal: sprint-status.yaml in standard BMAD output locations
find . -maxdepth 4 -name "sprint-status.yaml" -not -path "*/node_modules/*" -not -path "*/_bmad/bmm/workflows/*" 2>/dev/null

# Secondary signals: story files following BMAD naming convention ({epic}-{story}-{slug}.md)
ls _bmad-output/implementation-artifacts/*.md 2>/dev/null | head -5

# Tertiary: epics planning file
ls _bmad-output/planning-artifacts/epics.md 2>/dev/null
```

If `sprint-status.yaml` found (outside of workflow templates):
- **Record** file-based as a detected tracker
- Read the YAML header to extract: `tracking_system`, `story_location`, `project_key`
- Extract status definitions from the file comments or data
- Auto-detect state values used in the file (grep for `status:` values)
- **Continue checking** for external trackers — the project may have evolved

### Linear

Check if `mcp__linear-server__list_teams` is available. If callable:
- **Record** Linear as a detected tracker
- `tracker_mcp_prefix` = `mcp__linear-server__`

### GitHub Issues

Check if `gh` CLI is available and repo is on GitHub:
```bash
which gh 2>/dev/null && gh auth status 2>/dev/null
```

If GitHub forge detected (from git remote): **record** GitHub Issues as a detected tracker.

### GitLab Issues

Check if `glab` CLI is available and repo is on GitLab:
```bash
which glab 2>/dev/null && glab auth status 2>/dev/null
```

If GitLab forge detected (from git remote): **record** GitLab Issues as a detected tracker.

### Resolve Detected Trackers

After scanning all sources, determine the outcome:

**Multiple trackers detected** (e.g., file-based + Linear):
Present all detected trackers and ask: "I found multiple tracking systems:
- {list detected trackers with details}
Which one is your **current, active** tracker? (The others may be legacy from an earlier phase of the project.)"

**Single tracker detected:**
Auto-select it. Proceed to configuration.

**No tracker detected:**
Ask user: "Which issue tracker do you use?"
- Linear
- GitHub Issues
- GitLab Issues
- Jira (manual config — need base URL, project key)
- File-based (local `sprint-status.yaml`)

---

## 2. Configure Based on Tracker Type

### If Linear

#### a. Get Team

Call `list_teams`.

- If single team: auto-select
- If multiple teams: present list, ask user to pick

Store: `tracker_team` (name), `tracker_team_id` (UUID)

#### b. Get States

Call `list_issue_statuses` for the selected team.

Map each state to standard workflow names. Common Linear state names → standard mapping:

| Linear State Name | Standard Key | Notes |
|-------------------|-------------|-------|
| Backlog | `backlog` | |
| Triage | `triage` | Optional |
| Todo | `todo` | |
| In Progress | `in_progress` | |
| In Review | `in_review` | MR submitted |
| To Test | `to_test` | Deployed, awaiting validation |
| Done | `done` | Validated |
| Canceled / Cancelled | `canceled` | |

Present the mapping and ask user to confirm. Some teams may have custom state names.

Store: `tracker_states` (map of standard_key → UUID)

#### c. Discover Meta Project

Call `list_projects(teamId)`.

Look for a project with "Meta" in the name (case-insensitive). This is the BMAD meta-project used for cross-cutting documents.

- If found: auto-select, store `tracker_meta_project` (name) and `tracker_meta_project_id` (UUID)
- If not found: ask user if they want to create one, or skip

#### d. Labels

Ask user about label conventions:
- Spec reviewed label? (default: `spec-reviewed`)
- Client prefix? (default: `Client: `)
- Any other workflow labels?

### If GitHub Issues

Simpler config — no team concept, no custom states:

```yaml
tracker: github
tracker_states:
  todo: "open"
  in_progress: "open"  # differentiated by label
  done: "closed"
```

Ask user about labels used for workflow states (e.g., `in-progress`, `in-review`, `to-test`).

### If GitLab Issues

Similar to GitHub but with built-in boards:

```yaml
tracker: gitlab
```

Ask user about board columns / labels for workflow states.

### If Jira

```yaml
tracker: jira
tracker_base_url: "https://{org}.atlassian.net"
tracker_project_key: "{KEY}"
```

Ask user for base URL and project key. State mapping requires manual input (Jira workflows vary wildly).

### If File-Based

Read the detected `sprint-status.yaml` to extract actual configuration:

```bash
# Extract story location from the file
grep "story_location:" sprint-status.yaml

# Extract all unique status values actually used
grep -oP 'status:\s*\K\S+' sprint-status.yaml | sort -u

# Extract project key
grep "project_key:" sprint-status.yaml
```

Build config from what's actually in the file:

```yaml
tracker: file
tracker_file: "{path-to-sprint-status.yaml}"  # actual detected path, not hardcoded
tracker_story_location: "{story_location from file}"
tracker_epics_file: "{detected epics.md path, if found}"
tracker_states:
  backlog: "backlog"
  ready_for_dev: "ready-for-dev"
  in_progress: "in-progress"
  review: "review"
  done: "done"
  # Add any additional states found in the file
```

Present the detected states and paths for user confirmation. The states listed above are BMAD defaults — the actual file may use different values.

---

## CHECKPOINT

Present the tracker configuration:

```
Tracker:          {type}
Team:             {team_name} ({team_id})
Meta Project:     {meta_name} ({meta_id})
States:
  backlog:        {id}
  todo:           {id}
  in_progress:    {id}
  in_review:      {id}
  to_test:        {id}
  done:           {id}
  canceled:       {id}
Labels:
  spec_reviewed:  {label}
  client_prefix:  {prefix}
```

Ask user: "Does this mapping look correct? Any states missing or misnamed?"

**Store all confirmed values for step-06.**

---

**Next:** Read and follow `./steps/step-03-detect-forge.md`
