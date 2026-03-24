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

Read all files in `{project-root}/_bmad/core/bmad-shared/`.

Apply these rules for the entire workflow execution.

### 2. Configuration Loading

Load project context from `.claude/workflow-context.md` (if exists) and resolve:

- `user_name`, `communication_language`, `user_skill_level`
- Project conventions, forbidden patterns, test rules from `.claude/workflow-knowledge/stack.md`

**Communication:** Always speak in the configured `communication_language`.

### 3. Paths

- `wipFile` = `{implementation_artifacts}/spec-wip.md`

- `project_context` = `**/project-context.md` OR `.claude/workflow-knowledge/stack.md` (load if exists)

### 4. Related Workflows

- Escalation to planning: `/bmad-quick-spec` (tech-spec creation)
- Escalation to full method: `/bmad-create-prd` (PRD workflow)

---

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

After the final step completes (whether successfully or via early termination), read fully and follow `{project-root}/_bmad/core/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements. **This step is CONDITIONAL** — it only activates if difficulties were encountered.
