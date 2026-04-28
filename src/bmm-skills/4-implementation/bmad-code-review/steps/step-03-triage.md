---
nextStepFile: './step-04-present.md'
judgeTriage: '../subagent-workflows/judge-triage.md'
severityActionMatrix: '../data/severity-action-matrix.md'
---

# Step 3: Judge-Triage Consolidation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Judge-Triage Consolidation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Hand the 5-7 meta-reports to a dedicated `judge-triage` subagent. The judge deduplicates findings, applies security voting consensus (S1 + S2 → CONFIRMED vs SINGLE_REVIEWER), classifies each finding with an `action`, computes per-meta scores, renormalises weights if conditional metas did not activate, and emits the overall verdict.

This step is a single `Agent()` call. The judge runs at the same model tier as the orchestrator (model parity constraint).

---

## PRE-CHECK

- `META_REPORTS` must be non-empty
- `REVIEW_WORKTREE_PATH` must still be valid

Per-meta weights used by the judge (documented in `{judgeTriage}`):

| Meta | Weight |
|------|--------|
| M1 Contract & Spec Integrity | 0.20 |
| M2 Correctness & Reliability | 0.20 |
| M3 Security & Privacy | 0.25 |
| M4 Engineering Quality | 0.20 |
| M5 Operations & Deployment | 0.10 |
| M6 User-facing Quality | 0.05 |

Within Meta 2, sub-axis 2a Zero-Fallback carries weight **0.15** (raised from v1's 0.10). Sub-axes 2b and 2c share 0.425 each.

Action classification follows `{severityActionMatrix}`.

---

## INVOKE JUDGE-TRIAGE

Issue exactly ONE `Agent()` call:

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Judge-triage: consolidate meta reports into verdict',
  prompt: |
    Read and apply: {judgeTriage}
    Read and apply: {severityActionMatrix}

    input_reports:
      - meta: 1
        {META_REPORTS.M1}
      - meta: 2
        {META_REPORTS.M2}
      - meta: 3
        s1_findings: {META_REPORTS.M3.s1_findings}
        s2_findings: {META_REPORTS.M3.s2_findings}
      - meta: 4
        {META_REPORTS.M4}
      - meta: 5   # include only if M5 activated
        {META_REPORTS.M5 or null}
      - meta: 6   # include only if M6 activated
        {META_REPORTS.M6 or null}

    linear_issue: {LINKED_TRACKER_ISSUE or null}
    regression_risk:
      level: {REGRESSION_RISK_LEVEL}
      phase2_suspicious_removals: {PHASE2_SUSPICIOUS_REMOVALS}
    model_tier: '{ORCHESTRATOR_MODEL_TIER}'

    Return the YAML `consolidated_report` as defined in the judge-triage workflow.
    CRITICAL: Enforce model parity — you MUST run at the same model tier as the orchestrator.
    CRITICAL: You are READ-ONLY. Do NOT re-read source files.
)
```

---

## HANDLE JUDGE FAILURE (G1 — zero fallback for the skill itself)

Parse the returned `consolidated_report`. If it carries:

```yaml
consolidated_report:
  verdict: REJECTED
  error: 'judge_unable_to_consolidate'
  reason: '{explanation}'
  failed_layers: [...]
```

→ HALT the workflow. Per `bmad-shared/no-fallback-no-false-data.md` and G1 of the Tech Spec, the orchestrator does NOT fall back to presenting raw reports. Report the failure to the user with the reason and propose:

1. Retry judge-triage (transient failure)
2. Abort the review (judge unreachable, user investigates the model tier / context)

Wait for user choice. NEVER silently present raw reports to the user.

---

## PROPAGATE CONSOLIDATED REPORT

Store:

- `CONSOLIDATED_REPORT` — full YAML
- `VERDICT` — `APPROVED` / `NEEDS_WORK` / `REJECTED`
- `SCORE_OVERALL` — float
- `SCORES_PER_META` — map
- `FINDINGS` — unified, deduped, classified with severity × action
- `FAILED_LAYERS` — any empty/timeout meta agents
- `AC_COVERAGE` — propagated from Meta-1
- `CONSENSUS_LOG` — from Meta-3 voting

Proceed to `{nextStepFile}`.

## SUCCESS/FAILURE:

### SUCCESS: Single Agent() call to judge-triage, valid consolidated report received, stored for presentation
### FAILURE: Skipping judge-triage, falling back to raw reports on judge failure, ignoring model parity constraint

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Judge-Triage Consolidation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
