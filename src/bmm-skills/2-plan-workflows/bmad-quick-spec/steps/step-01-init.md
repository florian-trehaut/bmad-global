---
nextStepFile: './step-02-orient.md'
---

# Step 1: Initialize

## STEP GOAL:

Check for in-progress specs, greet the user, understand their request, and create a temporary worktree for code investigation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator, not a generator
- Collaborative dialogue -- you ask, the user decides
- You bring technical investigation, the user brings domain knowledge

### Step-Specific Rules:

- Focus on understanding the request at a high level -- no deep questions yet
- FORBIDDEN: asking detailed technical questions (that's Step 2)
- Approach: casual, welcoming, get the user talking

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Auto-proceed to next step (init step, no A/P/C menu)

---

## MANDATORY SEQUENCE

### 1. WIP Resume Check

Check if any `{project-root}/.claude/wip-quick-spec-*.md` file exists.

**If WIP file found:**

Read the WIP file frontmatter -- extract `title`, `slug`, `stepsCompleted`, `status`.

Present to user:

> I found a draft in progress:
>
> **{title}** (slug: `{slug}`)
> - Steps completed: {stepsCompleted}
> - Status: {status}
>
> **[Y]** Resume where we left off
> **[N]** Archive and start fresh

WAIT for user selection.

- **IF Y:** Load WIP state (all accumulated sections) and jump to the next incomplete step
- **IF N:** Rename WIP file to `wip-quick-spec-{slug}.archived.md`, then continue below
- **IF other:** Explain valid options and redisplay menu

### 2. Load Context

- Read `.claude/workflow-knowledge/tracker.md` if it exists -- extract tracker constants, status mappings
- Load Project Context:
  1. Tracker documents (primary): use `{TRACKER_MCP_PREFIX}list_documents(projectId: '{TRACKER_META_PROJECT_ID}')` -> find "Project Context" -> `{TRACKER_MCP_PREFIX}get_document(id: doc_id)`
  2. Fallback local: search for `**/project-context.md` in the project

### 3. Greet and Ask

Greet {USER_NAME} and ask what they want to spec today. Adapt tone to {COMMUNICATION_LANGUAGE}. Keep it casual and open-ended -- bug, task, feature, improvement, anything goes.

WAIT for user input.

### 4. Understand and Derive Slug

Get their initial description. Understand enough to know the domain and derive a URL-safe slug (lowercase, hyphens).

### 5. Create Worktree

Create a temporary worktree for investigation:

```bash
git fetch origin main
git worktree add {WORKTREE_TEMPLATE_SPEC} origin/main -b spec/{slug}
```

Where `{WORKTREE_TEMPLATE_SPEC}` is resolved from `workflow-context.md` `worktree_templates.quick_spec`, replacing `{slug}` with the derived slug.

**If worktree creation fails:** HALT -- report error to user. Investigation requires a worktree.

Store `SPEC_WORKTREE_PATH` = resolved worktree path.

**From this point on, ALL code investigation runs inside {SPEC_WORKTREE_PATH}.**

Log: "Worktree created: {SPEC_WORKTREE_PATH} (synced with main)"

### 6. Save WIP File

Write `{wip_file}` (at `{project-root}/.claude/wip-quick-spec-{slug}.md`) with frontmatter:
- `title`, `slug`, `created: {date}`, `status: in-progress`
- `stepsCompleted: [1]`, `type: {type}`
- `worktree_path: {SPEC_WORKTREE_PATH}`

### 7. Auto-Proceed

Load, read entire file, then execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- WIP check performed
- Context loaded (tracker or local fallback)
- User's request understood, slug derived
- Worktree created successfully
- WIP file saved with initial state
- Next step loaded

### FAILURE:

- Skipping WIP check
- Proceeding without worktree
- Not saving WIP before next step
- Asking detailed technical questions (too early)
