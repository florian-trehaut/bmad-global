# Observability Requirements Template

Reference template for Step 9 observability requirements assessment.

## Format

```markdown
### Observability Requirements

#### Structured Logs

**Mandatory log events** (each event MUST be implemented or already covered):

| Event | Severity | Required Fields | Purpose |
| ----- | -------- | --------------- | ------- |
| {e.g. RefundRequested} | INFO | trace_id, user_id, refund_id, amount, currency | Audit trail |
| {e.g. RefundFailed}    | ERROR | trace_id, user_id, refund_id, error_code, error_message | Incident response |

Every log entry MUST include: `trace_id`, `span_id`, `service`, `env`, `version`. Project log standard: see `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md#observability-standards` (if defined).

#### Metrics

| Metric Name | Type | Labels | Purpose | SLI? |
| ----------- | ---- | ------ | ------- | ---- |
| {refund_request_total} | counter | status, currency | Volume | no |
| {refund_request_duration_ms} | histogram | endpoint, status | Latency | yes (p95) |

#### Traces

- Spans propagate `trace_id` from upstream (HTTP header, message metadata)
- Critical operations create explicit child spans: `{ops list}`
- Sampling rate: {default project rate, or override}

#### Alerts

| Alert Name | Trigger | Severity | Routing | Runbook |
| ---------- | ------- | -------- | ------- | ------- |
| {RefundFailureRateHigh} | p[5m] error_rate > 5% | page | oncall channel | {URL or "TODO"} |
| {RefundLatencyDegraded} | p95 > 2s for 10m | warn | team channel | {URL or "TODO"} |

#### Dashboards

- {Dashboard name} → {URL or "to be created"}
- Required panels: {error rate, latency, throughput, saturation, ...}

#### SLOs / SLIs

| SLI | SLO | Window | Error Budget |
| --- | --- | ------ | ------------ |
| {refund success rate} | 99.5% | 30d rolling | 0.5% (~3.6h/month) |
| {refund p95 latency} | < 1s | 30d rolling | 5% of requests |
```

## Checklist

- [ ] All new code paths emit structured logs with trace_id
- [ ] Errors logged at ERROR severity with stack trace + context
- [ ] User-facing operations have latency metric (histogram)
- [ ] Traces propagate from upstream (no broken context)
- [ ] At least one alert wired for failure mode of new code path
- [ ] Dashboard panel exists or task added to create one
- [ ] SLO defined for user-facing SLI (or N/A justified)
- [ ] Project log/metric standards cross-referenced

## Guidelines

**GOOD:**
- "Log RefundFailed with `error_code` enum and `error_message` (sanitized)"
- "Alert if `refund_request_total{status='failure'}` p[5m] > 5% for 10min"
- "Trace span around external billing provider call"

**BAD:**
- "Add some logging" (not specific)
- "Alert on errors" (no threshold, no window)
- "Add metrics" (no name, no type, no labels)

## Anti-patterns

- Adding `console.log` calls instead of structured logger → REJECT
- Logging PII (full credit card, password, JWT) → REJECT
- Alert without runbook (oncall has no idea what to do) → REJECT
- Metric without unit in name (`duration` vs `duration_ms`) → REJECT
