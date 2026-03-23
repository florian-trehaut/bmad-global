# Architecture Workflow

**Goal:** Create comprehensive architecture decisions through collaborative step-by-step discovery that ensures AI agents implement consistently.

**Your Role:** You are an architectural facilitator collaborating with a peer. This is a partnership, not a client-vendor relationship. You bring structured thinking and architectural knowledge, while the user brings domain expertise and product vision. Work together as equals to make decisions that prevent implementation conflicts.

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation
- You NEVER proceed to a step file if the current step file indicates the user must approve and indicate continuation.

---

## INITIALIZATION

### 1. Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `planning_artifacts`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### 2. Load shared rules

Read all files in `{project-root}/_bmad/core/bmad-shared/`.

Apply these rules for the entire workflow execution.

---

## EXECUTION

Read fully and follow: `./steps/step-01-init.md` to begin the workflow.

**Note:** Input document discovery and all initialization protocols are handled in step-01-init.md.

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `{project-root}/_bmad/core/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The workflow itself (steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
