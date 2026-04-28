# NFR Registry Template

Reference template for Step 9 non-functional requirements assessment.

## Format

```markdown
### NFR Registry

| Category | Requirement | Target / Metric | Measurement Method | Status | Notes |
| -------- | ----------- | --------------- | ------------------ | ------ | ----- |
| Performance     | {response time, throughput, latency p95/p99}      | {e.g. p95 < 500ms} | {load test, APM, synthetic monitoring} | PRESENT / MISSING / PARTIAL / N/A | {justification if N/A} |
| Scalability     | {concurrent users, data volume, growth headroom}  | {e.g. 10k QPS}     | {load test, capacity plan}             | PRESENT / MISSING / PARTIAL / N/A | |
| Availability    | {uptime SLO, RTO, RPO}                            | {e.g. 99.9% / 1h / 5min} | {SLI dashboard, incident postmortem}   | PRESENT / MISSING / PARTIAL / N/A | |
| Reliability     | {error budget, retry policy, idempotency}         | {e.g. < 0.1% error rate} | {error rate metric, chaos test}        | PRESENT / MISSING / PARTIAL / N/A | |
| Security        | {auth, authz, encryption, threat model}           | {see security-gate-template.md}    | {pen test, audit, OWASP scan}          | PRESENT / MISSING / PARTIAL / N/A | |
| Observability   | {logs, metrics, traces, alerts}                   | {see observability-requirements-template.md} | {dashboard URL, alert rule}    | PRESENT / MISSING / PARTIAL / N/A | |
| Maintainability | {test coverage, doc, API stability, complexity}   | {e.g. 80% line coverage}           | {coverage report, lint, sonar}         | PRESENT / MISSING / PARTIAL / N/A | |
| Usability       | {accessibility, i18n, error messages, doc}        | {e.g. WCAG 2.1 AA}                 | {audit, user test}                     | PRESENT / MISSING / PARTIAL / N/A | |

**Project NFR baseline:** see `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md#nfr-defaults` (if defined).

**Mandatory:** every category must be addressed. `N/A` is allowed only with a one-line justification (why this category does not apply to this story).
```

## Checklist

- [ ] All 7 NFR categories addressed (PRESENT / MISSING / PARTIAL / N/A justified)
- [ ] Targets are quantifiable (numbers, not "fast" / "secure")
- [ ] Measurement method specified (how do we verify the target is met)
- [ ] N/A status justified in 1 line
- [ ] Project baseline NFRs cross-referenced (project.md#nfr-defaults)
- [ ] MISSING items create implementation tasks
- [ ] PARTIAL items document the gap

## Guidelines

**GOOD targets:**
- "p95 latency < 500ms under 1k QPS load"
- "99.9% uptime measured monthly"
- "Test coverage on changed lines >= 80%"
- "WCAG 2.1 AA compliance verified by axe scan"

**BAD targets:**
- "fast response" (not measurable)
- "high availability" (no SLO)
- "good security" (no threat model)
- "easy to use" (no usability metric)

## Anti-patterns

- Marking everything N/A without justification → REJECT, force the question
- Leaving Performance N/A on user-facing endpoints → REJECT
- Leaving Security N/A when story touches auth/data/secrets → REJECT
- Leaving Observability N/A when story adds new code paths → REJECT (logs minimum)
