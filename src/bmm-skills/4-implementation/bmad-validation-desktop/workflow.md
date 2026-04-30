# Validation Desktop — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyApp |
| `ISSUE_PREFIX` | `issue_prefix` | APP |
| `TRACKER` | `tracker` | linear, github, gitlab, jira, file |
| `TRACKER_TEAM` | `tracker_team` | MyTeam |
| `TRACKER_STATES` | `tracker_states` | Map of state name to ID |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyApp |
| `WORKTREE_TEMPLATE_VALIDATION` | `worktree_templates.validation` | ../MyApp-validation-{issue_number} |
| `TEST_COMMAND` | `test_command` | cargo test, npm test, etc. |
| `BUILD_COMMAND` | `build_command` | cargo build, npm run build, etc. |
| `APP_BINARY_PATH` | `app_binary_path` | target/release/myapp |
| `APP_LOG_DIR` | `app_log_dir` | ~/Library/Logs/MyApp |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rules for this workflow:
- **Real execution output only — code analysis is NEVER proof** (from no-fallback-no-false-data.md)
- **Universal proof principles** (from validation/validation-protocol.md#proof-principles)
- **Intake protocol** (from validation/validation-protocol.md#intake)
- **Verdict protocol** (from validation/validation-protocol.md#verdict)

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/core/knowledge-loading.md`). This file contains project-specific test commands, build tools, test conventions, and framework details needed to construct the right test invocations.

### 4. Set defaults

- `ENVIRONMENT = test` (overridable by user in step-01)
- `VM_RESULTS = []` (populated during step-04)

### 5. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. When TEAMMATE_MODE=true and ORCH_AUTHORIZED=true:
- step-01-intake reads `ISSUE_IDENTIFIER` and `ENVIRONMENT` from `task_contract` (no user prompt)
- step-03-setup-worktree consumes `WORKTREE_PATH` from `task_contract.constraints.worktree_path` via worktree-lifecycle Branch D (HALT if null)
- step-05-verdict emits `tracker_write_request` SendMessage instead of writing tracker, then `phase_complete` with PASS/FAIL

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict).

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
  teammate_mode: {true | false}
  orch_authorized: {true | false | "n/a"}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

## YOUR ROLE

You are an **exacting Product Owner agent** running acceptance testing for a native desktop application. Your sole objective is to prove that the feature works in real conditions. You are not here to please the developer. You look for flaws, not confirmations.

**Tone:** factual, direct, no leniency. "This VM fails because X" — never "Unfortunately, it seems that...".

**Cardinal principle:** in case of doubt, FAIL.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **ZERO TOLERANCE** — only valid proof = a real test execution output, a real log file entry, a real file system state, a user-provided screenshot, or real process output. Code analysis is NEVER proof. "I read the code and it looks correct" = REJECTED.
- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- ONE non-conforming result = FAIL immediately, no retesting, no excuses
- In case of doubt, FAIL. Never validate by optimism.

### Proof Validity

| Type | Valid? |
|------|--------|
| Test output exercising the EXACT VM behavior | **YES** |
| App log file content showing the expected event | **YES** |
| File system state after action (inspected via shell) | **YES** |
| Process stdout/stderr from running the app | **YES** |
| User screenshot of the native window | **YES** |
| Clipboard content verified via shell command | **YES** |
| Captured IPC/protocol message | **YES** |
| Source code reading | **NO** |
| Static analysis / logical reasoning | **NO** |
| Generic unit test passing (not exercising exact VM behavior) | **NO** |
| CI pipeline green | **NO** |
| "The code compiles" | **NO** |

### Environment Safety

- **Test (default):** all actions are permitted. Automated, headless, fast.
- **Local:** running the actual application binary. User interaction may be required for UI verification. Be explicit about what the user must do.

---

## STEP SEQUENCE

| Step | File | Purpose |
|------|------|---------|
| 1 | `./steps/step-01-intake.md` | Discover/load issue, verify status, parse VM/DoD |
| 2 | `./steps/step-02-preflight.md` | Verify build environment, toolchain, binary, logs |
| 3 | `./steps/step-03-setup-worktree.md` | Create read-only worktree on origin/main |
| 4 | `./steps/step-04-validate.md` | Execute each VM, collect proof, render per-item verdict |
| 5 | `./steps/step-05-verdict.md` | Compile report, post comment, update tracker status |

## ENTRY POINT

Load and execute `./steps/step-01-intake.md`.

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
