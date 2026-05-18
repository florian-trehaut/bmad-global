# Stack Sub-File: Rust — Null Safety

**Parent stack**: `stacks/rust.md`
**Loaded by**: Protocol `~/.claude/skills/bmad-shared/protocols/null-safety-review.md` when the project's tech-stack section includes `rust`.

---

Rust has no null references — but the moral equivalents (`Option::None`, `Result::Err`, slice out-of-bounds, integer overflow, byte-boundary string slicing) remain real production bugs.

## Anti-patterns to flag

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

## Required guardrails

- **`#![deny(clippy::unwrap_used)]` and `#![deny(clippy::expect_used)]`** in production crates (allow them only in `#[cfg(test)]` modules).
- **`#![deny(clippy::indexing_slicing)]`** for crates parsing untrusted input.
- **`#![deny(clippy::integer_arithmetic)]`** for crates handling money or security-critical sizes.
- **`cargo clippy --all-targets -- -D warnings`** in CI.

## Language-specific principles

- **Use the type system as proof.** A `Vec<T>` with a `NonEmpty<T>` newtype removes the empty-case bug forever.
- **`?`, `match`, `let-else`, `if let` — choose the most local form.** Don't reach for `.unwrap()` because it's shorter.
- **`Option<T>` is an honest type.** It says "this may be absent." `.unwrap()` discards that honesty.
- **Boundary parsers (`serde`, `clap`, custom) should reject invalid input early.** Beyond the boundary, types should be total.
- **Tests cover both arms.** For every `Option`/`Result` type at a boundary, at least one test for `None`/`Err`.

## Sources

- [Don't Unwrap Options (corrode)](https://corrode.dev/blog/rust-option-handling-best-practices/)
- [Clippy lint unwrap_used](https://rust-lang.github.io/rust-clippy/master/#unwrap_used)
- [Clippy lint expect_used](https://rust-lang.github.io/rust-clippy/master/#expect_used)
- [Clippy lint indexing_slicing](https://rust-lang.github.io/rust-clippy/master/#indexing_slicing)
- [The Rust Programming Language — Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Rust API Guidelines — Predictability](https://rust-lang.github.io/api-guidelines/predictability.html)
