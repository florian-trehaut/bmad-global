---
nextStepFile: './step-13-push-mr.md'
scopeCompletenessSubagent: '../subagent-workflows/scope-completeness.md'
---

# Step 12: Traceability, Task Verification & Impartial Scope Audit


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-12-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-12-ENTRY PASSED — entering Step 12: Traceability, Task Verification & Impartial Scope Audit with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Every AC must have at least one test at the level specified in the test strategy. Every task must be verified complete. Missing coverage = finding. After the local traceability check passes, an **impartial scope-completeness subagent** independently audits the implementation against the spec — last safety net before push.

## MANDATORY SEQUENCE

### 1. Build Traceability Matrix

For each BAC and each TAC in the issue description (story-spec v2: BACs in G/W/T, TACs in EARS):

```yaml
traceability:
  # Business Acceptance Criteria (G/W/T) — verified by VM (Validation Metier) at production time
  # AND by integration / journey tests pre-production
  - ac_id: 'BAC-1'
    ac_format: 'given-when-then'
    ac_text: 'Given …, when …, then …'
    expected_levels: [Integration, Journey]  # from TEST_STRATEGY
    priority: P0
    coverage:
      integration: { status: COVERED | MISSING, tests: ['file.spec.ts:line - test name'] }
      journey: { status: COVERED | MISSING | N/A, tests: [] }
      vm: { status: PLANNED, vm_id: 'VM-N' }  # Validation Metier executes at production time
    overall: FULL | PARTIAL | MISSING

  # Technical Acceptance Criteria (EARS) — verified by unit + integration tests
  - ac_id: 'TAC-1'
    ac_format: 'ears'
    ac_pattern: 'ubiquitous' | 'event-driven' | 'state-driven' | 'optional' | 'unwanted'
    ac_text: 'When …, the … shall …' (or other EARS pattern)
    refs_bacs: ['BAC-1', 'BAC-2']
    expected_levels: [Unit, Integration]  # from TEST_STRATEGY
    priority: P0
    coverage:
      unit: { status: COVERED | MISSING, tests: ['file.spec.ts:line'] }
      integration: { status: COVERED | MISSING, tests: [] }
    pattern_scaffold_match: TRUE | FALSE  # does the test scaffold match the EARS pattern?
    overall: FULL | PARTIAL | MISSING
```

**EARS pattern → test scaffold expectation:**
- Ubiquitous → "always" assertion across multiple fixtures
- Event-driven → setup + trigger + assert
- State-driven → state-machine test (pre-state, transition, post-state)
- Optional → feature-flag conditional test
- Unwanted → negative test + alert assertion (verify the system DID NOT do the forbidden thing AND emitted the proper alert/error)

If `pattern_scaffold_match` is FALSE → MINOR finding (test exists but doesn't exercise the EARS pattern correctly).

### 2. Scan Test Files

```bash
cd {WORKTREE_PATH}
git diff --name-only origin/main...HEAD | grep -E '\.(spec|test)\.(ts|js)$'
```

For each test file, read and match `describe`/`it` blocks to ACs by keyword/intent matching.

### 3. Evaluate Completeness

```yaml
traceability_summary:
  bacs:
    total: 0
    fully_covered: 0
    partially_covered: 0
    not_covered: 0
  tacs:
    total: 0
    by_pattern:
      ubiquitous: { total: 0, covered: 0 }
      event_driven: { total: 0, covered: 0 }
      state_driven: { total: 0, covered: 0 }
      optional: { total: 0, covered: 0 }
      unwanted: { total: 0, covered: 0 }
    fully_covered: 0
    partially_covered: 0
    not_covered: 0
    pattern_mismatches: 0  # tests exist but don't match the EARS pattern (MINOR)
  verdict: PASS | GAPS_FOUND
```

A BAC without at least one VM (Validation Metier) is a GAP (production verification missing). Surface as MAJOR.
A TAC with `pattern_scaffold_match: FALSE` is a MINOR finding (test exists but doesn't exercise the EARS pattern correctly).

### 4. Address Gaps

<check if="verdict == PASS">
  Log: "Traceability: PASS — all ACs covered at expected test levels"

  **TEAMMATE_MODE branch (autonomy_policy=spec-driven)** :
  - Verdict PASS = all BACs/TACs linked → auto-resolve (TACTICAL). Capture in `AUTONOMY_DECISIONS[]` : `{decision: 'traceability-tactical', classification: 'tactical', default_applied: 'all BACs/TACs linked — auto-resolve PASS', rationale: 'TAC-5b — full coverage matches spec test strategy'}`.
</check>

<check if="orphan TAC found (TAC referenced in spec but no corresponding implementation file or test)">
  **STRUCTURAL** — orphan TAC indicates spec inconsistency (TAC-6).
  - **TEAMMATE_MODE=true AND autonomy_policy=spec-driven** : emit `SendMessage(question, critical_ambiguity: true)` to `LEAD_NAME` with the orphan TAC details. Block until reply.
  - **Else** : HALT inline, surface to user as MAJOR finding.
</check>

<check if="gaps include P0 ACs">
  **P0 gaps are BLOCKERS — must fix before proceeding.**
  Write missing tests now (TDD RED -> GREEN).
  Re-evaluate traceability.
</check>

<check if="gaps are P1+ only">
  Branch on autonomy_policy:
  - **TEAMMATE_MODE=true AND autonomy_policy=spec-driven** : check if gap is TACTICAL (test-write only, no scope change) — if yes, complete missing tests automatically per Rule 8 (fix-by-default). Capture in `AUTONOMY_DECISIONS[]` : `{decision: 'traceability-gap-fill', classification: 'tactical', default_applied: 'auto-write missing P1+ tests', rationale: 'TAC-5b — gap-fill is routine test scaffold'}`. If gap is STRUCTURAL (architecture missing, contract change required) → emit `SendMessage(question, critical_ambiguity: true)` and HALT.
  - **Else** : Ask user:
    1. Complete missing tests now
    2. Continue and note gaps in tracker comment
    WAIT for user choice.
</check>

### 5. Verify Task Completion

For each task marked [x] in the issue, verify it is truly complete:
- Code exists for this task
- Tests exist for this task
- Tests pass
- Acceptance criteria satisfied
- No regressions introduced

<check if="any task incorrectly marked complete">
  Flag the task as incomplete.
  Fix the issue.
  Re-validate.
</check>

### 6. Impartial Scope-Completeness Audit (mandatory)

After the local traceability matrix passes, spawn an independent, impartial subagent that re-checks the SAME story against the ACTUAL implementation (the diff), with no shared context with this thread. This is the last safety net before push.

#### Why a separate audit when traceability already ran?

- Traceability (sections 1–5) is built BY the same thread that wrote the code — it answers "for each AC I know about, is there a test?"
- The impartial audit answers a stricter question: "for each task and AC declared in the spec, does the implementation deliver it? Are there oversights, missing files, scope creep, or stale references the author missed?"
- The two are complementary; both run before push.

#### Gating

This audit is **MANDATORY** at end-of-workflow — it always runs. The cost (~30-60s of subagent time) is small relative to the cost of a missed scope item shipping to review.

The only allowed skip: if the traceability matrix in section 3 reports `verdict: PASS` AND total ACs < 3 AND total tasks < 5 AND no cross-cutting infrastructure files were modified (no changes under `bmad-shared/`, `core-skills/`, `tools/`, `.github/workflows/`). Otherwise: run.

If skipping, log: `Impartial scope audit skipped (trivial story + clean traceability)`. Otherwise proceed below.

#### Invocation

Spawn the subagent per the contract `{scopeCompletenessSubagent}`. CRITICAL: the prompt MUST contain ONLY the inputs listed below — no summary, no excerpt, no hint about what was implemented. The subagent's value depends on its independence.

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Impartial scope-completeness audit (post-implementation)',
  prompt: |
    Read and apply this contract IN FULL: ~/.claude/skills/bmad-dev-story/subagent-workflows/scope-completeness.md

    Inputs:
      story_path: '{ABSOLUTE_PATH_TO_STORY_FILE_OR_TRACKER_DUMP}'
      worktree_path: '{WORKTREE_PATH}'
      baseline_commit: '{BASELINE_COMMIT}'

    Return the structured Markdown report defined in the contract. No preamble, no postamble.
)
```

`{BASELINE_COMMIT}` is `git merge-base HEAD origin/main` from the worktree (same value used by step-11 self-review).

If the issue tracker is file-based (the story is a markdown file), pass the local path. If the tracker is API-based (Linear / GitHub / GitLab), dump the issue body to a temporary file in the worktree and pass that path:

```bash
# Example for file-based tracker:
STORY_PATH="{TRACKER_STORY_LOCATION}/{story-slug}.md"

# Example for Linear:
mkdir -p {WORKTREE_PATH}/.bmad-tmp
linear issue view {ISSUE_IDENTIFIER} --markdown > {WORKTREE_PATH}/.bmad-tmp/story.md
STORY_PATH="{WORKTREE_PATH}/.bmad-tmp/story.md"
```

#### Handling the report

Wait for the subagent's response (a structured Markdown report with sections: Coverage matrix / Oversights detected / Risks not addressed / Verdict).

**If verdict = `APPROVED`** (no BLOCKER, ≤2 MAJOR):
Store the report alongside `TRACEABILITY_REPORT` for inclusion in the completion comment (Step 14). Proceed to step 7.

**If verdict = `NEEDS REVISION`** (≥1 BLOCKER or >2 MAJOR):
1. Present the findings to the user verbatim.
2. For each finding:
   - **BLOCKER**: must fix before push. Implement the fix (back to step-08 mentally, run tests, re-validate). Then re-run the audit.
   - **MAJOR**: ask the user — fix now, defer to a follow-up issue, or accept with justification.
3. The audit may re-run ONCE on the corrected diff (bounded to 2 iterations total to prevent infinite refinement).
4. If still NEEDS REVISION after 2 iterations, **HALT** and ask the user how to proceed (accept remaining findings with explicit justification recorded in the MR description, or abandon push).

The audit findings (or the explicit acceptance) MUST be visible to the user before step-13 (push & MR creation).

### 7. Proceed

Store TRACEABILITY_REPORT and IMPARTIAL_AUDIT_REPORT for inclusion in completion comment (Step 14).
Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Every AC mapped to tests, P0 gaps addressed, all tasks verified, impartial audit APPROVED (or explicit user acceptance of remaining findings)
### FAILURE: Skipping traceability, ignoring P0 gaps, marking tasks complete without verification, skipping the impartial audit on a non-trivial story, hiding audit findings from the user

---

## STEP EXIT (CHK-STEP-12-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-12-EXIT PASSED — completed Step 12: Traceability, Task Verification & Impartial Scope Audit
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
