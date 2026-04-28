# Stack: Go

**Loaded by:** Protocols `concurrency-review.md` and `null-safety-review.md` when the project's tech-stack section includes `go` or `golang`.

**Conventions:** Go-specific runtime-robustness rules. Generic principles live in the protocols; this file holds idioms, anti-patterns to grep, and required guardrails for Go.

---

## Concurrency

### Anti-patterns to flag

- **Concurrent counter increment without `sync/atomic` or `sync.Mutex`** (BLOCKER)
  - Detection: a goroutine literal `go func()` or function spawned via `go` writes to a shared variable (counter, slice index, struct field) with no enclosing `Mutex.Lock()` / `atomic.Add*` / channel handoff.
  - Why: a non-atomic `i++` is a load-modify-store sequence; concurrent goroutines interleave, producing lost updates and `runtime.panic` under `go test -race`.
  - Fix: `atomic.AddInt64(&counter, 1)` for counters, `sync.Mutex` for compound state, or a single owning goroutine fed by a channel.

- **Concurrent map writes** (BLOCKER)
  - Detection: `m[k] = v` on a `map[K]V` accessed from 2+ goroutines without `sync.RWMutex` or use of `sync.Map`.
  - Why: built-in maps are not goroutine-safe; concurrent writes panic with `concurrent map writes` and the runtime aborts the process.
  - Fix: `sync.Map` for read-heavy workloads, `sync.RWMutex` around a regular map, or per-key sharding.

- **Goroutine leak from missing `context.Context` cancellation** (MAJOR)
  - Detection: `go func()` blocks on `<-ch`, network I/O, or `time.Sleep` without selecting on `ctx.Done()`.
  - Why: goroutines that never exit accumulate forever; tests pass, production memory grows monotonically.
  - Fix: pass `context.Context` into every long-lived goroutine and `select { case <-ctx.Done(): return ... }`.

- **Channel double-close** (BLOCKER)
  - Detection: `close(ch)` called from multiple sites or in a deferred block without owner-check.
  - Why: closing an already-closed channel panics; closing from a non-owner is undefined-by-convention.
  - Fix: only the producer closes; if multiple producers, use `sync.Once` or a sentinel.

- **`range` over a channel without producer-side close** (MAJOR)
  - Detection: `for v := range ch` where the channel is never closed by its sender.
  - Why: the range loop blocks forever once the producer stops without `close(ch)`.
  - Fix: producer `defer close(ch)` after writing all values.

- **Unbounded goroutine spawn** (MAJOR)
  - Detection: `for ... { go ... }` over an external input (HTTP request fan-out, file list, queue messages) without a worker pool, semaphore, or `errgroup.SetLimit`.
  - Why: under load this OOMs the process.
  - Fix: `errgroup` with `SetLimit(N)`, a buffered semaphore channel, or a fixed worker pool.

- **Mutex copied by value** (BLOCKER)
  - Detection: a struct embedding `sync.Mutex` is passed/assigned by value (`func f(s MyStruct)` instead of `*MyStruct`).
  - Why: each copy gets its own mutex — locks no longer protect the original.
  - Fix: always pass `*sync.Mutex` (i.e., pointer-receiver methods, pointer arguments). `go vet` flags this.

### Required guardrails

- **`go test -race ./...` MUST run in CI on any package containing goroutines**, channels, atomics, mutexes, or shared state. A failure of `-race` is a HALT for dev-story step-08.
- **`go vet ./...` MUST run** — it catches mutex-copy and lock-order issues.
- For libraries shipped to others, run `-race` against examples and benchmarks too.

### Language-specific principles

- **"Don't communicate by sharing memory; share memory by communicating."** Prefer channels over locks when ownership transfers between goroutines.
- **One channel, one owner.** The owner writes and closes. Other goroutines only read.
- **Use `sync.Mutex` for state, `sync/atomic` for counters/flags, channels for handoff.** Don't mix these without intent.
- **`tokio`-style "no holding lock across await" does not apply** — Go's runtime is preemptive and locks may be held across blocking I/O. But long lock-hold still hurts throughput; prefer narrow critical sections.
- **`-race` slowdown (2-20×, 5-10× memory) is acceptable in CI**, not in production. Ship without `-race`.

---

## Null Safety

### Anti-patterns to flag

- **Pointer dereference without nil check** (BLOCKER)
  - Detection: `*p`, `p.Field`, or `p.Method()` where `p` is `*T` and the function entered via an external boundary (HTTP handler, RPC, decoded JSON, map lookup, type assertion).
  - Why: `runtime error: invalid memory address or nil pointer dereference` panics the goroutine; in HTTP handlers this kills the request, in workers it kills the process.
  - Fix: explicit `if p == nil { return ErrNotFound }` at the boundary; once past the check, downstream may assume non-nil.

- **Map access without comma-ok** (MAJOR)
  - Detection: `v := m[k]` where the absence of `k` is a meaningful error condition (config lookup, cache, registry).
  - Why: `m[k]` returns the zero value when `k` is missing, indistinguishable from `m[k] = 0`. Silent fallback bug.
  - Fix: `v, ok := m[k]; if !ok { return ErrMissingKey }`.

- **Zero-value-as-valid confusion** (MAJOR)
  - Detection: a domain field of type `int`, `string`, `bool`, or `time.Time` where `0`, `""`, `false`, or zero-time are semantically distinct from "absent". The struct has no `*int` or `Optional[T]` equivalent.
  - Why: deserialised JSON / DB rows produce zero values that downstream code treats as valid; intent ("user did not specify") is lost.
  - Fix: `*int` (pointer) for nullable scalars, `sql.NullInt64` / `sql.NullString` for DB, or a wrapping struct `type OptionalInt struct { Value int; Set bool }`.

- **Type assertion without comma-ok** (BLOCKER)
  - Detection: `v := i.(T)` (single-return form) on an `interface{}` / `any` value sourced externally.
  - Why: panic if the assertion fails; same root cause as nil deref.
  - Fix: `v, ok := i.(T); if !ok { return ErrBadType }`.

- **Slice / array index without bound check** (MAJOR)
  - Detection: `s[i]` where `i` is computed from external input (decoded length, parsed offset, user-controlled index).
  - Why: out-of-range panics the goroutine.
  - Fix: `if i < 0 || i >= len(s) { return ErrOutOfRange }` before access.

- **Struct embedding nil pointer** (MAJOR)
  - Detection: `type Outer struct { *Inner }` where the embedded pointer can be nil; methods on `Inner` are called via `Outer.Method()` without checking the embedded pointer.
  - Why: the embedded method panics on nil receiver.
  - Fix: explicit nil check or non-pointer embedding.

### Required guardrails

- **`go vet ./...`** catches some nil-deref patterns and is mandatory.
- **`staticcheck ./...`** (third-party) catches more; recommended.
- **`nilaway ./...`** (Uber, optional) statically checks for nil panics — recommended for production-critical code paths.

### Language-specific principles

- **Validate at the boundary.** Decode JSON into a struct with explicit `*T` for nullable fields; validate; then pass non-pointer / non-nil-checked values inward.
- **Prefer return-error to panic.** Library code and HTTP handlers must `return err`, never `panic`.
- **`errors.Is` / `errors.As` for sentinel checks** rather than string comparisons.
- **The zero value should be useful** when feasible, but **don't conflate "valid zero" with "missing"**. When they differ, use a pointer or a wrapper type.
- **Tests cover the absent-value path** for every nullable field that crosses a boundary.

---

## Sources

- [Go Race Detector — official docs](https://go.dev/doc/articles/race_detector)
- [Catching Race Conditions in Go (frosnerd)](https://dev.to/frosnerd/catching-race-conditions-in-go-307l)
- [Mastering Go Concurrency: Taming Race Conditions](https://dev.to/jones_charles_ad50858dbc0/mastering-go-concurrency-taming-race-conditions-like-a-pro-1kn2)
- [Understanding and Preventing Nil Pointer Dereference Panics in Go (Ezra Natanael)](https://medium.com/@ezrantn/understanding-and-preventing-nil-pointer-dereference-panics-in-go-1b0d341fa6b0)
- [How to Avoid and Debug Nil Pointer Dereference Panics in Go (oneuptime)](https://oneuptime.com/blog/post/2026-01-23-go-nil-pointer-panics/view)
