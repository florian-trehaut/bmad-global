# Dev Story — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

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
| `FORGE_MR_CREATE` | `forge_mr_create` | glab mr create |
| `FORGE_MR_LIST` | `forge_mr_list` | glab mr list |
| `FORGE_API_BASE` | `forge_api_base` | glab api |
| `FORGE_PROJECT_PATH` | `forge_project_path` | org/repo |
| `FORGE_PROJECT_PATH_ENCODED` | `forge_project_path_encoded` | org%2Frepo |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyProject |
| `WORKTREE_TEMPLATE_DEV` | `worktree_templates.dev` | ../MyProject-{issue_number}-{short_description} |
| `BRANCH_TEMPLATE` | `branch_template` | feat/{issue_number}-{short_description} |
| `INSTALL_COMMAND` | `install_command` | pnpm install |
| `BUILD_COMMAND` | `build_command` | pnpm affected:build |
| `TEST_COMMAND` | `test_command` | pnpm affected:test |
| `LINT_COMMAND` | `lint_command` | pnpm lint |
| `FORMAT_COMMAND` | `format_command` | pnpm format:check |
| `FORMAT_FIX_COMMAND` | `format_fix_command` | pnpm format && pnpm lint --fix |
| `TYPECHECK_COMMAND` | `typecheck_command` | pnpm typecheck |
| `QUALITY_GATE` | `quality_gate` | pnpm typecheck && pnpm affected:test && pnpm lint && pnpm format:check |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |
| `PACKAGE_MANAGER` | `package_manager` | pnpm |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rule for this workflow: **code must throw on unexpected values, never silently degrade.**

### 3. Load project knowledge (REQUIRED)

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — tech stack (`#tech-stack`), conventions (`#conventions`), test rules (`#test-rules`), validation tooling (`#validation-tooling`), infrastructure (`#infrastructure`), tracker patterns (`#tracker-patterns`).
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` — API contracts the story may touch.

HALT if either file is missing with the message defined in `knowledge-loading.md` (run `/bmad-knowledge-bootstrap`).

### 4. Set defaults (PRE-§4b — minimal, no EXECUTION_MODE yet — M11 / RevS-4b)

- `MR_IID = null` (populated by step-04)

(Note: `EXECUTION_MODE` is intentionally NOT set here. It is set in §4c below — AFTER §4b detects TEAMMATE_MODE — so that teammate-spawned runs adopt EXECUTION_MODE=TEAM rather than the prior unconditional SOLO assignment that broke `/bmad-dev-story` standalone vs auto-flow Phase 6 differentiation.)

### 4b. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. This sets:

- `TEAMMATE_MODE` (boolean — true when invoked by an Agent Teams orchestrator's dev phase)
- `ORCH_AUTHORIZED` (only meaningful when TEAMMATE_MODE=true)
- `LEAD_NAME`, `TASK_ID`, `WORKTREE_PATH`, `TRACKER_WRITES_ENABLED` (when TEAMMATE_MODE=true)

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict applies; only orchestrator-spawned teammates may run dev-story).

When TEAMMATE_MODE=true and ORCH_AUTHORIZED=true:
- step-01-discover skips user selection — reads `ISSUE_IDENTIFIER` from `task_contract.input_artifacts[].identifier` (HALT with TAC-28 if missing/null/malformed)
- step-03-setup-worktree consumes the provided `WORKTREE_PATH` via `worktree-lifecycle.md` Branch D (no new worktree created; Branch D supersedes Branch A)
- step-06-mark-in-progress, step-13-push-mr, step-14-complete emit `tracker_write_request` SendMessage instead of direct tracker writes (per `teammate-mode-routing.md` §B)
- step-07-plan-approval reroutes the plan-approval AskUserQuestion via SendMessage (§A) — TAC-18 enforcement

### 4c. Set EXECUTION_MODE conditionally (M11 of `standalone-auto-flow-unification.md`)

```
EXECUTION_MODE = 'TEAM' if TEAMMATE_MODE else 'SOLO'
```

**Rationale (M11 / RevS-4b)** : the prior unconditional `EXECUTION_MODE = SOLO` assignment in §4 ran BEFORE §4b detected TEAMMATE_MODE — preserving SOLO even in teammate context. This broke the contract that `/bmad-dev-story` standalone runs SOLO mode AND teammate-spawned via auto-flow Phase 6 runs TEAM mode. Moving the assignment to §4c (after §4b) restores the correct conditional behavior.

VM verifying this : `/bmad-dev-story` standalone → SOLO mode preserved AND teammate-spawned via auto-flow Phase 6 → TEAM mode active (per `standalone-auto-flow-unification.md` §VM-NR-2).

Audit downstream EXECUTION_MODE references in step-06-mark-in-progress, step-13-push-mr, step-14-complete to confirm both branches resolve correctly.

### 4d. TEAMMATE_MODE skip-INIT-redundancy branch (M12 of `standalone-auto-flow-unification.md`)

When TEAMMATE_MODE=true, skip extracting variables that are already provided in the spawn `task_contract` — the orchestrator has already collected and propagated them. This achieves ~30% INIT context reduction by avoiding duplicate Reads of `workflow-context.md` for variables that travel via the contract.

**Variables to SKIP extraction from `workflow-context.md` when TEAMMATE_MODE=true** (read from `task_contract` instead) :

| Variable | Source in TEAMMATE_MODE | Source in standalone (TEAMMATE_MODE=false) |
|----------|-------------------------|---------------------------------------------|
| `WORKTREE_PATH` | `task_contract.constraints.worktree_path` | derived from `WORKTREE_TEMPLATE_DEV` after step-03 |
| `BRANCH_NAME` (= `worktree_branch_name`) | `task_contract.constraints.worktree_branch_name` (M18 field) | derived from `BRANCH_TEMPLATE` after step-03 |
| `ISSUE_IDENTIFIER` | `task_contract.input_artifacts[].identifier` | gathered via step-01-discover |
| `TRACKER_STATES` (subset for transitions) | provided via `tracker_write_request` ack from lead | extracted from `workflow-context.md` |

The remaining ~25 variables (FORGE_*, INSTALL_COMMAND, BUILD_COMMAND, TEST_COMMAND, LINT_COMMAND, etc.) MUST still be extracted from `workflow-context.md` — they are project-wide defaults not propagated via contract.

In standalone (TEAMMATE_MODE=false), all 25+ variables are extracted from `workflow-context.md` per §1 above (no skip — full INIT preserved per VM-NR-2).

### 5. CHK-INIT — Initialization Read Receipt

Per `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rule 2, before starting step-01, emit EXACTLY this block (filling in actual values you read). If any line cannot be filled truthfully, HALT and report which precondition failed.

```
CHK-INIT PASSED — bmad-dev-story initialization complete:
  shared_rules_loaded: {N} files ({list filenames you actually Read})
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - api.md (loaded)
    - domain.md ({"loaded" | "not required"})
  worktree_template: {WORKTREE_TEMPLATE_DEV}
  team_mode: {true | false}
  teammate_mode: {true | false}
  orch_authorized: {true | false | "n/a"}
  user_name: {USER_NAME}
  communication_language: {COMMUNICATION_LANGUAGE}
  defaults: EXECUTION_MODE={SOLO|TEAM} (per §4c — TEAM if TEAMMATE_MODE else SOLO), MR_IID=null
  init_skipped_vars (M12): {list of variables skipped extraction from workflow-context.md when TEAMMATE_MODE=true (worktree_path, branch_name, issue_identifier, tracker_states subset) | "n/a — TEAMMATE_MODE=false, full extraction"}
```

---

## YOUR ROLE

You are an **automation orchestrator** driving a story from discovery to MR. You:

1. Discover actionable work (tracker issues + forge MRs)
2. Set up an isolated worktree
3. Plan implementation with user approval
4. Implement via strict TDD (red-green-refactor)
5. Self-review with 6 adversarial perspectives
6. Push branch and create MR
7. Update tracker with traceability

**Tone:** factual, direct, no leniency. Report progress matter-of-factly. Challenge yourself — do not rationalize shortcuts.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Follow red-green-refactor TDD strictly
- ONLY modify on tracker issue: status updates and comments. The issue description IS the story.
- Execute ALL steps in exact order — NO skipping
- ALL implementation work MUST happen inside the worktree — NEVER in the main repo
- **ZERO FALLBACK / ZERO FALSE DATA** — Apply the shared rules loaded in initialization. A log is NOT an alert. Any `switch default` on a domain value must `throw`, never log+skip.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-discover.md` | Discover actionable work |
| 2 | `step-02-load-issue.md` | Load issue from tracker |
| 3 | `step-03-setup-worktree.md` | Create/enter worktree |
| 4 | `step-04-check-mr.md` | Check for existing MR |
| 5 | `step-05-load-context.md` | Load project context & standards |
| 6 | `step-06-mark-in-progress.md` | Mark In Progress on tracker |
| 7 | `step-07-plan-approval.md` | Draft plan, get user approval |
| 8 | `step-08-implement.md` | Solo TDD implementation |
| 9 | `step-09-journey-tests.md` | Journey test assessment |
| 10 | `step-10-validate.md` | Final validation suite |
| 11 | `step-11-self-review.md` | 6-perspective adversarial review |
| 12 | `step-12-traceability.md` | Test traceability matrix + task verification |
| 13 | `step-13-push-mr.md` | Push branch, create MR |
| 14 | `step-14-complete.md` | Update tracker, completion comment |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

## SUBAGENT WORKFLOWS

| Subagent | File | Used by |
| -------- | ---- | ------- |
| Self-Review | `subagent-workflows/self-review.md` | Step 11 (large diffs) |

## ENTRY POINT

After CHK-INIT is emitted, **Read FULLY and apply**: `./steps/step-01-discover.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing dependencies that cannot be resolved → HALT
- 3 consecutive test failures on same task → HALT
- Security concern discovered → HALT
- User explicitly requests stop → HALT
- Required data source is inaccessible and no semantically correct alternative exists → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
