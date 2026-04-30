# Concurrency Review Protocol

**Loaded by:** Any bmad-* workflow that reviews code for concurrency safety: `bmad-review-story`, `bmad-dev-story` (step-08, step-11), `bmad-create-story` (step-07-plan), `bmad-code-review` (meta-2).

**Indirection layer for** language-specific concurrency rules consumed via `~/.claude/skills/bmad-shared/stacks/{language}.md#concurrency`.

---

## Purpose

A real production incident (Go data pipeline panicking from concurrent counter writes) revealed that BMAD workflows had no structured concurrency review. This protocol provides:

1. The language-agnostic **principles** every concurrent change must satisfy.
2. The **JIT-load mechanism** for language-specific anti-patterns and guardrails.
3. The **finding format** workflows produce when a violation is detected.

---

## Generic concurrency principles (apply regardless of language)

A change is "concurrent" if it touches goroutines, threads, async tasks, queues, batch processors, schedulers, callbacks under timers, or any shared mutable state. For each such change, verify the 9 principles below:

1. **Shared mutable state is identified.** Any variable read/written by 2+ concurrent flows is explicitly named and documented as shared.

2. **Shared state is protected.** Each shared variable uses ONE of: lock (mutex / read-write lock), atomic operation, message-passing (channel / queue), or immutability. No mix on the same data.

3. **Synchronisation is consistent.** All paths accessing the same shared state use the SAME mechanism. If path A locks and path B uses atomics, the protection is broken.

4. **Lock acquisition order is globally consistent.** When 2+ locks are held simultaneously, every code path acquires them in the same order. Otherwise: deadlock.

5. **No blocking primitive held across a suspension point.** No `MutexGuard` across `.await` (Rust), no `await` while holding `async-mutex` if not designed for it (TS), no synchronous lock held across `await asyncio.X` (Python). Drop, then await.

6. **Bounded parallelism.** Queues, fan-out via `Promise.all` / `asyncio.gather` / `errgroup`, worker spawns — all have an explicit upper bound. No "spawn one per input" without a semaphore or pool.

7. **Error propagation and cancellation are designed.** When task A fails, what happens to task B? Resource leak? Partial state? Rollback? The story must answer; the test must verify.

8. **Idempotency on retry.** Operations that may be retried (after failure, network blip, restart) produce the same observable state. Otherwise, retry-storms corrupt data.

9. **Ordering / causality covered by tests.** If order matters (counter, state machine, audit log), tests assert ordering — not just final value. Concurrent code requires concurrent tests (race detector / stress / fuzz), not only sequential happy-path.

---

## Loading stack-specific rules (JIT)

Language-specific rules live in `~/.claude/skills/bmad-shared/stacks/{language}.md` under the `## Concurrency` H2 section. To apply:

### Step 1 — Resolve detected languages

Apply the protocol `~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md` to read the project's `tech-stack` section from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`. Extract the list of language identifiers.

### Step 2 — JIT load the matching stack files

For each detected language `L` (canonical lowercase identifier — `go`, `rust`, `typescript`, `python`, …):

```
Read(~/.claude/skills/bmad-shared/stacks/{L}.md)
```

If the file exists, extract the `## Concurrency` section and apply:
- The "Anti-patterns to flag" list — convert each to a finding template
- The "Required guardrails" list — verify CI/build commands include them
- The "Language-specific principles" list — use as additional rubric on top of the 9 generic principles

If the file does NOT exist for a detected language, log:

```
INFO: No concurrency stack file for language "{L}". Applying only generic principles.
```

Do NOT halt. The generic principles still apply.

### Step 3 — Report which stacks were loaded

In the workflow's output (review report, plan, etc.), explicitly note:

```
Concurrency review applied:
- Generic principles (always)
- Stacks loaded: go, typescript    ← per detected languages
- Stacks missing: kotlin           ← log INFO, generic-only for these
```

This makes coverage transparent to reviewers.

---

## Finding format

A concurrency violation produces a finding with these fields:

```yaml
finding:
  id: F-CONC-{N}
  severity: BLOCKER | MAJOR | MINOR | INFO
  perspective: runtime_robustness          # for dev-story self-review YAML
  sub_axis: 2f                             # for code-review meta-2 (concurrency sub-axis)
  category: concurrency
  source: generic | stack-{language}       # which rule fired
  rule_ref: "Generic principle 4 (lock order)" OR "go.md#concurrency: Concurrent map writes"
  file: "path/file.go"
  line: 42
  evidence: "code snippet or grep result"
  why: "plain-English explanation of the risk"
  fix: "concrete idiomatic alternative"
```

The `source` field distinguishes generic findings (apply universally) from stack-specific findings (require a stack file). This lets users know how to extend coverage if they add a new language.

---

## Severity rubric

- **BLOCKER**: data race, deadlock potential, or panic-inducing pattern (concurrent map writes, MutexGuard across await, channel double-close).
- **MAJOR**: missing race detector evidence on concurrent code, unbounded parallelism, fire-and-forget without error handling, missing cancellation.
- **MINOR**: design smell (e.g., `Arc<Mutex>` where channels would be cleaner) or stylistic concurrency idiom.
- **INFO**: observation worth recording, no immediate action.

Each stack file may override these defaults for language-specific patterns (e.g., Rust's `MutexGuard across await` is always BLOCKER per the stack file).

---

## HALT conditions

- The required `tech-stack` section is missing or empty in `project.md` → HALT, run `/bmad-knowledge-refresh`.
- The protocol is invoked but the workflow's diff contains no concurrency triggers (no goroutines, threads, async, channels, shared state) → log INFO and skip; this is not a HALT, just a no-op.

---

## Why this protocol exists

- **Decoupling**: workflows reference this protocol — never `stacks/{language}.md` directly. Renaming a stack section requires updating only this protocol.
- **Single source of truth**: the 9 generic principles are stated once. Multiple workflows apply them consistently.
- **Extensibility**: adding a language = adding `stacks/{lang}.md` with a `## Concurrency` H2. Zero changes to this protocol or to consuming workflows.
- **Composability**: this protocol composes with `tech-stack-lookup.md` for language detection — no duplicated detection logic.

See `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` for the full architecture rationale.
