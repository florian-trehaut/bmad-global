# Step 5: Analyze


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Analyze with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Extract hypotheses from the story, verify each against real data gathered in Steps 3-4, identify edge cases and gaps, synthesize findings with severity levels and executable proposed actions.

## RULES

- NEVER mark a hypothesis as "CONFIRMED" without concrete evidence
- If you cannot verify a hypothesis, mark it "UNVERIFIABLE" and explain why
- Every finding MUST propose an EXECUTABLE action — "Decide X" or "Resolve question Y" is NEVER acceptable
- Severity must reflect real impact, not theoretical concern
- Apply the zero-fallback rules: any fallback or "best-effort" mapping in the story must be challenged

## SEQUENCE

### 0. Compose unified view if bifurcation mode (story-spec v3)

Before analysis, determine the spec mode:

```
spec_mode = bifurcation  IF local spec frontmatter has mode: bifurcation AND tracker_issue_id is set
spec_mode = monolithic   OTHERWISE (legacy v2 or explicit mode: monolithic)
```

**If `spec_mode == bifurcation`:**

Apply `~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md` operation 2 (Read — get full spec via compose unified view):

1. **Drift check first** — apply protocol operation 3 (lightweight `get issue updatedAt`). If drift detected (tracker `updatedAt > business_synced_at + 60s tolerance`), HALT and present the menu `[R]efresh / [I]gnore / [V]iew diff` per the protocol. Wait for user selection.
   - On `[R]`: apply protocol operation 4, regenerate mirror, update `business_synced_at` + `business_content_hash`, commit `spec: refresh business sections from tracker`. Then proceed.
   - On `[I]`: log "ignored drift, continuing with stale local mirror". Proceed.
   - On `[V]`: display the diff between tracker description and local mirror without modifying. After display, re-present `[R]/[I]` (no `[V]` again).
2. **Compose unified view** — read local file (technical sections + business mirrors), call `tracker-crud.md` `get_issue` for the full description, replace business mirror sections with the canonical tracker content (preserving heading order from `spec-completeness-rule.md`).
3. Use the unified view as the input to the analysis below — hypotheses are extracted from the composed view, not the local file alone.

**If `spec_mode == monolithic`:** read the spec file as-is (no tracker fetch). Proceed.

**HALT on any tracker fetch failure** — never silently fall back to the local mirror (zero-fallback rule).

### 1. Extract hypotheses from the story

Read the story description carefully. For each AC, task, and description paragraph, extract:

- **Data assumptions** — what does the story ASSUME about the data? (format, values, volume, availability)
- **System assumptions** — what does the story ASSUME about the current system? (existing behavior, data model, infra)
- **Capability assumptions** — what does the story ASSUME about existing capabilities? (adapters, templates, packages, endpoints, secrets, schedulers, triggers)
- **Implicit requirements** — what is NOT mentioned but implicitly required? (error handling, edge cases, rollback, monitoring)
- **Data migration assumptions** — if the story involves data migrations (UPDATE/DELETE on existing data), what does it ASSUME about the data in each environment? Names, slugs, and IDs often differ between dev, staging, and production. A WHERE clause that matches in production may silently match zero rows in staging (or vice versa). If DB access is available, query real data in all target environments to verify. A migration that silently updates 0 rows in any environment is a BLOCKER finding.
- **Business context coverage** — does the story have a business context section? If yes, verify: user journey makes sense E2E, BACs are realistic and verifiable, external dependencies are identified, Validation Metier checklist is concrete and executable. If NO business context section: create a MAJOR finding proposing to add one.
- **Validation Metier quality** — if the story has a "Validation Metier" section, verify each item is concrete, executable by a human in production, and from the business perspective (not "check logs"). Vague items like "verify it works" become MINOR findings.

List ALL hypotheses — explicit AND implicit.

### 1b. ADR Need Detection (if PROJECT_ADRS loaded)

If the project uses ADRs (`PROJECT_ADRS` is loaded), check whether the story introduces architectural decisions that lack a covering ADR:

- New service, module, or bounded context
- New integration pattern or external dependency
- New data store or significant schema change
- Deviation from patterns established by existing ADRs
- Technology choice that sets a precedent

For each gap found: create a MAJOR finding with proposed action: "Create ADR for {X} before implementation."

**Then immediately HALT.** Present the menu:

> This story introduces **{description}** which should be recorded as an Architecture Decision Record.
>
> **[A]** Create ADR now (invoke `bmad-create-adr`)
> **[S]** Skip — will create ADR later
> **[N]** Not needed — this doesn't warrant an ADR

WAIT for user selection.

- **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume review analysis.
- **IF S or N:** Log the user's choice and proceed.

**NEVER** silently document an ADR need as a "note" or "recommendation". The HALT forces an explicit decision.

### 1c. Story-spec v2 Phase B quality audit

create-story v2 produces **Real-Data Findings** (Step 5) and **External Research** (Step 6) BEFORE writing the spec. review-story's job here is NOT to re-do that investigation from scratch — it's to **verify the quality of the work that was done**, then complement it from a fresh perspective.

For Real-Data Findings:

- [ ] Section present in the spec (not "N/A" without justification)
- [ ] Sources investigated table populated with concrete sources (provider / DB / cloud_logs)
- [ ] Real samples / query results / log lines included (not just "I checked")
- [ ] Field-level observations match the data model (Step 8 of create-story) — schema-vs-reality drift addressed in spec
- [ ] Spec assumptions vs reality table present and complete
- [ ] INVALIDATED assumptions correctly converted to spec changes (not silently ignored)

If Real-Data Findings is shallow (single sentence, no concrete data), or marked "N/A" without justification on a story that touches real data → **MAJOR finding**: "create-story Phase B was skipped — real-data confrontation is incomplete. Either re-run /bmad-create-story Step 5, or accept the risk explicitly with a recorded waiver."

For External Research:

- [ ] Section present
- [ ] Official documentation cited with version (not just "the docs")
- [ ] Best practices linked to specific TACs / NFRs / Risks
- [ ] Known issues scanned for libs / vendors involved
- [ ] Search trail visible (queries listed)

If External Research is shallow → **MINOR-to-MAJOR finding** (severity scales with the criticality of the external dependencies).

For NFR Registry (Step 9 of create-story):

- [ ] All 7 categories addressed (PRESENT / MISSING / PARTIAL / N/A justified)
- [ ] Targets are quantifiable (numbers, not "fast")
- [ ] N/A categories have 1-line justification
- [ ] PARTIAL / MISSING categories have remediation tasks in Implementation Plan

For Security Gate:

- [ ] Binary verdict (PASS / FAIL / N/A — no PARTIAL, no PASS-with-caveats)
- [ ] All checklist items addressed (auth, authz, data exposure, input sanitization, secrets, audit trail, compliance)
- [ ] FAIL verdicts have remediation tasks
- [ ] Compliance scope explicit (which standards apply)

For Observability Requirements:

- [ ] Mandatory log events listed with required fields
- [ ] Metrics named with units (`*_ms`, `*_total`, `*_bytes`, etc.)
- [ ] Alerts have runbook URL or task to create one
- [ ] SLO/SLI defined for user-facing operations (or N/A justified)

For Out-of-Scope, Risks Register, Boundaries, INVEST: verify presence, completeness, and absence of contradictions per `~/.claude/skills/bmad-shared/spec-completeness-rule.md`.

### 2. The production chain hypothesis

**"Works in production" is the hypothesis that matters most.** For each AC, the story implicitly assumes that every link in the production chain exists and is active:

trigger/entry point --> processing --> observable result

Verify this chain end-to-end. A feature that passes all tests but cannot function in production is a BLOCKER. Common blind spots:

- Story says "existing" (template, adapter, endpoint, secret) --> GO VERIFY in the codebase. "Existing" is a hypothesis, not a fact.
- Story assumes a scheduler/trigger will invoke the code --> does it exist? Is it active?
- Story assumes an adapter/client exists for an external service --> is there a real implementation or just a test stub?
- Story assumes config/secrets are available --> are they in the secret manager AND the deployment config?
- Story assumes a downstream service supports the expected call --> does the endpoint/template/event exist?

For each broken link: BLOCKER finding with concrete task to fix it.

### 3. Verify each hypothesis

For EACH hypothesis, check against the evidence gathered in Steps 3 and 4:

```yaml
hypothesis_verification:
  - hypothesis: "{what the story assumes}"
    source: "{where in the story this comes from}"
    evidence: "{what the real data/code/docs show}"
    verdict: "CONFIRMED | CONTRADICTED | UNVERIFIABLE | PARTIALLY_TRUE"
    details: "{specific evidence with data/file:line references}"
```

### 4. Edge cases and volumetry

From the real data examined in Step 3:

- What edge cases exist in the real data that the story does not cover?
- What is the actual data volume? Does the story account for scale?
- What happens when the source data is unavailable or malformed?

### 4b. Runtime robustness (concurrency + null safety)

Apply protocols (loaded JIT):

- `~/.claude/skills/bmad-shared/protocols/concurrency-review.md` — generic concurrency principles + per-language anti-patterns
- `~/.claude/skills/bmad-shared/protocols/null-safety-review.md` — generic null-safety principles + per-language anti-patterns

For each task / AC in the story:

**Concurrency hypotheses** (apply if the story touches shared state, async, batch, queue, pipeline, scheduler, worker, goroutine, thread):

- Is shared mutable state explicitly identified?
- Is the synchronisation strategy stated (locks, channels, atomics, immutability)?
- Are bounds on parallelism declared (semaphore, worker pool size, `errgroup.SetLimit`)?
- Is cancellation propagation defined (context, AbortSignal, async cancel)?
- Are tests under concurrency required (race detector, stress, fuzz)?
- Apply stack-specific anti-patterns from each detected language (Go, Rust, TypeScript, Python, …).

**Null safety hypotheses** (apply for any field crossing a boundary — API ingress, deserialisation, config, CLI):

- Is nullability of each input/output field explicit in the data model (`Optional[T]`, `*T`, `T | null`)?
- Is the boundary validation strategy stated (Zod, pydantic, custom)?
- Does an absent-path test exist per nullable field?
- Apply stack-specific anti-patterns from each detected language.

Each violation produces a finding with severity per the protocol's rubric. A missing concurrency test on a concurrent code path is at minimum MAJOR. A missing null-safety guardrail (`strictNullChecks`, `mypy --strict`, `clippy::unwrap_used`) is BLOCKER.

### 5. Synthesize findings

For each gap found, create a structured finding:

```yaml
findings:
  - id: F-001
    severity: BLOCKER | MAJOR | MINOR | INFO
    category: hypothesis_contradiction | missing_edge_case | wrong_assumption | missing_ac | volumetry_risk | best_practice_violation | missing_business_context
    title: "{short description}"
    story_says: "{what the story states or implies}"
    reality: "{what the real data/code/docs show}"
    evidence: "{concrete proof — query result, file:line, API response, doc link}"
    proposed_action: "{EXECUTABLE change to the story — exact text to add/modify/remove}"
```

**Severity guide:**

- **BLOCKER**: The story is fundamentally wrong or will cause data loss/corruption/security issue. A production chain link is missing.
- **MAJOR**: Important gap that will cause the implementation to fail or produce incorrect results. Missing business context. Unverified critical assumption.
- **MINOR**: Missing edge case or improvement that should be addressed but will not block implementation. Vague VM items.
- **INFO**: Observation or best practice suggestion, no immediate impact.

**proposed_action MUST be executable.** Bad examples:
- "Resolve the question of the price mapping"
- "Decide whether to use X or Y"
- "Consider adding error handling"

Good examples:
- "Add to Task 14: the webhook handler must call the inventory API to retrieve purchasePriceExclTax before building the DTO, same pattern as booking.service.ts:1059-1068"
- "Add AC: Given an order with status PARTIALLY_SHIPPED, When the status sync runs, Then the order status must be set to a new PARTIALLY_SHIPPED enum value (extend OrderStatus), not mapped to SHIPPED"
- "Add error handling AC: Given the provider SFTP is unreachable, When the polling job runs, Then it must alert via the alerting port with severity 'error' and skip the batch (not crash the service)"

If you cannot determine the right action from evidence, state your best recommendation with the evidence that supports it — do NOT defer the decision to the story.

**RESOLVE OPTIONS PROACTIVELY.** If you identify multiple possible actions for a finding, do NOT present them as "Option A or Option B" for the user to choose. Instead:
1. Investigate autonomously — query code, databases, web search for best practices, check real system state
2. Determine which option is best based on evidence
3. Write a SINGLE recommended action with brief justification
4. Note investigated alternatives in a separate `investigation_notes` field

The user expects a recommendation backed by investigation, not an open question.

### 6. Append findings to intermediate file

Update the intermediate file with all findings.

### 7. Proceed

Load and execute `./steps/step-06-interactive-review.md`.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Analyze
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
