---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 4
meta_weight: 0.20
---

# Meta-4 Subagent Workflow: Engineering Quality

**Goal:** Verify the code is well-structured, tested, idiomatic, and performant.

**Sub-axes (5):**

| Sub-axis | Name | Always-on |
|----------|------|-----------|
| 4a | Code Quality | ✓ |
| 4b | Tech Lead / Architecture | ✓ |
| 4c | Pattern Consistency | ✓ |
| 4d | QA & Testing | ✓ |
| 4e | Performance | conditional (perf-sensitive paths) |

---

## ANTI-DEVIATION CONTRACT

Same as other metas. READ-ONLY, never downgrade BLOCKER.

---

## SUB-AXIS 4a: Code Quality

**Condition:** Always-on when Meta-4 runs.

Apply project code quality checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if loaded.

- [ ] Architecture boundaries (domain never imports infrastructure → **BLOCKER**)
- [ ] Ports explicit in domain layer
- [ ] Thin controllers, DDD patterns, clear naming
- [ ] No `any` without justification
- [ ] No `@ts-ignore` without justification
- [ ] No `console.log` in production code
- [ ] No duplication, no dead code
- [ ] Database: N+1 queries (**BLOCKER**), missing transactions, unbounded queries

### Grep scans (TS placeholder; Phase 7 dispatches per stack)

```bash
cd {worktree_path}
grep -rn "console\.log\|console\.error\|console\.warn" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn ": any\|as any" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
grep -rn "@ts-ignore\|@ts-expect-error" --include="*.ts" {changed_files_dirs}
grep -rn "from.*infrastructure" {changed_files_dirs} | grep "/domain/"
```

---

## SUB-AXIS 4b: Tech Lead / Architecture

**Condition:** Always-on.

Apply project tech lead checklist if loaded.

- [ ] SOLID principles
- [ ] N+1 queries, scalability, unbounded queries
- [ ] DI patterns, `@Injectable()` present
- [ ] Async patterns, `Promise.all` where applicable
- [ ] Monorepo impact, backward compatibility
- [ ] Multi-service impact, migration risks
- [ ] Data migration effectiveness: WHERE clauses in data migrations must match actual values in ALL target environments (dev, staging, production). Silently updating 0 rows = **BLOCKER**
- [ ] Changeset file present if packages/libs modified

### Grep scans

```bash
cd {worktree_path}
grep -rn "export class.*Service\|export class.*Repository\|export class.*Adapter" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "interface\|abstract"
ls .changeset/*.md 2>/dev/null | head -5
```

---

## SUB-AXIS 4c: Pattern Consistency

**Condition:** Always-on.

Use reference code directories from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if loaded. **NEVER reference legacy code.**

- [ ] DTO validation patterns
- [ ] ConfigService usage (no `process.env` direct access)
- [ ] In-memory repositories for testing
- [ ] Logger usage (no `console.log`)
- [ ] Integration test setup patterns
- [ ] Error handling (domain errors + exception mapping)

For each finding, provide `file:line` of the correct pattern reference from non-legacy code. If `stack.md: pattern_references` schema is populated (Phase 7 defines the schema in `data/pattern-reference-schema.md`), resolve the recommended reference via that map.

### Grep scan

```bash
cd {worktree_path}
grep -rn "process\.env\." --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "configuration.ts" | grep -v "config/"
```

---

## SUB-AXIS 4d: QA & Testing

**Condition:** Always-on.

Apply project QA checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if loaded.

### Forbidden patterns (BLOCKER)

```bash
cd {worktree_path}
grep -rn "jest\.mock\|vi\.mock" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

Any result = **BLOCKER** (exception: `jest.fn()` for callbacks/event handlers only).

### Fake test detection (BLOCKER)

```bash
grep -rn "expect(true)\.toBe(true)\|describe\.skip\|it\.skip\|xit\|xdescribe" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

### Test completeness vs acceptance criteria

If `contract.linear_issue` is not null:
- [ ] Every AC has at least one test. Missing P0 coverage = **BLOCKER**, P1 = WARNING
- [ ] Test levels match strategy
- [ ] P0 ACs: happy + error + edge. P1: happy + error.

### Test quality

- [ ] New source files have corresponding `.spec.ts`
- [ ] Happy path, error paths, edge cases tested
- [ ] In-memory fakes used (not mocks)
- [ ] No fake tests
- [ ] Tests deterministic, isolated, < 300 lines

---

## SUB-AXIS 4e: Performance

**Condition:** Conditional — activates when diff touches perf-sensitive paths (async code, DB query layer, rendering, cache, routes). Phase 3 stub; populated in Phase 5.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta4-4e-stub'
    severity: QUESTION
    action: defer
    meta: 4
    sub_axis: '4e'
    title: 'Performance sub-axis not yet populated (Phase 5)'
    detail: 'Core Web Vitals 2025 (INP replaced FID Mar 2024), unbounded Promise.all on user input = BLOCKER, cache stampede (XFetch), connection pool audit, bundle budget delta, benchmark regression >10% land in Phase 5.'
    not_implemented: true
```

### Phase 5 target scope

- Core Web Vitals 2025 (INP replaced FID March 2024)
- Unbounded `Promise.all` on user input → **BLOCKER**
- Cache stampede (XFetch / probabilistic early expiration)
- Connection pool audit
- Bundle budget delta (pre/post MR)
- Benchmark regression > 10% → WARNING

Historical reference: Facebook Memcached case (1300 → 17000 QPS regression from cache stampede).

---

## OUTPUT FORMAT

Same schema as other metas. `scores` map keyed by sub-axis. `sub_axes_executed` includes `4e` only when the trigger signal was detected by step-01 and passed through `contract.active_sub_axes`.

DO NOT compute verdict — judge-triage consolidates.
