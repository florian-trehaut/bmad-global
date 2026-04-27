# Step 4: Synthesize and Save Assessment

## STEP GOAL

Compile all dimension assessments into a single NFR Assessment document, determine the overall verdict using deterministic gate logic, formulate prioritized recommendations, and save the document to the tracker.

## RULES

- Overall verdict follows strict aggregation: FAIL if any dimension FAIL, CONCERNS if any CONCERNS, PASS only if all PASS.
- Recommendations must be actionable — each one should describe what to do, where, and why.
- The document is saved to the tracker, not just output to chat.
- For epic-level: save in the Epic Project. For system-level: save in the Meta Project.
- The gate decision is deterministic — no subjective judgment. Evidence drives the verdict.

## SEQUENCE

### 1. Determine overall verdict

Apply aggregation rules across all six dimensions (security, performance, reliability, maintainability, observability, testability):

- **FAIL** = at least one dimension is FAIL
- **CONCERNS** = no dimension is FAIL, at least one is CONCERNS
- **PASS** = all dimensions are PASS

### 2. Evidence-based gate decision

Produce a deterministic gate verdict with supporting evidence:

**Gate decision logic:**

| Condition | Gate Status | Action |
|-----------|------------|--------|
| All dimensions PASS, no critical gaps | **PASS** | Proceed to release / next phase |
| No FAIL, but CONCERNS exist with mitigations identified | **CONCERNS** | Address HIGH/CRITICAL issues, re-run assessment |
| Any dimension FAIL, or critical unmitigated gaps | **FAIL** | Resolve FAIL-status dimensions before proceeding |

For each dimension contributing to the gate decision, cite the specific evidence:

```yaml
gate_evidence:
  security: { status: PASS, key_evidence: "Auth guards on all routes (src/auth/), validation pipes global" }
  performance: { status: CONCERNS, key_evidence: "N+1 in orders query (src/orders/service.ts:42), no caching" }
  reliability: { status: PASS, key_evidence: "Circuit breakers, retry logic, health checks present" }
  maintainability: { status: PASS, key_evidence: "Hexagonal architecture, 85% test coverage" }
  observability: { status: CONCERNS, key_evidence: "Logging present but no distributed tracing" }
  testability: { status: CONCERNS, key_evidence: "Testability index 3.2/5 — partial DI, missing test factories" }
```

### 3. Classify recommendations by priority

Review all gaps collected across dimensions and classify:

**P0 — Actions immediates (security/reliability risks):**
- Any FAIL-status finding
- Security vulnerabilities (injection, missing auth, exposed secrets)
- Reliability gaps that could cause data loss or outages

**P1 — Actions a planifier (significant quality gaps):**
- CONCERNS-status findings with clear improvement path
- Performance bottlenecks with measurable impact
- Missing observability that hinders incident response
- Testability gaps that block test automation

**P2 — Ameliorations (nice-to-have, tech debt):**
- Minor code quality issues
- Missing but non-critical documentation
- Dependency updates without security implications

### 4. Compose assessment document

Compose the full NFR Assessment document using this structure:

```markdown
# NFR Assessment — {PROJECT_NAME or 'System'}

**Date:** {current date}
**Scope:** {SCOPE}
**Auteur:** {USER_NAME}
**Verdict global:** {overall_verdict}

## Synthese

| Categorie       | Statut   | Gaps critiques |
| --------------- | -------- | -------------- |
| Securite        | {status} | {gap_count}    |
| Performance     | {status} | {gap_count}    |
| Fiabilite       | {status} | {gap_count}    |
| Maintenabilite  | {status} | {gap_count}    |
| Observabilite   | {status} | {gap_count}    |
| Testabilite     | {status} | {gap_count}    |

## Detail — Securite

### Authentication
- **Statut:** {status}
- **Evidence:** {evidence with file paths}
- **Gaps:** {gaps or "Aucun"}

### Authorization
{same structure}

### Input Validation
{same structure}

### Data Protection
{same structure}

### Injection Prevention
{same structure}

### Transport Security
{same structure}

## Detail — Performance

### Database
{same structure}

### Caching
{same structure}

### Async Patterns
{same structure}

### Payload Management
{same structure}

## Detail — Fiabilite

### Error Handling
{same structure}

### Retry & Resilience
{same structure}

### Transactions
{same structure}

### Health Checks
{same structure}

## Detail — Maintenabilite

### Architecture Adherence
{same structure}

### Code Quality
{same structure}

### Test Coverage
{same structure}

### Dependency Health
{same structure}

## Detail — Observabilite

### Logging
{same structure}

### Tracing
{same structure}

### Alerting
{same structure}

### Metrics
{same structure}

## Detail — Testabilite

### Mock Seams Clarity
- **Statut:** {status}
- **Score:** {1-5}/5
- **Evidence:** {evidence with file paths}
- **Gaps:** {gaps or "Aucun"}

### DI Readiness
{same structure with score}

### Test Infrastructure
{same structure with score}

### Isolation
{same structure with score}

### Testability Index
- **Score global:** {testability_index}/5.0
- **Verdict:** {PASS >= 4.0 | CONCERNS 2.5-3.9 | FAIL < 2.5}

## Recommandations

### Actions immediates (P0)

{numbered list of P0 actions with file paths and rationale}

### Actions a planifier (P1)

{numbered list of P1 actions}

### Ameliorations (P2)

{numbered list of P2 actions}

## Risques residuels

{list of known risks that cannot be fully mitigated, with their current status}

## Gate Decision

**Status:** {PASS | CONCERNS | FAIL}
**Evidence summary:** {one-line per dimension}

## Gate YAML Snippet

{gate_yaml — see below}
```

### 5. Generate gate YAML snippet

Include a machine-readable gate snippet at the end of the document:

```yaml
nfr_assessment:
  date: '{current_date}'
  project: '{PROJECT_NAME or System}'
  scope: '{SCOPE}'
  categories:
    security: '{security_status}'
    performance: '{performance_status}'
    reliability: '{reliability_status}'
    maintainability: '{maintainability_status}'
    observability: '{observability_status}'
    testability: '{testability_status}'
  testability_index: '{testability_index}/5.0'
  overall_status: '{overall_verdict}'
  p0_actions: {count}
  p1_actions: {count}
  p2_actions: {count}
  gate_decision: '{PASS | CONCERNS | FAIL}'
  blockers: {true | false}
```

### 6. Save to tracker

**If SCOPE == "epic":**

1. Check for an existing "NFR Assessment" document in the Epic Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
   - Operation: List documents
   - Project: PROJECT_ID
2. If a document titled "NFR Assessment" exists, update it:
   - Operation: Update document
   - Document: existing_doc_id
   - Content: composed_content
3. If no existing document, create it:
   - Operation: Create document
   - Title: "NFR Assessment"
   - Project: PROJECT_ID
   - Content: composed_content

**If SCOPE == "system":**

1. Check for an existing "NFR Assessment: System" document in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
   - Operation: List documents
   - Project: {TRACKER_META_PROJECT_ID}
2. Update or create as above, with title "NFR Assessment: System".

### 7. Report completion

Present to the user:

```
## NFR Assessment termine

- **Scope:** {SCOPE} — {PROJECT_NAME or 'System'}
- **Verdict:** {overall_verdict}
- **Securite:** {security_status}
- **Performance:** {performance_status}
- **Fiabilite:** {reliability_status}
- **Maintenabilite:** {maintainability_status}
- **Observabilite:** {observability_status}
- **Testabilite:** {testability_status} (index: {testability_index}/5.0)
- **Gate Decision:** {PASS | CONCERNS | FAIL}
- **Tracker document:** sauvegarde ({created or updated})
- **P0 actions:** {count}
- **P1 actions:** {count}
- **P2 actions:** {count}
```

---

## END OF WORKFLOW

The bmad-nfr-assess workflow is complete.
