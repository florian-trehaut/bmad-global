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

**Goal:** Verify the code behaves correctly under failure, under load, under rollback, and **maintains state continuity during execution**.

**Sub-axes (4):**

| Sub-axis | Name | Always-on | Weight within M2 |
|----------|------|-----------|------------------|
| 2a | Zero Fallback / Zero False Data | ✓ | **0.15** |
| 2b | Resilience | ✓ | 0.275 |
| 2c | Rollback Safety | ✓ | 0.275 |
| 2d | Runtime State Continuity | ✓ | **0.30** |

Per-meta weight of M2 = 0.20 in the overall judge-triage weighting.

Weight rationale: 2b and 2c are Phase 4 stubs (effective contribution = 0 until populated), so 2d carries the second-highest active weight after 2a — it covers the transient-degradation class of bugs that pass tests but break consumers mid-run.

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

## SUB-AXIS 2d: Runtime State Continuity

**Condition:** ALWAYS executed.

**Purpose:** Detect changes that introduce a window of degraded availability for shared state during execution. Tests passing on initial/final state are blind to transient holes — destructive-then-reconstructive flows where consumers see empty/missing data mid-run.

This is the class of bug that:
- Passes unit tests (final state correct)
- Passes integration tests (pre/post snapshots correct)
- Has no fallback (data not falsified, just absent)
- Has no crash (operation completes successfully)
- Yet breaks downstream consumers reading the state during the rebuild window

### Triggering signal

The diff touches **shared persistent or in-memory state** that other components read during execution: relational tables, document collections, key-value stores, caches, message queues, search indices, materialized views, shared files, configuration stores, in-memory registries — anything where consumers other than the writer can observe the value mid-operation.

### Stack-specific grep scans

Dispatch the patterns from `data/stack-grep-bank/{stack}.md` section "Runtime State Continuity (sub-axis 2d)" for the language(s) detected via the tech-stack-lookup protocol. Each stack file enumerates the destructive bulk operations, cache invalidations, and rebuild markers that exist in that ecosystem.

If the project's stack file does not yet contain a 2d section, the meta-agent MUST still execute this sub-axis manually by walking the diff for the conceptual patterns below — never silently skip.

### Conceptual patterns to detect

Independent of language or storage technology, flag any of these:

1. **Destructive bulk operation followed by reconstruction outside a transactional boundary** — wipe-then-refill, drop-then-recreate, delete-all-then-insert, when the wipe and the refill are not enclosed in a single atomic unit visible to readers
2. **Mass invalidation of a shared cache without stale-while-revalidate or single-flight protection** — readers and the rebuild compete for an empty cache
3. **In-place mutation of a shared collection** when concurrent readers exist — `clear`/`flush`/`reset`/`drain`-style operations on registries, maps, indices that other components read
4. **Drop-and-rebuild orchestration** — pipelines, batch jobs, scheduled tasks, sync workers that re-source the entire dataset by erasing the previous version first

### Checks

- [ ] **Atomic swap, not in-place mutation**: rebuilding a shared collection MUST use a staging area + atomic switch, a versioned pointer, or a single transactional unit that wraps both the destructive and reconstructive steps. In-place destructive-then-reconstructive flow on state read by other consumers = **BLOCKER**.
- [ ] **No reader-visible empty window**: if consumers can read the state between the destructive and reconstructive steps, the pattern is unsafe. Acceptable alternatives: (a) versioned pointer (write new version, atomically switch reference), (b) transactional batch (single transaction wrapping destructive + reconstructive ops), (c) idempotent merge/upsert (no destructive step at all). Anything else = **BLOCKER**.
- [ ] **Concurrent reader audit**: enumerate every component that reads this state during the operation (other services, dashboards, scheduled jobs, exports, downstream APIs, cross-repo systems). If consumers exist and are not explicitly tolerant of empty/stale state, the pattern is unsafe = **BLOCKER**. If consumers cannot be enumerated = **BLOCKER** (audit before merging).
- [ ] **Documented unavailability window**: if drop-and-rebuild is unavoidable (e.g., schema migration, infrastructure rotation), the window MUST be documented (duration, blast radius, mitigation: maintenance mode, read-only fallback, traffic drain). Undocumented = WARNING.
- [ ] **Cache invalidation strategy**: bulk invalidation of a hot cache without stale-while-revalidate or single-flight = WARNING (cache stampede + temporary unavailability for readers).
- [ ] **Cross-service / cross-repo impact**: if the cleared or rebuilt state is read by services owned by other teams or in other repositories, the MR description MUST list those consumers and the chosen mitigation. Missing = WARNING.

### Reference patterns (safe alternatives — describe in stack-neutral terms)

- **Atomic swap**: write the new full snapshot to a parallel location, then atomically switch the reference / rename / promote — readers always see a complete version
- **Transactional batch**: enclose the destructive and reconstructive operations in a single transaction so readers either see the old state or the new state, never the empty intermediate state
- **Versioned pointer**: write the new version under a new key/name, then atomically update the active-version reference — supports instant rollback
- **Idempotent merge / upsert**: never delete; reconcile by inserting-or-updating with stable keys
- **Stale-while-revalidate (cache)**: serve the previous value while the new value is computed in the background, then atomically swap

### Severity matrix (concept-level)

| Pattern | Consumers tolerant of empty? | Severity |
|---------|------------------------------|----------|
| In-place destructive rebuild outside a transaction | Yes (audit log, write-only sink) | WARNING |
| In-place destructive rebuild outside a transaction | No (read by services / dashboards / users) | **BLOCKER** |
| In-place destructive rebuild outside a transaction | Unknown (consumers not enumerated) | **BLOCKER** |
| Destructive + reconstructive in a single transaction | Any | RECOMMENDATION (verify lock duration) |
| Bulk cache invalidation without SWR / single-flight | Hot cache | WARNING |
| Versioned pointer / atomic swap / idempotent merge | Any | PASS |

---

## OUTPUT FORMAT

Same schema as Meta-1. `scores` map keyed by sub-axis. `sub_axes_executed` lists active sub-axes. Scores for stubs = 1.0 (neutral — no deductions).

```yaml
perspective_report:
  meta: 2
  sub_axes_executed: ['2a', '2b', '2c', '2d']
  findings: [...]
  scores:
    '2a': 0.90   # zero-fallback — weight 0.15 within M2
    '2b': 1.0    # stub — weight 0.275
    '2c': 1.0    # stub — weight 0.275
    '2d': 0.85   # runtime state continuity — weight 0.30 within M2
  summary: {...}
```

DO NOT compute the overall verdict — judge-triage handles consolidation.
