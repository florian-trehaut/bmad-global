# Quick Spec — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Guide the user through conversational spec engineering -- capture business context and user journey, ask sharp questions, investigate code in a temporary worktree, and produce an implementation-ready specification (business + technical) published as a tracker issue with Validation Metier checklist.

**Your Role:** Spec Engineering Facilitator. You are a collaborative partner who asks informed questions, investigates code deeply, and helps the user produce complete, actionable specs.

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyProject |
| `ISSUE_PREFIX` | `issue_prefix` | PRJ |
| `TRACKER` | `tracker` | linear, github, gitlab, jira |
| `TRACKER_TEAM` | `tracker_team` | MyTeam |
| `TRACKER_TEAM_ID` | `tracker_team_id` | UUID |
| `TRACKER_META_PROJECT_ID` | `tracker_meta_project_id` | UUID |
| `TRACKER_STATES` | `tracker_states` | Map of state name to ID |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyProject |
| `WORKTREE_TEMPLATE_SPEC` | `worktree_templates.quick_spec` | ../MyProject-spec-{slug} |
| `BRANCH_TEMPLATE` | `branch_template` | feat/{issue_number}-{short_description} |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |
| `USER_SKILL_LEVEL` | `user_skill_level` | expert |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rule for this workflow: **verify story ACs don't rely on fallback assumptions. When defining status mappings or data transformations in specs, explicitly state "unknown value must throw + alert" as an AC.**

### 3. Load stack knowledge (optional)

If `.claude/workflow-knowledge/stack.md` exists at project root, read it. This file contains tech stack details, forbidden patterns, test rules, and reference code pointers.

### 4. Set WIP variables

```yaml
wip_file: "/tmp/bmad-wip-quick-spec-{slug}.md"
```

### 5. Set related workflow paths

```yaml
related_workflows:
  advanced_elicitation: "~/.claude/skills/bmad-advanced-elicitation/SKILL.md"
  party_mode: "~/.claude/skills/bmad-party-mode/workflow.md"
  adversarial_review: "~/.claude/skills/bmad-review-adversarial-general/SKILL.md"
```

If any of these files do not exist, the corresponding menu option (A/P/R) is silently unavailable.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file (~80-200 lines)
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **State Tracking**: Progress tracked via WIP file frontmatter (`stepsCompleted`)
- **Subprocess Optimization**: Use subprocess/subagent tools when available for parallel operations

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C'
5. **SAVE STATE**: Update WIP file before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update WIP file when step completes
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps
- If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- **ZERO FALLBACK / ZERO FALSE DATA** — Apply the shared rules loaded in initialization

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-init.md` | Resume WIP, greet, understand request, create worktree |
| 2 | `step-02-orient.md` | Quick scan (tracker + codebase), ask informed questions |
| 2b | `step-02b-business-context.md` | User journey, BACs, external deps, VM checklist |
| 3 | `step-03-investigate.md` | Deep code analysis in worktree (read-only) |
| 4 | `step-04-model.md` | Data model, API contracts, infra assessment |
| 4b | `step-04b-interfaces.md` | External interfaces, data mapping |
| 5 | `step-05-plan.md` | Implementation plan with tasks, test strategy |
| 5b | `step-05b-impact.md` | Trace all callers/dependents, non-regression items |
| 6 | `step-06-review.md` | Present complete spec, adversarial review |
| 7 | `step-07-create-issue.md` | Create tracker issue with full description |
| 8 | `step-08-cleanup.md` | Remove worktree, delete WIP, summary |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `.claude/workflow-context.md` → HALT
- Worktree creation fails → HALT
- Tracker API call fails for issue creation → HALT (no silent fallback to local file)
- User explicitly requests stop → HALT
- Required data source is inaccessible and no semantically correct alternative exists → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
