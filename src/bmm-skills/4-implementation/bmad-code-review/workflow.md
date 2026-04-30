# Code Review — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

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
| `FORGE` | `forge` | gitlab, github |
| `FORGE_CLI` | `forge_cli` | glab, gh |
| `FORGE_MR_LIST` | `forge_mr_list` | glab mr list |
| `FORGE_API_BASE` | `forge_api_base` | glab api |
| `FORGE_PROJECT_PATH` | `forge_project_path` | org/repo |
| `FORGE_PROJECT_PATH_ENCODED` | `forge_project_path_encoded` | org%2Frepo |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyProject |
| `WORKTREE_TEMPLATE_REVIEW` | `worktree_templates.review` | ../MyProject-review-{mr_iid} |
| `INSTALL_COMMAND` | `install_command` | pnpm install |
| `BUILD_COMMAND` | `build_command` | pnpm affected:build |
| `TEST_COMMAND` | `test_command` | pnpm affected:test |
| `LINT_COMMAND` | `lint_command` | pnpm lint |
| `FORMAT_FIX_COMMAND` | `format_fix_command` | pnpm format && pnpm lint --fix |
| `QUALITY_GATE` | `quality_gate` | pnpm typecheck && pnpm affected:test && pnpm lint && pnpm format:check |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rule for this workflow: **code must throw on unexpected values, never silently degrade. A log is NOT an alert.**

### 3. Load project knowledge (REQUIRED)

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — review perspectives (`#review-perspectives`), tech stack (`#tech-stack`), conventions (`#conventions`), test rules (`#test-rules`), investigation checklist (`#investigation-checklist`).
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` — API surface for endpoints under review.

HALT if either file is missing (run `/bmad-knowledge-bootstrap`).

### 4. Set defaults

- `REVIEW_MODE = null` (determined in step-01 after classification)
- `MR_IID = null` (populated by step-01)
- `CURRENT_USER = null` (detected in step-01)

### 5. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. **Important:** standalone `bmad-code-review` uses `Agent()` for parallel meta dispatch (preserved unchanged for backward compatibility per VM-NR-4 of story `auto-flow-orchestrator`). When invoked as a teammate (TEAMMATE_MODE=true), the Agent tool is removed at spawn time per Anthropic platform contract — running this workflow inside a teammate would FAIL at step-02.

Therefore: when TEAMMATE_MODE=true, this workflow MUST HALT in INITIALIZATION with:

```
HALT — bmad-code-review is not designed to run as a teammate.
  reason: bmad-code-review's step-02 spawns 5–7 metas via Agent(), which is removed from teammates at spawn time per Anthropic platform contract.
  action: orchestrators (bmad-auto-flow) MUST spawn the per-perspective subskills instead — see src/bmm-skills/4-implementation/bmad-code-review-perspective-{specs,correctness,security,engineering-quality,operations,user-facing}/.
  reference: spec auto-flow-orchestrator BAC-12, TAC-9, Risk-4.
```

When TEAMMATE_MODE=false (standalone), this workflow runs unchanged with full Agent() parallel dispatch.

---


### CHK-INIT — Initialization Read Receipt

Emit EXACTLY this block (filling in actual values you read), then proceed to the first step. If any line cannot be filled truthfully, HALT.

```
CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: {N} files (list filenames)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md ({"loaded" | "not required" | "required-but-missing"})
    - api.md ({"loaded" | "not required" | "required-but-missing"})
  worktree_path: {WORKTREE_PATH or "n/a"}
  team_mode: {true | false}
  teammate_mode: {must be false — HALT if true, see §5}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

## YOUR ROLE

You are an **adversarial code reviewer** — your job is to find what is wrong or missing. You:

1. Discover open MRs, cross-reference with tracker issues in review
2. Classify MRs (colleague, self-review, already-reviewed, draft)
3. Set up an isolated review worktree
4. Detect regression risk from stale rebases
5. Execute review via parallel `Agent()` calls (3 review-workers + 2 asymmetric security reviewers), consolidated by a dedicated `judge-triage` subagent
6. Present findings categorized by severity and action
7. Post findings to forge and/or tracker, approve or block

The orchestration uses the Claude Code `Agent` tool directly — N calls in a SINGLE orchestrator message execute concurrently. No experimental flags required, no tmux sessions to clean up, no `/resume` limitation.

**Tone:** factual, direct, adversarial. Find flaws, not confirmations. Challenge everything.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **ADVERSARIAL REVIEWER** — find what is wrong or missing
- **ZERO FALLBACK / ZERO FALSE DATA** — apply the shared rules loaded in initialization
- **NEVER review:** `_bmad/`, `_bmad-output/`, `.cursor/`, `.windsurf/`, `.claude/` folders
- **ALL review work MUST happen inside a worktree** — NEVER in the main repo
- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **RETROSPECTIVE IS MANDATORY** — after step-08 completes, execute `~/.claude/skills/bmad-shared/core/retrospective-step.md`. Do NOT end the workflow without it.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-gather-context.md` | Discover + classify MR, setup worktree, load context, compute diff, invoke regression-risk persona-skill, compute trigger routing (ACTIVE_METAS) |
| 2 | `step-02-review.md` | Parallel `Agent()` dispatch (colleague: 5-7 meta-agents; self: 2) in a SINGLE orchestrator message |
| 3 | `step-03-triage.md` | Single `Agent()` invocation of `judge-triage` — deduplicate, apply security voting consensus (S1/S2), classify `action`, compute per-meta scores + verdict |
| 4 | `step-04-present.md` | Present consolidated report, route actions (patch / decision_needed / defer / dismiss), post to forge + tracker, handle approval, run retrospective |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement. Step 04 has no nextStepFile — it's the terminal step.

## SUBAGENT WORKFLOWS

| Subagent | File | Used by |
| -------- | ---- | ------- |
| Meta-1 Contract & Spec Integrity | `subagent-workflows/meta-1-contract-spec.md` | Step 2 |
| Meta-2 Correctness & Reliability | `subagent-workflows/meta-2-correctness-reliability.md` | Step 2 |
| Meta-3 Security & Privacy (S1+S2) | `subagent-workflows/meta-3-security-privacy.md` | Step 2 |
| Meta-4 Engineering Quality | `subagent-workflows/meta-4-engineering-quality.md` | Step 2 |
| Meta-5 Operations & Deployment | `subagent-workflows/meta-5-operations-deployment.md` | Step 2 (conditional) |
| Meta-6 User-facing Quality | `subagent-workflows/meta-6-user-facing-quality.md` | Step 2 (conditional) |
| Judge-Triage | `subagent-workflows/judge-triage.md` | Step 3 (consolidation) |
| Regression-Risk (persona-skill) | `~/.claude/skills/bmad-review-regression-risk/workflow.md` | Step 1 (via Agent() prompt reference) |

## DATA FILES

| File | Content |
| ---- | ------- |
| `data/review-classification.md` | MR classification rules (colleague/self/already-reviewed/draft) |

## ENTRY POINT

Load and execute `./steps/step-01-discover.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Forge CLI not available or authentication error -> HALT
- Worktree creation fails -> HALT
- User explicitly requests stop -> HALT
- Security concern requiring immediate attention -> HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
