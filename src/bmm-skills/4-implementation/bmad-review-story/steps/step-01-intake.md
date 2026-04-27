# Step 1: Intake

## STEP GOAL

Select the story to review, setup a read-only investigation worktree, load the story and all related context from the tracker.

## RULES

- NEVER auto-select a story without user confirmation
- ALL investigation work MUST happen inside the worktree — NEVER in the main repo
- The worktree is READ-ONLY — NEVER modify files inside it
- Exclude already-reviewed stories (with `{LABELS.spec_reviewed}` label) from discovery
- Communicate in `{COMMUNICATION_LANGUAGE}` with `{USER_NAME}`

## SEQUENCE

### 1. Obtain the issue identifier

**If the user provided an identifier (e.g., {ISSUE_PREFIX}-XXX)** — store `ISSUE_IDENTIFIER`, skip to step 3.

**If no identifier provided** — launch discovery:

#### 1a. Discover stories ready for spec review

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) to list candidate issues:

- Operation: List issues
- Team: {TRACKER_TEAM}
- Status: {TRACKER_STATES.todo}
- Limit: 25

Then also:

- Operation: List issues
- Team: {TRACKER_TEAM}
- Status: {TRACKER_STATES.backlog}
- Limit: 25

#### 1b. Filter out already-reviewed stories

For each issue, check labels — exclude issues with label `{LABELS.spec_reviewed}`.
Also exclude issues with empty or trivial descriptions (chores, spikes with no ACs).

#### 1c. Present candidates

```
## Stories available for spec review

| # | Issue | Title | Status | Labels | Description preview |
|---|-------|-------|--------|--------|---------------------|
| 1 | {PREFIX}-XXX | ... | Todo | ... | First 80 chars... |
| 2 | {PREFIX}-YYY | ... | Backlog | ... | First 80 chars... |

Which story do you want to review? (number or identifier)
```

WAIT for user selection.

Store `ISSUE_IDENTIFIER`.

### 2. (Reserved — numbering preserved)

### 3. Load story details

Fetch the full story from the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Get issue
- Issue: {ISSUE_IDENTIFIER}

Store: `ISSUE_ID`, `ISSUE_TITLE`, `ISSUE_DESCRIPTION` (full), labels, project, state, assignee, comments.

### 4. Setup worktree

Create a read-only worktree on `origin/main` (up to date):

Use the `WORKTREE_TEMPLATE_REVIEW` from workflow-context.md, replacing `{issue_number}` with the current issue number extracted from `ISSUE_IDENTIFIER`.

```
WORKTREE_PATH = "{WORKTREE_TEMPLATE_REVIEW with {issue_number} replaced}"
```

Check for existing worktree:

```bash
git worktree list | grep "{WORKTREE_PATH base name}"
```

**If the worktree exists:**
```bash
cd {WORKTREE_PATH}
git fetch origin
git checkout origin/main --detach
```

**If the worktree does not exist:**
```bash
git fetch origin main
git worktree add --detach {WORKTREE_PATH} origin/main
```

Verify:
```bash
cd {WORKTREE_PATH} && git log --oneline -1
```

Display: "Worktree created on `origin/main` ({commit_short}) — read-only investigation."

All subsequent file reads and code analysis MUST use the worktree path.

### 5. Load related context

**Search for related context in the tracker:**
- Load the project (epic) this story belongs to — if any
- Check for linked issues, parent issues, blocking/blocked relationships
- Check for related tracker documents (PRD, architecture) in the same project

**Load project context from codebase:**
- Read the project context file (from `{OUTPUT_FOLDER}` or `**/project-context.md`) from the worktree for architecture and codebase overview

**Identify the domain/flux concerned by this story:**
- From the story description, determine which services, modules, and data flows are involved
- List: services, packages, libs, infra modules, DB schemas

### 6. Load Architecture Decision Records (if available)

Check `adr_location` from workflow-context.md.

<check if="adr_location is set and not 'none'">
  Load all ADRs from the configured location inside {WORKTREE_PATH}. When multiple ADRs on the same topic, the most recent takes precedence.
  Store as `PROJECT_ADRS` — the spec review must verify the story doesn't violate active ADRs and flags any need for new ADRs.
</check>

### 7. Create intermediate output file

Create a local intermediate file at `{OUTPUT_FOLDER}/review-story-{issue_number}.md`:

```markdown
---
issue_id: {ISSUE_IDENTIFIER}
issue_title: "{ISSUE_TITLE}"
review_date: {date}
status: IN_PROGRESS
sources_investigated: []
findings: []
---

# Spec Review — {ISSUE_IDENTIFIER}: {ISSUE_TITLE}

## Story Description

{full story description from tracker}

## Related Context

- Project/Epic: {project name or "none"}
- Linked issues: {list or "none"}
- Related documents: {list or "none"}

## Domain Analysis

- Services involved: {list}
- DB schemas: {list}
- Infra modules: {list}
```

### 8. Proceed

Load and execute `./steps/step-02-access-verification.md`.
