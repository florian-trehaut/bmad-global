# Step 4: Quality Gate Decision

## STEP GOAL

Apply deterministic gate decision logic based on coverage evidence from Steps 2-3 and produce a gate decision with full rationale. Support waiver flow when applicable.

## RULES

- **Decision is deterministic** — follow the decision tree exactly, no subjective judgment
- Gate type (`GATE_TYPE`) affects thresholds — story gates are stricter on P0, release gates require broader coverage
- WAIVED is only valid when a FAIL condition exists AND a stakeholder provides business justification
- Security gaps are NEVER waivable
- All evidence must be cited with file paths and specific data points

## SEQUENCE

### 1. Collect evidence summary

Compile from Steps 2-3:

```yaml
evidence:
  total_requirements: {TOTAL_REQUIREMENTS}
  covered_requirements: {COVERED_REQUIREMENTS}
  overall_coverage_pct: {percentage}
  p0_total: {count}
  p0_covered: {count}  # FULL only
  p0_coverage_pct: {percentage}
  p1_total: {count}
  p1_covered: {count}
  p1_coverage_pct: {percentage}
  critical_gaps: {count}
  high_gaps: {count}
  orphaned_tests: {count}
  total_tests: {TOTAL_TESTS}
```

### 2. Apply decision rules

**Decision tree (deterministic):**

```
IF p0_coverage_pct < 100%
  → FAIL
  → rationale: "P0 coverage is {pct}% (required: 100%). {N} critical requirements uncovered."

ELSE IF overall_coverage_pct >= gate_threshold(GATE_TYPE)
  → PASS
  → rationale: "P0 coverage is 100% and overall coverage is {pct}% (target: {threshold}%)."

ELSE IF overall_coverage_pct >= gate_floor(GATE_TYPE)
  → CONCERNS
  → rationale: "P0 coverage is 100% but overall coverage is {pct}% (target: {threshold}%). {N} gaps remain."

ELSE
  → FAIL
  → rationale: "Overall coverage is {pct}% (minimum: {floor}%). Significant gaps exist."
```

**Gate thresholds by type:**

| Gate Type | PASS threshold | CONCERNS floor | Notes |
|-----------|---------------|----------------|-------|
| **story** | >= 90% overall, 100% P0 | >= 75% overall | Single story — tight scope |
| **epic** | >= 85% overall, 100% P0 | >= 70% overall | Multiple stories — some gaps expected |
| **release** | >= 90% overall, 100% P0, >= 95% P1 | >= 80% overall | Production release — high bar |
| **hotfix** | 100% P0 for affected area | N/A | Focused — only affected ACs matter |

### 3. Waiver flow (only on FAIL)

If the decision is FAIL, present the waiver option:

> **Gate Decision: FAIL**
>
> {rationale}
>
> **Waiver option:** A stakeholder can waive this gate with business justification.
> Do you want to apply a waiver? **[Y] Yes** / **[N] No, keep FAIL**

**If waiver requested:**

Collect:
- **Waiver reason:** Business justification (not technical convenience)
- **Waiver approver:** Name and role (must have authority — VP/CTO/PO)
- **Waiver expiry:** Date after which the waiver is void
- **Remediation plan:** Concrete actions with due dates to resolve the gaps

**Waiver constraints:**
- Security gaps (SEC category from test design) are NEVER waivable
- Waiver applies to THIS gate only — does not carry forward
- Waiver must have a remediation plan

If waiver is accepted, set `GATE_DECISION = WAIVED`.

### 4. Generate gate decision document

Produce the complete gate report:

```markdown
# Quality Gate Decision

**Gate type:** {GATE_TYPE}
**Date:** {current date}
**Evaluator:** {USER_NAME}
**Decision:** {GATE_DECISION}

## Evidence Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| P0 coverage | {pct}% | 100% | {MET/NOT MET} |
| P1 coverage | {pct}% | {target}% | {MET/NOT MET} |
| Overall coverage | {pct}% | {threshold}% | {MET/NOT MET} |
| Total requirements | {count} | — | — |
| Total tests | {count} | — | — |
| Critical gaps | {count} | 0 | {MET/NOT MET} |

## Decision Rationale

{rationale from decision tree}

## Traceability Matrix

{Full matrix from Step 2}

## Gap Analysis

{Gap details from Step 3}

## Recommendations

{Prioritized list from Step 3}

{IF CONCERNS}
## Residual Risks

{List unresolved P1/P2 gaps with probability x impact}
{Mitigations or monitoring recommendations}
{ENDIF}

{IF WAIVED}
## Waiver Details

- **Reason:** {business justification}
- **Approver:** {name, role}
- **Expiry:** {date}
- **Remediation plan:** {actions with due dates}
- **Monitoring:** {what to watch until remediation}
{ENDIF}

{IF FAIL}
## Critical Issues

{Top issues that must be resolved, with priority and recommended action}
{ENDIF}

## Next Actions

{Based on decision type:}
{PASS: "Proceed. Coverage meets standards."}
{CONCERNS: "Proceed with monitoring. Address gaps in next iteration."}
{FAIL: "Blocked. Resolve critical gaps and re-run trace."}
{WAIVED: "Proceed under waiver. Execute remediation plan by {expiry}."}
```

### 5. Present gate decision

Display the final decision prominently:

> ## GATE DECISION: {GATE_DECISION}
>
> **Gate type:** {GATE_TYPE}
> **P0 coverage:** {pct}% (required: 100%) — {MET/NOT MET}
> **Overall coverage:** {pct}% (target: {threshold}%) — {MET/NOT MET}
>
> **Rationale:** {rationale}
>
> **Critical gaps:** {count}
> **Recommendations:** {top 3}
>
> **Next action:** {based on decision}

---

## END OF WORKFLOW

The bmad-tea-trace workflow is complete.
