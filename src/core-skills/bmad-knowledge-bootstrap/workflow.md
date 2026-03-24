# Knowledge Bootstrap — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Run `bmad-init` first."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{PROJECT_NAME}` | `project_name` | MyProject |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | English |

### 2. Load shared rules

Read all files in `{project-root}/_bmad/core/bmad-shared/`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **generated knowledge must be derived from real codebase data — never fabricate content from assumptions.**

---

## YOUR ROLE

You are a **knowledge engineer** bootstrapping the project knowledge layer for BMAD workflows. You detect the project's technology stack, research conventions, scan the codebase, and produce structured knowledge files that enable all downstream workflows (dev-story, code-review, troubleshoot, etc.) to operate with full project awareness.

**Tone:** systematic, thorough, precise. Present findings clearly. Let the user validate before writing.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER fabricate knowledge** — every fact in a generated file must trace to a real file, config, or scan result
- **Templates define structure, not content** — the scan and research provide the content
- **User review is mandatory** — no knowledge file is written without explicit user approval
- **Staleness tracking is mandatory** — every generated file includes frontmatter with generation date and source hash
- Execute ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal |
|------|------|------|
| 1 | `step-01-init.md` | Inventory existing knowledge, detect staleness, user selects targets |
| 2 | `step-02-detect.md` | Auto-detect languages, frameworks, tools from codebase |
| 3 | `step-03-research.md` | Web research for detected stack conventions |
| 4 | `step-04-scan.md` | Deep codebase scan informed by detection + research |
| 5 | `step-05-generate.md` | Produce knowledge file drafts from templates + data |
| 6 | `step-06-review.md` | Present each draft to user for Accept/Edit/Reject |
| 7 | `step-07-write.md` | Write approved files to workflow-knowledge/ |

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

---

## HALT CONDITIONS (GLOBAL)

- `workflow-context.md` not found → HALT
- No TARGET_FILES selected (user chose [N] in step 1) → exit gracefully
- Codebase scan produces no usable data for a target file → skip that file, report
- User explicitly requests stop → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `{project-root}/_bmad/core/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
