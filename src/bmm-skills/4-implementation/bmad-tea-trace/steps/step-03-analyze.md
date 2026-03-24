# Step 3: Gap Analysis

## STEP GOAL

Analyze coverage gaps from the traceability matrix, identify orphaned tests, detect duplicate coverage, and generate risk-prioritized recommendations.

## RULES

- Gap severity must follow priority classification: P0 uncovered = CRITICAL, P1 uncovered = HIGH, P2 = MEDIUM, P3 = LOW
- Priority classification comes from the test design document (if loaded in Step 1) or from AC criticality analysis
- Recommendations must be specific and actionable — include suggested test level and test description
- Duplicate coverage is acceptable for defense-in-depth on critical paths, but flag unnecessary duplication

## SEQUENCE

### 1. Classify AC priorities

If a test design document was loaded in Step 1, use its priority assignments (P0/P1/P2/P3).

If no test design is available, assign priorities based on AC analysis:

| Priority | Criteria |
|----------|---------|
| **P0** | Core business flow, security, data integrity — failure = system unusable or data loss |
| **P1** | Important business logic, key user journeys — failure = significant user impact |
| **P2** | Secondary features, edge cases — failure = degraded experience |
| **P3** | Nice-to-have, cosmetic, logging — failure = minimal impact |

### 2. Analyze coverage gaps

For each uncovered or partially covered AC, record:

```yaml
- ac_id: AC-XX
  ac_description: "..."
  priority: P0 | P1 | P2 | P3
  current_coverage: NONE | PARTIAL | UNIT-ONLY | INTEGRATION-ONLY
  gap_severity: CRITICAL | HIGH | MEDIUM | LOW
  gap_description: "What is missing specifically"
  recommended_test_level: E2E | API | Component | Unit
  recommended_test_description: "Given X, When Y, Then Z"
```

**Gap severity mapping:**

| Priority | Coverage = NONE | Coverage = PARTIAL/UNIT-ONLY/INTEGRATION-ONLY |
|----------|----------------|-----------------------------------------------|
| P0 | CRITICAL (BLOCKER) | HIGH |
| P1 | HIGH | MEDIUM |
| P2 | MEDIUM | LOW |
| P3 | LOW | LOW |

### 3. Detect duplicate coverage

Identify ACs covered at multiple test levels. Classify:

- **Acceptable duplication:** Defense-in-depth for P0/P1 critical paths (e.g., unit + E2E for auth flow)
- **Unnecessary duplication:** Same exact assertion at multiple levels with no additional confidence gain

For unnecessary duplication, recommend consolidation to the most appropriate level.

### 4. Calculate coverage metrics

```
Overall coverage:    {FULL count / TOTAL_REQUIREMENTS * 100}%
P0 coverage:         {P0 FULL / P0 total * 100}%
P1 coverage:         {P1 FULL / P1 total * 100}%
P2 coverage:         {P2 FULL / P2 total * 100}%

By test level:
  E2E coverage:      {ACs with E2E tests / total}%
  API coverage:      {ACs with API tests / total}%
  Component coverage: {ACs with component tests / total}%
  Unit coverage:     {ACs with unit tests / total}%
```

### 5. Generate recommendations

Produce a prioritized list of recommended actions:

1. **CRITICAL gaps (P0 NONE):** Immediate — list specific tests to write
2. **HIGH gaps (P0 PARTIAL or P1 NONE):** Before merge — list specific tests
3. **MEDIUM gaps (P1 PARTIAL or P2 NONE):** Planned — suggest test approach
4. **LOW gaps:** Tracked — document for future
5. **Duplicate coverage:** Suggest consolidation targets
6. **Orphaned tests:** Review for relevance or removal

### 6. CHECKPOINT

Present the gap analysis:

> **Gap Analysis Complete**
>
> **Coverage metrics:**
> - Overall: {percentage}%
> - P0: {percentage}%
> - P1: {percentage}%
>
> **Gaps by severity:**
> - CRITICAL: {count} (P0 requirements without coverage — BLOCKER)
> - HIGH: {count}
> - MEDIUM: {count}
> - LOW: {count}
>
> **Duplicate coverage:** {count} ACs with multi-level coverage ({acceptable} acceptable, {unnecessary} flagged)
>
> **Orphaned tests:** {count}
>
> **Top recommendations:**
> {numbered list of top 5 recommendations with severity}

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-04-gate.md`
