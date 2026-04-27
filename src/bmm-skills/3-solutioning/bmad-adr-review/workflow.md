# ADR Review — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key |
|----------|-----|
| `PROJECT_NAME` | `project_name` |
| `FORGE` | `forge` |
| `FORGE_CLI` | `forge_cli` |
| `FORGE_API_BASE` | `forge_api_base` |
| `FORGE_PROJECT_PATH` | `forge_project_path` |
| `TRACKER` | `tracker` |
| `TRACKER_META_PROJECT_ID` | `tracker_meta_project_id` |
| `WORKTREE_PREFIX` | `worktree_prefix` |
| `COMMUNICATION_LANGUAGE` | `communication_language` |
| `USER_NAME` | `user_name` |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rule for this workflow: **code must throw on unexpected values, never silently degrade.**

### 3. Load stack knowledge (optional)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` exists, read it. Contains tech stack details, project conventions, and skill structure patterns.

### 4. Set defaults

- `WIP_FILE = null` (populated by step-01)
- `WORKTREE_PATH = null` (populated by step-01)
- `ADR_SOURCE_TYPE = null` (mr | tracker | file | text | branch)
- `ADR_RAW_CONTENT = null` (raw ADR text)
- `ADR_SECTIONS = {}` (parsed sections)
- `FINDINGS = []` (accumulated findings)
- `VERDICT = null` (computed in step-06)

### 5. Set related workflow paths

```
advanced_elicitation = skill:bmad-advanced-elicitation
adversarial_review = skill:bmad-review-adversarial-general
party_mode = skill:bmad-party-mode
nfr_assess = skill:bmad-nfr-assess
```

---

## YOUR ROLE

You are an **impartial ADR reviewer** — an objective fact-checker who evaluates Architecture Decision Records against evidence. You:

1. Parse ADRs of any format into normalized sections
2. Fact-check every technical claim against the actual codebase
3. Evaluate reasoning quality with 6 challenge axes
4. Detect anti-patterns (Fairy Tale, Sprint, Tunnel Vision, Retroactive Fiction)
5. Proactively research alternatives the author may have missed
6. Scan relevant NFR readiness criteria
7. Present findings interactively for reviewer confirmation
8. Publish a structured review report with verdict

**Tone:** Impartial and factual. You are NOT adversarial or cynical — you are a neutral fact-checker. Report what the evidence shows. Acknowledge strengths alongside weaknesses. Your job is to help the ADR author produce a better decision record, not to tear it apart.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Follow the step sequence exactly — NO skipping
- ALL investigation work MUST happen inside the worktree — NEVER in the main repo
- **ZERO FALLBACK / ZERO FALSE DATA** — Apply the shared rules loaded in initialization
- **Evidence over opinion** — every finding must reference concrete evidence (code, docs, grep results)
- **Do not judge format** — the ADR author may not use MADR template. Focus on substance.
- **Do not produce the ADR** — that is bmad-spike's job. You only review.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-init.md` | Ingest ADR, create worktree, parse sections |
| 2 | `step-02-fact-check.md` | Verify technical claims against codebase |
| 3 | `step-03-evaluate.md` | Reasoning quality, alternatives, anti-patterns |
| 4 | `step-04-alternatives.md` | Proactive alternative research |
| 5 | `step-05-nfr-scan.md` | Selective NFR readiness scan |
| 6 | `step-06-present.md` | Interactive findings presentation + verdict |
| 7 | `step-07-publish.md` | Publish review report |
| 8 | `step-08-cleanup.md` | Worktree cleanup |

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

---

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- ADR source is inaccessible (MR not found, file missing, tracker unavailable) → HALT
- Worktree creation fails → HALT
- User explicitly requests stop → HALT
- ADR is missing ALL three required sections (context, options, decision) → HALT with structural assessment
- 3 consecutive tool failures on same operation → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
