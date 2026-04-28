# Step 2: Risk Assessment


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Risk Assessment with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Analyze the loaded requirements and architecture to identify concrete risks, score each using a 3x3 probability/impact matrix, and classify them into action thresholds. In system-level mode, also perform a testability review of the architecture. This assessment drives test coverage priorities in the next step.

## RULES

- Every risk must trace to a specific requirement, AC, or architectural decision — no generic risks
- Use exactly 6 risk categories: SEC (Security), PERF (Performance), DATA (Data Integrity), BUS (Business Logic), TECH (Technical), OPS (Operational)
- Probability and Impact are each scored 1-3 (Low/Medium/High)
- Score = Probability x Impact (range 1-9)
- Threshold classification is deterministic based on score

## SEQUENCE

### 1. Testability assessment (system-level mode only)

**Skip this section if MODE = "epic-level"** — jump to section 2.

In system-level mode, evaluate the architecture for testability before identifying risks. Assess three dimensions:

**Controllability** — Can tests control system state?
- State seeding mechanisms (test data APIs, seed scripts, factories)
- Mock seams for external dependencies (DI containers, adapter pattern, feature flags)
- Fault injection capability (circuit breaker triggers, error simulation endpoints)

**Observability** — Can tests observe outcomes deterministically?
- Structured logging (JSON format, correlation IDs, trace context)
- Metrics endpoints (Prometheus, health checks, readiness probes)
- Deterministic assertion points (API contracts, DB state, event payloads — not timing-dependent)

**Isolation & Reliability** — Can tests run independently?
- Test isolation (no shared mutable state, parallel-safe test data)
- Reproducibility (no flaky dependencies, deterministic ordering)
- Environment parity (local/CI/staging consistency)

**Output structure:**

1. **Testability Concerns** — actionable issues that block or degrade test quality (list as blockers or improvements needed, with owner and timeline recommendations)
2. **Testability Assessment Summary** — what is already strong
3. **Architecturally Significant Requirements (ASRs)** — mark each as ACTIONABLE (requires change) or FYI (awareness only)

Store the testability assessment for inclusion in the output documents (step 4).

### 2. Identify risks

Analyze the loaded PRD, Architecture, and stories/projects for risks across all 6 categories:

| Category | What to look for |
|----------|-----------------|
| **SEC** | Auth flows, data exposure, input validation, third-party integrations, API surface |
| **PERF** | High-throughput paths, large datasets, real-time requirements, batch operations |
| **DATA** | Schema migrations, data transformations, cross-service consistency, financial calculations |
| **BUS** | Complex business rules, state machines, edge cases in ACs, multi-step workflows |
| **TECH** | New technologies, complex integrations, shared dependencies, infrastructure changes |
| **OPS** | Deployment risks, rollback complexity, monitoring gaps, configuration management |

For each identified risk, record:

```yaml
- id: 'R-001'
  category: SEC | PERF | DATA | BUS | TECH | OPS
  description: 'Specific risk description tied to a requirement or decision'
  source: 'Reference to the AC, PRD section, or architecture element'
  probability: 1-3  # 1=Low, 2=Medium, 3=High
  impact: 1-3       # 1=Low, 2=Medium, 3=High
  score: 1-9        # probability x impact
  threshold: DOCUMENT | MONITOR | MITIGATE | BLOCK
  mitigation: 'How to mitigate through testing or design'
```

### 3. Score using 3x3 matrix

Apply scores using this matrix:

```
              Impact
              Low(1)    Med(2)    High(3)
Prob High(3)   3         6         9
Prob Med(2)    2         4         6
Prob Low(1)    1         2         3
```

### 4. Classify thresholds

Assign threshold based on score:

| Score | Threshold | Action |
|-------|-----------|--------|
| 1-3 | **DOCUMENT** | Record the risk and move on. Minimal test coverage. |
| 4-5 | **MONITOR** | Track actively. Standard test coverage with monitoring. |
| 6-8 | **MITIGATE** | Requires dedicated test coverage + mitigation plan. |
| 9 | **BLOCK** | Must resolve before implementation proceeds. Maximum test coverage. |

### 5. Update counters

Set `RISK_COUNT` = total number of identified risks.
Set `HIGH_RISK_COUNT` = count of risks with score >= 6.

### 6. CHECKPOINT

Present the risk matrix to the user:

> **Risk Assessment Summary**
>
> Total risks: {RISK_COUNT} | Critical (score >= 6): {HIGH_RISK_COUNT}
>
> | ID | Cat | Description | Prob | Impact | Score | Threshold |
> |----|-----|-------------|------|--------|-------|-----------|
> | R-001 | ... | ... | ... | ... | ... | ... |
>
> **BLOCK risks (score 9):** {list or "None"}
> **MITIGATE risks (score 6-8):** {list}

If system-level mode, also present the testability assessment summary.

If any BLOCK risks exist, flag:
> "BLOCK risks identified. These must be resolved before implementation. Proceed with test design assuming resolution?"

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Risk Assessment
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-coverage.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
