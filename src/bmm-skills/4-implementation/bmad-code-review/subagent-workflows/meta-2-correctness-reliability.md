---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 2
meta_weight: 0.20
sub_axis_weights:
  '2a': 0.15
  '2b': 0.425
  '2c': 0.425
---

# Meta-2 Subagent Workflow: Correctness & Reliability

**Goal:** Verify the code behaves correctly under failure, under load, under rollback.

**Sub-axes (3):**

| Sub-axis | Name | Always-on | Weight within M2 |
|----------|------|-----------|------------------|
| 2a | Zero Fallback / Zero False Data | ✓ | **0.15** (raised from v1's 0.10) |
| 2b | Resilience | ✓ | 0.425 |
| 2c | Rollback Safety | ✓ | 0.425 |

Per-meta weight of M2 = 0.20 in the overall judge-triage weighting.

---

## ANTI-DEVIATION CONTRACT

Same as Meta-1. READ-ONLY, execute only `contract.active_sub_axes`, report with `file:line`, never downgrade BLOCKER.

---

## SUB-AXIS 2a: Zero Fallback / Zero False Data

**Condition:** ALWAYS executed — this is the highest-impact correctness axis (w=0.15 inside M2).

**Load and apply `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.**

### Grep scans (stack-agnostic — see `data/stack-grep-bank/*.md` for stack-specific patterns)

For TypeScript / JavaScript (Phase 7 will split per-stack into `data/stack-grep-bank/`):

```bash
cd {worktree_path}
grep -rn "?? 0\|?? ''\||| 0\||| ''\|?? 'N/A'\|?? 'Unknown'" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn "/ 1\.2\|/ 1\.1\|\* 0\.8\|\* 1\.2" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
```

### Checks

- [ ] No fallback to wrong data: `??` / `||` on business-critical fields — verify fallback is semantically identical. If not → **BLOCKER**
- [ ] No computed substitutions: deriving a value from the wrong source → **BLOCKER**
- [ ] No silent defaults: `0`, `''`, `'N/A'`, `'Unknown'` as defaults on fields flowing to external systems → **BLOCKER**
- [ ] Null rejection present: business-critical fields have explicit null checks with throw + alert → missing = **BLOCKER**
- [ ] No downstream effects on failure: notifications sent only after successful persistence; sending before = **BLOCKER**
- [ ] Data migrations: `UPDATE` / `DELETE` with `WHERE` clauses must match real data in ALL target environments (dev, staging, production). Silently matching zero rows = **BLOCKER**

### Reference

`data/acceptable-fallback-rules.md` (added in Phase 4) documents the narrow 4-condition exception — UI i18n fallbacks, documented defaults with owner+expiry, etc. Zero-fallback applies to business-critical data only, not UI copy.

---

## SUB-AXIS 2b: Resilience

**Condition:** Always-on. Phase 3 stub; populated in Phase 4.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta2-2b-stub'
    severity: QUESTION
    action: defer
    meta: 2
    sub_axis: '2b'
    title: 'Resilience sub-axis not yet populated (Phase 4)'
    detail: 'Timeouts, AWS-decorrelated jitter, idempotency keys (IETF draft), retry budgets, circuit breakers (Polly / Resilience4j / Opossum / tenacity / pybreaker), DLQ + poison-pill handling land in Phase 4.'
    not_implemented: true
```

### Phase 4 target scope

- Timeouts: connect / request / total — missing on outbound I/O = WARNING
- Jitter: AWS-style decorrelated jitter on retries (exponential backoff alone is not enough)
- Idempotency keys on non-safe HTTP methods (IETF draft-ietf-httpbis-idempotency-key)
- Retry budgets bounded per operation — unbounded retry = WARNING
- Circuit breakers on external dependencies
- DLQ + poison-pill for message consumers

---

## SUB-AXIS 2c: Rollback Safety

**Condition:** Always-on. Phase 3 stub; populated in Phase 4.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta2-2c-stub'
    severity: QUESTION
    action: defer
    meta: 2
    sub_axis: '2c'
    title: 'Rollback Safety sub-axis not yet populated (Phase 4)'
    detail: 'OpenFeature CNCF standard, flag metadata (owner+expiry), kill-switch tests, expand/contract non-reversible DB migrations (2-phase), fail-closed flag defaults land in Phase 4.'
    not_implemented: true
```

### Phase 4 target scope

- OpenFeature (CNCF Incubating) for feature flags — direct vendor SDK imports = WARNING (prefer OpenFeature provider)
- Flag metadata: every new flag carries `owner` + `expiry` date — missing = WARNING
- Kill switch tested: at least one test flips the flag and asserts both code paths
- Expand/contract DB migrations: `DROP COLUMN` without prior expand phase (deploy-only) = **BLOCKER**
- Fail-closed defaults: new flags default to the safer side

---

## OUTPUT FORMAT

Same schema as Meta-1. `scores` map keyed by sub-axis. `sub_axes_executed` lists active sub-axes. Scores for stubs = 1.0 (neutral — no deductions).

```yaml
perspective_report:
  meta: 2
  sub_axes_executed: ['2a', '2b', '2c']
  findings: [...]
  scores:
    '2a': 0.90   # zero-fallback — weight 0.15 within M2
    '2b': 1.0    # stub
    '2c': 1.0    # stub
  summary: {...}
```

DO NOT compute the overall verdict — judge-triage handles consolidation.
