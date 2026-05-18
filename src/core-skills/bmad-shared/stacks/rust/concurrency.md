# Stack Sub-File: Rust — Concurrency

**Parent stack**: `stacks/rust.md`
**Loaded by**: Protocol `~/.claude/skills/bmad-shared/protocols/concurrency-review.md` when the project's tech-stack section includes `rust`.

---

## Anti-patterns to flag

- **`std::sync::MutexGuard` held across `.await`** (BLOCKER)
  - Detection: in an `async fn` (or async block), a `let _guard = mutex.lock()...` (returning `MutexGuard<'_, T>`) is followed by an `.await` while `_guard` is still in scope.
  - Why: the future is parked at the `.await` while holding a thread-blocking lock; if the executor reschedules another task that needs the same lock, the runtime deadlocks. This is one of the most common Tokio production bugs.
  - Fix: drop the guard before `.await` (`drop(_guard);` or scoping with `{}`), OR use `tokio::sync::Mutex` (whose guard is `Send` and `.await`-friendly), OR redesign so the locked critical section contains no `.await`. Tokio's mutex is more expensive — reach for it only when necessary.

- **Inconsistent lock acquisition order** (BLOCKER)
  - Detection: code path A locks `m1` then `m2`; code path B locks `m2` then `m1`. Use grep on `.lock()` calls within the same module.
  - Why: classic deadlock — A waits for `m2`, B waits for `m1`, neither releases.
  - Fix: enforce a global lock order (e.g., document "always lock A before B"). Better: combine the two mutexes into one wrapping struct, or use lock-free primitives.

- **Mixing `std::sync` and `tokio::sync` for the same data** (MAJOR)
  - Detection: a struct field is locked via `std::sync::Mutex` in one path and via `tokio::sync::Mutex` in another.
  - Why: they're incompatible types and protect different invariants. The compiler refuses, but a `parking_lot::Mutex` mixed with `tokio::sync::Mutex` may compile and silently misbehave.
  - Fix: pick one and use it consistently for that data.

- **Spin loop with `loop { lock.try_lock() ... }`** (MAJOR)
  - Detection: explicit `try_lock`/`try_read`/`try_write` calls inside a tight `loop` without backoff.
  - Why: burns CPU, starves the lock holder, and is rarely the right pattern.
  - Fix: use the blocking `lock()`, or `tokio::sync::Notify`, or a `Condvar`.

- **Unbounded `tokio::spawn` from external input** (MAJOR)
  - Detection: `for ... { tokio::spawn(async move { ... }) }` over an unbounded source (stream, request fan-out).
  - Why: spawns can outpace the executor; memory unbounded.
  - Fix: `JoinSet` with explicit limit, `tokio::sync::Semaphore::acquire`, or `futures::stream::buffer_unordered(N)`.

- **`Arc<Mutex<T>>` where channels would do** (MINOR — design smell)
  - Detection: `Arc<Mutex<T>>` shared across many tasks for state that flows in one direction (producer → consumers).
  - Why: shared-state concurrency is harder to reason about than message passing.
  - Fix: `tokio::sync::mpsc` channel; mutate state only inside the receiver task; readers receive copies/snapshots.

## Required guardrails

- **`cargo test` MUST run** for every change touching async code, channels, atomics, mutexes.
- **`clippy::await_holding_lock` lint MUST be enabled** (it catches the `MutexGuard across await` bug at compile-time).
- **`loom`** (optional, for low-level critical paths): exhaustive scheduler exploration in tests.
- **`miri`** (optional): detects undefined behavior including some races.

## Language-specific principles

- **`Send` and `Sync` are proof, not paperwork.** If the compiler refuses to share a value across threads, redesign — don't reach for `unsafe` to bypass.
- **Prefer message passing.** `tokio::sync::mpsc` and `crossbeam::channel` are first-class; `Arc<Mutex<T>>` is the last resort.
- **`tokio::sync::Mutex` ONLY when the lock must be held across `.await`.** Otherwise `parking_lot::Mutex` or `std::sync::Mutex` are faster.
- **Drop guards before `.await`.** Even `tokio::sync::MutexGuard` benefits from minimal critical sections.
- **Cancellation safety.** When a future is dropped (e.g., `tokio::select!` losing a branch), in-progress operations may be cancelled. Long critical sections amplify this risk.
- **No `unsafe` to silence the borrow checker.** If borrow rules block your design, the design is wrong, not the compiler.

## Sources

- [Tokio — Shared state](https://tokio.rs/tokio/tutorial/shared-state)
- [How to Prevent Async Deadlocks in Rust (Savan Nahar)](https://savannahar68.medium.com/rust-deadlock-do-not-hold-blocking-locks-over-await-1628bf12c6d9)
- [The Rust Programming Language — Shared-State Concurrency](https://doc.rust-lang.org/book/ch16-03-shared-state.html)
- [Rust Concurrency Guide Favors Message Passing Over Shared State (Prism)](https://www.prismnews.com/hobbies/rust-programming/rust-concurrency-guide-favors-message-passing-over-shared)
- [loom — concurrency testing](https://docs.rs/loom/)
- [Clippy lint await_holding_lock](https://rust-lang.github.io/rust-clippy/master/#await_holding_lock)
