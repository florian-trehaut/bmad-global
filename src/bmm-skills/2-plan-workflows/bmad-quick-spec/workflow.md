# Quick Spec — Workflow (story-spec v2 quick profile)

**Goal:** Produce a story-spec v2 quick-profile spec in ~5x less effort than `/bmad-create-story` (full profile). The spec is complete (all 22 mandatory sections present) but allows terse `N/A — {1-line justification}` on Real-Data Findings and External Research when scope is internal-only and no external systems are involved.

**Use when:**
- The feature is small, internal, well-understood (one team, one bounded context)
- Real-data investigation and external research add no value (internal config, refactor, doc, internal tooling)
- The user wants a tracker-tracked story without 14 steps of investigation

**Escalate to `/bmad-create-story` when:**
- The feature touches an external API, third-party system, or production data
- The feature has more than ~5 ACs or ~3 architectural decisions
- The feature requires multi-validator review or Business Comprehension Gate
- The investigation would benefit from real-data confrontation (auth, payments, integrations)

**Output:** A spec file at `{tracker_story_location}/{slug}.md` and a tracker entry transitioned to `ready-for-dev`. The spec passes `npm run validate:story-spec -- {path} --profile=quick` with 0 BLOCKER findings (BAC-10 of story `auto-flow-orchestrator`).

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rules for this workflow:

- `no-fallback-no-false-data.md` — Zero Fallback / Zero False Data
- `workflow-adherence.md` — NO-SKIP discipline + CHK-STEP receipts
- `ac-format-rule.md` — BACs in Given/When/Then; TACs in EARS (5 patterns)
- `spec-completeness-rule.md` — mandatory sections list (story-spec v2 schema, quick profile)
- `boundaries-rule.md` — boundaries triple (Always / Ask First / Never)
- `validation-verdict-protocol.md` — binary Security Gate verdict
- `teammate-mode-routing.md` — auto-detect TEAMMATE_MODE; reroute interactivity if running inside an Agent Teams teammate

### 2. Load project context (REQUIRED)

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — resolve `user_name`, `communication_language`, `tracker`, `tracker_story_location`, quality gate. HALT if missing.
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — conventions (`#conventions`), test rules (`#test-rules`), tech stack (`#tech-stack`), validation tooling (`#validation-tooling`). HALT if missing.
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md` — ubiquitous language for spec composition. HALT if missing (story creation always needs domain context).

### 3. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (this skill is not allowed in non-orchestrator teammate context). If TEAMMATE_MODE=true and ORCH_AUTHORIZED=true → enable interactive rerouting + tracker write deferral for steps 02–06.

### 4. Set defaults

- `SPEC_PROFILE = quick` (this skill writes ONLY quick-profile specs; full-profile escalates to `/bmad-create-story`)
- `MR_IID = null` (this skill produces a spec, no MR yet)

### 5. CHK-INIT — Initialization Read Receipt

Per `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rule 2, before starting step-01, emit EXACTLY this block (filling in actual values you read). If any line cannot be filled truthfully, HALT and report which precondition failed.

```
CHK-INIT PASSED — bmad-quick-spec initialization complete:
  shared_rules_loaded: {N} files (must include ac-format-rule.md, spec-completeness-rule.md, boundaries-rule.md, teammate-mode-routing.md)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md (loaded — REQUIRED for spec composition)
    - api.md ({"loaded" | "not required"})
  spec_profile: "quick"
  teammate_mode: {true | false}
  orch_authorized: {true | false | "n/a"}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

---

## YOUR ROLE

You are an **expert spec author** producing a condensed but complete story spec. Your work feeds directly into `/bmad-dev-story` or `/bmad-quick-dev`. The spec MUST be implementable as-is — no follow-up clarifications needed.

**Tone:** factual, direct, no leniency. Apply EARS/Given-When-Then strictly. Detect ambiguity early and surface it for the user to resolve.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md.

---

## CRITICAL RULES

- Execute ALL 6 steps in exact order — NO skipping
- Quick profile is NOT "incomplete profile" — all 22 sections MUST be present, only Real-Data Findings + External Research may be `N/A — {1-line justification}` (scope must be internal)
- If during step-02 the scope reveals external integrations, real-data dependencies, or > 5 ACs → escalate to `/bmad-create-story` immediately (do not silently downgrade)
- ZERO FALLBACK / ZERO FALSE DATA — apply the shared rule loaded at initialization throughout
- Boundaries Triple per the spec is mandatory (Always Do / Ask First / Never Do, ≥3 items each)
- BACs MUST use `Given … When … Then …` ; TACs MUST use one of the 5 EARS patterns

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-entry.md` | Greet, gather feature description, check escalation thresholds |
| 2 | `step-02-investigate.md` | Condensed investigation — codebase patterns + light real-data check (or N/A justified) |
| 3 | `step-03-model.md` | Domain model, data flow, API contracts (or N/A) |
| 4 | `step-04-nfr-security-obs.md` | NFR registry (7 categories), Security Gate (binary), Observability requirements |
| 5 | `step-05-plan.md` | Implementation plan (tasks + TACs in EARS), Boundaries triple, Risks register, INVEST self-check |
| 6 | `step-06-review.md` | Single-validator review pass, write spec file, transition tracker |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

---

## ENTRY POINT

After CHK-INIT is emitted, **Read FULLY and apply**: `./steps/step-01-entry.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

---

## HALT CONDITIONS (GLOBAL)

- Required knowledge file missing → HALT
- Scope reveals external integrations, real-data dependencies, or > 5 ACs → HALT and escalate to `/bmad-create-story`
- User cannot articulate the feature in 2-3 sentences → HALT (the feature is too vague for quick spec)
- Security Gate FAIL on any item → HALT (Security failures block the spec)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes, read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`. The retrospective is **CONDITIONAL** — it only activates if difficulties were encountered.
