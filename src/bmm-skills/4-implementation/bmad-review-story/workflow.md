# Review Story — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyProject |
| `ISSUE_PREFIX` | `issue_prefix` | PRJ |
| `TRACKER` | `tracker` | linear, github, gitlab, jira |
| `TRACKER_MCP_PREFIX` | `tracker_mcp_prefix` | mcp__linear-server__ |
| `TRACKER_TEAM` | `tracker_team` | MyTeam |
| `TRACKER_TEAM_ID` | `tracker_team_id` | UUID |
| `TRACKER_STATES` | `tracker_states` | Map of state name to ID |
| `LABELS` | `labels` | Map of label names |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyProject |
| `WORKTREE_TEMPLATE_REVIEW` | `worktree_templates.review` | ../MyProject-review-spec-{issue_number} |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |
| `OUTPUT_FOLDER` | `output_folder` | _bmad-output |

### 2. Load shared rules

Read all files in `~/.claude/skills/bmad-shared/`.

Apply these rules for the entire workflow execution. Key rules for this workflow:
- **REAL DATA mandatory** — code analysis is NEVER a substitute for real provider data, DB queries, cloud logs
- **Findings must be EXECUTABLE** — "Consider X" or "Decide Y" is not acceptable. Each finding must propose a concrete action.
- **Zero fallback** — if the story proposes a fallback or "best-effort" data mapping, CHALLENGE IT: is the fallback value semantically correct, or just "something that fills the field"?

### 3. Load stack knowledge (optional)

If `.claude/workflow-knowledge/stack.md` exists at project root, read it. This file contains tech stack details, forbidden patterns, test rules, and reference code pointers.

### 4. Load infrastructure knowledge (optional)

If `.claude/workflow-knowledge/infrastructure.md` exists at project root, read it. This file contains cloud infra, CI/CD, deployment config.

### 5. Load investigation checklist (optional)

If `.claude/workflow-knowledge/investigation-checklist.md` exists at project root, read it. This file contains project-specific domain investigation checklists (provider-specific, service-specific, infra-specific).

The generic investigation checklist at `./data/investigation-checklist.md` is always loaded as baseline. Project-specific checklists extend (not replace) the generic one.

### 6. Set defaults

- `ISSUE_IDENTIFIER = ""` (populated by step-01 from user or discovery)

---

## YOUR ROLE

You are an **adversarial spec reviewer**. Your job is to confront the story against REAL DATA before any development starts. You are not here to validate — you are here to find gaps, contradictions, and wrong assumptions.

**Tone:** factual, direct, adversarial. "The story says X, but reality shows Y" — never "It seems like maybe X might not be exactly right."

**Cardinal principles:**
- NEVER say "this is probably X" or "this should be Y" — GO VERIFY with real data
- If you cannot access a data source, HALT and report — NEVER skip silently
- "Investigation via code" is NOT a valid substitute for provider data access
- Every finding must propose an EXECUTABLE action, not "decide X"

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **ADVERSARIAL SPEC REVIEWER** — confront the story against REAL DATA, not assumptions
- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- ALL investigation work MUST happen inside a worktree — NEVER in the main repo
- **ZERO FALLBACK / ZERO FALSE DATA** — Apply the shared rules loaded in initialization
- **DATABASE ACCESS** — always use the project's DB access skill (from workflow-knowledge) for connections. NEVER guess proxy ports, credentials, or connection parameters manually.
- **PROVIDER DATA = REAL DATA** — reading the parser code tells you what the code EXPECTS. It does NOT tell you what the provider ACTUALLY sends.
- **FINDINGS MUST BE EXECUTABLE** — "Resolve question X" is not a valid proposed action. Make the decision based on evidence and propose the concrete outcome.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-intake.md` | Select story, setup worktree, load context |
| 2 | `step-02-access-verification.md` | Verify all data sources accessible |
| 3 | `step-03-investigate.md` | Source data investigation with REAL DATA |
| 4 | `step-04-external-research.md` | Web search for official docs, best practices |
| 5 | `step-05-analyze.md` | Extract hypotheses, verify, identify edge cases |
| 6 | `step-06-interactive-review.md` | Present findings one by one, user decides |
| 6b | `step-06b-dod-update.md` | Propose DoD/BAC/VM updates from accepted findings |
| 7 | `step-07-finalize.md` | Apply mods to tracker, add label, cleanup |

Each step file contains its own sequence and proceed instructions.

## ENTRY POINT

Load and execute `./steps/step-01-intake.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Required data source is inaccessible and user does not grant explicit exemption
- User explicitly requests stop
- Story has no actionable content (empty description, no ACs)
- Tracker is inaccessible

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
