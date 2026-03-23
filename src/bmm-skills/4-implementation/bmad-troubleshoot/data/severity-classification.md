# Severity Classification

Reference for classifying bug severity and blast radius. Loaded by step-01-understand.

---

## Severity Matrix

| Severity | Definition | User Impact | Response |
|----------|-----------|-------------|----------|
| **SEV-1 / Critical** | Service down, data loss, security breach, all users affected | Complete loss of function | Mitigate first (rollback/flag), investigate after |
| **SEV-2 / High** | Major feature broken, significant user subset affected | Major degradation | Parallel mitigation + investigation |
| **SEV-3 / Medium** | Degraded experience, workaround exists | Minor degradation | Investigate, scheduled fix |
| **SEV-4 / Low** | Cosmetic, edge case, minimal impact | Negligible | Backlog, fix when convenient |

## Blast Radius Assessment

Ask these questions to determine the blast radius:

| Question | Impact if "yes" |
|----------|----------------|
| Are ALL users affected? | → SEV-1 minimum |
| Is data being corrupted or lost? | → SEV-1 regardless of user count |
| Are multiple services affected (cascading)? | → Escalate one level |
| Is only a specific tenant/client affected? | → Scoped impact, may not escalate |
| Does a workaround exist? | → De-escalate one level |
| Did this start after a recent deploy? | → Likely regression, rollback may fix |

## Regression Detection Signals

| Signal | Action |
|--------|--------|
| Deploy in last 24h correlates with symptom start | Flag as likely regression |
| Feature flag toggled recently | Check flag state vs. symptom |
| Error rate spike in metrics | Compare to baseline (same day last week) |
| New dependency version | Check changelog for breaking changes |

## Quick Mitigations (before root cause is known)

| Action | Risk | When |
|--------|------|------|
| Disable feature flag | Low | New feature causing issues |
| Rollback deployment | Low | Symptom correlates with recent deploy |
| Restart service | Medium | Resource exhaustion, memory leak |
| Scale up | Medium | Load-related degradation |
