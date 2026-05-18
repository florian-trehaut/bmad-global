# Stack Sub-File: Rust — Error Handling

**Parent stack**: `stacks/rust.md`
**Loaded by**: future `error-handling-review.md` protocol (when implemented) or referenced inline by reviewers when language detection includes Rust.

---

## Philosophy: Errors as Values

Rust models failure with two ordinary algebraic types — `Result<T, E>` for "operation that can fail with error data" and `Option<T>` for "value that may legitimately be absent" — plus `panic!` for programmer-bug invariant violations. There are no exceptions, no try/catch, no `throws` clauses. Propagation is explicit: every fallible call returns a `Result`, and the `?` operator forwards `Err` upward while applying any `From<InnerError> for OuterError` conversion. Errors are values you compose, attach context to, downcast, and test — not opaque control-flow jumps. The contract is enforced by the type system: an unused `Result` triggers the `#[must_use]` lint, and `?` only compiles when the current function's return type can absorb the error.

Three failure tiers must be kept distinct:

| Tier                  | Vehicle                          | When                                                                                  |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| Recoverable           | `Result<T, E>`                   | Anything an honest caller might handle: I/O, parsing, validation, network, contention |
| Absent-but-valid      | `Option<T>`                      | "Not found" / "no value yet" — absence carries no diagnostic                          |
| Programmer-bug        | `panic!` / `unwrap` / `expect`   | Invariants the compiler can't prove and the author has audited                        |
| Unrecoverable-process | `std::process::abort` / OOM hook | Memory corruption, double-fault, allocator failure in `no_std`                        |

Mixing these tiers is the root cause of most Rust error-handling anti-patterns.

## Anti-patterns to flag

- **`.unwrap()` in shipping library or service code paths** (MAJOR)
  - Detection: `rg "\.unwrap\(\)" --type rust --glob '!**/tests/**' --glob '!**/*test*.rs' --glob '!**/examples/**' --glob '!build.rs'`.
  - Why: `Option::None.unwrap()` / `Result::Err(_).unwrap()` panics the thread with a generic message ("called `unwrap()` on a `None` value"). In async tasks the panic only surfaces if a parent `JoinHandle::await` is checked — silent fire-and-forget tasks die invisibly.
  - Fix: `?` (when the function returns `Result`/`Option`), `match`, `let … else`, `ok_or(MyError::…)`, `with_context(|| …)`. Reserve `unwrap()` for tests and provably-Some statically-checked invariants.

- **`panic!()` (or `todo!()` / `unimplemented!()`) on recoverable conditions** (MAJOR)
  - Detection: `rg "panic!\(|todo!\(|unimplemented!\(" --type rust`, filter out test modules.
  - Why: collapses recoverable I/O / parse / network / contention errors into thread-killing panics; callers cannot inspect or retry.
  - Fix: return `Result<T, MyError>`; use `thiserror` to give the error a typed variant; convert to a panic only at the top-level binary if the policy is "fail fast".

- **`.expect("invariant")` without a comment proving the invariant** (MAJOR)
  - Detection: `rg "\.expect\(" --type rust` and inspect for adjacent rationale (`// safe because …`).
  - Why: cosmetic improvement over `unwrap` only — the panic is identical at runtime. Often used to "document" assumptions the author did not actually verify.
  - Fix: encode the invariant in the type (e.g., `NonEmpty<T>`, `NonZeroU32`, parsed enum) so the impossible case is unrepresentable. If unavoidable, add a comment citing the proof and turn on `clippy::missing_panics_doc` so the panic is documented in rustdoc.

- **Ignoring a `Result` with `let _ = …;` or no binding** (BLOCKER)
  - Detection: `rg "let _ = " --type rust`; also bare expression statements whose type is `Result<_, _>` (`unused_must_use` lint catches them).
  - Why: silently discards an error that can carry I/O failure, network timeout, or validation rejection. Equivalent to "swallowed exception" in other languages.
  - Fix: handle it, propagate with `?`, log it (`tracing::warn!(error = ?e)`), or convert to a documented intentional drop with `if let Err(e) = … { tracing::debug!(…); }`. Enable `#![deny(unused_must_use)]` at the crate root.

- **`.ok()` to throw away the error value** (MAJOR)
  - Detection: `rg "\.ok\(\)" --type rust` on `Result` values (look for `\.ok\(\)\?` or `\.ok\(\)\.unwrap` chains).
  - Why: converts `Result<T, E>` → `Option<T>`, erasing every diagnostic the error type was carrying (chain, backtrace, context strings). The next layer that fails will have no idea why.
  - Fix: if you genuinely don't want the error data, log it first: `.inspect_err(|e| tracing::warn!(error = ?e, "fallback path"))?`. If the case is structurally "no value", change the function signature to return `Option`.

- **`.unwrap_or_default()` masking parse / lookup bugs** (MINOR)
  - Detection: `rg "\.unwrap_or_default\(\)" --type rust`.
  - Why: replaces an `Err` with `T::default()` — `0`, `""`, `Vec::new()`, `None`. Hides bugs where parsing failed, the key was missing, or auth returned `None`; the program continues with silently-wrong data.
  - Fix: handle the error path explicitly. Use `unwrap_or` only with a value documented as a legitimate fallback (e.g., a configured default), never as ad-hoc papering-over.

- **Boxing every error as `Box<dyn Error>` or `anyhow::Error` in library APIs** (MAJOR)
  - Detection: public function signatures returning `Result<T, Box<dyn std::error::Error + Send + Sync>>` or `anyhow::Result<T>` in a `lib.rs` / re-exported from a crate.
  - Why: collapses all errors into a type-erased trait object. Callers can no longer pattern-match variants to react differently (e.g., retry on `Timeout`, fail on `BadCredentials`). They must `downcast_ref` or parse Display strings.
  - Fix: libraries return concrete `Result<T, MyError>` where `MyError` is a `thiserror`-derived enum with one variant per recoverable failure category. Use `anyhow` / `eyre` only in binaries (`main.rs`, top-level command handlers).

- **`thiserror` enum where every variant is `#[error(transparent)] #[from] InnerError`** (MINOR — design smell)
  - Detection: a `MyError` enum where ≥80% of variants are pure transparent wrappers around foreign types.
  - Why: the wrapper adds no semantic value, just `From` plumbing. Callers still need to know every inner type. The error type becomes a leaky alias.
  - Fix: either (a) actually attach context to each variant (`#[error("loading config: {0}")]`), or (b) drop the enum and use `anyhow`/`eyre` if the boundary really is "any of these underlying errors, no caller will discriminate".

- **`std::panic::catch_unwind` used as control flow** (BLOCKER)
  - Detection: `rg "catch_unwind" --type rust` outside FFI / WASM boundaries / panic-handler crates.
  - Why: panic catching is documented as a fault-isolation mechanism for FFI boundaries (preventing unwinding into C frames is UB), test harnesses, and async executors. Using it as `try { … } catch { … }` violates Rust's design and silently breaks `UnwindSafe` invariants; types like `Cell<T>`, `&mut T`, `Mutex` may be in inconsistent state when caught.
  - Fix: model the failure with `Result`. Reserve `catch_unwind` for the FFI / task-isolation cases only and document the safety argument.

- **Mixing `Result` and `Option` semantically** (MINOR)
  - Detection: function returns `Option<T>` but call sites do `.ok_or(SomeError)?` everywhere.
  - Why: `Option::None` says "valid absence, no info"; `Result::Err(E)` says "failure with diagnostic". A function that knows _why_ the value is missing should attach that to an error, not push the responsibility onto every caller.
  - Fix: return `Result<T, MyError>` from the producer. Keep `Option` only for genuinely-absent values (`HashMap::get`, cache miss, optional config field).

- **Integer / size cast via `as` for length / size limits** (MAJOR)
  - Detection: `rg "as u32|as u16|as usize|as i32" --type rust` near input validation, size checks, length comparisons.
  - Why: silently truncates and wraps. A user-supplied `u64 = 2^33` cast to `u32` becomes `0`, bypassing length checks (CVE class — integer overflow → buffer underflow / OOB).
  - Fix: `u32::try_from(value).map_err(|_| MyError::SizeTooLarge { actual: value })?`. Use `as` only when the upstream type guarantees the range (e.g., result of `% N` where `N < u32::MAX`).

- **`Result<(), ()>`** (MAJOR)
  - Detection: `rg "Result<\(\), \(\)>" --type rust`.
  - Why: an error type carrying zero bits is indistinguishable from `Option<()>` — and the type-system signal "this can fail" is the only thing the unit-error variant communicates. The caller learns nothing about what failed.
  - Fix: define a typed error (even a one-variant enum is honest), or convert to `bool` / `Option<()>` if the binary outcome truly carries no diagnostic.

- **Error enum with `String` payload fields instead of structured data** (MINOR)
  - Detection: `String` fields inside `thiserror` variants (`MyError::Parse(String)`).
  - Why: opaque blob; programmatic handlers can't extract the offending value, line, key, or limit. Localization is impossible. Tests rely on substring matching.
  - Fix: structured fields — `MyError::Parse { line: usize, column: usize, found: Token, expected: Vec<Token> }`. Format the user-facing message in `#[error(…)]`.

- **`#[error("{0}")]` everywhere defeating Display purposefully** (MINOR)
  - Detection: every `thiserror` variant has `#[error("{0}")]` and a single field.
  - Why: indistinguishable from `#[error(transparent)]` but more verbose, and loses the upstream `Source` chain.
  - Fix: use `#[error(transparent)]` and `#[from]` for genuine pass-throughs; reserve `{0}` syntax for variants that genuinely format an embedded value (`#[error("invalid port: {0}")]`).

- **Empty `Vec` returned to signal "no results"** (MINOR)
  - Detection: function returns `Vec<T>` and callers `.is_empty()` to branch on it.
  - Why: ambiguous: was the query empty? did the source fail? was the result filtered to zero? Mixing "absence" and "failure" into one value is the same anti-pattern as Java's "null vs empty list".
  - Fix: `Result<Vec<T>, MyError>` if it can fail; `Option<NonEmpty<T>>` if absence is meaningful; plain `Vec<T>` only when "no results" is structurally normal and the caller is correct to treat empty identically to one-item.

- **`anyhow::Result` (or `eyre::Result`) in a public library API** (MAJOR)
  - Detection: a `pub fn` in a crate's `lib.rs` (or re-exported module) returns `anyhow::Result<T>` / `eyre::Result<T>`.
  - Why: same as the boxed-`dyn Error` anti-pattern — callers lose all type info and must parse strings. Furthermore, every downstream crate must depend on `anyhow` / `eyre`. These crates are explicitly documented as "use in applications, not libraries".
  - Fix: library APIs use `thiserror`-derived concrete errors. The application binary that consumes the library uses `anyhow::Result` and converts to it via `?` (which works because the `?` operator inserts `From<MyError> for anyhow::Error` via the blanket impl).

- **`#[non_exhaustive]` missing on public error enums** (MINOR)
  - Detection: `pub enum MyError { … }` derived `Error` without `#[non_exhaustive]`.
  - Why: adding a variant later is a SemVer-major break — any downstream `match` must add an arm. `#[non_exhaustive]` forces downstream callers to write a wildcard `_ =>` from day one.
  - Fix: `#[non_exhaustive] pub enum MyError { … }` on every public error type. Cite [Rust API Guidelines — C-NUM-NO-EXHAUSTIVE](https://rust-lang.github.io/api-guidelines/future-proofing.html).

## Required guardrails

- **`#![deny(unused_must_use)]`** at every crate root — turns ignored `Result` into a compile error.
- **`#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]`** in production crates; allow them only inside `#[cfg(test)]` modules and `tests/` integration suites. Configure `allow-unwrap-in-tests = true` in `clippy.toml` so tests stay readable.
- **`#![warn(clippy::missing_errors_doc, clippy::missing_panics_doc)]`** so every public `fn -> Result` documents which `Err` variants it can return and every potentially-panicking `pub fn` documents the condition under which it panics.
- **`#![deny(clippy::indexing_slicing)]`** in any crate parsing untrusted input (network, file, user) — direct `s[i]` becomes a compile error, forcing `.get(i)`.
- **`#![deny(clippy::integer_arithmetic, clippy::as_conversions)]`** in crates handling money, sizes, or security-critical bounds — forces `checked_add` / `try_from`.
- **`cargo clippy --all-targets --all-features -- -D warnings`** wired into CI on every PR.
- **`cargo test --all-targets`** must run; tests must include at least one `#[test]` per `Err` variant of every public API.
- **`#[non_exhaustive]`** on every public error enum (SemVer future-proofing — see Rust API Guidelines C-NUM-NO-EXHAUSTIVE).
- **`#[must_use]`** is implicit on `Result` and `Option`; on custom types whose drop has side effects (e.g., a `Drop`-firing finalizer), apply `#[must_use = "explanation"]` so accidental discards warn.

## Language-specific principles

- **Errors are values, never exceptions.** Every fallible function declares its failure in its return type. `Result<T, E>` is not boilerplate to be avoided; it is the function's contract.
- **Two-tier ecosystem: `thiserror` for libraries, `anyhow`/`eyre` for binaries.** This split is now community consensus and reflected in nearly every blog post and audit since 2023. Libraries produce typed errors callers can pattern-match; binaries aggregate, attach context, and report.
- **Provide `From` impls so `?` composes.** A `MyError` enum with `#[from]` on each variant gives the user free upward conversion. Avoid `.map_err(MyError::from)` chains — they signal a missing `#[from]`.
- **Categorize failures by handler, not by source.** Variants exist because _different callers handle them differently_. If every caller treats `IoError` and `ParseError` identically (log and exit), collapse them. If one will retry on `IoError` and abort on `ParseError`, keep them split.
- **Use the type system as proof of impossibility.** `NonEmpty<Vec<T>>`, `NonZeroU32`, parsed-enum-instead-of-`String`, `&'static str` for keys known at compile time. Each removes an entire failure mode from existence.
- **Attach context at the boundary, not in the middle.** `with_context(|| format!("loading config from {path}"))` belongs at the public boundary where the user-facing message lives; intermediate `?` propagations should not paraphrase.
- **`Display` is for users, `Debug` is for developers.** `Display` walks left-to-right ("config load failed"); `Debug` shows the structured chain. The full causal chain is accessed via `error.source()` recursively, or `anyhow::Error::chain()` / `eyre::Report::chain()`.
- **Backtraces are diagnostic, not error data.** `std::backtrace::Backtrace` (stable since 1.65) is captured at error construction site; enable via `RUST_BACKTRACE=1` / `RUST_LIB_BACKTRACE=1`. Do not eq/match on backtraces — they are non-deterministic.
- **Panics are programmer-bug telemetry, not error reporting.** A panic in production should fire a paged alert. If your panic count is non-zero in steady state, you're using panic as exception.
- **Reserve `?` for the same crate's error type or types with `From` impls.** Cross-crate `?` chains via `Box<dyn Error>` lose information; either define a wrapper variant or use `anyhow` if you genuinely are in application code.
- **Tests cover the error arm.** For every `Result`-returning API, at least one test asserts a specific `Err` variant via `assert!(matches!(result, Err(MyError::Foo { .. })))`. "Happy path only" is half a test suite.
- **Newtype error variants for boundaries.** A `ParseError { line: usize, column: usize, source: anyhow::Error }` carries structured user-facing data plus opaque diagnostic — better than either a pure enum or a pure boxed error.

## Library choice: thiserror vs anyhow vs eyre vs miette

### `thiserror` 2.x — the library-author standard

`thiserror` is a derive-only crate with **zero runtime overhead**: it only generates `impl std::error::Error` + `impl Display` + `impl From<…>` for your hand-written enum or struct. There is no opinionated wrapper type. Use it for any public error type a library exports.

Version 2.0 (released 2024-11-06; latest 2.0.x as of May 2026) introduced breaking changes:

- Crates using `#[derive(thiserror::Error)]` must now have a **direct** `thiserror` dependency, even when re-exported indirectly.
- New `no_std` support: disable the default `"std"` cargo feature.
- Field named `r#source` opts out of the auto-`Error::source()` treatment.
- Infinite recursion in a generated `Display` impl now produces an `unconditional_recursion` warning.

Core attributes you will use:

| Attribute                | Effect                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#[error("…")]`          | The `Display` format string for that variant (`{0}` / `{field}` / `{self.field}` interpolation supported)                                           |
| `#[error(transparent)]`  | Forwards `Display` and `Source` to the inner error — no added message                                                                               |
| `#[from]`                | Auto-derives `From<InnerType> for MyError` for that variant; implies `#[source]`                                                                    |
| `#[source]`              | Marks a field as the source error returned by `Error::source()` (auto-applied if the field is named `source`)                                       |
| `#[backtrace]`           | Captures backtrace at the `From` site; requires nightly + Rust ≥ 1.73 for the underlying `std::error::Error::provide` infra (gated stable per item) |
| `#[error("…", arg = …)]` | Pass named args to the `Display` formatter                                                                                                          |

Crate root rule of thumb: define **one** error enum per crate boundary, with one variant per category of failure callers must distinguish. Avoid the "100-variant god enum" — split by module if necessary, then wrap into a top-level enum at the crate root.

Docs: <https://docs.rs/thiserror>. Repo: <https://github.com/dtolnay/thiserror>.

### `anyhow` 1.x — the application-binary standard

`anyhow::Error` is a single concrete type (`Box`-erased trait object) holding _any_ `std::error::Error + Send + Sync + 'static`. The crate offers:

- `anyhow::Result<T>` = `Result<T, anyhow::Error>` type alias.
- Blanket `From<E>` impl so `?` works across heterogeneous error types without boilerplate.
- `Context` extension trait: `.context("static msg")` and `.with_context(|| format!("…"))` to attach a layer of explanation. `with_context` is lazy — the closure runs only on `Err`.
- `anyhow::Error::chain()` to iterate causes; `anyhow::Error::root_cause()` for the bottom.
- `anyhow::Error::downcast_ref::<MyError>()` to recover the concrete type (rarely needed in app code).
- Backtrace captured automatically when `RUST_BACKTRACE=1` (or always when built with `anyhow` feature `"backtrace"`).

When to use: any `main.rs`, top-level CLI handler, server request handler boundary, or top of a binary that just needs to log and exit. **Never** in a library's public API surface.

Docs: <https://docs.rs/anyhow>. Repo: <https://github.com/dtolnay/anyhow>.

### `eyre` 0.6 / `color-eyre` — anyhow plus pluggable reports

`eyre::Report` is API-compatible with `anyhow::Error`. The difference: `eyre` allows you to install a **custom report handler** that controls how errors are printed (colors, ANSI sequences, line wrapping, spantraces). `color-eyre` is the de-facto handler — it adds:

- Coloured causal chain
- Source-line highlighting (when `RUST_BACKTRACE=full` and debuginfo present)
- Captures of `tracing-error` spans (if the `tracing-error` integration is wired in)

Used by tokio, ratatui, oxide-rs's RFD-400 examples, and most modern Rust CLIs.

Docs: <https://docs.rs/eyre>, <https://docs.rs/color-eyre>. Repo: <https://github.com/eyre-rs/eyre>.

Pick `eyre`+`color-eyre` over `anyhow` if you want pretty terminal output. Pick `anyhow` if you want stricter zero-dep posture or are already in an `anyhow` ecosystem (`?` Just Works either way thanks to identical APIs).

### `miette` — diagnostics with source-pointing

`miette` goes beyond reporting and emits **compiler-style diagnostics**: source-code excerpts with carets, multiple labelled spans, suggestion hints, and severity levels. Each error type derives `miette::Diagnostic` and points to spans in the input it received (the source string can be embedded in the error).

```rust
#[derive(Diagnostic, Error, Debug)]
#[diagnostic(
    code(my_lang::unclosed_brace),
    help("did you forget the closing `}}`?"),
)]
#[error("unclosed brace")]
pub struct UnclosedBrace {
    #[source_code] src: NamedSource<String>,
    #[label("opened here")] span: SourceSpan,
}
```

Used by Cargo (recent releases adopt miette for rustdoc / lint output), Bevy, Cargo-deny, Polars CLI, several DSL parsers. The right choice for any tool whose error reports point into user-supplied source text (parsers, transpilers, validators, linters).

Docs: <https://docs.rs/miette>. Repo: <https://github.com/zkat/miette>.

### `snafu` — context-by-context error design

`snafu` predates `thiserror` and remains maintained. Its core idea: each error variant carries a **context selector** struct that lets the caller attach context at the `?` site without exposing the underlying error type.

```rust
#[derive(Debug, Snafu)]
enum Error {
    #[snafu(display("could not open config at {path:?}"))]
    OpenConfig { path: PathBuf, source: std::io::Error },
}
// usage:
let f = std::fs::File::open(&p).context(OpenConfigSnafu { path: p.clone() })?;
```

Heavier API than `thiserror`; preferred when many call-sites attach distinct context to the same inner error type, or when you want backtrace-captured-at-source semantics. Less popular in 2026 than thiserror+anyhow but actively maintained.

Docs: <https://docs.rs/snafu>.

### `failure` — DEPRECATED

`failure` was the 2018-era community standard but is officially deprecated (see <https://github.com/rust-lang-deprecated/failure>). Replacements:

- `failure::Error` → `anyhow::Error` (or `eyre::Report`)
- `#[derive(Fail)]` → `#[derive(thiserror::Error)]`

If you still see `failure` in a Cargo.tree, treat it as tech debt and migrate.

### Selection matrix

| Context                              | Recommended                       |
| ------------------------------------ | --------------------------------- |
| Library / SDK / crate published      | `thiserror` (concrete `MyError`)  |
| Application binary (CLI / server)    | `anyhow` or `eyre` + `color-eyre` |
| Parser / compiler / DSL / linter CLI | `miette` (+ `thiserror` for core) |
| Heavy context-per-call-site need     | `snafu`                           |
| `no_std` library                     | `thiserror` 2.x without `std`     |

## Error context patterns

- **`?` propagates without context.** Bare `?` is a transparent pass-through. The error type at the `?` site must implement `From<InnerErr>` for the outer error. No message is added; the chain just grows.

- **`Context::context("static label")`** (from `anyhow`/`eyre`) attaches a `&'static str` description without allocating in the success path. Use for the common case where the message has no interpolated data.

- **`Context::with_context(|| format!("…", …))`** runs the closure **only** when the result is `Err` — the formatting cost is paid only on failure. Use whenever the message includes dynamic values (paths, IDs, retry counts).

- **`Result::map_err(|e| MyError::Variant { src: e, … })`** (std) is the typed-error analogue. It always evaluates, so prefer to extract data the variant needs first, then construct.

- **Error chains.** `std::error::Error::source()` returns the underlying cause; recursively walking it builds the chain. `anyhow::Error::chain()` returns an iterator; `eyre::Report::chain()` does the same. Display printing in `anyhow`/`eyre` shows the chain by default: `outer: middle: inner`.

- **Backtraces.** `std::backtrace::Backtrace::capture()` reads `RUST_BACKTRACE` / `RUST_LIB_BACKTRACE`; `::force_capture()` ignores env vars. `Backtrace` was stabilized in Rust 1.65 (Nov 2022). `thiserror`'s `#[backtrace]` field auto-captures via `Error::provide`. `anyhow` captures automatically when `RUST_BACKTRACE=1`; the backtrace is rendered as part of the `Display`. Never compare backtraces in tests — they're non-deterministic across builds.

- **One context layer per boundary.** Each function adds at most one layer that names the operation it performed ("loading config"). Avoid `?`-without-context chains that go six levels deep before the first message — the user sees only the leaf cause.

- **No paraphrasing.** Do not write `with_context(|| "io error")?` over a `std::io::Error` — the inner error already says that. Attach _what you were doing_ ("writing pid file"), not _what failed_.

## Conversion patterns (From / Into / TryFrom)

- **`From<E1> for MyError`** is the engine of `?` ergonomics. Every error a function calls into must have a `From` impl into the function's return error type — `?` calls `From::from` implicitly.

- **`#[from]` (thiserror)** auto-derives `From<InnerType> for MyError` for that variant. Constraint: the variant must contain only the source field (optionally plus a `Backtrace`).

  ```rust
  #[derive(thiserror::Error, Debug)]
  pub enum MyError {
      #[error("io: {0}")] Io(#[from] std::io::Error),
      #[error("parse: {0}")] Parse(#[from] serde_json::Error),
  }
  ```

- **`TryFrom<T>` for fallible value-to-value conversions.** Returns `Result<Self, Self::Error>`. Standard for size/range narrowing: `u32::try_from(u64_value)`.

- **Avoid `.into()` in `?` chains.** Use `?` directly — it already calls `From::from`. `.into()?` is redundant and obscures the conversion.

- **Generic bounds `where E: Into<MyError>`** allow callers to pass any `From`-compatible type. Useful in builder APIs; over-used elsewhere because it leaks generic complexity.

- **Don't add `From<String> for MyError`.** Strings have no semantic identity — any string can convert, hiding the lack of a typed variant. If you need an ad-hoc message variant, name it: `MyError::Custom(String)` and call it explicitly.

- **One-way conversions.** `Result<T, MyError>` → `anyhow::Result<T>` works automatically via `?` (because `anyhow::Error` impls `From<E: Error + Send + Sync + 'static>`). The reverse needs `error.downcast::<MyError>()` and is fallible — design so it's rarely required.

## Panics: when justified

A panic indicates a **programmer-detected impossible state**. It is appropriate when:

- **Tests.** `assert!`, `assert_eq!`, `panic!`, and unwrap/expect inside `#[cfg(test)]` are correct usage; failing assertions _are_ the test result.
- **Provably-unreachable arms.** `unreachable!()` in a `match` where the compiler insists on exhaustiveness but a type invariant rules out the case. Always comment the invariant.
- **Internal invariants the compiler cannot prove.** E.g., `vec.last().expect("just pushed")` immediately after `vec.push(x)`. Add `#[track_caller]` to the wrapper so the panic site shows the caller's line, not the wrapper's. Document with `#[clippy::has_significant_drop]` discipline.
- **Constructors of invariant-bearing newtypes** that consumed validation: `NonEmpty::new_unchecked(vec)` may panic on `vec.is_empty()` and that is the design — the unchecked constructor's contract.
- **Allocation failure / OOM** with `std::process::abort()` (not `panic!`) when in a `no_std` or kernel context where unwinding is forbidden.

A panic is **wrong** for:

- Network errors, file errors, parse errors, user-input validation, missing env vars, expected race conditions. All of these are `Result`.
- "I am too lazy to model this" — `unwrap` to skip writing the `?` propagation is the most common Rust code-smell.
- Reachable arms with `unreachable!()` — when the case _is_ reachable in production, you've turned a recoverable error into a thread death.

**`#[track_caller]`** propagates the panic location to the function's caller. Useful on wrapper functions that always panic on bad input. Note: it does **not** work on closures, and is documented to work on async functions only with limitations ([rust-lang/rust#78840](https://github.com/rust-lang/rust/issues/78840)).

**`#[non_exhaustive]` plus `unreachable!()`** is a future-compat trick when matching public enums — but only when the variant cannot occur _at this version_; never when "I don't want to handle it".

**Document panics in rustdoc.** Enable `clippy::missing_panics_doc` so any `pub fn` that can panic carries a `# Panics` section in its rustdoc. The reader should never be surprised by a panic.

## Async error handling

- **`async fn returning Result<T, E>`** desugars to `impl Future<Output = Result<T, E>>`. `?` works inside async blocks exactly as in sync code, applying `From` for the function's `E`.

- **`tokio::spawn(async { … })`** returns `JoinHandle<T>` — note: the task's _output_ is `T`, not `Result<T, E>`. If the task panics, the `JoinHandle::await` resolves to `Err(JoinError)`. So a spawned task returning `Result<T, MyError>` ends up as `Result<Result<T, MyError>, JoinError>` — the **double-`?` pattern**: `handle.await??`.

  ```rust
  let handle: JoinHandle<Result<T, MyError>> = tokio::spawn(async move { do_thing().await });
  let value: T = handle.await??; // first ? unwraps JoinError, second unwraps MyError
  ```

- **`JoinError` distinguishes panic from cancel.** Use `JoinError::is_panic()` to check whether the task died from a panic vs `is_cancelled()` for explicit abort. A canceled task should usually be expected (it was your `AbortHandle`); a panicked task is a bug.

- **`tokio::time::timeout(d, fut)`** returns `Result<T, Elapsed>` where `T` is the inner future's output. If `fut` itself returns `Result<U, E>`, you get `Result<Result<U, E>, Elapsed>` — again, `timeout(d, …).await??` is the idiom (with `From<Elapsed> for MyError` if you want a single error type).

- **`tokio::task::JoinSet`** is `cancel-safe`: its `join_next` is safe to use in `tokio::select!` without losing tasks (see [tokio JoinSet docs](https://docs.rs/tokio/latest/tokio/task/struct.JoinSet.html)).

- **Cancellation safety.** When a future is dropped (e.g., a `select!` branch loses, a `timeout` fires), every `.await` point in flight ceases. Any partial state — half-written file, half-acquired lock, half-sent message — must be either commit-or-rollback. Using `Result` on each step lets you _detect_ partial progress; achieving _atomicity_ requires explicit cleanup (`Drop` guards, `tokio::pin!` with explicit cancellation tokens, or `tokio_util::sync::DropGuard`). See [Oxide RFD-400 on cancel safety](https://rfd.shared.oxide.computer/rfd/0400) for the canonical exposition.

- **`tracing` over `println!` for async errors.** Spawned tasks have no parent stdout; errors logged via `eprintln!` may interleave or vanish. `tracing::error!(error = %e, "context")` writes structured fields the subscriber can route, and `tracing-error::SpanTrace::capture()` plus `color-eyre` reconstructs the async call chain.

## FFI / boundary error patterns

- **Convert `Result<T, E>` to integer error codes** at C FFI boundaries. `extern "C" fn op() -> i32` returning `0` on success and negative `errno`-style codes on failure. Out-parameters via `*mut T` for success values.

  ```rust
  #[no_mangle]
  pub unsafe extern "C" fn my_op(out: *mut MyHandle) -> i32 {
      match do_op() {
          Ok(h) => { unsafe { *out = h; } 0 }
          Err(MyError::BadInput) => -1,
          Err(MyError::Io(_))    => -2,
          Err(_)                 => -99,
      }
  }
  ```

- **Error-message accessors.** Provide `extern "C" fn my_last_error_message(buf: *mut c_char, len: usize) -> usize` that copies the most recent thread-local error into the caller's buffer. Ownership stays on the Rust side; never hand out a raw pointer to a Rust `String`'s buffer that the C side might call `free` on.

- **`#[repr(C)]` on error enums crossing FFI.** Required for ABI stability; pair with explicit discriminants (`#[repr(C)] pub enum ErrorCode { Ok = 0, BadInput = -1, … }`).

- **`panic::catch_unwind` at the FFI boundary.** Unwinding into a C frame is undefined behavior. Every `extern "C"` function must wrap its body in `catch_unwind` and convert a caught panic into an error code:

  ```rust
  #[no_mangle]
  pub extern "C" fn safe_op() -> i32 {
      std::panic::catch_unwind(|| do_thing()).unwrap_or(-128)
  }
  ```

  Alternatively, mark the function `extern "C-unwind"` to declare that Rust panics may propagate (only safe if the caller is Rust-aware). See [RFC 2945 — C-unwind ABI](https://rust-lang.github.io/rfcs/2945-c-unwind-abi.html).

- **WebAssembly (`wasm-bindgen`).** Exported functions returning `Result<T, JsValue>` produce JS exceptions on `Err`. `wasm-bindgen` (recent versions) auto-injects `MaybeUnwindSafe` bounds; with `-Cpanic=unwind` and the `std` feature, panics are caught at the JS boundary and become JS exceptions (`PanicError`). Hard aborts (`unreachable` instruction, stack overflow, OOM) cannot be caught — see [wasm-bindgen panic catching guide](https://wasm-bindgen.github.io/wasm-bindgen/reference/catch-unwind.html) and [Cloudflare's "Making Rust Workers reliable"](https://blog.cloudflare.com/making-rust-workers-reliable/).

- **Closure captures crossing `catch_unwind`** must satisfy `UnwindSafe`. Types like `Cell<T>`, `RefCell<T>`, `&mut T`, `Mutex` are **not** unwind-safe by default (they may be in inconsistent state after a caught panic). Wrap intentionally with `std::panic::AssertUnwindSafe(…)` after auditing.

- **`anyhow::Error` does not cross FFI / JS / WASM cleanly.** It is a `Box<dyn Error>` of arbitrary type — neither `repr(C)` nor serializable to JS. Convert to a `#[repr(C)]` error code (or a serializable structured error) at the boundary.

## Testing error paths

- **One `#[test]` per `Err` variant** of every public `Result`-returning function. Pattern:

  ```rust
  #[test]
  fn returns_bad_input_on_empty() {
      let err = parse("").unwrap_err();
      assert!(matches!(err, MyError::BadInput { .. }));
  }
  ```

- **`Result<(), E>` tests.** `#[test] fn t() -> Result<(), MyError> { … Ok(()) }` lets the test body use `?` for cleanup. Idiomatic for tests with many setup calls.

- **`#[should_panic(expected = "substring")]`** for tests asserting a panic occurs. Use only when the panic is the documented contract of the API — for `Result`-returning APIs, `assert!(matches!(…, Err(…)))` is correct.

- **`assert_matches!` (from the `assert_matches` crate or the unstable std macro)** is the cleanest pattern-match assertion with diagnostic on failure. Equivalent expansion via `assert!(matches!(…))` works on stable.

- **`proptest` for error-path coverage.** Generate arbitrary inputs and assert "either the function succeeds and the output is well-formed, or it returns a specific `Err` variant". Catches input classes the author didn't think of. The crate currently has ~75M downloads (May 2026); see <https://github.com/proptest-rs/proptest>.

- **Mock injection via `#[cfg(test)]`.** For dependencies that produce errors only in production (network failure, disk-full, OOM), swap the trait implementation in tests:

  ```rust
  #[cfg_attr(test, mockall::automock)]
  pub trait Database { fn fetch(&self, k: &Key) -> Result<Row, DbError>; }
  ```

  Then make the mock return an `Err` variant deliberately to exercise the error path.

- **Backtrace assertions are forbidden.** Backtraces are non-deterministic across compilers, OSes, optimization levels. Never `assert_eq!` or substring-match on a backtrace.

- **`#[track_caller]` on test helpers.** When a test calls `assert_ok(parse(input))`, attribute the helper with `#[track_caller]` so the panic on `Err` points to the test, not the helper.

- **`cargo nextest`** is the modern test runner; parallelizes better than `cargo test` and reports test names on panic without buffer interleaving. Recommend on any CI pipeline running ≥50 tests.

## Sources

- [The Rust Programming Language — Error Handling (Chapter 9)](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Rust API Guidelines — Dependability](https://rust-lang.github.io/api-guidelines/dependability.html)
- [Rust API Guidelines — Future Proofing (`#[non_exhaustive]`)](https://rust-lang.github.io/api-guidelines/future-proofing.html)
- [`std::error::Error` trait — std docs](https://doc.rust-lang.org/std/error/trait.Error.html)
- [`std::backtrace::Backtrace` — std docs (stabilized Rust 1.65)](https://doc.rust-lang.org/std/backtrace/struct.Backtrace.html)
- [Rust 1.65 release notes (Backtrace stabilization)](https://blog.rust-lang.org/2022/11/03/Rust-1.65.0.html)
- [Rust 1.85 release notes (2024 edition stabilization, Feb 2025)](https://blog.rust-lang.org/2025/02/20/Rust-1.85.0/)
- [Rust 1.87 release notes (May 2025, 10-year anniversary)](https://blog.rust-lang.org/2025/05/15/Rust-1.87.0/)
- [`thiserror` crate docs (2.x)](https://docs.rs/thiserror)
- [`thiserror` GitHub — repository](https://github.com/dtolnay/thiserror)
- [`anyhow` crate docs (1.x)](https://docs.rs/anyhow)
- [`anyhow::Context` trait](https://docs.rs/anyhow/latest/anyhow/trait.Context.html)
- [`anyhow` GitHub — repository](https://github.com/dtolnay/anyhow)
- [`eyre` GitHub — repository](https://github.com/eyre-rs/eyre)
- [`color-eyre` crate docs](https://docs.rs/color-eyre)
- [`miette` crate docs](https://docs.rs/miette)
- [`miette` GitHub — repository](https://github.com/zkat/miette)
- [`snafu` crate docs](https://docs.rs/snafu)
- [`failure` crate — DEPRECATED notice](https://github.com/rust-lang-deprecated/failure)
- [Clippy lint — `unwrap_used`](https://rust-lang.github.io/rust-clippy/master/#unwrap_used)
- [Clippy lint — `expect_used`](https://rust-lang.github.io/rust-clippy/master/#expect_used)
- [Clippy lint — `panic`](https://rust-lang.github.io/rust-clippy/master/#panic)
- [Clippy lint — `indexing_slicing`](https://rust-lang.github.io/rust-clippy/master/#indexing_slicing)
- [Clippy lint — `missing_errors_doc`](https://rust-lang.github.io/rust-clippy/master/#missing_errors_doc)
- [Clippy lint — `missing_panics_doc`](https://rust-lang.github.io/rust-clippy/master/#missing_panics_doc)
- [Clippy configuration — `allow-unwrap-in-tests`](https://doc.rust-lang.org/clippy/lint_configuration.html)
- [Tokio — `JoinHandle`](https://docs.rs/tokio/latest/tokio/task/struct.JoinHandle.html)
- [Tokio — `JoinError`](https://docs.rs/tokio/latest/tokio/task/struct.JoinError.html)
- [Tokio — `JoinSet`](https://docs.rs/tokio/latest/tokio/task/struct.JoinSet.html)
- [Oxide RFD-400 — Dealing with cancel safety in async Rust](https://rfd.shared.oxide.computer/rfd/0400)
- [`std::panic::catch_unwind`](https://doc.rust-lang.org/std/panic/fn.catch_unwind.html)
- [RFC 2945 — `C-unwind` ABI](https://rust-lang.github.io/rfcs/2945-c-unwind-abi.html)
- [`wasm-bindgen` — Catching Panics](https://wasm-bindgen.github.io/wasm-bindgen/reference/catch-unwind.html)
- [`wasm-bindgen` — Handling Aborts](https://wasm-bindgen.github.io/wasm-bindgen/reference/handling-aborts.html)
- [Cloudflare — Making Rust Workers reliable: panic and abort recovery in wasm-bindgen](https://blog.cloudflare.com/making-rust-workers-reliable/)
- [`proptest` GitHub — repository](https://github.com/proptest-rs/proptest)
- [Luca Palmieri — Error Handling in Rust: A Deep Dive](https://www.lpalmieri.com/posts/error-handling-rust/)
- [Iroh — Trying to get error backtraces in Rust libraries right](https://www.iroh.computer/blog/error-handling-in-iroh)
- [Evan Schwartz — Your Clippy Config Should Be Stricter](https://emschwartz.me/your-clippy-config-should-be-stricter/)
- [Nick Cameron — Error Handling in Rust (ecosystem reference)](https://nrc.github.io/error-docs/ecosystem.html)
- [Rust By Example — Error Handling](https://doc.rust-lang.org/rust-by-example/error.html)
- [Rust 2024 Edition Guide — `let` chains](https://doc.rust-lang.org/edition-guide/rust-2024/let-chains.html)
