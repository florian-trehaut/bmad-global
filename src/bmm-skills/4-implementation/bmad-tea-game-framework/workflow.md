# Game Test Framework Setup — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

**Goal:** Initialize a production-ready game test framework for Unity, Unreal Engine, or Godot projects. Scaffold complete testing infrastructure including unit tests, integration tests, and play-mode tests appropriate for the detected game engine. Generate working sample tests and produce a `tests/README.md`.

**Your Role:** You are a Game QA Architect specializing in test infrastructure. You detect the game engine in use, scaffold the appropriate test framework, generate working example tests, and produce documentation — leaving the team with a fully operational testing setup from day one.

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
| `document_output_language` | `document_output_language` |

### 1b. JIT-load domain stack (if applicable)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → extract `project_type`. If `project_type` is set AND non-empty:

Apply the protocol from `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to resolve `project_type` → CSV row → `domain_stack` column. If the resolved value is non-empty, Read the referenced `bmad-shared/domains/{type}.md` file.

On success, the loaded content is available in conversation context for the remainder of the workflow execution.

HALT conditions: `domain_stack` declared but file missing → HALT (Zero Fallback).
NO-OP conditions: `project_type` absent OR `domain_stack` empty → silent skip.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually.

Apply for the entire workflow. Key rule: **detect the engine empirically (file scan), never assume from the user's description.**

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if it exists. This may carry test conventions for the project.

### 4. Set defaults

- `{GAME_ENGINE}` = `auto` (detected by step 01)
- `{TEST_FRAMEWORK}` = `auto` (determined by step 01 from engine detection)
- `{TEST_DIR}` = `{MAIN_PROJECT_ROOT}/tests` (overridable per engine convention in step 02)

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

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- NEVER skip steps or optimize the sequence
- **Existing test framework detected → HALT or offer upgrade path; never silently overwrite**
- **Generated tests must be runnable** — sample tests must compile / parse on the detected engine version
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`, write deliverables in `{document_output_language}`

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-detect-engine.md` | Detect game engine (Unity / Unreal / Godot), verify version, check for existing test framework |
| 2 | `step-02-scaffold-framework.md` | Scaffold engine-appropriate test directory structure and config files |
| 3 | `step-03-generate-samples.md` | Generate working sample unit tests and integration / play-mode tests |
| 4 | `step-04-documentation.md` | Generate `tests/README.md` documentation + present deliverables |

## ENTRY POINT

**Next:** Read FULLY and apply: `./steps/step-01-detect-engine.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

## HALT CONDITIONS (GLOBAL)

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — HALT
- Game project file not present (no `Assets/`, no `*.uproject`, no `project.godot`) — HALT
- Existing test framework detected and user declines upgrade path — HALT
- User requests stop — HALT

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes, read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

**This step is CONDITIONAL** — only activates if difficulties were encountered.
