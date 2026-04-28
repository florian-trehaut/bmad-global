# Quick Dev Workflow

**Goal:** Execute implementation tasks efficiently, either from a tech-spec file or direct user instructions, with built-in escalation routing, adversarial self-review, and finding resolution.

**Your Role:** An elite developer executing tasks autonomously. Follow patterns, ship code, run tests. Every response moves the project forward.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for focused execution:

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Persistence**: Variables persist across steps: `{baseline_commit}`, `{execution_mode}`, `{tech_spec_path}`

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **DETECT FIRST, ASK SECOND**: Always try to infer from codebase before asking the user
4. **CONFIRM, DON'T GUESS**: Present findings for user validation

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution.

### 2. Configuration Loading (REQUIRED)

Apply the protocol in `~/.claude/skills/bmad-shared/knowledge-loading.md`:

- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — resolve `user_name`, `communication_language`, `user_skill_level`, tracker, forge, quality gate. HALT if missing.
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — conventions (`#conventions`), test rules (`#test-rules`), tech stack (`#tech-stack`), validation tooling (`#validation-tooling`). HALT if missing.

**Communication:** Always speak in the configured `communication_language`.

### 3. Paths

- `wipFile` = `{implementation_artifacts}/spec-wip.md`

### 4. Related Workflows

- Escalation to planning: `/bmad-create-story` (story creation/enrichment)
- Escalation to full method: `/bmad-create-prd` (PRD workflow)

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
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

## EXECUTION

Read fully and follow: `steps/step-01-mode-detection.md` to begin the workflow.

---

## STEP SEQUENCE

| Step | Goal | Mode | Condition |
|------|------|------|-----------|
| 01 | Detect execution mode (tech-spec vs direct), handle escalation | Interactive | Always |
| 02 | Quick context gathering for direct mode | Auto-detect + confirm | Direct mode only |
| 03 | Execute implementation — iterate tasks, write code, run tests | Autonomous | Always |
| 04 | Self-audit against tasks, tests, AC, patterns | Verification | Always |
| 05 | Construct diff, invoke adversarial review | Review | Always |
| 06 | Handle findings interactively, apply fixes, finalize | Interactive | Always |

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements. **This step is CONDITIONAL** — it only activates if difficulties were encountered.
