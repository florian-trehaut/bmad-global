# Create Story — Workflow (v2)

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, dual-mode (Discovery / Enrichment), story-spec v2 (monolithic) or v3 (bifurcation) schema.**

**Goal:** Produce implementation-ready stories that meet the story-spec v2 (monolithic) or v3 (bifurcation) schema (`bmad-shared/spec/spec-completeness-rule.md`). The workflow combines real-data confrontation, external research, structured NFR / security / observability, EARS-formatted technical ACs, INVEST self-check, out-of-scope register, risks/assumptions register, and boundaries triple — producing the most rigorous public story-spec pipeline.

In **Discovery mode**, guide the user through conversational spec engineering to create a new tracker issue. In **Enrichment mode**, load all project context and enrich an existing issue with the same v2 sections. Both modes converge into the same evidence → modeling → audit → plan → multi-validator review → publication pipeline.

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

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rules for this workflow:

- `no-fallback-no-false-data.md` — Zero Fallback / Zero False Data
- `evidence-based-debugging.md` — diagnostic integrity (rungs of proof)
- `validation/validation-protocol.md#proof-principles` — proof standards for business validation (real environment only)
- `validation/validation-protocol.md#verdict` — binary verdict semantics (used by Step 9 Security Gate)
- `workflow-adherence.md` — NO-SKIP discipline + CHK-STEP receipts
- **`ac-format-rule.md`** — BACs in Given/When/Then; TACs in EARS (5 patterns)
- **`spec-completeness-rule.md`** — mandatory sections list (story-spec v2 (monolithic) or v3 (bifurcation) schema)
- **`boundaries-rule.md`** — boundaries triple (Always / Ask First / Never)
- **`knowledge-schema.md`** — schema_version v1.1 expected (with optional sections data-sources / compliance-requirements / observability-standards / nfr-defaults / security-baseline)

### 3. Load knowledge files

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`. For this workflow:

- **Required (HALT if missing):** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — tracker patterns (`#tracker-patterns`), tech stack (`#tech-stack`), conventions (`#conventions`), validation tooling (`#validation-tooling`), test rules (`#test-rules`)
- **Required (HALT if missing):** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md` — ubiquitous language and domain rules used to phrase stories
- **Conditional:** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` — load if the story touches API contracts
- **Optional v1.1 sections** — load if present and consumed by Steps 4 / 9: `#data-sources`, `#compliance-requirements`, `#observability-standards`, `#nfr-defaults`, `#security-baseline`. Absent sections do NOT halt — they fall back to per-story values without baseline cross-reference.

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

### 6. Detect teammate mode (M7 of `standalone-auto-flow-unification.md` — TAC-3 / TAC-4 / TAC-5)

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` to detect whether this workflow is running inside an Agent Teams teammate context (e.g., spawned by `bmad-auto-flow` Phase 1 spec team).

This sets:
- `TEAMMATE_MODE` (boolean — true when invoked by an authorized orchestrator's spec phase)
- `ORCH_AUTHORIZED` (only meaningful when TEAMMATE_MODE=true)
- `LEAD_NAME`, `TASK_ID`, `WORKTREE_PATH`, `TRACKER_WRITES_ENABLED` (when TEAMMATE_MODE=true)

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict applies; only orchestrator-spawned teammates may run create-story).

**Behavior in TEAMMATE_MODE=true:**
- Step 01 (entry / mode detection) skips the user-facing greet/banner — reads `MODE` and `ISSUE_IDENTIFIER` from `task_contract.input_artifacts[].identifier` (TAC-4)
- Steps 02e (real-data investigation), 05 (external research), 06 (NFR/security/observability), 07 (planning), 12 (multi-validator review) are sub-tasks — when this workflow runs as a teammate (rare), the lead would have already delegated these as TaskCreates via auto-flow step-03-spec-phase.md
- The "lead-orchestration loop itself" is NEVER delegated — TEAMMATE_MODE=true on `bmad-create-story` is an exceptional path used only when auto-flow orchestrator delegates the entire spec phase to a teammate (NOT current architecture per TAC-6)
- Step 13 (output) emits `tracker_write_request` SendMessage instead of direct tracker writes (per `teammate-mode-routing.md` §B)
- The full 14-step structure is preserved — this is FCIS pattern (Pattern Application Matrix, M7+M9 of `standalone-auto-flow-unification.md`) with TEAMMATE_MODE-conditional behavior, NOT a new file

**Behavior in TEAMMATE_MODE=false (standalone):**
- Full inline behavior preserved — greet/banner/AskUserQuestion/14-step interactive flow identical to pre-refactor (BAC-3 / TAC-5 / VM-NR-1)

#### Inline-vs-delegated step matrix (M9 of `standalone-auto-flow-unification.md`)

When `bmad-create-story` runs inside `bmad-auto-flow` Phase 1 (auto-flow step-03-spec-phase.md), the lead orchestrates inline AND delegates heavy sub-tasks to spec-team teammates via TaskCreate. Reference matrix per `bmad-auto-flow/steps/step-03-spec-phase.md` :

| Step | File | Inline (lead) | Delegated (teammate) | Teammate role |
|------|------|---------------|----------------------|---------------|
| 01 | step-01-entry.md | YES | — | (lead) |
| 02 | step-02-investigate.md | YES (driver) | step-02e (real-data confrontation) | spec-investigator |
| 03 | step-03-real-data-confrontation.md | YES (synthesizer) | — (subsumed by step-02e teammate) | (lead) |
| 04 | step-04-business-context.md | YES | — | (lead) |
| 05 | step-05-external-research.md | YES (driver) | YES (external-researcher) | external-researcher |
| 06 | step-06-nfr-security-obs.md | YES (driver) | YES (nfr-investigator) | spec-investigator |
| 07 | step-07-tac-plan.md | YES (driver) | YES (planning-investigator) | spec-investigator |
| 08 | step-08-validation-metier.md | YES | — | (lead) |
| 09 | step-09-security-gate.md | YES | — | (lead) |
| 10 | step-10-impact-analysis.md | YES | — | (lead) |
| 11 | step-11-boundaries-risks.md | YES | — | (lead) |
| 12 | step-12-review.md | YES (driver) | YES (3 validators) | spec-validator-A/B/C |
| 13 | step-13-output.md | YES | — | (lead) |
| 14 | step-14-test-strategy.md | YES | — | (lead) |

This matrix is informational and authoritative — the auto-flow orchestrator builds its TaskCreate contracts from this table. Any future change to the lead/delegated split MUST be reflected here AND in `bmad-auto-flow/steps/step-03-spec-phase.md`.

---


### CHK-INIT — Initialization Read Receipt

Emit EXACTLY this block (filling in actual values you read), then proceed to the first step. If any line cannot be filled truthfully, HALT.

```
CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: {N} files (list filenames, must include ac-format-rule.md, spec-completeness-rule.md, boundaries-rule.md)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X}, expected v1.1+)
    - domain.md ({"loaded" | "not required" | "required-but-missing"})
    - api.md ({"loaded" | "not required" | "required-but-missing"})
  optional_v1_1_sections:
    - data-sources: {"present" | "absent"}
    - compliance-requirements: {"present" | "absent"}
    - observability-standards: {"present" | "absent"}
    - nfr-defaults: {"present" | "absent"}
    - security-baseline: {"present" | "absent"}
  worktree_path: {WORKTREE_PATH or "n/a"}
  team_mode: {true | false}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

## YOUR ROLE

**Discovery mode:** Spec Engineering Facilitator. Collaborative partner who asks informed questions, investigates code AND real data, consults external sources, and helps produce complete actionable specs.

**Enrichment mode:** Senior Developer preparing implementation context. Last line of defense before code is written. The enriched story is the developer's COMPLETE guide — nothing ambiguous, nothing missing, nothing assumed, every assumption verified against real data and authoritative sources.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **ABSOLUTELY NO TIME ESTIMATES** — no durations, no "~5 min", no "takes about N hours"
- **Every "existant" claim must be VERIFIED** — if architecture says a template, adapter, endpoint, or secret "exists", search the codebase to confirm
- **Real data is mandatory** — Steps 4-5 are blocking gates; provider / DB / cloud access verified before proceeding
- **External research is mandatory** — Step 6 documents authoritative sources; no claim from training data or memory
- **Infrastructure tasks are NOT optional** — a service without deployment pipeline is not shippable
- **Zero Fallback / Zero False Data** — never propose fallback values for missing data; HALT instead
- **AC format rule** — BACs in G/W/T, TACs in EARS (5 patterns); enforced at Step 11 + Step 12
- **Boundaries triple** — Always / Ask First / Never; produced at Step 11
- **Spec completeness** — every mandatory section present per `spec-completeness-rule.md`; enforced at Step 12
- **Multi-validator gate** — Step 12 runs 3 independent validators; 0 BLOCKER findings before Step 13
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

## STEP SEQUENCE (v2 — 14 step files)

| Step | File | Mode | Goal |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-entry.md` | Both | Detect mode (Discovery/Enrichment), greet, load context |
| 2d | `step-02d-discover.md` | Discovery | Orient, ask informed questions, capture business context |
| 2e | `step-02e-load-context.md` | Enrichment | Load PRD, Architecture, UX, completed stories, git history |
| 3 | `step-03-setup-worktree.md` | Both | Create investigation worktree, post-setup |
| 4 | `step-04-access-verification.md` | Both | **Phase B (Evidence)** — HALT gate on DB / providers / cloud / web access |
| 5 | `step-05-real-data-investigation.md` | Both | **Phase B (Evidence)** — provider/DB/cloud queries, flux trace with REAL DATA |
| 6 | `step-06-external-research.md` | Both | **Phase B (Evidence)** — official docs, RFC, best practices, gotchas |
| 7 | `step-07-investigate.md` | Both | Code investigation, ADRs, patterns (cross-references Phase B evidence) |
| 8 | `step-08-model.md` | Both | Data model, API contracts, infra, external interfaces, data mapping |
| 9 | `step-09-nfr-security-observability.md` | Both | NFR registry (7 cats), Security Gate (binary), Observability Requirements |
| 10 | `step-10-audit.md` | Both | Deployment chain, ADR conformity, AC viability, impact analysis, runtime continuity |
| 11 | `step-11-plan.md` | Both | Tasks, BACs (G/W/T), TACs (EARS), Out-of-Scope, Risks, Boundaries, INVEST, compose |
| 12 | `step-12-review.md` | Both | Multi-validator (Requirements / Design / Tasks); BLOCKER gate before publication |
| 13 | `step-13-output.md` | Both | Business Comprehension Gate (extended) + Create new issue (Discovery) or update existing (Enrichment) |
| 14 | `step-14-cleanup.md` | Both | Remove worktree, summary, retrospective |

## ENTRY POINT

Load and execute `./steps/step-01-entry.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → HALT
- Tracker MCP tools unavailable or returning auth errors → HALT
- Worktree creation fails (when enabled) → HALT
- Tracker API call fails for issue creation/update → HALT (no silent fallback)
- User explicitly requests stop → HALT
- Required data source is inaccessible (Step 4) and no semantically correct alternative exists → HALT
- No Backlog issues found and no issue identifier provided (Enrichment mode) → HALT
- Project Context document not found (Enrichment mode) → HALT
- PRD or Architecture document not found (Enrichment mode) → HALT
- New architectural decision detected requiring ADR (Step 10) → HALT (present ADR menu)
- Multi-validator (Step 12) finds BLOCKER findings → HALT (require fix loop)
- Security Gate (Step 9) verdict = FAIL with no remediation tasks → HALT
- INVEST self-check (Step 11) has any NO without remediation → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:

- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
