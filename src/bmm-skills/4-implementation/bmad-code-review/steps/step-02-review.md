---
nextStepFile: './step-03-triage.md'
meta1: '../subagent-workflows/meta-1-contract-spec.md'
meta2: '../subagent-workflows/meta-2-correctness-reliability.md'
meta3: '../subagent-workflows/meta-3-security-privacy.md'
meta4: '../subagent-workflows/meta-4-engineering-quality.md'
meta5: '../subagent-workflows/meta-5-operations-deployment.md'
meta6: '../subagent-workflows/meta-6-user-facing-quality.md'
---

# Step 2: Parallel Review Dispatch


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Parallel Review Dispatch with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Dispatch the 5-7 review agents in ONE orchestrator message, so the Claude Code runtime executes them concurrently. Every worker returns a structured YAML `perspective_report` directly via the `Agent()` tool response. No Agent Teams orchestration primitives are used — no experimental flag required.

The agents are scoped by `ACTIVE_METAS` (computed in step-01). Always-on metas: M1 + M2 + M3 (×2 for S1/S2 voting) + M4. Conditional metas: M5 (infra/CI/commits) + M6 (UI+i18n). Typical review spawns 5-7 agents.

---

## PRE-CHECK: Worktree Invariant

**HALT if** `REVIEW_WORKTREE_PATH` is unset, empty, or the directory does not exist.

**HALT if** `ACTIVE_METAS` is empty — step-01 must have computed trigger routing.

---

## ANTI-RATIONALIZATION RULE (MANDATORY — ALL PERSPECTIVES)

Code comments that justify shortcuts, casts, workarounds, or deviations are **evidence of a problem, not an attenuation**. Detection signals:

- Comments starting with "// This is needed because...", "// TS requires...", "// Structurally compatible..."
- `as` casts accompanied by "why it's safe" comments
- `// TODO` / `// FIXME` paired with justification for leaving it
- Comments explaining why a type/architecture/pattern deviation is "acceptable"

**Rule:** When you encounter such a comment:

1. Ignore the comment entirely — pretend it doesn't exist
2. Judge the code on its own merits
3. If the code needs a comment to justify itself, the code is wrong
4. Classify as WARNING minimum, never RECOMMENDATION

---

## SELF-REVIEW MODE (REVIEW_MODE == 'self')

Self-review uses the SAME 5-agent colleague-mode pattern but with a reduced set of active sub-axes for speed. Same `Agent()` orchestration — 5 parallel calls in one message covering M1, M2, M3 (S1+S2), M4. M5 and M6 only activate if the diff triggers them per step-01's routing table.

Self-review preserves the adversarial voting structure (S1 attacker / S2 defender) — the author's perspective is the weakest lens on their own code; asymmetric security reviewers partially correct for this.

The orchestration block below is the colleague-mode block — read on.

---

## COLLEAGUE REVIEW MODE (REVIEW_MODE == 'colleague')

Dispatch ALL the following `Agent()` calls in a SINGLE orchestrator message — the runtime executes them concurrently and returns results synchronously.

### Always-on: 3 review-worker agents + 2 asymmetric security agents

#### Agent A — Meta-1 Contract & Spec Integrity

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Meta-1 Contract & Spec Integrity',
  prompt: |
    Read and apply: {meta1}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      meta: 1
      active_sub_axes: {ACTIVE_METAS.M1.sub_axes}
      linear_issue:
        identifier: '{ISSUE_IDENTIFIER}'
        description: |
          {ISSUE_DESCRIPTION}
        acceptance_criteria: {AC_LIST}
      changed_files: {CHANGED_FILES}
      diff_stats: '{DIFF_STATS}'
      phase2_suspicious_removals: {PHASE2_SUSPICIOUS_REMOVALS}
      project_adrs: {PROJECT_ADRS}

    Return a YAML `perspective_report` per the meta-1 contract.
    CRITICAL: You are READ-ONLY.
)
```

#### Agent B — Meta-2 Correctness & Reliability

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Meta-2 Correctness & Reliability',
  prompt: |
    Read and apply: {meta2}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      meta: 2
      active_sub_axes: {ACTIVE_METAS.M2.sub_axes}
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` per the meta-2 contract.
    CRITICAL: You are READ-ONLY.
)
```

#### Agent S1 — Meta-3 Security (attacker POV, low creativity)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Meta-3 Security S1: attacker POV (voting 1/2)',
  prompt: |
    Read and apply: {meta3}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    POV_FRAMING: attacker
    CREATIVITY: low (emulate temperature 0.2 — deterministic, focused)
    DIRECTIVE: |
      Assume an adversary is reading this code looking for exploit paths.
      Enumerate concrete attack vectors; prefer depth on known CVE classes
      over breadth. Only report findings with a plausible exploit chain.

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      meta: 3
      group_id: 'S1'
      pov: 'attacker'
      temperature_hint: 0.2
      active_sub_axes: {ACTIVE_METAS.M3.sub_axes}
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` per the meta-3 contract.
    CRITICAL: You are READ-ONLY. Do NOT coordinate with S2.
)
```

#### Agent S2 — Meta-3 Security (defender POV, medium creativity)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Meta-3 Security S2: defender POV (voting 2/2)',
  prompt: |
    Read and apply: {meta3}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    POV_FRAMING: defender
    CREATIVITY: medium (emulate temperature 0.5 — creative, coverage-oriented)
    DIRECTIVE: |
      Assume this code is in production and you are designing defense-in-depth.
      Enumerate classes of risk that could emerge under load, misuse, or
      edge-case inputs. Prefer breadth — surface latent risks even without a
      confirmed exploit chain.

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      meta: 3
      group_id: 'S2'
      pov: 'defender'
      temperature_hint: 0.5
      active_sub_axes: {ACTIVE_METAS.M3.sub_axes}
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` per the meta-3 contract.
    CRITICAL: You are READ-ONLY. Do NOT coordinate with S1.
)
```

#### Agent C — Meta-4 Engineering Quality

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Meta-4 Engineering Quality',
  prompt: |
    Read and apply: {meta4}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      meta: 4
      active_sub_axes: {ACTIVE_METAS.M4.sub_axes}
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` per the meta-4 contract.
    CRITICAL: You are READ-ONLY.
)
```

### Conditional: M5 + M6

If `M5` is in `ACTIVE_METAS` → add Agent D (Meta-5 Operations & Deployment) using the same pattern with `{meta5}`.

If `M6` is in `ACTIVE_METAS` → add Agent E (Meta-6 User-facing Quality) using `{meta6}`.

### All 5-7 `Agent()` calls run in the SAME orchestrator message.

---

## Handle Agent Failures

Any agent that returns empty / timeout / parse-error: record its group_id in `failed_layers`. Do NOT retry silently. Per `bmad-shared/no-fallback-no-false-data.md`, a failed layer must be surfaced to the user rather than substituted with an empty report. Judge-triage (step-03) carries `failed_layers` through to the consolidated verdict.

---

## Collect Reports

Parse each returned YAML `perspective_report`. Validate each contains:

- `meta` (or legacy `group_id`) matching the dispatched agent
- `perspectives_completed` (or `sub_axes_completed` for metas) covering the contract's scope
- `findings[]` with `{severity, perspective (or sub_axis), file, line, title, detail, fix}`
- `summary` with severity counts

If validation fails → record in `failed_layers` with the parse error.

Store all reports as `META_REPORTS` (keyed by meta number; Meta-3 has both `s1_findings` and `s2_findings`).

---

## Proceed

Pass `META_REPORTS`, `LINKED_TRACKER_ISSUE`, `REGRESSION_RISK_LEVEL`, `PHASE2_SUSPICIOUS_REMOVALS`, and `ORCHESTRATOR_MODEL_TIER` to `{nextStepFile}` for judge-triage consolidation.

## SUCCESS/FAILURE:

### SUCCESS: All active agents dispatched in one parallel call, reports collected, failed layers recorded
### FAILURE: Calling agents sequentially, skipping S2 security voting, substituting failed layers with empty reports, violating READ-ONLY constraint

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Parallel Review Dispatch
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
