---
nfrRegistryTemplate: '~/.claude/skills/bmad-shared/data/nfr-registry-template.md'
securityGateTemplate: '~/.claude/skills/bmad-shared/data/security-gate-template.md'
observabilityRequirementsTemplate: '~/.claude/skills/bmad-shared/data/observability-requirements-template.md'
---

# Step 9: NFR Registry, Security Gate & Observability Requirements


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "story interne sans NFR", "pas de donnees sensibles", "obs deja en place".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-08-EXIT emis dans la conversation)
- [ ] Data model + API contracts + infra + external interfaces issus de Step 8 disponibles
- [ ] Real-Data Findings (Step 5) + External Research (Step 6) accessibles pour cross-reference

Emettre EXACTEMENT:

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: NFR Registry, Security Gate & Observability Requirements with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Produce three structured artefacts that gate the spec for production-readiness:

1. **NFR Registry** — 7-category non-functional requirements with measurable targets
2. **Security Gate** — binary checklist (PASS / FAIL / N/A) with compliance coverage
3. **Observability Requirements** — structured logs / metrics / traces / alerts / dashboards / SLOs

Each artefact is mandatory; each item within is mandatory; N/A is allowed only with a one-line justification.

## RULES

- Apply `bmad-shared/core/no-fallback-no-false-data.md`, `bmad-shared/validation/validation-protocol.md#proof-principles`, `bmad-shared/validation/validation-protocol.md#verdict` (binary verdict semantics for the security gate)
- Cross-reference `project.md#nfr-defaults` / `#observability-standards` / `#compliance-requirements` / `#security-baseline` (schema v1.1+)
- Outputs follow templates: {nfrRegistryTemplate}, {securityGateTemplate}, {observabilityRequirementsTemplate}
- Targets must be quantifiable — no "fast", no "secure", no "good UX"
- Security Gate is BINARY — any FAIL → BLOCKING for production. Add remediation tasks (carried into Step 11)

## SEQUENCE

### 1. NFR Registry

Load {nfrRegistryTemplate}.

Walk through each of the 7 categories and produce a row per category:

| Category | What to address | Source |
| -------- | --------------- | ------ |
| Performance     | response time, throughput, latency p95/p99 | Step 5 (volume), Step 6 (vendor SLA), `project.md#nfr-defaults` |
| Scalability     | concurrent users, data volume, growth headroom | Step 5 (volume + growth) |
| Availability    | uptime SLO, RTO, RPO | `project.md#nfr-defaults` + Step 6 (vendor) |
| Reliability     | error budget, retry policy, idempotency | Step 6 (best practices), Step 7 (patterns) |
| Security        | high-level pointer to Security Gate | (cross-ref to gate below) |
| Observability   | high-level pointer to Observability Requirements | (cross-ref below) |
| Maintainability | test coverage target, doc, complexity | (via validation-tooling-lookup protocol + `project.md#conventions`) |
| Usability       | accessibility (WCAG), i18n, error messaging | `project.md` UX section if present |

Produce the NFR registry table. Every category MUST have a verdict: PRESENT / MISSING / PARTIAL / N/A (with 1-line justification for N/A).

**Anti-pattern check:**
- Marking everything N/A without justification → REJECT
- Performance N/A on a user-facing endpoint → REJECT
- Security N/A when story touches auth / data / secrets → REJECT
- Observability N/A when story adds new code paths → REJECT (logs minimum)

### 2. Security Gate

Load {securityGateTemplate}.

Cross-reference with `project.md#security-baseline` and `project.md#compliance-requirements` if defined.

Walk through each row of the binary checklist:

- Authentication
- Authorization
- Data Exposure
- Input Sanitization
- Secrets Handling
- Audit Trail
- Compliance — GDPR
- Compliance — HIPAA
- Compliance — SOC2
- Compliance — PCI-DSS
- Compliance — Other (project-specific)

For each, emit one of: **PASS** (with evidence file:line) / **FAIL** (with remediation) / **N/A** (with justification).

**Verdict rule:** ANY item FAIL → security gate FAILS → BLOCKING. Add remediation tasks (carried into Step 11). The gate ITSELF is binary — there is no PARTIAL, no PASS-with-caveats.

If story is high-risk security (auth changes, encryption, PII handling), produce the gate even if everything passes — the explicit PASS is the audit trail.

### 3. Observability Requirements

Load {observabilityRequirementsTemplate}.

Cross-reference with `project.md#observability-standards` if defined.

Produce subsections:

**a. Structured Logs**
- Mandatory log events (each with severity + required fields + purpose)
- Project standard fields propagated (`trace_id`, `span_id`, `service`, `env`, `version`)

**b. Metrics**
- Per metric: name (with unit suffix), type (counter/gauge/histogram), labels, purpose, SLI flag

**c. Traces**
- Span propagation (upstream context preserved)
- Critical operation spans listed
- Sampling rate

**d. Alerts**
- Per alert: name, trigger expression, severity, routing channel, runbook URL (or "TODO" with task added in Step 11)

**e. Dashboards**
- Existing dashboard URL or task added to create one
- Required panels listed

**f. SLOs / SLIs**
- Per user-facing operation: SLI definition, SLO target, window, error budget

**Anti-pattern check:**
- `console.log` instead of structured logger → REJECT
- PII in logs (full credit card, password, JWT) → REJECT
- Alert without runbook → REJECT
- Metric without unit in name (`duration` instead of `duration_ms`) → REJECT

### 4. Cross-link to Step 11

For every MISSING / FAIL / PARTIAL item, queue a task entry to be picked up in Step 11:

- NFR MISSING → "Implement {target} measurement + ensure target met"
- Security FAIL → "Remediate {item}" with concrete action
- Observability MISSING → "Add {log/metric/trace/alert} per requirement"

These will be added to the Implementation Plan tasks alongside the application tasks.

### 5. Checkpoint

Present consolidated findings:

```
## NFR / Security / Observability — Synthesis

### NFR Registry
{table}

### Security Gate Verdict: PASS / FAIL
{n_pass} PASS, {n_fail} FAIL, {n_na} N/A

### Observability Coverage
{N} mandatory log events, {N} metrics, {N} alerts, {N} SLOs defined

### Tasks queued for Step 11
- {N} NFR remediation tasks
- {N} security remediation tasks (if FAIL)
- {N} observability tasks
```

WAIT for user feedback. If FAIL items exist, the user must explicitly acknowledge before proceeding.

### 6. Proceed

Load and execute `./step-10-audit.md`.

---

## STEP EXIT (CHK-STEP-09-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-09-EXIT PASSED — completed Step 9: NFR Registry, Security Gate & Observability Requirements
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-10-audit.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-10-audit.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
