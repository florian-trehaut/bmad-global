# Step 3: Test Coverage Design

## STEP GOAL

Design a risk-proportional test coverage plan. Map each risk and acceptance criterion to specific test types and priority levels (P0-P3), following the project's test pyramid. Define quality gate criteria and execution order.

## RULES

- Priority assignment is driven by risk scores — higher risk = higher priority
- Test type selection follows the test pyramid: prefer the lowest level that covers the risk
- Test types: Unit, Integration, Journey, E2E (as defined in the project's test architecture)
- Coverage targets scale with priority level
- Epic-level mode maps tests to stories/ACs; system-level mode maps to components/services

## SEQUENCE

### 1. Assign priorities

Map risks and ACs to priority levels:

| Priority | Criteria | Coverage targets |
|----------|----------|-----------------|
| **P0** | BLOCK/MITIGATE risks, revenue-critical, security, compliance | >90% unit, >80% integration, all critical paths in Journey |
| **P1** | MONITOR risks, core business journeys, complex logic | >80% unit, >60% integration, main happy paths |
| **P2** | DOCUMENT risks, secondary features, standard flows | >60% unit, >40% integration, smoke tests |
| **P3** | Low-risk, nice-to-have, cosmetic | Smoke tests only |

### 2. Design coverage plan

**Epic-level mode** — for each story/AC in the epic:

| AC / Story | Risk Ref | Priority | Unit | Integration | Journey | E2E | Notes |
|------------|----------|----------|------|-------------|---------|-----|-------|
| AC1: ... | R-001 | P0 | 3 | 2 | 1 | 0 | ... |
| AC2: ... | R-003 | P1 | 2 | 1 | 0 | 0 | ... |

For each row, specify:
- **Unit**: count of unit tests needed, what pure logic they validate
- **Integration**: count, what module interactions they cover (with real DB via testcontainers)
- **Journey**: count, what multi-service YAML scenarios they require
- **E2E**: count, what full-stack flows need browser automation (if any)

**System-level mode** — for each service/component:

| Service / Component | Risk Refs | Testability Gaps | Integration Needs | NFR Tests | Notes |
|---------------------|-----------|------------------|-------------------|-----------|-------|
| trigger-service | R-002 | ... | Cross-service pub/sub | Load test | ... |

Identify:
- Testability gaps (missing test infrastructure, untestable coupling)
- Cross-service integration test needs
- NFR test requirements (load, security, resilience)

### 3. Design journey scenarios (if applicable)

For MITIGATE and BLOCK risks that span multiple services, outline journey test scenarios:

```yaml
- name: 'Scenario description'
  tags: [relevant, tags]
  risks_covered: [R-001, R-003]
  priority: P0
  steps_outline:
    - 'Setup: seed test data, verify health'
    - 'Action: trigger the workflow'
    - 'Verify: check DB state, API response, side effects'
    - 'Teardown: cleanup'
```

### 4. Define quality gate

```yaml
quality_gate:
  pass_criteria:
    p0_coverage: 100%
    p0_pass_rate: 100%
    p1_coverage: '>= 95%'
    p1_pass_rate: '>= 95%'
    security_issues: 0
    critical_nfr_failures: 0
  concerns_criteria:
    p1_coverage: '>= 80%'
    p2_coverage: '>= 60%'
  fail_criteria:
    p0_coverage: '< 100%'
    security_issues: '> 0'
```

### 5. Define execution order

1. **Smoke tests** — system is up, basic connectivity, health checks
2. **P0 tests** — revenue-critical, security, compliance (BLOCK/MITIGATE risks)
3. **P1 tests** — core journeys, complex logic (MONITOR risks)
4. **P2/P3 tests** — secondary features, nice-to-have

### 6. Define entry/exit criteria

**Entry criteria:**
- PRD validated, architecture approved
- Dev environment operational, test infrastructure ready
- Dev standards and test conventions loaded

**Exit criteria:**
- All P0 tests pass (100%)
- P1 tests pass or triaged (>= 95%)
- No high-severity bugs open
- Coverage targets met per priority level
- Quality gate PASS or CONCERNS (not FAIL)

### 7. Compute totals

Set `TOTAL_TEST_COUNT` = sum of all test counts across all rows and types.
Compute per-priority counts: `P0_COUNT`, `P1_COUNT`, `P2_COUNT`, `P3_COUNT`.

### 8. CHECKPOINT

Present the coverage plan to the user:

> **Test Coverage Plan**
>
> Total tests planned: {TOTAL_TEST_COUNT}
> - P0: {P0_COUNT} | P1: {P1_COUNT} | P2: {P2_COUNT} | P3: {P3_COUNT}
>
> {coverage plan table}
>
> **Journey scenarios:** {count or "None"}
> **Quality gate:** defined
> **Execution order:** Smoke → P0 → P1 → P2/P3

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-04-save.md`
