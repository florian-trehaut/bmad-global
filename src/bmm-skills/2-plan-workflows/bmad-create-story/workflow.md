# Create Story — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, dual-mode (Discovery / Enrichment).**

**Goal:** Produce implementation-ready stories. In Discovery mode, guide the user through conversational spec engineering to create a new tracker issue. In Enrichment mode, load all project context and enrich an existing issue with tasks, guardrails, ACs, and test requirements. Both modes converge into the same analysis and output pipeline.

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
| `TRACKER` | `tracker` | linear, github, gitlab, jira, file |
| `TRACKER_TEAM` | `tracker_team` | MyTeam |
| `TRACKER_TEAM_ID` | `tracker_team_id` | UUID |
| `TRACKER_META_PROJECT_ID` | `tracker_meta_project_id` | UUID |
| `TRACKER_STATES` | `tracker_states` | Map of state name to ID |
| `WORKTREE_PREFIX` | `worktree_prefix` | MyProject |
| `WORKTREE_TEMPLATE_SPEC` | `worktree_templates.quick_spec` | ../MyProject-spec-{slug} |
| `BRANCH_TEMPLATE` | `branch_template` | feat/{issue_number}-{short_description} |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Developer |
| `USER_SKILL_LEVEL` | `user_skill_level` | expert |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rules:

- **Verify story ACs don't rely on fallback assumptions.** When defining status mappings or data transformations, explicitly state "unknown value must throw + alert" as an AC.
- **Every AC must have a complete, verified production chain** from trigger to observable result — never assume "existant" without verification in the codebase.

### 3. Load knowledge files

Apply the protocol in `~/.claude/skills/bmad-shared/knowledge-loading.md`. For this workflow:

- **Required (HALT if missing):** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — tracker patterns (`#tracker-patterns`), tech stack (`#tech-stack`), conventions (`#conventions`), validation tooling (`#validation-tooling`), test rules (`#test-rules`)
- **Required (HALT if missing):** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md` — ubiquitous language and domain rules used to phrase stories
- **Conditional:** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` — load if the story touches API contracts

### 4. Set related workflow paths

```yaml
related_workflows:
  advanced_elicitation: "~/.claude/skills/bmad-advanced-elicitation/SKILL.md"
  party_mode: "~/.claude/skills/bmad-party-mode/workflow.md"
  adversarial_review: "~/.claude/skills/bmad-review-adversarial-general/SKILL.md"
```

If any of these files do not exist, the corresponding menu option (A/P/R) is silently unavailable.

### 5. Set defaults

```yaml
MODE: null        # Set in step 01: "discovery" or "enrichment"
ISSUE_ID: null
ISSUE_IDENTIFIER: null
ISSUE_TITLE: null
PROJECT_NAME: null
PROJECT_ID: null
EPIC_SLUG: null
SPEC_WORKTREE_PATH: null
```

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

## YOUR ROLE

**Discovery mode:** Spec Engineering Facilitator. Collaborative partner who asks informed questions, investigates code deeply, and helps produce complete actionable specs.

**Enrichment mode:** Senior Developer preparing implementation context. Last line of defense before code is written. The enriched story is the developer's COMPLETE guide — nothing ambiguous, nothing missing, nothing assumed.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **ABSOLUTELY NO TIME ESTIMATES** — no durations, no "~5 min", no "takes about N hours"
- **Every "existant" claim must be VERIFIED** — if architecture says a template, adapter, endpoint, or secret "exists", search the codebase to confirm
- **Infrastructure tasks are NOT optional** — a service without deployment pipeline is not shippable
- **Zero Fallback / Zero False Data** — never propose fallback values for missing data; HALT instead
- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- ALWAYS halt at menus and wait for user input
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **Subprocess Optimization**: Use subprocess/subagent tools when available for parallel operations
- **Dual-Mode Routing**: Step 01 detects the mode; steps 02d/02e are mode-specific; all other steps are shared with conditional behavior

---

## STEP SEQUENCE

| Step | File | Mode | Goal |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-entry.md` | Both | Detect mode (Discovery/Enrichment), greet, load context |
| 2d | `step-02d-discover.md` | Discovery | Orient, ask informed questions, capture business context |
| 2e | `step-02e-load-context.md` | Enrichment | Load PRD, Architecture, UX, completed stories, git history |
| 3 | `step-03-setup-worktree.md` | Both | Create investigation worktree, post-setup |
| 4 | `step-04-investigate.md` | Both | Deep code analysis, ADRs, patterns |
| 5 | `step-05-model.md` | Both | Data model, API contracts, infra, external interfaces |
| 6 | `step-06-audit.md` | Both | Deployment chain audit, AC viability, impact analysis |
| 7 | `step-07-plan.md` | Both | Tasks, ACs, test strategy, guardrails, composition, estimation |
| 8 | `step-08-review.md` | Discovery | Review loop with adversarial review option |
| 9 | `step-09-output.md` | Both | Business Comprehension Gate (mandatory, hard gate) + Create new issue (Discovery) or update existing (Enrichment) |
| 10 | `step-10-cleanup.md` | Both | Remove worktree, summary, retrospective |

## ENTRY POINT

Load and execute `./steps/step-01-entry.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → HALT
- Tracker MCP tools unavailable or returning auth errors → HALT
- Worktree creation fails (when enabled) → HALT
- Tracker API call fails for issue creation/update → HALT (no silent fallback)
- User explicitly requests stop → HALT
- Required data source is inaccessible and no semantically correct alternative exists → HALT
- No Backlog issues found and no issue identifier provided (Enrichment mode) → HALT
- Project Context document not found (Enrichment mode) → HALT
- PRD or Architecture document not found (Enrichment mode) → HALT
- New architectural decision detected requiring ADR → HALT (present ADR menu)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:

- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
