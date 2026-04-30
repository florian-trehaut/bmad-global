# Quick Dev Workflow (v2)

**Goal:** Execute implementation tasks efficiently, either from a tech-spec file (story-spec v2 quick profile) or direct user instructions, with built-in escalation routing, adversarial self-review, and finding resolution.

**Spec profile:** `bmad-quick-dev` reads/writes specs in the **quick profile** of the v2 schema. For full investigation rigor (real-data confrontation, external research, multi-validator review, Business Comprehension Gate), escalate to `/bmad-create-story` (full profile).

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

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rules for this workflow:

- `no-fallback-no-false-data.md` — Zero Fallback / Zero False Data
- `evidence-based-debugging.md` — diagnostic integrity
- `validation-proof-principles.md` — proof standards
- `validation-verdict-protocol.md` — binary verdict semantics (Security Gate)
- `workflow-adherence.md` — NO-SKIP discipline + CHK-STEP receipts
- **`ac-format-rule.md`** — BACs in Given/When/Then; TACs in EARS (5 patterns)
- **`spec-completeness-rule.md`** — mandatory sections list (story-spec v2 (monolithic) or v3 (bifurcation) schema, quick profile allows terse N/A on Real-Data Findings + External Research)
- **`boundaries-rule.md`** — boundaries triple (Always / Ask First / Never)
- **`knowledge-schema.md`** — schema_version v1.1 expected (with optional sections data-sources / compliance-requirements / observability-standards / nfr-defaults / security-baseline)

### 2. Configuration Loading (REQUIRED)

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — resolve `user_name`, `communication_language`, `user_skill_level`, tracker, forge, quality gate. HALT if missing.
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — conventions (`#conventions`), test rules (`#test-rules`), tech stack (`#tech-stack`), validation tooling (`#validation-tooling`). HALT if missing.
- **Optional v1.1 sections (additive, no HALT if absent):** `#data-sources`, `#compliance-requirements`, `#observability-standards`, `#nfr-defaults`, `#security-baseline` — used to cross-reference per-story values when the story declares NFR / security / observability requirements.

**Communication:** Always speak in the configured `communication_language`.

### 3. Paths

- `wipFile` = `{implementation_artifacts}/spec-wip.md`

### 4. Related Workflows

- Escalation to planning: `/bmad-create-story` (story creation/enrichment, full v2 profile)
- Escalation to full method: `/bmad-create-prd` (PRD workflow)
- Spec template (v2 quick profile): `templates/spec-template.md`

### 5. Detect teammate mode (inserted AFTER Configuration Loading, BEFORE CHK-INIT — non-canonical INIT structure per F-005)

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. This sets:

- `TEAMMATE_MODE` (boolean)
- `ORCH_AUTHORIZED` (boolean — only meaningful when TEAMMATE_MODE=true)
- `LEAD_NAME`, `TASK_ID`, `WORKTREE_PATH`, `TRACKER_WRITES_ENABLED` (when TEAMMATE_MODE=true)

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict; only orchestrator-spawned teammates may run quick-dev).

When TEAMMATE_MODE=true and ORCH_AUTHORIZED=true:
- step-01-mode-detection skips user mode prompt — reads `tech_spec_path` (or DIRECT mode tasks) from `task_contract.input_artifacts[type=document]`
- step-05-adversarial-review reroutes review prompts via SendMessage (per `teammate-mode-routing.md` §A)
- step-06-resolve-findings reroutes finding-resolution prompts via SendMessage; tracker writes go through `tracker_write_request` (§B)

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
  teammate_mode: {true | false}
  orch_authorized: {true | false | "n/a"}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
  spec_profile: "quick" (use /bmad-create-story for "full" profile)
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

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements. **This step is CONDITIONAL** — it only activates if difficulties were encountered.
