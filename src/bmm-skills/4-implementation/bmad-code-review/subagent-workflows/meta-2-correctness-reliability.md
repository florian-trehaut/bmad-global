---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 2
meta_weight: 0.20
sub_axis_weights:
  '2a': 0.15
  '2b': 0.20
  '2c': 0.20
  '2d': 0.25
  '2e': 0.10
  '2f': 0.10
---

# Meta-2 Subagent Workflow: Correctness & Reliability

**Goal:** Verify the code behaves correctly under failure, under load, under rollback, **maintains state continuity during execution**, handles missing/null values without crashing, is concurrency-safe, **and implements the observability contract declared in the story spec (story-spec v2)**.

## v2 Spec Inputs (story-spec v2 (monolithic) or v3 (bifurcation) schema)

If `contract.linear_issue.spec_v2` is loaded, this meta consumes:

- **Observability Requirements** — mandatory log events, required fields, metrics, traces, alerts, dashboards, SLOs. Verify each declared item is implemented in the diff:
  - Mandatory log events with all required fields (especially `trace_id`, `span_id`, `service`, `env`, `version` per project standard) — missing field = MAJOR
  - Metrics named with units (`*_ms`, `*_total`, `*_bytes`, etc.) — naming violation = MINOR; missing metric = MAJOR
  - Alerts with runbook URL — missing runbook = MINOR; missing alert wire-up entirely = MAJOR (or BLOCKER for user-facing critical paths)
  - SLO/SLI for user-facing operations — missing SLO when declared in spec = MAJOR
  - Trace span propagation — broken context = MAJOR
- **NFR Registry — Performance / Scalability / Availability / Reliability** rows. Verify each declared target is verifiable:
  - Performance target declared but no measurement instrumentation → MAJOR
  - Scalability target declared but no load test / capacity plan → MAJOR
  - Reliability target (error budget, retry policy) declared but no implementation → MAJOR

If a meta-2 finding maps to an NFR or Observability requirement declared in the spec, cite the spec section in the finding's `detail` field.

**Sub-axes (6):**

| Sub-axis | Name | Always-on | Weight within M2 |
|----------|------|-----------|------------------|
| 2a | Zero Fallback / Zero False Data | ✓ | **0.15** |
| 2b | Resilience | ✓ | 0.20 |
| 2c | Rollback Safety | ✓ | 0.20 |
| 2d | Runtime State Continuity | ✓ | **0.25** |
| 2e | Null Safety | ✓ | 0.10 |
| 2f | Concurrency | ✓ | 0.10 |

Per-meta weight of M2 = 0.20 in the overall judge-triage weighting.

Weight rationale: 2b and 2c are Phase 4 stubs (effective contribution = 0 until populated). 2d carries the highest active weight — it covers the transient-degradation class of bugs. 2a (zero-fallback) keeps its anchor weight. 2e and 2f are introduced with the Runtime Robustness Stacks story; their initial weights are intentionally modest (0.10 each) and may be calibrated in a future story once `stack-grep-bank/{lang}.md` ships per-stack grep patterns for them.

---

## ANTI-DEVIATION CONTRACT

Same as Meta-1. READ-ONLY, execute only `contract.active_sub_axes`, report with `file:line`, never downgrade BLOCKER.

---

## SUB-AXIS 2a: Zero Fallback / Zero False Data

**Condition:** ALWAYS executed — this is the highest-impact correctness axis (w=0.15 inside M2).

**Load and apply `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md`.**

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

## SUB-AXIS 2e: Null Safety

**Condition:** ALWAYS executed.

**Purpose:** Detect runtime null/missing-value pitfalls — the runtime-robustness counterpart to 2a (which covers business-fallback). They sometimes intersect on the same line, in which case findings cite both sub-axes.

**Load and apply `~/.claude/skills/bmad-shared/protocols/null-safety-review.md`.**

The protocol JIT-loads `~/.claude/skills/bmad-shared/stacks/{language}.md#null-safety` for each detected language via `tech-stack-lookup`.

### Checks

- [ ] **Boundary validation present**: external input (HTTP body, RPC, config, deserialised JSON, CLI args) goes through a parser that produces a typed result (Zod, pydantic, `serde`, custom). Missing = **BLOCKER** if the input is consumed downstream as if validated.
- [ ] **Type-system enforcement**: project's compiler/lint config has stack-appropriate guardrails — TS `strictNullChecks` + `noUncheckedIndexedAccess`; Python `mypy --strict`; Rust `clippy::unwrap_used` denied; Go `go vet`/`staticcheck` mandatory. Disabled = **BLOCKER**.
- [ ] **No `!` non-null assertion** introduced (TypeScript). Each one = **MAJOR** unless paired with a proven invariant comment.
- [ ] **No `.unwrap()` / `.expect()`** introduced in Rust production paths (allowed in `#[cfg(test)]`). Each one = **MAJOR**.
- [ ] **No bare `dict[k]`** introduced in Python on potentially-missing keys — use `dict.get(k, default)` or explicit `if k in d` guard. Each one = **MAJOR**.
- [ ] **No pointer deref without nil check** in Go after external boundary. Each one = **BLOCKER** if reachable from a request handler.
- [ ] **`||` vs `??`**: TypeScript code using `value || default` where `0`/`""`/`false` are valid = **MAJOR** (also crosses 2a if business-critical).
- [ ] **Absent-path test**: every new nullable field crossing a boundary has at least one test exercising the absent case. Missing = **MAJOR**.

### Stack-specific rules

For each detected language `L`, apply the anti-patterns enumerated in `~/.claude/skills/bmad-shared/stacks/{L}.md` under `## Null Safety` → `### Anti-patterns to flag`. Findings cite the rule (`stack-{L}.md#null-safety: <pattern>`) for traceability.

If no stack file exists for a detected language, fall back to the generic principles from `null-safety-review.md`.

### Cross-axis with 2a

When a single line of code violates BOTH 2a (zero-fallback business) AND 2e (null-safety runtime) — e.g., `price ?? 0` on a required price field — produce one finding citing both sub-axes:

```yaml
- id: 'F-meta2-2e-1'
  severity: BLOCKER
  meta: 2
  sub_axes: ['2a', '2e']           # cross-axis finding
  ...
```

---

## SUB-AXIS 2f: Concurrency

**Condition:** Triggered when the diff touches goroutines, threads, async/await, channels, queues, batch processors, schedulers, callback timers, or shared mutable state.

**Load and apply `~/.claude/skills/bmad-shared/protocols/concurrency-review.md`.**

The protocol JIT-loads `~/.claude/skills/bmad-shared/stacks/{language}.md#concurrency` for each detected language.

### Checks

- [ ] **Shared state identified**: every variable read/written by 2+ concurrent flows is named and documented. Missing = **MAJOR**.
- [ ] **Synchronisation present and consistent**: ONE mechanism per shared variable (lock / atomic / channel / immutable). Mixed = **MAJOR**.
- [ ] **Lock acquisition order globally consistent**: 2+ locks held simultaneously must be acquired in the same order across all paths. Inconsistent = **BLOCKER**.
- [ ] **No blocking primitive across suspension point**: no `MutexGuard` across `.await` (Rust), no synchronous lock across `await asyncio.X` (Python). Each = **BLOCKER**.
- [ ] **Bounded parallelism**: `Promise.all` / `asyncio.gather` / `errgroup` / `JoinSet` over external input has explicit limit. Unbounded = **MAJOR**.
- [ ] **Cancellation propagation defined**: long-lived async tasks accept `context.Context` / `AbortSignal` / `CancellationToken`. Missing = **MAJOR**.
- [ ] **Race detector / stress test evidence**: for Go, the diff includes `go test -race` results in CI. For other languages, the diff includes a stress test (`Promise.all` of N / `asyncio.gather` of N) asserting state consistency. Missing on a concurrent code path = **MAJOR**.

### Stack-specific rules

For each detected language `L`, apply anti-patterns from `~/.claude/skills/bmad-shared/stacks/{L}.md#concurrency` → `### Anti-patterns to flag`. Examples:

- Go: concurrent map writes (BLOCKER), counter `++` without atomic/mutex (BLOCKER), unbounded `go func()` (MAJOR)
- Rust: `MutexGuard` across `.await` (BLOCKER), inconsistent lock order (BLOCKER), `Arc<Mutex<T>>` where channels would do (MINOR design smell)
- TypeScript: `Promise.all` rejecting on first error when partial results matter (MAJOR), check-then-act on shared state (MAJOR), missing `await` (MAJOR)
- Python: `time.sleep` in `async def` (BLOCKER), unbounded `asyncio.gather` (MAJOR), `requests` in async code (MAJOR)

If no stack file exists for a detected language, fall back to the generic principles from `concurrency-review.md`.

---

## OUTPUT FORMAT

Same schema as Meta-1. `scores` map keyed by sub-axis. `sub_axes_executed` lists active sub-axes. Scores for stubs = 1.0 (neutral — no deductions).

```yaml
perspective_report:
  meta: 2
  sub_axes_executed: ['2a', '2b', '2c', '2d', '2e', '2f']
  findings: [...]
  scores:
    '2a': 0.90   # zero-fallback — weight 0.15
    '2b': 1.0    # stub — weight 0.20
    '2c': 1.0    # stub — weight 0.20
    '2d': 0.85   # runtime state continuity — weight 0.25
    '2e': 0.95   # null safety — weight 0.10 (new — Runtime Robustness Stacks story)
    '2f': 0.95   # concurrency — weight 0.10 (new — Runtime Robustness Stacks story)
  summary: {...}
```

DO NOT compute the overall verdict — judge-triage handles consolidation.
