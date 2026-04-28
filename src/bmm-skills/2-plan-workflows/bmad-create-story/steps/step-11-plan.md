---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
trackerIssueTemplate: '../templates/tracker-issue-description.md'
acFormatRule: '~/.claude/skills/bmad-shared/ac-format-rule.md'
boundariesRule: '~/.claude/skills/bmad-shared/boundaries-rule.md'
specCompletenessRule: '~/.claude/skills/bmad-shared/spec-completeness-rule.md'
earsTemplate: '~/.claude/skills/bmad-shared/data/ears-acceptance-criteria-template.md'
boundariesTemplate: '~/.claude/skills/bmad-shared/data/boundaries-triple-template.md'
investTemplate: '~/.claude/skills/bmad-shared/data/invest-checklist-template.md'
outOfScopeTemplate: '~/.claude/skills/bmad-shared/data/out-of-scope-template.md'
risksTemplate: '~/.claude/skills/bmad-shared/data/risks-assumptions-register-template.md'
---

# Step 11: Implementation Plan & Composition


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "INVEST evident", "boundaries evidentes".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-11-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-10-EXIT emis dans la conversation)
- [ ] Audit findings + ADR conformity + impact analysis disponibles depuis Step 10
- [ ] NFR Registry + Security Gate + Observability Requirements disponibles depuis Step 9
- [ ] Real-Data Findings (Step 5) + External Research (Step 6) accessibles
- [ ] Variables requises en scope (verifier avant action)

Emettre EXACTEMENT:

```
CHK-STEP-11-ENTRY PASSED — entering Step 11: Implementation Plan & Composition with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate implementation tasks, acceptance criteria (BACs in G/W/T, TACs in EARS), test strategy, guardrails, boundaries triple, out-of-scope register, risks & assumptions register, INVEST self-check. Compose the full issue description using the unified template. Estimate story points. The output must meet the READY FOR DEVELOPMENT standard per the v2 spec schema.

## RULES

- Every task has a clear file path and specific action — no placeholders, no "TBD"
- ABSOLUTELY NO TIME ESTIMATES anywhere
- Infrastructure tasks get `[INFRA]` or `[CI/CD]` prefix — they are mandatory, not optional
- Every task is concrete and actionable — no vague "handle edge cases"
- Guardrails must be specific to THIS story, not generic advice
- **BACs MUST use Given/When/Then per `{acFormatRule}`** — readable by PM and validation-metier
- **TACs MUST use one of the 5 EARS patterns per `{acFormatRule}` and `{earsTemplate}`** — Ubiquitous / Event-driven / State-driven / Optional / Unwanted
- Each TAC must trace to at least one BAC (`*(Pattern, refs BAC-N)*`)
- Validation Metier items must be executable by a human in production, each tracing to BACs
- Load {trackerIssueTemplate} for section ordering and conditional rules
- **One Story**: This spec produces exactly ONE story — the scope is what was defined earlier. Do not expand it.
- All sections required by `{specCompletenessRule}` must be produced — no omission

## SEQUENCE

### 1. Generate Implementation Tasks

Each task should be:

- A discrete, completable unit of work
- Ordered logically (dependencies first)
- Include the specific files to modify
- Explicit about what changes to make

Task format:

```markdown
- [ ] Task N: Clear action description
  - File: `path/to/file.ext`
  - Action: Specific change to make
```

MUST include:
- `[CI/CD]` and `[INFRA]` prefixed tasks for any MISSING/PARTIAL layers from Step 10
- Tasks for NFR remediation queued in Step 9 (performance instrumentation, observability hooks, etc.)
- Tasks for Security Gate FAIL items queued in Step 9
- Tasks for INVALIDATED assumptions / HIGH-impact unverified assumptions from Step 5

Group tasks by logical area (domain, API, infrastructure, observability, security, tests).

### 2. Generate Acceptance Criteria

**Two types — keep them separate, with mandatory format:**

#### 2a. Business Acceptance Criteria (BACs) — Given/When/Then

**Discovery mode:** Review the BACs captured in Step 2d. Refine if needed based on investigation findings.

**Enrichment mode:**

- If `HAS_BUSINESS_CONTEXT = true`: preserve existing BACs from the issue description
- If `HAS_BUSINESS_CONTEXT = false`: synthesize from PRD using `~/.claude/skills/bmad-shared/data/business-context-template.md`:
  - User journey E2E (primary actor, numbered steps)
  - Business Acceptance Criteria in Given/When/Then — observable outcomes
  - External dependencies and validation gates (table)

```markdown
### Business Acceptance Criteria

- [ ] BAC-N: Given [user context], when [user action], then [observable result]
```

Format check: every BAC must match `Given … When … Then …`. Reject any other format.

#### 2b. Technical Acceptance Criteria (TACs) — EARS

Load {earsTemplate} for the 5 patterns + examples.

```markdown
### Technical Acceptance Criteria

- [ ] TAC-N *(Ubiquitous, refs BAC-X)*: The {system} shall {action}.
- [ ] TAC-N *(Event-driven, refs BAC-X)*: When {trigger}, the {system} shall {action}.
- [ ] TAC-N *(State-driven, refs BAC-X)*: While {state}, the {system} shall {action}.
- [ ] TAC-N *(Optional, refs BAC-X)*: Where {feature is enabled}, the {system} shall {action}.
- [ ] TAC-N *(Unwanted, refs BAC-X)*: If {undesired condition}, then the {system} shall {action to prevent / handle}.
```

Cover: happy path (Event-driven), permanent invariants (Ubiquitous), state-conditional behaviour (State-driven), feature-flagged behaviour (Optional), forbidden behaviour (Unwanted).

**Format check:** every TAC must match exactly one of the 5 EARS patterns AND reference at least one BAC. Reject Given/When/Then format on TACs (it should have been caught earlier — surface as immediate fix).

### 3. Generate Test Strategy

For each TAC, classify using the test pyramid and priority matrix:

| TAC | Pattern | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | ------- | -------- | ---- | ----------- | ------- | ------------- |

The Pattern column maps EARS pattern to test scaffold (informs `bmad-tea-atdd`):

- Ubiquitous → "always" assertion across many fixtures
- Event-driven → setup + trigger + assert
- State-driven → state-machine test (pre-state, transition, post-state)
- Optional → feature-flag conditional test
- Unwanted → negative test + alert assertion

Priority classification:
- P0: Revenue-critical, security, compliance, data integrity (>90% unit, >80% integration)
- P1: Core journeys, frequently used, complex logic (>80% unit, >60% integration)
- P2: Secondary features, admin, reporting
- P3: Rarely used, nice-to-have

### 4. Generate Guardrails

What NOT to do, common mistakes to avoid for THIS story.

**MUST include these mandatory guardrails:**

1. "Do not consider the story complete if schema changes exist without generated migrations"
2. "Data migrations with UPDATE/DELETE must be effective in ALL environments (dev, staging, production). WHERE clauses matching on names/slugs must be verified against real data — names often differ between environments. A migration that silently updates 0 rows is a zero-fallback violation."
3. "Do not consider the story complete if a service is not deployable end-to-end via CI/CD"
4. "Do not consider the story complete if schema changes have no documented data mapping (DTO <-> Domain <-> DB)"
5. "Every new config access must have a corresponding env var in the project's configuration module AND deployment template"
6. "Pipelines, batch jobs, scheduled tasks, or any flow that rebuilds shared persistent or in-memory state (relational tables, document collections, key-value stores, caches, indices, materialized views, search engines, shared files, configuration stores, in-memory registries) MUST use one of: atomic swap (write the new version to a parallel location and atomically switch the reference), versioned pointer (new version under a new identifier with an atomic active-version update), transactional batch (destructive and reconstructive steps in a single transaction so readers see only the old or new state), or idempotent merge/upsert (no destructive step at all). NEVER use an in-place destructive rebuild outside a transactional boundary — i.e. wipe-then-refill, drop-then-recreate, delete-all-then-insert, clear-then-load — when concurrent consumers exist. A flow that introduces a window of empty/missing data visible to consumers is a runtime regression even if the final state is correct and tests pass."

Plus story-specific guardrails from analysis (ADR violations, prior MR rejections, etc.).

### 4b. Runtime Robustness AC suggestion (concurrency + null safety)

Apply protocols (loaded JIT):

- `~/.claude/skills/bmad-shared/protocols/concurrency-review.md`
- `~/.claude/skills/bmad-shared/protocols/null-safety-review.md`

**Concurrency triggers** — keywords in the task descriptions: `goroutine`, `thread`, `async`, `await`, `Promise.all`, `Promise.allSettled`, `worker`, `queue`, `batch`, `pipeline`, `scheduler`, `cron`, `tokio`, `asyncio`, `mutex`, `lock`, `channel`, `concurrent`, "shared state".

**Null safety triggers** — patterns suggesting boundary-crossing data: `Optional`, `nullable`, `?:`, `null`, `undefined`, `nil`, `None`, "external API", "request body", "deserialise", "JSON", "config", "env var", "user input".

For each detected trigger, surface candidate ACs/tasks for user confirmation (no silent insertion):

- **Candidate TAC** *(Ubiquitous, refs BAC-X)*: The {component} shall protect shared state {X} via {Mutex|atomic|channel} per the {language} stack rules
- **Candidate TAC** *(Event-driven, refs BAC-X)*: When {boundary input Y} is received, the {component} shall validate via {Zod|pydantic|serde|...} returning a typed result; downstream code shall NOT use `!` non-null assertion
- **Candidate task**: Add a stack-appropriate concurrent test (e.g., Go: `go test -race`; TS: `Promise.all` of N concurrent calls)
- **Candidate task**: Verify project's tooling enforces null safety (`tsconfig.strictNullChecks`, `mypy --strict`, `clippy::unwrap_used`, `go vet`/`staticcheck`)

Present:

```
## Runtime Robustness candidates detected

The following ACs/tasks may apply to this story (per detected triggers + stack rules):

[List of candidates]

[A]ccept all  [S]elect specific  [N]one apply
```

WAIT for user choice. Add only the accepted items to the AC/task lists.

If no triggers match, skip this section silently (no candidates surfaced).

### 5. Generate Out-of-Scope Register

Load {outOfScopeTemplate}. Apply rule: at least 2 items naming work that a thoughtful reader might EXPECT to be included.

```markdown
| # | Non-goal | Why excluded | Where it might land |
| - | -------- | ------------ | -------------------- |
| OOS-1 | {item} | {reason} | {next story / future epic / never} |
```

Cross-check with the Scope (Included/Excluded) section — out-of-scope must NOT contradict in-scope.

Scope-creep policy is automatically active downstream: dev-story scope-completeness + code-review meta-1 enforce.

### 6. Generate Risks & Assumptions Register

Load {risksTemplate}.

**Risks** — produce table with: ID, description, probability (LOW/MED/HIGH), impact (LOW/MED/HIGH), mitigation, validation method, owner.

Sources:
- INVALIDATED / INCONCLUSIVE assumptions from Step 5 → convert to Risks
- Step 6 known issues / gotchas
- Step 10 audit findings (UNSAFE patterns, NEEDS_UPDATE callers)
- Step 9 NFR PARTIAL items + Security Gate FAIL items

Every HIGH-impact RISK without an executable mitigation → BLOCKER (cannot ship).

**Assumptions** — produce table with: ID, assumption, source, validation status (UNVERIFIED/VERIFIED/INVALIDATED), validation method.

Every UNVERIFIED assumption with HIGH impact-if-false → must either be VERIFIED in Step 5 or converted to a RISK above.

### 7. Generate Boundaries Triple

Load {boundariesTemplate} and `{boundariesRule}`.

Compose the triple as project baseline + story-specific items.

```markdown
#### ✅ Always Do
{project baseline + story items}

#### ⚠️ Ask First
{project baseline + story items}

#### 🚫 Never Do
{project baseline + story items}
```

Each bucket has at least 3 items. No item appears in more than one bucket. Story-specific items cannot contradict project baselines.

### 8. Generate File List

Expected files to create and modify, grouped by service/area.

### 9. Performance Measurement Plan (cross-ref NFR Registry)

If the NFR Registry (Step 9) declares a Performance target, include a measurement task:

```markdown
- [ ] Task N: Performance measurement
  - Add temporary timing instrumentation to {critical_paths}
  - Run with realistic data, capture measurements
  - Document results (include in MR description)
  - Verify target {p95 < ...} is met
  - Remove instrumentation before final commit (or convert to permanent metric per Observability Requirements)
```

Skip only if NFR Performance is N/A with justification.

### 10. INVEST Self-Check

Load {investTemplate}.

Answer all 6 INVEST questions with evidence:

| Criterion | Answer | Evidence |
| --------- | ------ | -------- |
| Independent | YES / NO | ... |
| Negotiable  | YES / NO | ... |
| Valuable    | YES / NO | ... |
| Estimable   | YES / NO | ... |
| Small       | YES / NO | ... |
| Testable    | YES / NO | ... |

ANY answer = NO → either fix the failing criterion or split / re-scope. NO with concrete remediation action acceptable; NO with "will think about it" = REJECTED.

### 11. Compose Issue Description

Load {trackerIssueTemplate} for the description structure and conditional rules.

Compose the full Markdown description filling in all accumulated content. Sections from previous steps:
- Step 5 → Real-Data Findings
- Step 6 → External Research
- Step 8 → Data Model / API / Infrastructure / External Interfaces / Data Mapping
- Step 9 → NFR Registry / Security Gate / Observability Requirements
- Step 10 → ADR conformity / impact / runtime continuity / Validation Metier (incl. VM-NR)
- This step → Tasks / BACs / TACs / Guardrails / Out-of-Scope / Risks / Boundaries / INVEST / Test Strategy / File List

**CRITICAL ordering** (enforced by {trackerIssueTemplate}):
- **Definition of Done (product)** is the FIRST section — first thing visible when opening the ticket
  - Two dimensions: Feature DoD (BACs satisfied, user journey validated) + Non-regression DoD (impacted flows verified)
- **Technical Context** goes inside a `<details>` collapsible block
- **Validation Metier** stays in its natural position after Implementation Plan
  - Each VM declares its type and traces to BACs: `VM-N [type] *(BAC-X,Y)* : description`
  - Non-regression VMs trace to impacts: `VM-NR-N [type] *(Impact IN)* : description`
  - Adapt VM types to the project's stack (via the validation-tooling-lookup and tech-stack-lookup protocols)

### 12. Estimate Story Points

Estimate complexity in Fibonacci (1, 2, 3, 5, 8, 13). Consider:

- **Scope**: number of tasks, services impacted, data model changes
- **Uncertainty**: how well-defined is the solution? (low if VERIFIED assumptions; high if many UNVERIFIED)
- **Risk**: count of HIGH-impact risks, infrastructure changes, external dependencies
- **NFR effort**: implementing observability + security remediation tasks adds weight

This is autonomous — do NOT ask the user.

### 13. Verify READY FOR DEVELOPMENT

Verify the spec meets this standard:

- **One Story**: Exactly one story — not an epic, not multiple stories
- **Actionable**: Every task has a clear file path and specific action
- **Logical**: Tasks ordered by dependency
- **Testable**: BACs in G/W/T, TACs in EARS (5 patterns covered as appropriate)
- **Complete**: All investigation results inlined — no placeholders or "TBD"
- **Self-Contained**: A fresh agent can implement from the issue without reading workflow history
- **Business-Grounded**: Every TAC traces to at least one BAC
- **Validation Metier**: Production test checklist defined with VM types
- **Guardrails**: Mandatory guardrails + story-specific guardrails present
- **Out-of-Scope**: At least 2 explicit non-goals
- **Risks & Assumptions**: Register populated; HIGH-impact items have mitigation
- **Boundaries**: Triple bucket complete (Always / Ask First / Never)
- **NFR**: 7 categories addressed (PRESENT / MISSING / PARTIAL / N/A justified)
- **Security Gate**: Binary verdict (PASS / FAIL with remediation)
- **Observability**: Logs / metrics / traces / alerts / dashboards / SLOs covered or N/A
- **INVEST**: 6 questions answered with evidence; no rejected NO
- **Spec completeness**: per `{specCompletenessRule}` v2 schema — all mandatory sections present

### 14. Checkpoint & Menu

**Discovery mode:** Present composed description summary, then A/P/C menu:

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to multi-validator review (Step 12)"

- IF A: Read fully and follow {advancedElicitationTask}, process, ask "Accept?", update then redisplay
- IF P: Read fully and follow {partyModeWorkflow}, process, ask "Accept?", update then redisplay
- IF C: Load, read fully, and execute `./step-12-review.md`

ALWAYS halt and wait. ONLY proceed when user selects 'C'.

**Enrichment mode:** Present the composed description for validation, then proceed directly to `./step-12-review.md` (multi-validator now active in BOTH modes).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Tasks generated with file paths and specific actions, including NFR/security/observability tasks queued from Step 9
- BACs in Given/When/Then; TACs in EARS (one of 5 patterns each)
- Each TAC traces to at least one BAC
- Test strategy with pyramid classification + EARS pattern annotation
- Mandatory guardrails + story-specific guardrails present
- Out-of-Scope register with at least 2 items
- Risks & Assumptions Register populated; HIGH-impact items have mitigation
- Boundaries Triple complete (3 buckets, 3+ items each)
- INVEST self-check completed; no rejected NO
- Validation Metier with VM types and BAC tracing (incl. VM-NR from Step 10)
- File list present
- READY FOR DEVELOPMENT checklist verified per `{specCompletenessRule}`
- Description composed from {trackerIssueTemplate}
- Story points estimated

### FAILURE:

- Tasks without file paths
- BACs not in Given/When/Then
- TACs not in EARS (one of 5 patterns)
- TACs without parent BAC link
- Missing test strategy
- Missing mandatory guardrails
- Out-of-Scope empty or contradicting in-scope
- Risks register without mitigation on HIGH items
- Boundaries with single-item buckets
- INVEST: NO without remediation
- Placeholders or "TBD" in output

---

## STEP EXIT (CHK-STEP-11-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-11-EXIT PASSED — completed Step 11: Implementation Plan & Composition
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-12-review.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-12-review.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
