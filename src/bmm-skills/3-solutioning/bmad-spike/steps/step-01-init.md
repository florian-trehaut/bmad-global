---
nextStepFile: './step-02-frame.md'
---

# Step 1: Initialize

## STEP GOAL:

Check for in-progress spikes, greet the user, validate the request is a genuine spike (not disguised implementation), and create a temporary worktree for investigation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are an Investigation Facilitator — you structure the uncertainty, the user provides the question and constraints
- Collaborative dialogue — you ask, the user decides
- You bring technical/functional analysis rigor, the user brings domain knowledge

### Step-Specific Rules:

- Focus on understanding the investigation question at a high level — no deep investigation yet
- FORBIDDEN: jumping into investigation or writing code (that is Step 3)
- Validate this is a real spike: genuine uncertainty exists, the output is knowledge not production code
- Approach: casual, welcoming, get the user talking about what they need to figure out

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before proceeding
- Auto-proceed to next step (init step, no A/P/C menu)

---

## MANDATORY SEQUENCE

### 1. WIP Resume Check

Check if any `/tmp/bmad-wip-spike-*.md` file exists.

**If WIP file found:**

Read the WIP file frontmatter — extract `title`, `slug`, `stepsCompleted`, `status`, `timebox`.

Present to user:

> I found a spike investigation in progress:
>
> **{title}** (slug: `{slug}`)
> - Steps completed: {stepsCompleted}
> - Status: {status}
> - Timebox: {timebox}
>
> **[Y]** Resume where we left off
> **[N]** Archive and start fresh

WAIT for user selection.

- **IF Y:** Load WIP state (all accumulated sections) and jump to the next incomplete step
- **IF N:** Rename WIP file to `wip-spike-{slug}.archived.md`, then continue below
- **IF other:** Explain valid options and redisplay menu

### 2. Load Context

- Read `.claude/workflow-knowledge/tracker.md` if it exists — extract tracker constants, status mappings
- Load Project Context:
  1. Tracker documents (primary, using CRUD patterns from tracker.md): List documents for project {TRACKER_META_PROJECT_ID} → find "Project Context" → Get document by ID
  2. Fallback local: search for `**/project-context.md` in the project

### 3. Greet and Ask

Greet {USER_NAME} and ask what they want to investigate. Adapt tone to {COMMUNICATION_LANGUAGE}.

Prompt specifically: "What question do you need answered before committing to implementation? What is the uncertainty?"

WAIT for user input.

### 4. Spike Validation Gate

Validate this is a genuine spike, not disguised implementation:

1. **Does a specific question exist?** The user must have something they don't know, not "implement feature X"
2. **Is there genuine uncertainty?** The answer is not already obvious or documented
3. **Will the output be knowledge?** The deliverable is a decision/recommendation/findings, not production code

**If the request is actually implementation work:**

> This sounds like implementation work rather than an investigation. The spike workflow produces knowledge artifacts (ADR, trade-off analysis, PoC findings) — not production code.
>
> Would you prefer:
> - **quick-spec** — to write an implementation-ready specification
> - **dev-story** — to implement a story directly

WAIT for user decision. If they confirm it's a spike, continue. If they want spec/dev, exit and redirect.

### 5. Discover Existing Spike Issues

Check the tracker for existing spike issues that might relate (using CRUD patterns from tracker.md):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Label: Spike
- Limit: 10

If spikes found in Backlog/Todo:

> I found existing spike issues:
> {list with identifiers and titles}
>
> Is your investigation related to one of these, or is this a new spike?

WAIT for input. Store `SPIKE_ISSUE_ID` if linked to an existing issue, or `null` if new.

### 6. Understand and Derive Slug

Get the spike question as a clear statement. Derive a URL-safe slug (lowercase, hyphens, e.g., `auth-provider-feasibility`, `message-queue-comparison`).

### 7. Create Worktree

Create a temporary worktree for investigation:

```bash
git fetch origin main
git worktree add {WORKTREE_TEMPLATE_SPIKE} origin/main -b spike/{slug}
```

Where `{WORKTREE_TEMPLATE_SPIKE}` is resolved from `workflow-context.md` `worktree_templates.spike`, replacing `{slug}` with the derived slug.

**If worktree creation fails:** HALT — report error to user. Investigation requires a worktree.

Store `SPIKE_WORKTREE_PATH` = resolved worktree path.

**From this point on, ALL code investigation and PoC work runs inside {SPIKE_WORKTREE_PATH}.**

Log: "Worktree created: {SPIKE_WORKTREE_PATH} (synced with main) — PoC code will live here."

### 8. Save WIP File

Write `{wip_file}` (at `/tmp/bmad-wip-spike-{slug}.md`) with frontmatter:
- `title`, `slug`, `created: {date}`, `status: in-progress`
- `stepsCompleted: [1]`
- `spike_type: pending` (set in Step 2)
- `worktree_path: {SPIKE_WORKTREE_PATH}`
- `spike_issue_id: {SPIKE_ISSUE_ID or null}`
- `timebox: pending` (set in Step 2)
- `timebox_started: {timestamp}`
- `output_format: pending` (set in Step 2)

### 9. Auto-Proceed

Load, read entire file, then execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- WIP check performed
- Context loaded (tracker or local fallback)
- User's investigation question understood
- Spike validation gate passed (genuine uncertainty confirmed)
- Existing spike issues checked
- Slug derived, worktree created
- WIP file saved with initial state
- Next step loaded

### FAILURE:

- Skipping WIP check
- Not validating the request is a genuine spike
- Proceeding without worktree
- Not saving WIP before next step
- Jumping into investigation or code (too early)
