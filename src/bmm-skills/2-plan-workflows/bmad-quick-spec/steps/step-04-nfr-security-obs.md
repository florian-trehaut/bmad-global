---
nextStepFile: './step-05-plan.md'
---

# Step 4: NFR Registry, Security Gate, Observability Requirements

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-03-EXIT emis dans la conversation
- [ ] Variables en scope: DATA_MODEL, API_CONTRACTS

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: NFR/Security/Observability with SLUG={slug}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Produce three mandatory sections:
1. NFR Registry covering 7 categories — each PRESENT / PARTIAL / MISSING / N/A justified
2. Security Gate with binary verdict (PASS / FAIL / N/A)
3. Observability Requirements (logs / metrics / traces / alerts / dashboards / SLOs)

Apply `~/.claude/skills/bmad-shared/validation-verdict-protocol.md` for the Security Gate's binary semantics.

## MANDATORY SEQUENCE

### 1. NFR Registry — 7 categories

Cross-reference baseline: `project.md#nfr-defaults` — load if present, otherwise note ABSENT and use per-story values.

Build the table with one row per category:

| # | Category | Verdict | Target / Justification |
|---|----------|---------|------------------------|
| 1 | Performance | {PRESENT/PARTIAL/MISSING/N/A} | {target_or_justification} |
| 2 | Scalability | {…} | {…} |
| 3 | Availability | {…} | {…} |
| 4 | Reliability | {…} | {…} |
| 5 | Security | {PRESENT — see Security Gate below} | {…} |
| 6 | Observability | {PRESENT — see Observability section below} | {…} |
| 7 | Maintainability | {…} | {…} |

For each MISSING or PARTIAL row, add a remediation task to a `Tasks queued for remediation` list at the bottom of the section. Do NOT silently skip a category.

Store as `NFR_REGISTRY`.

### 2. Security Gate — binary verdict

Cross-reference baseline: `project.md#security-baseline` and `project.md#compliance-requirements` — load if present.

Build the table with one row per item (skip N/A for compliance categories the project doesn't observe):

| # | Item | Verdict | Evidence / Justification |
|---|------|---------|--------------------------|
| 1 | Authentication | {PASS/FAIL/N/A} | {…} |
| 2 | Authorization | {…} | {…} |
| 3 | Data Exposure | {…} | {…} |
| 4 | Input Sanitization | {…} | {…} |
| 5 | Secrets Handling | {…} | {…} |
| 6 | Audit Trail | {…} | {…} |
| 7 | Compliance — GDPR | {…} | {…} |
| 8 | Compliance — HIPAA | {…} | {…} |
| 9 | Compliance — SOC2 | {…} | {…} |
| 10 | Compliance — PCI-DSS | {…} | {…} |
| 11 | Compliance — Other | {…} | {…} |

**Binary verdict:** the Security Gate is PASS only if 0 items are FAIL. Any FAIL → overall verdict = FAIL → HALT (apply `validation-verdict-protocol.md` semantics).

For each PARTIAL or FAIL row, add a remediation task. PASS-with-PARTIAL is acceptable; FAIL is not.

Store as `SECURITY_GATE` with `verdict={PASS|FAIL|N/A}`.

### 3. Observability Requirements

Cross-reference baseline: `project.md#observability-standards` — load if present.

Document mandatory log events:

| Event | Severity | Required Fields | Purpose |
|-------|----------|-----------------|---------|

For BMAD-METHOD specifically, CHK-STEP-NN-ENTRY/EXIT receipts in the conversation log are the primary observability mechanism — list them as the mandatory events.

For metrics / traces / alerts / dashboards / SLOs:
- For framework-internal Markdown skills: usually `All N/A — {justification}` (no metrics infrastructure, no central alerting)
- For deployed services: must define at least one SLI per critical path

Store as `OBSERVABILITY`.

### 4. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: NFR Registry covers all 7 categories with explicit verdicts; Security Gate verdict is binary (PASS/FAIL/N/A) with 0 FAIL items if PASS; Observability section explicitly lists logs (or N/A justified)
- **FAILURE**: leaving a category blank, declaring PASS with a FAIL row, omitting remediation tasks for PARTIAL/MISSING

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: NFR/Security/Observability
  actions_executed: built NFR Registry ({n_present}/7 PRESENT, {n_partial}/7 PARTIAL, {n_missing}/7 MISSING, {n_na}/7 N/A); built Security Gate (verdict: {PASS/FAIL/N/A}); built Observability section ({N} log events, {M} metrics)
  artifacts_produced: NFR_REGISTRY, SECURITY_GATE (verdict={…}), OBSERVABILITY
  next_step: ./steps/step-05-plan.md
```

**Next:** Read FULLY and apply: `./steps/step-05-plan.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
