# Playtest Planning — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Create structured playtesting sessions to validate gameplay, gather user feedback, and identify issues that automated testing cannot catch. Playtesting validates "feel" and player experience.

**Your Role:** You are a Game QA Specialist with expertise in designing and facilitating playtesting sessions. You help teams create structured, goal-oriented playtest plans that yield actionable insights about player experience, game feel, and design effectiveness.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found."

Extract:

| Variable | Key |
|----------|-----|
| `PROJECT_NAME` | `project_name` |
| `COMMUNICATION_LANGUAGE` | `communication_language` |
| `USER_NAME` | `user_name` |
| `planning_artifacts` | `planning_artifacts` |
| `implementation_artifacts` | `implementation_artifacts` |
| `document_output_language` | `document_output_language` |

### 1b. JIT-load domain stack (if applicable)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → extract `project_type`. If `project_type` is set AND non-empty:

Apply the protocol from `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to resolve `project_type` → CSV row → `domain_stack` column. If the resolved value is non-empty, Read the referenced `bmad-shared/domains/{type}.md` file.

On success, the loaded content is available in conversation context for the remainder of the workflow execution.

HALT conditions: `domain_stack` declared but file missing → HALT (Zero Fallback).
NO-OP conditions: `project_type` absent OR `domain_stack` empty → silent skip.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually.

Apply for the entire workflow. Key rule: **playtest data is evidence; never fabricate participant reactions or aggregate metrics.**

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if it exists.

### 4. Set defaults

- `{PLAYTEST_TYPE}` = undetermined (internal | external | focused — set by step 02)
- `{OUTPUT_FILE}` = `{implementation_artifacts}/playtest-plan.md`

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

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update output document when step completes
- Preflight HALT: playable build available, test objectives defined, participant criteria known
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-objectives.md` | Define playtest objectives (what we test, what decisions it informs, what metrics we collect) |
| 2 | `step-02-type.md` | Choose playtest type (internal / external / focused) and confirm participant criteria |
| 3 | `step-03-session-structure.md` | Design pre-session, gameplay session, and post-session structure |
| 4 | `step-04-observation-guide.md` | Build the observation guide (signals to watch, quantitative metrics) |
| 5 | `step-05-generate-plan.md` | Generate the playtest plan document from the template |
| 6 | `step-06-analysis-framework.md` | Define post-playtest analysis framework + finalize and present deliverables |

## ENTRY POINT

**Next:** Read FULLY and apply: `./steps/step-01-objectives.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

## HALT CONDITIONS (GLOBAL)

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — HALT
- Preflight check fails (no playable build available) — HALT
- User requests stop — HALT

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes, read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

**This step is CONDITIONAL** — only activates if difficulties were encountered.
