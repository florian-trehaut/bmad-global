# Stack: Rust

**Loaded by:** Protocols `concurrency-review.md` and `null-safety-review.md` when the project's tech-stack section includes `rust`.

**Conventions:** Rust-specific runtime-robustness rules. Rust's type system catches many issues at compile-time, but `.unwrap()`, `.expect()`, and async deadlocks remain real production hazards.

---

## Concurrency

### Anti-patterns to flag

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

### Required guardrails

- **`cargo test` MUST run** for every change touching async code, channels, atomics, mutexes.
- **`clippy::await_holding_lock` lint MUST be enabled** (it catches the `MutexGuard across await` bug at compile-time).
- **`loom`** (optional, for low-level critical paths): exhaustive scheduler exploration in tests.
- **`miri`** (optional): detects undefined behavior including some races.

### Language-specific principles

- **`Send` and `Sync` are proof, not paperwork.** If the compiler refuses to share a value across threads, redesign — don't reach for `unsafe` to bypass.
- **Prefer message passing.** `tokio::sync::mpsc` and `crossbeam::channel` are first-class; `Arc<Mutex<T>>` is the last resort.
- **`tokio::sync::Mutex` ONLY when the lock must be held across `.await`.** Otherwise `parking_lot::Mutex` or `std::sync::Mutex` are faster.
- **Drop guards before `.await`.** Even `tokio::sync::MutexGuard` benefits from minimal critical sections.
- **Cancellation safety.** When a future is dropped (e.g., `tokio::select!` losing a branch), in-progress operations may be cancelled. Long critical sections amplify this risk.
- **No `unsafe` to silence the borrow checker.** If borrow rules block your design, the design is wrong, not the compiler.

---

## Null Safety

The user noted that "ça ne peut pas vraiment arriver en Rust" — true in spirit (no nullable references), but the moral equivalents remain real production bugs:

### Anti-patterns to flag

- **`.unwrap()` in production code paths** (MAJOR)
  - Detection: `grep -rn "\.unwrap()"` excluding `tests/`, `*test*.rs`, examples, build scripts.
  - Why: `Option::None.unwrap()` and `Result::Err(_).unwrap()` panic the thread; in async tasks, the panic propagates only with `JoinHandle::await` checks. Often the panic message is unhelpful ("called `unwrap()` on a `None` value").
  - Fix: `?` operator (when in a function returning `Result`/`Option`), `match`, `let-else`, `unwrap_or`, `unwrap_or_else`, `ok_or(error)`, `context("description")` (anyhow/eyre). Reserve `unwrap()` for tests and provably-Some invariants.

- **`.expect("should never happen")` masking real cases** (MAJOR)
  - Detection: `.expect(...)` calls; the message is part of the literal.
  - Why: same as `unwrap()` but with a slightly better panic message. Often used to "document" an invariant the author didn't actually verify.
  - Fix: if the invariant is real, prove it (refactor to a type that excludes the impossible case). If not, return `Result`.

- **Slice / array index `s[i]` from external input** (MAJOR)
  - Detection: `s[i]` where `i` is parsed from input.
  - Why: out-of-bounds panics; not caught by `Option`.
  - Fix: `s.get(i)?` (returns `Option<&T>`), then handle `None`.

- **Integer cast that can truncate or wrap** (MAJOR)
  - Detection: `as` casts between integer types of different widths/signs (`u64 as u32`, `i64 as usize`).
  - Why: silent truncation; in security-critical contexts, controlled truncation can bypass length checks.
  - Fix: `try_from`/`u32::try_from(value).map_err(...)`. Use `as` only for known-safe narrowings (e.g., a value already proved < 2^32).

- **`&str` indexing on byte boundary not character boundary** (MAJOR)
  - Detection: `&s[i..j]` where `s: &str` and `i`/`j` come from external input.
  - Why: panics if the range falls inside a multi-byte UTF-8 char.
  - Fix: `s.get(i..j)` (returns `Option<&str>`), or operate on `chars()`/`char_indices()`.

- **`Option<T>` returned where `Result<T, E>` is correct** (MINOR — design smell)
  - Detection: a function returns `Option<T>` and the call sites use `.ok_or(SomeError)` to convert.
  - Why: the function is the right place to attach error context; callers shouldn't manufacture it.
  - Fix: return `Result<T, E>` directly with a meaningful error type.

### Required guardrails

- **`#![deny(clippy::unwrap_used)]` and `#![deny(clippy::expect_used)]`** in production crates (allow them only in `#[cfg(test)]` modules).
- **`#![deny(clippy::indexing_slicing)]`** for crates parsing untrusted input.
- **`#![deny(clippy::integer_arithmetic)]`** for crates handling money or security-critical sizes.
- **`cargo clippy --all-targets -- -D warnings`** in CI.

### Language-specific principles

- **Use the type system as proof.** A `Vec<T>` with a `NonEmpty<T>` newtype removes the empty-case bug forever.
- **`?`, `match`, `let-else`, `if let` — choose the most local form.** Don't reach for `.unwrap()` because it's shorter.
- **`Option<T>` is an honest type.** It says "this may be absent." `.unwrap()` discards that honesty.
- **Boundary parsers (`serde`, `clap`, custom) should reject invalid input early.** Beyond the boundary, types should be total.
- **Tests cover both arms.** For every `Option`/`Result` type at a boundary, at least one test for `None`/`Err`.

---

## Sources

- [Tokio — Shared state](https://tokio.rs/tokio/tutorial/shared-state)
- [How to Prevent Async Deadlocks in Rust (Savan Nahar)](https://savannahar68.medium.com/rust-deadlock-do-not-hold-blocking-locks-over-await-1628bf12c6d9)
- [Don't Unwrap Options (corrode)](https://corrode.dev/blog/rust-option-handling-best-practices/)
- [The Rust Programming Language — Shared-State Concurrency](https://doc.rust-lang.org/book/ch16-03-shared-state.html)
- [Rust Concurrency Guide Favors Message Passing Over Shared State (Prism)](https://www.prismnews.com/hobbies/rust-programming/rust-concurrency-guide-favors-message-passing-over-shared)
